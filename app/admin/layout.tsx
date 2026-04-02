'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const ADMIN_EMAIL = 'chegeadmin@gmail.com';
const ADMIN_PASSWORD = 'Phil@2003';

const NAV = [
  { id: 'overview',  label: 'Overview',  icon: '▦',  path: '/admin' },
  { id: 'movies',    label: 'Movies',    icon: '◉',  path: '/admin/movies' },
  { id: 'payments',  label: 'Payments',  icon: '◈',  path: '/admin/payments' },
  { id: 'users',     label: 'Users',     icon: '◎',  path: '/admin/users' },
  { id: 'library',   label: 'Library',   icon: '◧',  path: '/admin/library' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed]       = useState(false);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setError('Invalid credentials');
    }
  };

  if (!authed) return (
    <div style={{
      minHeight: '100vh',
      background: '#080810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { color-scheme: dark; }
        body { background: #080810; }

        .login-wrap {
          width: 380px;
          padding: 48px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        .login-wrap::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #e50914, #ff6b35, #e50914);
          background-size: 200% 100%;
          animation: slide 3s linear infinite;
        }
        @keyframes slide { to { background-position: 200% 0; } }

        .login-badge {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #e50914;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .login-badge::before {
          content: '';
          width: 20px; height: 1px;
          background: #e50914;
        }
        .login-h {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .login-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 40px;
        }
        .login-field { margin-bottom: 20px; }
        .login-label {
          display: block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 10px;
        }
        .login-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 3px;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .login-input:focus { border-color: rgba(229,9,20,0.5); }
        .login-error {
          font-size: 11px;
          color: #ff6b6b;
          background: rgba(229,9,20,0.08);
          border: 1px solid rgba(229,9,20,0.2);
          padding: 10px 14px;
          border-radius: 3px;
          margin-bottom: 20px;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: #e50914;
          border: none;
          border-radius: 3px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s;
          margin-top: 8px;
        }
        .login-btn:hover { opacity: 0.85; }
      `}</style>

      <div className="login-wrap">
        <div className="login-badge">DjAfro Cinema</div>
        <h1 className="login-h">Admin<br/>Console</h1>
        <p className="login-sub">Analytics · Revenue · Performance</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="login-btn" type="submit">Access Console →</button>
        </form>
      </div>
    </div>
  );

  const active = NAV.find(n => n.path === pathname)?.id || 'overview';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810', fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { color-scheme: dark; }
        body { background: #080810; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(229,9,20,0.3); border-radius: 2px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 0',
        transition: 'width 0.25s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {!collapsed ? (
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#e50914', letterSpacing: '0.05em' }}>
              DJ<span style={{ color: '#fff' }}>AFRO</span>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono', monospace", fontWeight: 400, marginTop: 2 }}>ADMIN CONSOLE</div>
            </div>
          ) : (
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#e50914', textAlign: 'center' }}>DJ</div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(n => {
            const isActive = n.id === active;
            return (
              <button key={n.id} onClick={() => router.push(n.path)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(229,9,20,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(229,9,20,0.25)' : '1px solid transparent',
                borderRadius: 4,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                width: '100%',
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
              }}>
                <span style={{ fontSize: 16, color: isActive ? '#e50914' : 'inherit' }}>{n.icon}</span>
                {!collapsed && <span>{n.label}</span>}
                {!collapsed && isActive && <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#e50914' }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '0 12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setCollapsed(c => !c)} style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
            padding: '8px 12px', background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, width: '100%',
          }}>{collapsed ? '→' : '←'}</button>

          <button onClick={() => setAuthed(false)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '10px 12px', background: 'transparent',
            border: '1px solid rgba(229,9,20,0.15)', borderRadius: 4,
            color: 'rgba(229,9,20,0.6)', cursor: 'pointer',
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.1em', width: '100%',
          }}>
            <span>⊗</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}