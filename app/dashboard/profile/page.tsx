"use client";

import { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, Camera, LogOut,
  Trash2, Save, Eye, EyeOff, Shield,
  AlertTriangle, Check, X, Pencil, Lock,
  Calendar, Film,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import MobileTopBar from "@/components/dashboard/topbar/MobileTopBar";
import DesktopTopBar from "@/components/dashboard/topbar/DesktopTopBar";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK USER
// ─────────────────────────────────────────────────────────────────────────────
const USER = {
  name: "Mwangi Kamau",
  email: "mwangi@djafro.co.ke",
  phone: "+254 712 345 678",
  avatar: null as string | null,
  joinedAt: "2024-11-03T10:00:00Z",
  moviesWatched: 47,
};

const SLIDES = [
  "/images/footer1.jpg",
];

// ─────────────────────────────────────────────────────────────────────────────
// HERO BACKGROUND — crossfading movie stills
// ─────────────────────────────────────────────────────────────────────────────
function HeroBg({ height }: { height: number }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % SLIDES.length);
        setFading(false);
      }, 1000);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-bg" style={{ height }}>
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="hero-slide"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === idx ? (fading ? 0 : 1) : 0,
            transition: "opacity 1s ease",
          }}
        />
      ))}
      <div className="hero-bar hero-bar--top" />
      <div className="hero-bar hero-bar--bot" />
      <div className="hero-vignette" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({
  name, src, size = 88, editable = false, onUpload,
}: {
  name: string; src: string | null; size?: number;
  editable?: boolean; onUpload?: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [hov, setHov] = useState(false);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && onUpload) onUpload(URL.createObjectURL(f));
  }

  return (
    <div
      className="av"
      style={{ width: size, height: size, cursor: editable ? "pointer" : "default" }}
      onMouseEnter={() => editable && setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => editable && ref.current?.click()}
    >
      {src
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <div className="av-init" style={{ fontSize: size * 0.32 }}>{initials}</div>
      }
      {editable && (
        <div className={`av-over ${hov ? "av-over--vis" : ""}`}>
          <Camera size={size * 0.22} color="#fff" />
        </div>
      )}
      {editable && <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={pick} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO ROW (read mode)
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="info-row">
      <div className="info-icon"><Icon size={13} strokeWidth={1.8} /></div>
      <div className="info-body">
        <span className="info-label">{label}</span>
        <span className="info-value">{value}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT FIELD
// ─────────────────────────────────────────────────────────────────────────────
function EditField({
  label, value, onChange, type = "text", icon: Icon, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; icon: React.ElementType; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const t = type === "password" ? (showPw ? "text" : "password") : type;

  return (
    <div className="ef-wrap">
      <label className="ef-lbl">{label}</label>
      <div className={`ef-box ${focused ? "ef-box--on" : ""}`}>
        <Icon size={13} color={focused ? "#e50914" : "rgba(255,255,255,0.2)"} strokeWidth={1.8} />
        <input
          type={t} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="ef-input"
        />
        {type === "password" && (
          <button type="button" className="ef-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
            {showPw ? <EyeOff size={13} color="rgba(255,255,255,0.25)" /> : <Eye size={13} color="rgba(255,255,255,0.25)" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function PasswordDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cur, setCur]   = useState("");
  const [nw, setNw]     = useState("");
  const [cf, setCf]     = useState("");
  const [done, setDone] = useState(false);
  const mismatch = nw && cf && nw !== cf;

  function submit() {
    if (!cur || !nw || mismatch) return;
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); setCur(""); setNw(""); setCf(""); }, 1800);
  }

  return (
    <>
      <div className={`pw-backdrop ${open ? "pw-backdrop--vis" : ""}`} onClick={onClose} />
      <div className={`pw-drawer ${open ? "pw-drawer--open" : ""}`}>
        <div className="pw-head">
          <p className="pw-title">Change Password</p>
          <button className="pw-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="pw-body">
          <EditField label="Current password" value={cur} onChange={setCur} icon={Lock} type="password" placeholder="••••••••" />
          <EditField label="New password"     value={nw}  onChange={setNw}  icon={Lock} type="password" placeholder="At least 8 characters" />
          <EditField label="Confirm password" value={cf}  onChange={setCf}  icon={Lock} type="password" placeholder="••••••••" />
          {mismatch && <p className="pw-err">Passwords don't match</p>}
        </div>
        <div className="pw-foot">
          <button className="act-btn act-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className={`act-btn act-btn--solid ${done ? "act-btn--done" : ""}`}
            onClick={submit}
            disabled={!cur || !nw || !!mismatch}
          >
            {done ? <><Check size={13} /> Updated</> : <><Save size={13} /> Update Password</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [val, setVal] = useState("");
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon"><AlertTriangle size={20} color="#e50914" /></div>
        <h2 className="modal-h">Delete Account</h2>
        <p className="modal-p">
          Permanently deletes your account, watch history, and all owned content.
          Type <strong>DELETE</strong> to confirm.
        </p>
        <input
          className="modal-input"
          placeholder="Type DELETE"
          value={val}
          onChange={e => setVal(e.target.value)}
        />
        <div className="modal-acts">
          <button className="act-btn act-btn--ghost" onClick={() => { onClose(); setVal(""); }}>Cancel</button>
          <button className="act-btn act-btn--destroy" disabled={val !== "DELETE"}>
            <Trash2 size={12} /> Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const layout = useDashboardLayout();
  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  const [name,   setName]   = useState(USER.name);
  const [email,  setEmail]  = useState(USER.email);
  const [phone,  setPhone]  = useState(USER.phone);
  const [avatar, setAvatar] = useState(USER.avatar);

  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [pwOpen,  setPwOpen]  = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const [dName,  setDName]  = useState(name);
  const [dEmail, setDEmail] = useState(email);
  const [dPhone, setDPhone] = useState(phone);

  function startEdit()  { setDName(name); setDEmail(email); setDPhone(phone); setEditing(true); }
  function cancelEdit() { setEditing(false); }
  function saveEdit()   {
    setName(dName); setEmail(dEmail); setPhone(dPhone);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const joinDate = new Date(USER.joinedAt).toLocaleDateString("en-KE", {
    day: "numeric", month: "long", year: "numeric",
  });

  const HERO_H = isSmall ? 240 : 300;

  return (
    <>
      <style>{CSS}</style>

      <div className="root">
        {!isSmall && (
          <DashboardSidebar
            user={{ name, email }}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div id="dj-content-col" className="col">
          {isSmall ? (
            <MobileTopBar onSearchOpen={() => setSearchOpen(true)} notifCount={2} userName={name} />
          ) : (
            <DesktopTopBar
              scrolled={scrolled}
              searchOpen={searchOpen} searchVal={searchVal}
              onSearchOpen={() => setSearchOpen(true)}
              onSearchClose={() => { setSearchOpen(false); setSearchVal(""); }}
              onSearchChange={setSearchVal}
              notifCount={2} userName={name}
            />
          )}

          <div className="page">

            {/* ── HERO ── */}
            <div className="hero" style={{ height: HERO_H }}>
              <HeroBg height={HERO_H} />
              <div className="hero-now">
                <span className="hero-dot" />
                NOW PLAYING
              </div>
            </div>

            {/* ── PROFILE HEADER ── */}
            <div className="phead" style={{ padding: isSmall ? "0 16px 20px" : "0 40px 24px" }}>
              <div className="phead-left">
                <div className="av-ring">
                  <Avatar
                    name={name} src={avatar}
                    size={isSmall ? 68 : 92}
                    editable={editing}
                    onUpload={setAvatar}
                  />
                  {editing && (
                    <div className="av-badge"><Camera size={9} color="#fff" /></div>
                  )}
                </div>
                <div className="phead-meta">
                  <h1 className="phead-name">{name}</h1>
                  <p className="phead-email">{email}</p>
                </div>
              </div>

              <div className="phead-actions">
                {!editing ? (
                  <>
                    <button className="act-btn act-btn--ghost" onClick={() => setPwOpen(true)}>
                      <Lock size={12} /> Password
                    </button>
                    <button className="act-btn act-btn--solid" onClick={startEdit}>
                      <Pencil size={12} /> Edit Profile
                    </button>
                  </>
                ) : (
                  <>
                    <button className="act-btn act-btn--ghost" onClick={cancelEdit}>
                      <X size={12} /> Cancel
                    </button>
                    <button
                      className={`act-btn act-btn--solid ${saved ? "act-btn--done" : ""}`}
                      onClick={saveEdit}
                    >
                      {saved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save Changes</>}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* divider */}
            <div className="hdivider" style={{ margin: isSmall ? "0 16px" : "0 40px" }} />

            {/* ── BODY ── */}
            <div className="pbody" style={{ padding: isSmall ? "24px 16px 100px" : "28px 40px 80px" }}>

              {/* stat strip */}
              <div className="stats">
                <div className="stat">
                  <Film size={13} color="rgba(255,255,255,0.28)" />
                  <span className="stat-n">{USER.moviesWatched}</span>
                  <span className="stat-l">Films watched</span>
                </div>
                <div className="stat-sep" />
                <div className="stat">
                  <Calendar size={13} color="rgba(255,255,255,0.28)" />
                  <span className="stat-n">{joinDate}</span>
                  <span className="stat-l">Member since</span>
                </div>
              </div>

              {/* grid */}
              <div className="grid" style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>

                {/* ── PERSONAL DETAILS ── */}
                <section className="section">
                  <p className="sec-label">Personal Details</p>
                  {!editing ? (
                    <div className="info-list">
                      <InfoRow label="Full name"     value={name}  icon={User}  />
                      <InfoRow label="Email address" value={email} icon={Mail}  />
                      <InfoRow label="Phone number"  value={phone} icon={Phone} />
                    </div>
                  ) : (
                    <div className="edit-fields">
                      <EditField label="Full name"     value={dName}  onChange={setDName}  icon={User}  placeholder="Your name" />
                      <EditField label="Email address" value={dEmail} onChange={setDEmail} icon={Mail}  placeholder="you@example.com" type="email" />
                      <EditField label="Phone number"  value={dPhone} onChange={setDPhone} icon={Phone} placeholder="+254 7xx xxx xxx" />
                    </div>
                  )}
                </section>

                {/* ── SECURITY ── */}
                <section className="section">
                  <p className="sec-label">Security</p>
                  <div className="sec-row" onClick={() => setPwOpen(true)}>
                    <div className="sec-ico"><Lock size={15} strokeWidth={1.8} /></div>
                    <div className="sec-text">
                      <p className="sec-t">Password</p>
                      <p className="sec-s">Click to update your password</p>
                    </div>
                    <span className="sec-chev">›</span>
                  </div>

                  <button className="signout-row" onClick={() => {}}>
                    <LogOut size={13} color="rgba(255,255,255,0.28)" />
                    <span>Sign out of this device</span>
                  </button>
                </section>

              </div>

              {/* ── DANGER ZONE ── */}
              <div className="dzone">
                <div className="dzone-inner">
                  <div>
                    <p className="dzone-t">Delete account</p>
                    <p className="dzone-s">Permanently removes your account and all data. This cannot be undone.</p>
                  </div>
                  <button className="act-btn act-btn--destroy" onClick={() => setDelOpen(true)}>
                    <Trash2 size={12} /> Delete Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {isSmall && <MobileBottomNav />}
      </div>

      <PasswordDrawer open={pwOpen} onClose={() => setPwOpen(false)} />
      <DeleteModal    open={delOpen} onClose={() => setDelOpen(false)} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
*, *::before, *::after { box-sizing: border-box; }

.root { display:flex; height:100svh; background:#070709; overflow:hidden; }
.col {
  flex:1; min-width:0;
  height:100svh; overflow-y:auto; overflow-x:hidden;
  display:flex; flex-direction:column;
}
.col::-webkit-scrollbar { display:none; }
.col { scrollbar-width:none; }
.page { flex:1; }

/* ── Hero ── */
.hero { position:relative; overflow:hidden; flex-shrink:0; }
.hero-bg { position:absolute; inset:0; }
.hero-slide {
  position:absolute; inset:0;
  background-size:cover; background-position:center 20%;
}
.hero-bar {
  position:absolute; left:0; right:0; height:20px; background:#070709; z-index:2;
}
.hero-bar--top { top:0; }
.hero-bar--bot { bottom:0; }
.hero-vignette {
  position:absolute; inset:0; z-index:1;
  background:
    linear-gradient(to bottom, rgba(7,7,9,0.45) 0%, rgba(7,7,9,0.05) 45%, rgba(7,7,9,0.75) 100%),
    linear-gradient(to right, rgba(7,7,9,0.65) 0%, transparent 65%);
}
.hero-now {
  position:absolute; top:30px; left:32px; z-index:3;
  display:flex; align-items:center; gap:8px;
  font-family:var(--font-body);
  font-size:9px; font-weight:700;
  letter-spacing:0.2em; color:rgba(255,255,255,0.4);
}
.hero-dot {
  width:6px; height:6px; background:#e50914;
  animation:blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* ── Profile header ── */
.phead {
  display:flex; align-items:flex-end; justify-content:space-between;
  flex-wrap:wrap; gap:16px;
  margin-top:-38px; position:relative; z-index:4;
}
.phead-left { display:flex; align-items:flex-end; gap:16px; }
.av-ring { position:relative; flex-shrink:0; }
.av {
  border-radius:50%; overflow:hidden; position:relative;
  border:3px solid #070709;
  box-shadow:0 0 0 1px rgba(255,255,255,0.1);
  background:#141418;
}
.av-init {
  width:100%; height:100%;
  background:linear-gradient(135deg,#e50914 0%,#6b0009 100%);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-display); font-weight:700; color:#fff;
  letter-spacing:0.02em;
}
.av-over {
  position:absolute; inset:0;
  background:rgba(0,0,0,0.55);
  display:flex; align-items:center; justify-content:center;
  opacity:0; transition:opacity .18s;
}
.av-over--vis { opacity:1; }
.av-badge {
  position:absolute; bottom:2px; right:2px;
  width:19px; height:19px; background:#e50914;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  border:2px solid #070709;
}
.phead-meta { padding-bottom:6px; }
.phead-name {
  font-family:var(--font-display);
  font-size:clamp(1.45rem,3vw,2rem);
  font-weight:700; color:#fff; margin:0;
  letter-spacing:-0.03em; line-height:1.1;
}
.phead-email {
  font-family:var(--font-body);
  font-size:12px; color:rgba(255,255,255,0.26);
  margin:4px 0 0;
}
.phead-actions {
  display:flex; gap:9px; align-items:center; padding-bottom:6px;
}

/* ── Buttons ── */
.act-btn {
  display:inline-flex; align-items:center; gap:7px;
  padding:9px 18px;
  font-family:var(--font-body);
  font-size:11px; font-weight:700;
  letter-spacing:0.06em; text-transform:uppercase;
  cursor:pointer; border:none; white-space:nowrap;
  transition:all .15s;
}
.act-btn--ghost {
  background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.09);
  color:rgba(255,255,255,0.45);
}
.act-btn--ghost:hover { background:rgba(255,255,255,0.09); color:rgba(255,255,255,0.8); }
.act-btn--solid { background:#e50914; color:#fff; }
.act-btn--solid:hover { background:#ff1a27; transform:translateY(-1px); }
.act-btn--solid:active { transform:none; }
.act-btn--done  { background:#15803d !important; }
.act-btn--done:hover { background:#166534 !important; transform:translateY(-1px); }
.act-btn--destroy {
  background:rgba(229,9,20,0.07);
  border:1px solid rgba(229,9,20,0.18);
  color:#e50914;
}
.act-btn--destroy:hover { background:rgba(229,9,20,0.14); border-color:rgba(229,9,20,0.35); }
.act-btn--destroy:disabled { opacity:0.3; cursor:not-allowed; transform:none; }

.hdivider { height:1px; background:rgba(255,255,255,0.05); }

/* ── Body ── */
.pbody {}

/* stats */
.stats {
  display:flex; align-items:center; gap:20px;
  margin-bottom:28px;
}
.stat { display:flex; align-items:center; gap:8px; }
.stat-n {
  font-family:var(--font-display);
  font-size:0.9rem; font-weight:700; color:#fff; letter-spacing:-0.01em;
}
.stat-l {
  font-family:var(--font-body);
  font-size:11px; color:rgba(255,255,255,0.22);
}
.stat-sep { width:1px; height:18px; background:rgba(255,255,255,0.07); }

/* grid */
.grid { display:grid; gap:14px; margin-bottom:20px; }

/* sections */
.section {
  background:rgba(255,255,255,0.02);
  border:1px solid rgba(255,255,255,0.06);
  padding:20px;
}
.sec-label {
  font-family:var(--font-body);
  font-size:9px; font-weight:700;
  letter-spacing:0.16em; text-transform:uppercase;
  color:rgba(255,255,255,0.18);
  margin:0 0 16px;
}

/* info rows */
.info-list { display:flex; flex-direction:column; }
.info-row {
  display:flex; align-items:center; gap:13px;
  padding:11px 0;
  border-bottom:1px solid rgba(255,255,255,0.05);
}
.info-row:last-child { border-bottom:none; padding-bottom:0; }
.info-icon {
  width:30px; height:30px; flex-shrink:0;
  background:rgba(255,255,255,0.04);
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,0.28);
}
.info-body { display:flex; flex-direction:column; gap:1px; min-width:0; }
.info-label {
  font-family:var(--font-body);
  font-size:9.5px; font-weight:700;
  letter-spacing:0.08em; text-transform:uppercase;
  color:rgba(255,255,255,0.2);
}
.info-value {
  font-family:var(--font-body);
  font-size:13.5px; color:rgba(255,255,255,0.78);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}

/* edit fields */
.edit-fields { display:flex; flex-direction:column; gap:12px; }
.ef-wrap { display:flex; flex-direction:column; gap:5px; }
.ef-lbl {
  font-family:var(--font-body);
  font-size:9.5px; font-weight:700;
  letter-spacing:0.1em; text-transform:uppercase;
  color:rgba(255,255,255,0.22);
}
.ef-box {
  display:flex; align-items:center; gap:9px;
  height:42px; padding:0 12px;
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.07);
  transition:border-color .15s, background .15s;
}
.ef-box--on { border-color:rgba(229,9,20,0.38); background:rgba(229,9,20,0.02); }
.ef-input {
  flex:1; background:none; border:none; outline:none;
  font-family:var(--font-body);
  font-size:13px; color:rgba(255,255,255,0.82);
  caret-color:#e50914; min-width:0;
}
.ef-input::placeholder { color:rgba(255,255,255,0.14); }
.ef-eye { background:none; border:none; cursor:pointer; padding:0; display:flex; align-items:center; }

/* security */
.sec-row {
  display:flex; align-items:center; gap:13px;
  padding:11px 0;
  border-bottom:1px solid rgba(255,255,255,0.05);
  cursor:pointer; transition:background .15s;
}
.sec-row:hover { background:rgba(255,255,255,0.025); }
.sec-ico {
  width:34px; height:34px; flex-shrink:0;
  background:rgba(255,255,255,0.04);
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,0.35);
}
.sec-text { flex:1; }
.sec-t {
  font-family:var(--font-body);
  font-size:13px; font-weight:600;
  color:rgba(255,255,255,0.65); margin:0 0 2px;
}
.sec-s {
  font-family:var(--font-body);
  font-size:11px; color:rgba(255,255,255,0.2); margin:0;
}
.sec-chev { font-size:18px; color:rgba(255,255,255,0.18); line-height:1; }

.signout-row {
  display:flex; align-items:center; gap:9px;
  padding:13px 0 0;
  background:none; border:none; cursor:pointer;
  font-family:var(--font-body);
  font-size:12px; color:rgba(255,255,255,0.28);
  transition:color .15s;
}
.signout-row:hover { color:rgba(255,255,255,0.6); }

/* danger zone */
.dzone {
  border:1px solid rgba(229,9,20,0.1);
  border-left:2px solid rgba(229,9,20,0.35);
  padding:18px 20px;
  background:rgba(229,9,20,0.025);
}
.dzone-inner {
  display:flex; align-items:center;
  justify-content:space-between; gap:16px; flex-wrap:wrap;
}
.dzone-t {
  font-family:var(--font-body);
  font-size:13px; font-weight:600;
  color:rgba(255,255,255,0.58); margin:0 0 3px;
}
.dzone-s {
  font-family:var(--font-body);
  font-size:11.5px; color:rgba(255,255,255,0.2); margin:0; line-height:1.5;
}

/* ── Password Drawer ── */
.pw-backdrop {
  position:fixed; inset:0; background:rgba(0,0,0,0.65);
  backdrop-filter:blur(8px); z-index:90;
  opacity:0; pointer-events:none; transition:opacity .25s;
}
.pw-backdrop--vis { opacity:1; pointer-events:all; }
.pw-drawer {
  position:fixed; right:0; top:0; bottom:0;
  width:min(420px,100vw);
  background:#0b0b0e;
  border-left:1px solid rgba(255,255,255,0.07);
  z-index:91; display:flex; flex-direction:column;
  transform:translateX(100%);
  transition:transform .3s cubic-bezier(.4,0,.2,1);
}
.pw-drawer--open { transform:translateX(0); }
.pw-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:24px 24px 20px;
  border-bottom:1px solid rgba(255,255,255,0.06);
}
.pw-title {
  font-family:var(--font-display);
  font-size:1.05rem; font-weight:700; color:#fff; margin:0;
  letter-spacing:-0.02em;
}
.pw-close {
  width:30px; height:30px;
  background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.08);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:rgba(255,255,255,0.45);
  transition:all .15s;
}
.pw-close:hover { background:rgba(255,255,255,0.1); color:#fff; }
.pw-body {
  flex:1; padding:24px;
  display:flex; flex-direction:column; gap:14px;
  overflow-y:auto;
}
.pw-err {
  font-family:var(--font-body);
  font-size:11px; color:#e50914; margin:0; font-weight:500;
}
.pw-foot {
  padding:16px 24px;
  border-top:1px solid rgba(255,255,255,0.06);
  display:flex; gap:10px; justify-content:flex-end;
}

/* ── Delete Modal ── */
.modal-bg {
  position:fixed; inset:0;
  background:rgba(0,0,0,0.85);
  backdrop-filter:blur(12px);
  display:flex; align-items:center; justify-content:center;
  z-index:99; padding:20px;
}
.modal {
  background:#0b0b0e;
  border:1px solid rgba(229,9,20,0.18);
  padding:28px 24px; width:100%; max-width:365px;
  display:flex; flex-direction:column;
  align-items:center; text-align:center; gap:12px;
}
.modal-icon {
  width:46px; height:46px;
  background:rgba(229,9,20,0.08);
  border:1px solid rgba(229,9,20,0.18);
  display:flex; align-items:center; justify-content:center;
}
.modal-h {
  font-family:var(--font-display);
  font-size:1.1rem; font-weight:700; color:#fff; margin:0;
  letter-spacing:-0.02em;
}
.modal-p {
  font-family:var(--font-body);
  font-size:12.5px; color:rgba(255,255,255,0.3); margin:0; line-height:1.65;
}
.modal-p strong { color:rgba(255,255,255,0.55); font-weight:600; }
.modal-input {
  width:100%;
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(229,9,20,0.16);
  padding:10px 14px;
  font-family:var(--font-body);
  font-size:13px; color:#fff;
  outline:none; text-align:center; letter-spacing:0.12em;
  caret-color:#e50914;
}
.modal-input::placeholder { color:rgba(255,255,255,0.16); letter-spacing:0.04em; }
.modal-input:focus { border-color:rgba(229,9,20,0.38); }
.modal-acts { display:flex; gap:10px; width:100%; }
.modal-acts .act-btn { flex:1; justify-content:center; }
`;