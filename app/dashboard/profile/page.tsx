"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Camera, LogOut,
  Trash2, Save, Eye, EyeOff,
  AlertTriangle, Check, X, Pencil,
  Lock, Calendar, MessageCircle,
  Send, RefreshCw, ExternalLink, Clapperboard,
  ChevronRight, Film, Palette,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { account, databases } from "@/lib/appwrite";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import { ID } from "appwrite";

const DATABASE_ID               = process.env.NEXT_PUBLIC_DATABASE_ID!;
const USER_REQUESTS_COLLECTION_ID = process.env.NEXT_PUBLIC_USER_REQUESTS_COLLECTION_ID!;
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb7ysbU3GJOobmCMxx0d";
const WHATSAPP_DIRECT  = "https://wa.me/254711263923";

// ── DiceBear avatar styles (gender-neutral, fun) ──────────────────────────
const AVATAR_STYLES = [
  "bottts",
  "fun-emoji",
  "adventurer-neutral",
  "lorelei-neutral",
  "micah",
  "notionists-neutral",
  "pixel-art-neutral",
  "thumbs",
  "open-peeps",
];

function dicebearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a0f`;
}

function formatJoin(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC HERO BG
// ─────────────────────────────────────────────────────────────────────────────
function HeroBg({ height }: { height: number }) {
  return (
    <div className="hero-bg" style={{ height }}>
      <div className="hero-slide" style={{ backgroundImage: "url(/images/footer1.jpg)" }} />
      <div className="hero-bar hero-bar--top" />
      <div className="hero-bar hero-bar--bot" />
      <div className="hero-vignette" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR PICKER
// ─────────────────────────────────────────────────────────────────────────────
function AvatarPicker({
  seed, style, size, editable, onStyleChange, onSeedChange,
}: {
  seed: string; style: string; size: number; editable: boolean;
  onStyleChange: (s: string) => void;
  onSeedChange:  (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hov,  setHov]  = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div
        className="av"
        style={{ width: size, height: size, cursor: editable ? "pointer" : "default" }}
        onMouseEnter={() => editable && setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => editable && setOpen(o => !o)}
      >
        <img
          src={dicebearUrl(style, seed)}
          alt="avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {editable && (
          <div className={`av-over${hov ? " av-over--vis" : ""}`}>
            <Camera size={Math.round(size * 0.22)} color="#fff" />
          </div>
        )}
      </div>

      {open && editable && (
        <div className="av-picker">
          <div className="av-picker-head">
            <span>Pick your avatar</span>
            <button className="av-picker-close" onClick={() => setOpen(false)}><X size={13} /></button>
          </div>
          <div className="av-picker-grid">
            {AVATAR_STYLES.map(s => (
              <button
                key={s}
                className={`av-opt${style === s ? " av-opt--on" : ""}`}
                onClick={() => { onStyleChange(s); }}
                title={s}
              >
                <img
                  src={dicebearUrl(s, seed)}
                  alt={s}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
          <button
            className="av-shuffle"
            onClick={() => onSeedChange(Math.random().toString(36).slice(2, 10))}
          >
            <RefreshCw size={10} /> Shuffle look
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THEME SWITCHER SECTION
// ─────────────────────────────────────────────────────────────────────────────
function ThemeSwitcher() {
  const { theme, themes, setThemeId } = useTheme();

  return (
    <section className="section">
      <p className="sec-lbl">Active Theme</p>
      <div className="theme-grid">
        {themes.map(th => {
          const isActive = th.id === theme.id;
          return (
            <button
              key={th.id}
              className={`theme-swatch${isActive ? " theme-swatch--on" : ""}`}
              onClick={() => setThemeId(th.id as Parameters<typeof setThemeId>[0])}
              title={th.name}
              style={{
                "--swatch-accent": th.tokens.accent,
                "--swatch-bg": th.tokens.bgSurface,
                "--swatch-glow": th.tokens.accentGlow,
              } as React.CSSProperties}
            >
              <span className="swatch-dot" />
              <span className="swatch-name">{th.name}</span>
              {isActive && <Check size={10} className="swatch-check" />}
            </button>
          );
        })}
      </div>
      <p className="theme-active-label">
        <span className="theme-active-dot" />
        {theme.name} — {theme.description}
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO ROW
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="info-row">
      <div className="info-icon"><Icon size={13} strokeWidth={1.8} /></div>
      <div className="info-body">
        <span className="info-lbl">{label}</span>
        <span className="info-val">{value || "—"}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT FIELD
// ─────────────────────────────────────────────────────────────────────────────
function EditField({
  label, value, onChange, type = "text", icon: Icon, placeholder, disabled: dis,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; icon: React.ElementType; placeholder?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const t = type === "password" ? (showPw ? "text" : "password") : type;

  return (
    <div className="ef-wrap">
      <label className="ef-lbl">{label}</label>
      <div className={`ef-box${focused && !dis ? " ef-box--on" : ""}${dis ? " ef-box--dis" : ""}`}>
        <Icon size={13} strokeWidth={1.8} />
        <input
          type={t} value={value}
          onChange={e => !dis && onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={dis}
          className="ef-input"
        />
        {type === "password" && !dis && (
          <button type="button" className="ef-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
            {showPw
              ? <EyeOff size={13} />
              : <Eye    size={13} />}
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
  const [nw,  setNw]    = useState("");
  const [cf,  setCf]    = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);
  const mismatch = nw && cf && nw !== cf;

  async function submit() {
    if (!cur || !nw || mismatch) return;
    setErr(null); setBusy(true);
    try {
      await account.updatePassword(nw, cur);
      setDone(true);
      setTimeout(() => {
        setDone(false); onClose();
        setCur(""); setNw(""); setCf("");
      }, 1800);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Update failed — check your current password.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className={`pw-backdrop${open ? " pw-backdrop--vis" : ""}`} onClick={onClose} />
      <div className={`pw-drawer${open ? " pw-drawer--open" : ""}`}>
        <div className="pw-head">
          <p className="pw-title">Change Password</p>
          <button className="pw-close" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="pw-body">
          <EditField label="Current password" value={cur} onChange={setCur} icon={Lock} type="password" placeholder="••••••••" />
          <EditField label="New password"     value={nw}  onChange={setNw}  icon={Lock} type="password" placeholder="At least 8 characters" />
          <EditField label="Confirm password" value={cf}  onChange={setCf}  icon={Lock} type="password" placeholder="••••••••" />
          {mismatch && <p className="ferr">Passwords don't match</p>}
          {err      && <p className="ferr">{err}</p>}
        </div>
        <div className="pw-foot">
          <button className="act-btn act-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className={`act-btn act-btn--solid${done ? " act-btn--done" : ""}`}
            onClick={submit}
            disabled={!cur || !nw || !!mismatch || busy}
          >
            {done ? <><Check size={12} /> Updated</> : busy ? "Updating…" : <><Save size={12} /> Update</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOVIE REQUEST DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function RequestDrawer({
  open, onClose, user,
}: {
  open: boolean; onClose: () => void;
  user: { $id: string; name: string; email: string } | null;
}) {
  const [title, setTitle] = useState("");
  const [year,  setYear]  = useState("");
  const [genre, setGenre] = useState("");
  const [busy,  setBusy]  = useState(false);
  const [done,  setDone]  = useState(false);
  const [err,   setErr]   = useState<string | null>(null);

  async function submit() {
    if (!title.trim()) return;
    setErr(null); setBusy(true);
    try {
      await databases.createDocument(DATABASE_ID, USER_REQUESTS_COLLECTION_ID, ID.unique(), {
        user_id:      user?.$id   ?? "guest",
        user_name:    user?.name  ?? "Guest",
        user_email:   user?.email ?? "",
        message_type: "movie_request",
        priority:     "normal",
        status:       "new",
        is_read:      false,
        movie_title:  title.trim(),
        movie_year:   year.trim()  || null,
        movie_genre:  genre.trim() || null,
        subject:      `Movie Request: ${title.trim()}`,
        content:      `User requested: ${title.trim()}${year ? ` (${year})` : ""}${genre ? ` — Genre: ${genre}` : ""}`,
      });
      setDone(true);
      setTimeout(() => {
        setDone(false); onClose();
        setTitle(""); setYear(""); setGenre("");
      }, 2000);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to send. Try again.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className={`pw-backdrop${open ? " pw-backdrop--vis" : ""}`} onClick={onClose} />
      <div className={`pw-drawer${open ? " pw-drawer--open" : ""}`}>
        <div className="pw-head">
          <p className="pw-title">Request a Movie</p>
          <button className="pw-close" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="pw-body">
          <p className="req-hint">
            Can't find a movie? Request it below and we'll add it to the library.
            Or contact us directly on{" "}
            <a href={WHATSAPP_DIRECT} target="_blank" rel="noreferrer" className="req-link">
              WhatsApp
            </a>.
          </p>

          <EditField label="Movie title *" value={title} onChange={setTitle} icon={Film}      placeholder="e.g. Baahubali" />
          <EditField label="Release year"  value={year}  onChange={setYear}  icon={Calendar}  placeholder="e.g. 2023" />
          <EditField label="Genre"         value={genre} onChange={setGenre} icon={Clapperboard} placeholder="e.g. Action, Drama" />

          {err && <p className="ferr">{err}</p>}
          {done && (
            <div className="req-success">
              <Check size={14} /> Request sent! We'll add it soon.
            </div>
          )}

          <div className="req-alt">
            <p className="req-alt-lbl">Or request on WhatsApp</p>
            <div className="req-alt-row">
              <a href={WHATSAPP_CHANNEL} target="_blank" rel="noreferrer" className="wa-btn wa-btn--ch">
                <MessageCircle size={12} /> Join Channel
              </a>
              <a href={WHATSAPP_DIRECT} target="_blank" rel="noreferrer" className="wa-btn wa-btn--dm">
                <Send size={12} /> Direct Message
              </a>
            </div>
          </div>
        </div>
        <div className="pw-foot">
          <button className="act-btn act-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className={`act-btn act-btn--solid${done ? " act-btn--done" : ""}`}
            onClick={submit}
            disabled={!title.trim() || busy || done}
          >
            {done ? <><Check size={12} /> Sent!</> : busy ? "Sending…" : <><Send size={12} /> Send Request</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteModal({
  open, onClose, onConfirm,
}: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const [val, setVal] = useState("");
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon"><AlertTriangle size={20} /></div>
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
          <button className="act-btn act-btn--ghost" onClick={() => { onClose(); setVal(""); }}>
            Cancel
          </button>
          <button
            className="act-btn act-btn--destroy"
            disabled={val !== "DELETE"}
            onClick={() => { if (val === "DELETE") onConfirm(); }}
          >
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
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  // Editable fields
  const [name,  setName]  = useState(user?.name  ?? "");
  const [phone, setPhone] = useState((user?.prefs?.phone as string) ?? "");

  // Avatar (stored in account prefs)
  const [avStyle, setAvStyle] = useState<string>((user?.prefs?.avStyle as string) ?? "bottts");
  const [avSeed,  setAvSeed]  = useState<string>((user?.prefs?.avSeed  as string) ?? (user?.$id ?? "djafro"));

  // Draft values (only committed on Save)
  const [dName,    setDName]    = useState(name);
  const [dPhone,   setDPhone]   = useState(phone);
  const [dAvStyle, setDAvStyle] = useState(avStyle);
  const [dAvSeed,  setDAvSeed]  = useState(avSeed);

  // UI
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [pwOpen,  setPwOpen]  = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  // Sync from auth on load
  useEffect(() => {
    if (user) {
      const n = user.name ?? "";
      const p = (user.prefs?.phone as string) ?? "";
      const s = (user.prefs?.avStyle as string) ?? "bottts";
      const sd = (user.prefs?.avSeed  as string) ?? user.$id;
      setName(n); setPhone(p); setAvStyle(s); setAvSeed(sd);
      setDName(n); setDPhone(p); setDAvStyle(s); setDAvSeed(sd);
    }
  }, [user]);

  function startEdit() {
    setDName(name); setDPhone(phone);
    setDAvStyle(avStyle); setDAvSeed(avSeed);
    setSaveErr(null); setEditing(true);
  }
  function cancelEdit() { setEditing(false); setSaveErr(null); }

  async function saveEdit() {
    setSaving(true); setSaveErr(null);
    try {
      if (dName !== name) await account.updateName(dName);
      await account.updatePrefs({
        ...user?.prefs,
        phone:   dPhone,
        avStyle: dAvStyle,
        avSeed:  dAvSeed,
      });
      setName(dName); setPhone(dPhone);
      setAvStyle(dAvStyle); setAvSeed(dAvSeed);
      setEditing(false); setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2400);
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : "Save failed. Please try again.");
    } finally { setSaving(false); }
  }

  async function handleLogout() {
    await logout();
    router.replace("/auth");
  }

  async function handleDeleteAccount() {
    try { await account.deleteSession("current"); } catch { /* ok */ }
    router.replace("/auth");
  }

  const HERO_H   = isSmall ? 220 : 290;
  const AV_SIZE  = isSmall ? 72 : 92;
  const displayName  = name  || user?.name  || "Guest";
  const displayEmail = user?.email ?? "";
  const createdAt    = (user as unknown as Record<string, string>)?.$createdAt;

  // Which avatar values to preview during editing
  const previewStyle = editing ? dAvStyle : avStyle;
  const previewSeed  = editing ? dAvSeed  : avSeed;

  return (
    <>
      <style>{CSS}</style>

      <div className="root">
        {!isSmall && (
          <DashboardSidebar
            user={{ name: displayName, email: displayEmail }}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div id="dj-content-col" className="col">

          <div className="page">

            {/* ── HERO ── */}
            <div className="hero" style={{ height: HERO_H }}>
              <HeroBg height={HERO_H} />
              <div className="hero-now">
                <span className="hero-dot" />NOW PLAYING
              </div>
            </div>

            {/* ── PROFILE HEADER ── */}
            <div className="phead" style={{ padding: isSmall ? "0 16px 18px" : "0 40px 22px" }}>
              <div className="phead-left">
                <div className="av-ring">
                  <AvatarPicker
                    seed={previewSeed} style={previewStyle}
                    size={AV_SIZE} editable={editing}
                    onStyleChange={s => setDAvStyle(s)}
                    onSeedChange={s  => setDAvSeed(s)}
                  />
                  {editing && <div className="av-badge"><Camera size={9} color="#fff" /></div>}
                </div>
                <div className="phead-meta">
                  <h1 className="phead-name">{displayName}</h1>
                  <p className="phead-email">{displayEmail}</p>
                  {savedOk && (
                    <span className="saved-toast"><Check size={10} /> Profile saved</span>
                  )}
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
                    <button className="act-btn act-btn--ghost" onClick={cancelEdit} disabled={saving}>
                      <X size={12} /> Cancel
                    </button>
                    <button
                      className={`act-btn act-btn--solid${savedOk ? " act-btn--done" : ""}`}
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      {savedOk ? <><Check size={12} /> Saved</>
                        : saving ? "Saving…"
                        : <><Save size={12} /> Save Changes</>}
                    </button>
                  </>
                )}
              </div>
            </div>

            {saveErr && (
              <div className="save-err" style={{ margin: isSmall ? "0 16px 12px" : "0 40px 12px" }}>
                <AlertTriangle size={12} /> {saveErr}
              </div>
            )}

            <div className="hdivider" style={{ margin: isSmall ? "0 16px" : "0 40px" }} />

            {/* ── BODY ── */}
            <div className="pbody" style={{ padding: isSmall ? "20px 16px 110px" : "24px 40px 80px" }}>

              {/* Member since */}
              {createdAt && (
                <div className="stats">
                  <div className="stat">
                    <Calendar size={12} />
                    <span className="stat-n">{formatJoin(createdAt)}</span>
                    <span className="stat-l">Member since</span>
                  </div>
                </div>
              )}

              {/* ── Main grid ── */}
              <div className="grid" style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>

                {/* Personal details */}
                <section className="section">
                  <p className="sec-lbl">Personal Details</p>
                  {!editing ? (
                    <div className="info-list">
                      <InfoRow label="Full name"     value={displayName}        icon={User}  />
                      <InfoRow label="Email address" value={displayEmail}       icon={Mail}  />
                      <InfoRow label="Phone number"  value={phone || "Not set"} icon={Phone} />
                    </div>
                  ) : (
                    <div className="edit-fields">
                      <EditField
                        label="Full name" value={dName} onChange={setDName}
                        icon={User} placeholder="Your name"
                      />
                      <EditField
                        label="Email address" value={displayEmail} onChange={() => {}}
                        icon={Mail} disabled
                      />
                      <p className="ef-hint">Email address cannot be changed here.</p>
                      <EditField
                        label="Phone number" value={dPhone} onChange={setDPhone}
                        icon={Phone} placeholder="+254 7xx xxx xxx"
                      />
                    </div>
                  )}
                </section>

                {/* Security */}
                <section className="section">
                  <p className="sec-lbl">Security</p>

                  <div className="sec-row" onClick={() => setPwOpen(true)}>
                    <div className="sec-ico"><Lock size={14} strokeWidth={1.8} /></div>
                    <div className="sec-text">
                      <p className="sec-t">Password</p>
                      <p className="sec-s">Update your account password</p>
                    </div>
                    <ChevronRight size={14} />
                  </div>

                  <div className="sec-row" onClick={handleLogout}>
                    <div className="sec-ico"><LogOut size={14} strokeWidth={1.8} /></div>
                    <div className="sec-text">
                      <p className="sec-t">Sign Out</p>
                      <p className="sec-s">Sign out of this device</p>
                    </div>
                    <ChevronRight size={14} />
                  </div>
                </section>
              </div>

              {/* ── THEME SWITCHER ── */}
              <div style={{ marginBottom: "12px" }}>
                <ThemeSwitcher />
              </div>

              {/* ── WhatsApp channel card ── */}
              <div className="wa-card">
                <div className="wa-card-l">
                  <div className="wa-icon">
                    <MessageCircle size={20} color="#25D366" />
                  </div>
                  <div>
                    <p className="wa-card-t">Join Our WhatsApp Channel</p>
                    <p className="wa-card-s">
                      Get notified when new movies drop, request films, and stay in the loop.
                    </p>
                  </div>
                </div>
                <a
                  href={WHATSAPP_CHANNEL}
                  target="_blank"
                  rel="noreferrer"
                  className="act-btn act-btn--wa"
                >
                  <ExternalLink size={12} /> Join Now
                </a>
              </div>

              {/* ── Movie request card ── */}
              <div className="req-card" onClick={() => setReqOpen(true)}>
                <div className="req-card-l">
                  <div className="req-icon">
                    <Clapperboard size={20} />
                  </div>
                  <div>
                    <p className="req-card-t">Can't Find a Movie?</p>
                    <p className="req-card-s">
                      Request any movie and we'll add it to the library for you.
                    </p>
                  </div>
                </div>
                <span className="act-btn act-btn--ghost" style={{ pointerEvents: "none" }}>
                  <Send size={12} /> Request
                </span>
              </div>

              {/* ── Danger zone ── */}
              <div className="dzone">
                <div className="dzone-inner">
                  <div>
                    <p className="dzone-t">Delete account</p>
                    <p className="dzone-s">
                      Permanently removes your account and all data. This cannot be undone.
                    </p>
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

      <PasswordDrawer open={pwOpen}  onClose={() => setPwOpen(false)} />
      <RequestDrawer  open={reqOpen} onClose={() => setReqOpen(false)} user={user} />
      <DeleteModal    open={delOpen} onClose={() => setDelOpen(false)} onConfirm={handleDeleteAccount} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS — fully theme-aware via var(--dj-*) tokens
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }
html, body { background: var(--dj-bg-base); color: var(--dj-text-primary); margin: 0; padding: 0; }

.root { display: flex; height: 100svh; background: var(--dj-bg-base); overflow: hidden; }
.col {
  flex: 1; min-width: 0; height: 100svh;
  overflow-y: auto; overflow-x: hidden;
  display: flex; flex-direction: column;
  scrollbar-width: none;
}
.col::-webkit-scrollbar { display: none; }
.page { flex: 1; }

/* ── Hero ── */
.hero { position: relative; overflow: hidden; flex-shrink: 0; }
.hero-bg { position: absolute; inset: 0; }
.hero-slide {
  position: absolute; inset: 0;
  background-size: cover; background-position: center 20%;
}
.hero-bar {
  position: absolute; left: 0; right: 0; height: 20px;
  background: var(--dj-bg-base); z-index: 2;
}
.hero-bar--top { top: 0; }
.hero-bar--bot { bottom: 0; }
.hero-vignette {
  position: absolute; inset: 0; z-index: 1;
  background:
    linear-gradient(to bottom, color-mix(in srgb, var(--dj-bg-base) 45%, transparent) 0%, color-mix(in srgb, var(--dj-bg-base) 5%, transparent) 45%, color-mix(in srgb, var(--dj-bg-base) 75%, transparent) 100%),
    linear-gradient(to right, color-mix(in srgb, var(--dj-bg-base) 65%, transparent) 0%, transparent 65%);
}
.hero-now {
  position: absolute; top: 28px; left: 32px; z-index: 3;
  display: flex; align-items: center; gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.2em; color: var(--dj-text-muted);
}
.hero-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--dj-accent);
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.22} }

/* ── Profile header ── */
.phead {
  display: flex; align-items: flex-end; justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
  margin-top: -36px; position: relative; z-index: 4;
}
.phead-left { display: flex; align-items: flex-end; gap: 14px; }
.av-ring { position: relative; flex-shrink: 0; }
.av {
  border-radius: 50%; overflow: hidden; position: relative;
  border: 3px solid var(--dj-bg-base);
  box-shadow: 0 0 0 1px var(--dj-border-subtle);
  background: var(--dj-bg-surface);
}
.av-over {
  position: absolute; inset: 0;
  background: var(--dj-overlay);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .17s;
}
.av-over--vis { opacity: 1; }
.av-badge {
  position: absolute; bottom: 2px; right: 2px;
  width: 18px; height: 18px; background: var(--dj-accent); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--dj-bg-base);
}

/* Avatar picker */
.av-picker {
  position: absolute; left: 0; top: calc(100% + 10px);
  background: var(--dj-bg-surface);
  border: 1px solid var(--dj-border-medium);
  border-radius: 12px; padding: 14px;
  z-index: 50; width: 258px;
  box-shadow: 0 20px 60px var(--dj-overlay);
}
.av-picker-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 11px;
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--dj-text-muted);
}
.av-picker-close {
  background: none; border: none; cursor: pointer;
  color: var(--dj-icon-inactive); display: flex; padding: 0;
  transition: color .15s;
}
.av-picker-close:hover { color: var(--dj-text-primary); }
.av-picker-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px;
  margin-bottom: 9px;
}
.av-opt {
  width: 100%; aspect-ratio: 1; border-radius: 7px;
  overflow: hidden; cursor: pointer; background: var(--dj-bg-elevated);
  border: 2px solid transparent; padding: 0;
  transition: border-color .14s, transform .14s;
}
.av-opt:hover { transform: scale(1.09); border-color: var(--dj-border-accent); }
.av-opt--on  { border-color: var(--dj-accent); }
.av-shuffle {
  width: 100%; padding: 7px; border-radius: 7px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; font-weight: 500;
  color: var(--dj-text-secondary);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background .14s, color .14s;
}
.av-shuffle:hover { background: var(--dj-nav-active-bg); color: var(--dj-text-primary); }

.phead-meta { padding-bottom: 4px; }
.phead-name {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  font-weight: 800; color: var(--dj-text-primary); margin: 0;
  letter-spacing: -0.03em; line-height: 1.1;
}
.phead-email {
  font-family: 'Outfit', sans-serif;
  font-size: 11px; color: var(--dj-text-muted); margin: 3px 0 0;
}
.saved-toast {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 5px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px; font-weight: 600;
  color: var(--dj-success); letter-spacing: 0.02em;
}
.phead-actions { display: flex; gap: 8px; align-items: center; padding-bottom: 4px; }

/* ── Buttons ── */
.act-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 17px; border-radius: 7px;
  font-family: 'Outfit', sans-serif;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; border: none; white-space: nowrap;
  text-decoration: none; transition: all .14s;
}
.act-btn--ghost {
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  color: var(--dj-text-secondary);
}
.act-btn--ghost:hover { background: var(--dj-nav-active-bg); color: var(--dj-text-primary); }
.act-btn--solid { background: var(--dj-accent); color: var(--dj-text-on-accent); }
.act-btn--solid:hover { background: var(--dj-accent-light); transform: translateY(-1px); }
.act-btn--solid:active { transform: none; }
.act-btn--solid:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.act-btn--done { background: var(--dj-success) !important; color: #fff !important; }
.act-btn--done:hover { filter: brightness(1.1); transform: translateY(-1px); }
.act-btn--wa {
  background: rgba(37,211,102,0.08);
  border: 1px solid rgba(37,211,102,0.2);
  color: #25D366; flex-shrink: 0;
}
.act-btn--wa:hover { background: rgba(37,211,102,0.15); }
.act-btn--destroy {
  background: color-mix(in srgb, var(--dj-danger) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--dj-danger) 18%, transparent);
  color: var(--dj-danger);
}
.act-btn--destroy:hover {
  background: color-mix(in srgb, var(--dj-danger) 14%, transparent);
  border-color: color-mix(in srgb, var(--dj-danger) 35%, transparent);
}
.act-btn--destroy:disabled { opacity: 0.3; cursor: not-allowed; }

.save-err {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 12px; border-radius: 7px;
  background: color-mix(in srgb, var(--dj-danger) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--dj-danger) 18%, transparent);
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px; color: var(--dj-danger);
}

.hdivider { height: 1px; background: var(--dj-border-subtle); }

/* ── Body ── */
.stats { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.stat  { display: flex; align-items: center; gap: 7px; color: var(--dj-text-muted); }
.stat-n {
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem; font-weight: 700; color: var(--dj-text-secondary);
}
.stat-l {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: var(--dj-text-muted);
}

.grid { display: grid; gap: 10px; margin-bottom: 12px; }

.section {
  background: color-mix(in srgb, var(--dj-text-primary) 2%, transparent);
  border: 1px solid var(--dj-border-subtle);
  border-radius: 10px; padding: 17px;
}
.sec-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--dj-text-muted); margin: 0 0 13px;
}

.info-list { display: flex; flex-direction: column; }
.info-row {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--dj-border-subtle);
}
.info-row:last-child { border-bottom: none; padding-bottom: 0; }
.info-icon {
  width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px;
  background: var(--dj-nav-hover-bg);
  display: flex; align-items: center; justify-content: center;
  color: var(--dj-icon-inactive);
}
.info-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.info-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--dj-text-muted);
}
.info-val {
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; color: var(--dj-text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.edit-fields { display: flex; flex-direction: column; gap: 10px; }
.ef-wrap { display: flex; flex-direction: column; gap: 4px; }
.ef-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--dj-text-muted);
}
.ef-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px; color: var(--dj-text-muted);
  margin: -4px 0 0;
}
.ef-box {
  display: flex; align-items: center; gap: 9px;
  height: 40px; padding: 0 11px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle); border-radius: 7px;
  transition: border-color .14s, background .14s;
  color: var(--dj-icon-inactive);
}
.ef-box--on  { border-color: var(--dj-border-accent); background: var(--dj-nav-active-bg); color: var(--dj-accent); }
.ef-box--dis { opacity: 0.4; cursor: not-allowed; }
.ef-input {
  flex: 1; background: none; border: none; outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; color: var(--dj-text-primary);
  caret-color: var(--dj-accent); min-width: 0;
}
.ef-input::placeholder { color: var(--dj-text-muted); }
.ef-input:disabled { cursor: not-allowed; }
.ef-eye {
  background: none; border: none; cursor: pointer; padding: 0;
  display: flex; align-items: center; color: var(--dj-icon-inactive);
}

.sec-row {
  display: flex; align-items: center; gap: 11px;
  padding: 9px 0;
  border-bottom: 1px solid var(--dj-border-subtle);
  cursor: pointer; border-radius: 6px;
  transition: padding-left .14s, background .14s;
}
.sec-row:last-child { border-bottom: none; }
.sec-row:hover { background: var(--dj-nav-hover-bg); padding-left: 6px; }
.sec-ico {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 7px;
  background: var(--dj-nav-hover-bg);
  display: flex; align-items: center; justify-content: center;
  color: var(--dj-icon-inactive);
}
.sec-text { flex: 1; }
.sec-t {
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; font-weight: 600;
  color: var(--dj-text-secondary); margin: 0 0 1px;
}
.sec-s {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: var(--dj-text-muted); margin: 0;
}

/* ── Theme switcher ── */
.theme-grid {
  display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 10px;
}
.theme-swatch {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 11px 6px 8px; border-radius: 20px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  cursor: pointer; transition: all .16s;
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; font-weight: 600;
  color: var(--dj-text-secondary); white-space: nowrap;
}
.theme-swatch:hover {
  border-color: var(--swatch-accent, var(--dj-border-accent));
  background: color-mix(in srgb, var(--swatch-accent, var(--dj-accent)) 8%, transparent);
  color: var(--dj-text-primary);
}
.theme-swatch--on {
  border-color: var(--swatch-accent, var(--dj-accent));
  background: color-mix(in srgb, var(--swatch-accent, var(--dj-accent)) 12%, transparent);
  color: var(--dj-text-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--swatch-accent, var(--dj-accent)) 25%, transparent);
}
.swatch-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--swatch-accent, var(--dj-accent));
  flex-shrink: 0;
  box-shadow: 0 0 6px var(--swatch-glow, var(--dj-accent-glow));
}
.swatch-name { line-height: 1; }
.swatch-check { color: var(--swatch-accent, var(--dj-accent)); margin-left: 2px; }
.theme-active-label {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: var(--dj-text-muted); margin: 0;
}
.theme-active-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--dj-accent);
  box-shadow: 0 0 8px var(--dj-accent-glow);
  flex-shrink: 0;
  animation: blink 2s ease-in-out infinite;
}

/* ── WhatsApp card ── */
.wa-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; flex-wrap: wrap;
  padding: 15px 17px; border-radius: 10px;
  background: rgba(37,211,102,0.04);
  border: 1px solid rgba(37,211,102,0.11);
  margin-bottom: 9px;
}
.wa-card-l { display: flex; align-items: center; gap: 13px; flex: 1; }
.wa-icon {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: 8px;
  background: rgba(37,211,102,0.09);
  border: 1px solid rgba(37,211,102,0.16);
  display: flex; align-items: center; justify-content: center;
}
.wa-card-t {
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; font-weight: 600;
  color: var(--dj-text-secondary); margin: 0 0 2px;
}
.wa-card-s {
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; color: var(--dj-text-muted); margin: 0; line-height: 1.5;
}

/* ── Request card ── */
.req-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; flex-wrap: wrap;
  padding: 15px 17px; border-radius: 10px;
  background: color-mix(in srgb, var(--dj-accent) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--dj-accent) 9%, transparent);
  margin-bottom: 12px; cursor: pointer;
  transition: background .14s, border-color .14s;
}
.req-card:hover {
  background: color-mix(in srgb, var(--dj-accent) 6%, transparent);
  border-color: color-mix(in srgb, var(--dj-accent) 18%, transparent);
}
.req-card-l { display: flex; align-items: center; gap: 13px; flex: 1; }
.req-icon {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: 8px;
  background: color-mix(in srgb, var(--dj-accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--dj-accent) 14%, transparent);
  display: flex; align-items: center; justify-content: center;
  color: var(--dj-accent);
}
.req-card-t {
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; font-weight: 600;
  color: var(--dj-text-secondary); margin: 0 0 2px;
}
.req-card-s {
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; color: var(--dj-text-muted); margin: 0; line-height: 1.5;
}

/* ── Danger zone ── */
.dzone {
  border: 1px solid color-mix(in srgb, var(--dj-danger) 10%, transparent);
  border-left: 2px solid color-mix(in srgb, var(--dj-danger) 35%, transparent);
  border-radius: 0 8px 8px 0;
  padding: 15px 17px;
  background: color-mix(in srgb, var(--dj-danger) 2%, transparent);
}
.dzone-inner {
  display: flex; align-items: center;
  justify-content: space-between; gap: 14px; flex-wrap: wrap;
}
.dzone-t {
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; font-weight: 600;
  color: var(--dj-text-secondary); margin: 0 0 2px;
}
.dzone-s {
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; color: var(--dj-text-muted); margin: 0; line-height: 1.5;
}

/* ── Drawers ── */
.pw-backdrop {
  position: fixed; inset: 0;
  background: var(--dj-overlay); backdrop-filter: blur(8px);
  z-index: 90; opacity: 0; pointer-events: none;
  transition: opacity .24s;
}
.pw-backdrop--vis { opacity: 1; pointer-events: all; }
.pw-drawer {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: min(430px, 100vw);
  background: var(--dj-bg-surface);
  border-left: 1px solid var(--dj-border-subtle);
  z-index: 91; display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.pw-drawer--open { transform: translateX(0); }
.pw-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--dj-border-subtle);
}
.pw-title {
  font-family: 'Syne', sans-serif;
  font-size: 0.98rem; font-weight: 700; color: var(--dj-text-primary); margin: 0;
  letter-spacing: -0.02em;
}
.pw-close {
  width: 28px; height: 28px; border-radius: 6px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--dj-icon-inactive);
  transition: all .14s;
}
.pw-close:hover { background: var(--dj-nav-active-bg); color: var(--dj-text-primary); }
.pw-body {
  flex: 1; padding: 18px;
  display: flex; flex-direction: column; gap: 11px;
  overflow-y: auto; scrollbar-width: none;
}
.pw-body::-webkit-scrollbar { display: none; }
.pw-foot {
  padding: 13px 18px;
  border-top: 1px solid var(--dj-border-subtle);
  display: flex; gap: 8px; justify-content: flex-end;
}

.ferr {
  font-family: 'Outfit', sans-serif;
  font-size: 11px; color: var(--dj-danger); margin: 0; font-weight: 500;
}

/* request drawer extras */
.req-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px; color: var(--dj-text-muted); line-height: 1.65; margin: 0;
}
.req-link { color: #25D366; text-decoration: none; font-weight: 600; }
.req-link:hover { text-decoration: underline; }
.req-success {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 12px; border-radius: 7px;
  background: color-mix(in srgb, var(--dj-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dj-success) 18%, transparent);
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px; color: var(--dj-success); font-weight: 500;
}
.req-alt { margin-top: 4px; }
.req-alt-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--dj-text-muted); margin: 0 0 7px;
}
.req-alt-row { display: flex; gap: 7px; }
.wa-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 13px; border-radius: 7px;
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; font-weight: 600;
  text-decoration: none; transition: all .14s;
}
.wa-btn--ch {
  background: rgba(37,211,102,0.08);
  border: 1px solid rgba(37,211,102,0.16);
  color: #25D366;
}
.wa-btn--ch:hover { background: rgba(37,211,102,0.14); }
.wa-btn--dm {
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  color: var(--dj-text-secondary);
}
.wa-btn--dm:hover { background: var(--dj-nav-active-bg); color: var(--dj-text-primary); }

/* ── Delete Modal ── */
.modal-bg {
  position: fixed; inset: 0;
  background: color-mix(in srgb, var(--dj-overlay) 88%, black); backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  z-index: 99; padding: 20px;
}
.modal {
  background: var(--dj-bg-surface);
  border: 1px solid color-mix(in srgb, var(--dj-danger) 18%, transparent);
  border-radius: 12px; padding: 24px 20px; width: 100%; max-width: 355px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 11px;
}
.modal-icon {
  width: 44px; height: 44px; border-radius: 10px;
  background: color-mix(in srgb, var(--dj-danger) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dj-danger) 18%, transparent);
  display: flex; align-items: center; justify-content: center;
  color: var(--dj-danger);
}
.modal-h {
  font-family: 'Syne', sans-serif;
  font-size: 1rem; font-weight: 800; color: var(--dj-text-primary); margin: 0;
  letter-spacing: -0.02em;
}
.modal-p {
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px; color: var(--dj-text-muted); margin: 0; line-height: 1.65;
}
.modal-p strong { color: var(--dj-text-secondary); font-weight: 600; }
.modal-input {
  width: 100%; border-radius: 7px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid color-mix(in srgb, var(--dj-danger) 16%, transparent);
  padding: 10px 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px; color: var(--dj-text-primary);
  outline: none; text-align: center; letter-spacing: 0.12em;
  caret-color: var(--dj-accent);
}
.modal-input::placeholder { color: var(--dj-text-muted); letter-spacing: 0.04em; }
.modal-input:focus { border-color: color-mix(in srgb, var(--dj-danger) 38%, transparent); }
.modal-acts { display: flex; gap: 8px; width: 100%; }
.modal-acts .act-btn { flex: 1; justify-content: center; }
`;