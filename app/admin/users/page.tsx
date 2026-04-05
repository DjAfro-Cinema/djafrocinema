'use client';

import { useEffect, useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { analyticsService, SessionRecord } from '@/services/analytics.service';
import { PageShell, StatCard, ChartCard, ChartCanvas, Skeleton, Badge } from '../components';

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const ANA = process.env.NEXT_PUBLIC_ANALYTICS_COLLECTION_ID!;

interface AnaUser {
  $id: string;
  userId: string;
  email: string;
  platform: 'pwa' | 'mobile-app';
  signupMethod: 'email' | 'otp' | 'google-oauth';
  isActive: boolean;
  signupAt: string;
  lastLoginAt?: string;
  userAgent?: string;
  sessionType?: 'pwa' | 'app' | 'unknown';
  loginCount?: number;
}

type PlatformFilter = 'all' | 'pwa' | 'mobile-app';
type MethodFilter   = 'all' | 'email' | 'otp' | 'google-oauth';
type SessionFilter  = 'all' | 'pwa' | 'app' | 'unknown';
type Period         = '7d' | '30d' | '90d' | 'all';
type PageTab        = 'users' | 'sessions';

function daysAgo(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

function hoursAgo(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
}

function groupByDay(users: AnaUser[], period: Period) {
  const from = (() => {
    const d = new Date();
    if (period === '7d')  { d.setDate(d.getDate() - 7);  return d; }
    if (period === '30d') { d.setDate(d.getDate() - 30); return d; }
    if (period === '90d') { d.setDate(d.getDate() - 90); return d; }
    return new Date(0);
  })();
  const filtered = users.filter(u => new Date(u.signupAt) >= from);
  const map = new Map<string, number>();
  for (const u of filtered) {
    const date = u.signupAt.split('T')[0];
    map.set(date, (map.get(date) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}

function groupSessionsByDay(sessions: SessionRecord[], period: Period) {
  const from = (() => {
    const d = new Date();
    if (period === '7d')  { d.setDate(d.getDate() - 7);  return d; }
    if (period === '30d') { d.setDate(d.getDate() - 30); return d; }
    if (period === '90d') { d.setDate(d.getDate() - 90); return d; }
    return new Date(0);
  })();
  const filtered = sessions.filter(s => new Date(s.loginAt) >= from);
  const pwaMap = new Map<string, number>();
  const appMap = new Map<string, number>();
  for (const s of filtered) {
    const date = s.loginAt.split('T')[0];
    if (s.sessionType === 'pwa') pwaMap.set(date, (pwaMap.get(date) || 0) + 1);
    else                          appMap.set(date, (appMap.get(date) || 0) + 1);
  }
  const allDates = Array.from(new Set([...pwaMap.keys(), ...appMap.keys()])).sort();
  return allDates.map(date => ({ date, pwa: pwaMap.get(date) || 0, app: appMap.get(date) || 0 }));
}

export default function UsersPage() {
  const [pageTab, setPageTab]     = useState<PageTab>('users');
  const [users, setUsers]         = useState<AnaUser[]>([]);
  const [sessions, setSessions]   = useState<SessionRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User filters
  const [search, setSearch]       = useState('');
  const [platform, setPlatform]   = useState<PlatformFilter>('all');
  const [method, setMethod]       = useState<MethodFilter>('all');
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');
  const [period, setPeriod]       = useState<Period>('30d');

  // Session filters
  const [sessionSearch, setSessionSearch]   = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<'all' | 'pwa' | 'app'>('all');
  const [sessionPeriod, setSessionPeriod]   = useState<Period>('7d');

  const load = useCallback(async () => {
    const [usersRes, sessionsRes] = await Promise.all([
      databases.listDocuments(DB, ANA, [Query.limit(1000)]),
      analyticsService.getRecentSessions(500),
    ]);
    setUsers(usersRes.documents as unknown as AnaUser[]);
    setSessions(sessionsRes);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // ── User stats ──
  const total         = users.length;
  const pwa           = users.filter(u => u.platform === 'pwa').length;
  const mobile        = users.filter(u => u.platform === 'mobile-app').length;
  const active        = users.filter(u => u.isActive).length;
  const newThisWeek   = users.filter(u => daysAgo(u.signupAt) <= 7).length;
  const activeToday   = users.filter(u => u.lastLoginAt && daysAgo(u.lastLoginAt) === 0).length;
  const sessionPWA    = users.filter(u => u.sessionType === 'pwa').length;
  const sessionApp    = users.filter(u => u.sessionType === 'app').length;

  const emailC  = users.filter(u => u.signupMethod === 'email').length;
  const otpC    = users.filter(u => u.signupMethod === 'otp').length;
  const googleC = users.filter(u => u.signupMethod === 'google-oauth').length;

  // ── Session stats ──
  const totalSessions     = sessions.length;
  const pwaSessions       = sessions.filter(s => s.sessionType === 'pwa').length;
  const appSessions       = sessions.filter(s => s.sessionType === 'app').length;
  const todayStr          = new Date().toISOString().split('T')[0];
  const sessionsToday     = sessions.filter(s => s.loginAt?.startsWith(todayStr)).length;
  const uniqueToday       = new Set(sessions.filter(s => s.loginAt?.startsWith(todayStr)).map(s => s.userId)).size;
  const weekAgo           = new Date(Date.now() - 7 * 86400000);
  const sessionsThisWeek  = sessions.filter(s => new Date(s.loginAt) >= weekAgo).length;
  const uniqueThisWeek    = new Set(sessions.filter(s => new Date(s.loginAt) >= weekAgo).map(s => s.userId)).size;

  // ── Charts ──
  const byDay  = groupByDay(users, period);
  const dates  = byDay.map(d => d.date.slice(5));
  const counts = byDay.map(d => d.count);
  const cum    = counts.reduce<number[]>((acc, v) => { acc.push((acc[acc.length - 1] || 0) + v); return acc; }, []);

  const sessionsByDay    = groupSessionsByDay(sessions, sessionPeriod);
  const sessionDates     = sessionsByDay.map(d => d.date.slice(5));
  const sessionPwaCounts = sessionsByDay.map(d => d.pwa);
  const sessionAppCounts = sessionsByDay.map(d => d.app);

  // ── Filtered users table ──
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch   = !q || u.email.toLowerCase().includes(q) || (u.userId || '').toLowerCase().includes(q);
    const matchPlatform = platform === 'all' || u.platform === platform;
    const matchMethod   = method === 'all' || u.signupMethod === method;
    const matchSession  = sessionFilter === 'all' || (u.sessionType || 'unknown') === sessionFilter;
    return matchSearch && matchPlatform && matchMethod && matchSession;
  });

  // ── Filtered sessions table ──
  const filteredSessions = sessions.filter(s => {
    const q = sessionSearch.toLowerCase();
    const matchSearch = !q || s.email?.toLowerCase().includes(q) || s.userId?.toLowerCase().includes(q);
    const matchType   = sessionTypeFilter === 'all' || s.sessionType === sessionTypeFilter;
    const matchPeriod = (() => {
      if (sessionPeriod === 'all') return true;
      const days = sessionPeriod === '7d' ? 7 : sessionPeriod === '30d' ? 30 : 90;
      return new Date(s.loginAt) >= new Date(Date.now() - days * 86400000);
    })();
    return matchSearch && matchType && matchPeriod;
  });

  // ── Color helpers ──
  const methodColor    = (m: string) => m === 'email' ? '#e50914' : m === 'otp' ? '#f59e0b' : '#4285f4';
  const platformColor  = (p: string) => p === 'pwa' ? '#a855f7' : '#25d366';
  const sessionColor   = (s: string | undefined) => s === 'pwa' ? '#a855f7' : s === 'app' ? '#25d366' : '#6b7280';
  const sessionLabel   = (s: string | undefined) => s === 'pwa' ? 'PWA' : s === 'app' ? 'App' : 'Unknown';

  const tabStyle = (t: PageTab) => ({
    padding: '10px 24px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: "'DM Mono',monospace",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    background: pageTab === t ? 'rgba(229,9,20,0.12)' : 'transparent',
    border: `1px solid ${pageTab === t ? 'rgba(229,9,20,0.35)' : 'rgba(255,255,255,0.08)'}`,
    color: pageTab === t ? '#e50914' : 'rgba(255,255,255,0.4)',
    transition: 'all 0.2s',
  });

  return (
    <PageShell title="Users & Sessions" sub="Signups, logins, and live session tracking" onRefresh={handleRefresh} refreshing={refreshing}>

      {/* Page tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <button style={tabStyle('users')}   onClick={() => setPageTab('users')}>Users</button>
        <button style={tabStyle('sessions')} onClick={() => setPageTab('sessions')}>Sessions</button>
      </div>

      {/* ════════════════ USERS TAB ════════════════ */}
      {pageTab === 'users' && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
            {loading ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={100} />) : (
              <>
                <StatCard label="Total Users"   value={total.toLocaleString()} />
                <StatCard label="PWA / Web"     value={pwa}          accent="#4285f4" />
                <StatCard label="Mobile App"    value={mobile}       accent="#25d366" />
                <StatCard label="Active Users"  value={active}       accent="#22c55e" />
                <StatCard label="New This Week" value={newThisWeek}  accent="#f59e0b" />
                <StatCard label="Active Today"  value={activeToday}  accent="#e50914" />
                <StatCard label="PWA Sessions"  value={sessionPWA}   accent="#a855f7" />
                <StatCard label="App Sessions"  value={sessionApp}   accent="#25d366" />
              </>
            )}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
            {!loading && (
              <>
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', flex: 1 }}>Signup Growth</div>
                    {(['7d', '30d', '90d', 'all'] as Period[]).map(p => (
                      <button key={p} onClick={() => setPeriod(p)} style={{
                        padding: '4px 12px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10,
                        background: period === p ? 'rgba(229,9,20,0.12)' : 'transparent',
                        border: `1px solid ${period === p ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: period === p ? '#e50914' : 'rgba(255,255,255,0.35)',
                      }}>{p === 'all' ? 'All' : p}</button>
                    ))}
                  </div>
                  <div style={{ height: 240 }}>
                    <ChartCanvas deps={[byDay, period]} config={{
                      type: 'bar' as const,
                      data: { labels: dates, datasets: [
                        { type: 'bar',  label: 'New Signups', data: counts, backgroundColor: 'rgba(229,9,20,0.6)', borderColor: '#e50914', borderWidth: 1, borderRadius: 3, yAxisID: 'y' } as any,
                        { type: 'line', label: 'Total Users',  data: cum,   borderColor: '#4285f4', backgroundColor: 'rgba(66,133,244,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true, yAxisID: 'y2' } as any,
                      ]},
                      options: { responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: 'rgba(255,255,255,0.45)', font: { family: 'DM Mono', size: 10 } } } },
                        scales: {
                          x:  { ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'DM Mono', size: 9 }, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                          y:  { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' }, position: 'left' },
                          y2: { ticks: { color: 'rgba(66,133,244,0.6)', font: { family: 'DM Mono', size: 10 } }, grid: { display: false }, position: 'right' },
                        },
                      } as any,
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <ChartCard title="Signup Methods" height={110}>
                    <ChartCanvas deps={[emailC, otpC, googleC]} config={{
                      type: 'doughnut',
                      data: { labels: ['Email', 'OTP', 'Google'], datasets: [{ data: [emailC, otpC, googleC], backgroundColor: ['#e50914bb', '#f59e0bbb', '#4285f4bb'], borderColor: '#080810', borderWidth: 3, hoverOffset: 5 }] },
                      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.5)', padding: 10, boxWidth: 8, font: { size: 10, family: 'DM Mono' } } } } },
                    }} />
                  </ChartCard>
                  <ChartCard title="Platform" height={110}>
                    <ChartCanvas deps={[pwa, mobile]} config={{
                      type: 'doughnut',
                      data: { labels: ['PWA', 'Mobile'], datasets: [{ data: [pwa, mobile], backgroundColor: ['#a855f7bb', '#25d366bb'], borderColor: '#080810', borderWidth: 3, hoverOffset: 5 }] },
                      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.5)', padding: 10, boxWidth: 8, font: { size: 10, family: 'DM Mono' } } } } },
                    }} />
                  </ChartCard>
                  <ChartCard title="Last session via" height={110}>
                    <ChartCanvas deps={[sessionPWA, sessionApp]} config={{
                      type: 'doughnut',
                      data: { labels: ['PWA', 'App'], datasets: [{ data: [sessionPWA, sessionApp], backgroundColor: ['#a855f7bb', '#25d366bb'], borderColor: '#080810', borderWidth: 3, hoverOffset: 5 }] },
                      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.5)', padding: 10, boxWidth: 8, font: { size: 10, family: 'DM Mono' } } } } },
                    }} />
                  </ChartCard>
                </div>
              </>
            )}
          </div>

          {/* Users table */}
          {!loading && (
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '24px 28px' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                <input placeholder="Search email or ID…" value={search} onChange={e => setSearch(e.target.value)} style={{
                  padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                  color: '#fff', fontFamily: "'DM Mono',monospace", fontSize: 12, outline: 'none', width: 240,
                }} />
                {(['all', 'pwa', 'mobile-app'] as PlatformFilter[]).map(p => (
                  <button key={p} onClick={() => setPlatform(p)} style={{
                    padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10,
                    background: platform === p ? 'rgba(168,85,247,0.12)' : 'transparent',
                    border: `1px solid ${platform === p ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: platform === p ? '#a855f7' : 'rgba(255,255,255,0.35)', textTransform: 'capitalize',
                  }}>{p === 'mobile-app' ? 'Mobile' : p}</button>
                ))}
                {(['all', 'email', 'otp', 'google-oauth'] as MethodFilter[]).map(m => (
                  <button key={m} onClick={() => setMethod(m)} style={{
                    padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10,
                    background: method === m ? 'rgba(229,9,20,0.1)' : 'transparent',
                    border: `1px solid ${method === m ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    color: method === m ? '#e50914' : 'rgba(255,255,255,0.35)',
                  }}>{m}</button>
                ))}
                {(['all', 'pwa', 'app', 'unknown'] as SessionFilter[]).map(s => (
                  <button key={s} onClick={() => setSessionFilter(s)} style={{
                    padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10,
                    background: sessionFilter === s ? 'rgba(37,211,102,0.08)' : 'transparent',
                    border: `1px solid ${sessionFilter === s ? 'rgba(37,211,102,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    color: sessionFilter === s ? '#25d366' : 'rgba(255,255,255,0.35)',
                  }}>{s === 'all' ? 'All Sessions' : s === 'pwa' ? 'PWA' : s === 'app' ? 'App' : 'Unknown'}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{filteredUsers.length} users</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Mono',monospace" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Email', 'Platform', 'Method', 'Session', 'Logins', 'Joined', 'Last Active', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 150).map(u => {
                      const joinedAgo = daysAgo(u.signupAt);
                      const lastAgo   = u.lastLoginAt ? daysAgo(u.lastLoginAt) : null;
                      return (
                        <tr key={u.$id}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,9,20,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <td style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{u.email}</td>
                          <td style={{ padding: '12px 14px' }}><Badge label={u.platform === 'pwa' ? 'PWA' : 'Mobile'} color={platformColor(u.platform)} /></td>
                          <td style={{ padding: '12px 14px' }}><Badge label={u.signupMethod} color={methodColor(u.signupMethod)} /></td>
                          <td style={{ padding: '12px 14px' }}><Badge label={sessionLabel(u.sessionType)} color={sessionColor(u.sessionType)} /></td>
                          <td style={{ padding: '12px 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{u.loginCount ?? '—'}</td>
                          <td style={{ padding: '12px 14px', fontSize: 12, color: joinedAgo <= 7 ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                            {joinedAgo === 0 ? 'Today' : joinedAgo === 1 ? 'Yesterday' : `${joinedAgo}d ago`}
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: 12, color: lastAgo === null ? 'rgba(255,255,255,0.2)' : lastAgo === 0 ? '#22c55e' : lastAgo <= 7 ? '#f59e0b' : 'rgba(255,255,255,0.35)' }}>
                            {lastAgo === null ? '—' : lastAgo === 0 ? 'Today' : `${lastAgo}d ago`}
                          </td>
                          <td style={{ padding: '12px 14px' }}><Badge label={u.isActive ? 'Active' : 'Inactive'} color={u.isActive ? '#22c55e' : '#6b7280'} /></td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No users match filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════ SESSIONS TAB ════════════════ */}
      {pageTab === 'sessions' && (
        <>
          {/* Session KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
            {loading ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} h={100} />) : (
              <>
                <StatCard label="Total Logins"      value={totalSessions.toLocaleString()} />
                <StatCard label="PWA Logins"        value={pwaSessions}       accent="#a855f7" />
                <StatCard label="App Logins"        value={appSessions}       accent="#25d366" />
                <StatCard label="Logins Today"      value={sessionsToday}     accent="#e50914" />
                <StatCard label="Unique Today"      value={uniqueToday}       accent="#f59e0b" />
                <StatCard label="Logins This Week"  value={sessionsThisWeek}  accent="#4285f4" />
                <StatCard label="Unique This Week"  value={uniqueThisWeek}    accent="#22c55e" />
              </>
            )}
          </div>

          {/* Session chart */}
          {!loading && (
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '24px 28px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', flex: 1 }}>Login Activity — PWA vs App</div>
                {(['7d', '30d', '90d', 'all'] as Period[]).map(p => (
                  <button key={p} onClick={() => setSessionPeriod(p)} style={{
                    padding: '4px 12px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10,
                    background: sessionPeriod === p ? 'rgba(229,9,20,0.12)' : 'transparent',
                    border: `1px solid ${sessionPeriod === p ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: sessionPeriod === p ? '#e50914' : 'rgba(255,255,255,0.35)',
                  }}>{p === 'all' ? 'All' : p}</button>
                ))}
              </div>
              <div style={{ height: 260 }}>
                <ChartCanvas deps={[sessionsByDay, sessionPeriod]} config={{
                  type: 'bar' as const,
                  data: { labels: sessionDates, datasets: [
                    { label: 'PWA', data: sessionPwaCounts, backgroundColor: 'rgba(168,85,247,0.7)', borderColor: '#a855f7', borderWidth: 1, borderRadius: 3 },
                    { label: 'App', data: sessionAppCounts, backgroundColor: 'rgba(37,211,102,0.7)', borderColor: '#25d366', borderWidth: 1, borderRadius: 3 },
                  ]},
                  options: { responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: 'rgba(255,255,255,0.45)', font: { family: 'DM Mono', size: 10 } } } },
                    scales: {
                      x: { stacked: true, ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'DM Mono', size: 9 }, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                      y: { stacked: true, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    },
                  } as any,
                }} />
              </div>
            </div>
          )}

          {/* Sessions table */}
          {!loading && (
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '24px 28px' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                <input placeholder="Search email or user ID…" value={sessionSearch} onChange={e => setSessionSearch(e.target.value)} style={{
                  padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                  color: '#fff', fontFamily: "'DM Mono',monospace", fontSize: 12, outline: 'none', width: 240,
                }} />
                {(['all', 'pwa', 'app'] as const).map(t => (
                  <button key={t} onClick={() => setSessionTypeFilter(t)} style={{
                    padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10,
                    background: sessionTypeFilter === t ? 'rgba(168,85,247,0.12)' : 'transparent',
                    border: `1px solid ${sessionTypeFilter === t ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: sessionTypeFilter === t ? '#a855f7' : 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                  }}>{t === 'all' ? 'All' : t}</button>
                ))}
                {(['7d', '30d', '90d', 'all'] as Period[]).map(p => (
                  <button key={p} onClick={() => setSessionPeriod(p)} style={{
                    padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10,
                    background: sessionPeriod === p ? 'rgba(229,9,20,0.1)' : 'transparent',
                    border: `1px solid ${sessionPeriod === p ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    color: sessionPeriod === p ? '#e50914' : 'rgba(255,255,255,0.35)',
                  }}>{p === 'all' ? 'All time' : p}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{filteredSessions.length} sessions</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Mono',monospace" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Email', 'Session Type', 'Platform', 'Method', 'When'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.slice(0, 200).map(s => {
                      const ha = hoursAgo(s.loginAt);
                      const da = daysAgo(s.loginAt);
                      const whenLabel = ha === 0 ? 'Just now' : ha < 24 ? `${ha}h ago` : da === 1 ? 'Yesterday' : `${da}d ago`;
                      const whenColor = ha < 1 ? '#22c55e' : ha < 24 ? '#f59e0b' : 'rgba(255,255,255,0.35)';
                      return (
                        <tr key={s.$id}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <td style={{ padding: '11px 14px', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{s.email}</td>
                          <td style={{ padding: '11px 14px' }}><Badge label={sessionLabel(s.sessionType)} color={sessionColor(s.sessionType)} /></td>
                          <td style={{ padding: '11px 14px' }}><Badge label={s.platform === 'pwa' ? 'PWA' : 'Mobile'} color={platformColor(s.platform)} /></td>
                          <td style={{ padding: '11px 14px' }}><Badge label={s.signupMethod || '—'} color={methodColor(s.signupMethod)} /></td>
                          <td style={{ padding: '11px 14px', fontSize: 12, color: whenColor }}>{whenLabel}</td>
                        </tr>
                      );
                    })}
                    {filteredSessions.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No sessions found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </PageShell>
  );
}