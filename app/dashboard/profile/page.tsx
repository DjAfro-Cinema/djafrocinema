"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  User, Mail, Phone, Camera, LogOut,
  Trash2, Save, Eye, EyeOff, Shield,
  ChevronRight, AlertTriangle,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import MobileTopBar from "@/components/dashboard/topbar/MobileTopBar";
import DesktopTopBar from "@/components/dashboard/topbar/DesktopTopBar";

// ── MOCK USER ──────────────────────────────────────────────────────────────

const USER = {
  name: "Mwangi Kamau",
  email: "mwangi@djafro.co.ke",
  phone: "+254 712 345 678",
  avatar: null as string | null,
  joinedAt: "2024-11-03T10:00:00Z",
};

// ── AVATAR ─────────────────────────────────────────────────────────────────

function Avatar({ name, src, onUpload }: {
  name: string;
  src: string | null;
  onUpload: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hov, setHov] = useState(false);

  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  }

  return (
    <div
      className="avatar-wrap"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => inputRef.current?.click()}
    >
      {src ? (
        <img src={src} alt={name} className="avatar-img" />
      ) : (
        <div className="avatar-initials">{initials}</div>
      )}
      <div className={`avatar-overlay ${hov ? "avatar-overlay--visible" : ""}`}>
        <Camera size={18} color="#fff" />
        <span>Change</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}

// ── INPUT ──────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", icon: Icon, placeholder, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon: React.ElementType;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const inputType = type === "password" ? (showPw ? "text" : "password") : type;

  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className={`field-box ${focused ? "field-box--focused" : ""} ${disabled ? "field-box--disabled" : ""}`}>
        <Icon size={15} color={focused ? "#e50914" : "rgba(255,255,255,0.2)"} strokeWidth={1.8} />
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="field-input"
        />
        {type === "password" && (
          <button
            type="button"
            className="field-eye"
            onClick={() => setShowPw(p => !p)}
            tabIndex={-1}
          >
            {showPw
              ? <EyeOff size={14} color="rgba(255,255,255,0.25)" />
              : <Eye    size={14} color="rgba(255,255,255,0.25)" />
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── SECTION CARD ───────────────────────────────────────────────────────────

function Card({ title, children, accent }: {
  title: string;
  children: React.ReactNode;
  accent?: "red" | "danger";
}) {
  return (
    <div className={`section-card ${accent === "danger" ? "section-card--danger" : ""}`}>
      <p className="section-title">{title}</p>
      {children}
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const layout = useDashboardLayout();
  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  // Form state
  const [name,        setName]        = useState(USER.name);
  const [email,       setEmail]       = useState(USER.email);
  const [phone,       setPhone]       = useState(USER.phone);
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [avatar,      setAvatar]      = useState(USER.avatar);
  const [saved,       setSaved]       = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const joinDate = new Date(USER.joinedAt).toLocaleDateString("en-KE", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{CSS}</style>

      <div className="root-shell">
        {!isSmall && (
          <DashboardSidebar
            user={{ name, email }}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div id="dj-content-col" className="content-col">
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

          <div className="page-body" style={{ padding: isSmall ? "24px 16px 110px" : "36px 32px 80px" }}>

            {/* Header */}
            <div className="page-header">
              <h1 className="page-title">My Profile</h1>
              <p className="page-sub">Member since {joinDate}</p>
            </div>

            <div className="profile-grid" style={{
              gridTemplateColumns: isMobile ? "1fr" : "260px 1fr",
            }}>

              {/* ── LEFT: Identity ── */}
              <div className="left-col">
                <Card title="Your Identity">
                  <div className="identity-block">
                    <Avatar name={name} src={avatar} onUpload={setAvatar} />
                    <div className="identity-text">
                      <p className="identity-name">{name}</p>
                      <p className="identity-email">{email}</p>
                    </div>
                  </div>
                  <div className="identity-divider" />
                  <div className="identity-meta">
                    <div className="meta-row">
                      <Shield size={12} color="rgba(255,255,255,0.2)" />
                      <span>Free account</span>
                    </div>
                    <Link href="/dashboard/pricing" className="upgrade-btn">
                      Go Premium <ChevronRight size={12} />
                    </Link>
                  </div>
                </Card>
              </div>

              {/* ── RIGHT: Forms ── */}
              <div className="right-col">

                {/* Personal Info */}
                <Card title="Personal Information">
                  <div className="fields-grid" style={{
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  }}>
                    <Field label="Full Name"    value={name}  onChange={setName}  icon={User} placeholder="Your name" />
                    <Field label="Phone Number" value={phone} onChange={setPhone} icon={Phone} placeholder="+254 7xx xxx xxx" />
                    <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                      <Field label="Email Address" value={email} onChange={setEmail} icon={Mail} placeholder="you@example.com" type="email" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className={`save-btn ${saved ? "save-btn--saved" : ""}`} onClick={handleSave}>
                      {saved ? (
                        <><span className="save-check">✓</span> Saved</>
                      ) : (
                        <><Save size={13} /> Save Changes</>
                      )}
                    </button>
                  </div>
                </Card>

                {/* Change Password */}
                <Card title="Change Password">
                  <div className="fields-grid" style={{
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  }}>
                    <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                      <Field label="Current Password" value={currentPw} onChange={setCurrentPw} icon={Shield} type="password" placeholder="••••••••" />
                    </div>
                    <Field label="New Password"     value={newPw}     onChange={setNewPw}     icon={Shield} type="password" placeholder="••••••••" />
                    <Field label="Confirm Password" value={confirmPw} onChange={setConfirmPw} icon={Shield} type="password" placeholder="••••••••" />
                  </div>
                  {newPw && confirmPw && newPw !== confirmPw && (
                    <p className="pw-mismatch">Passwords don't match</p>
                  )}
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleSave}>
                      <Save size={13} /> Update Password
                    </button>
                  </div>
                </Card>

                {/* Danger Zone */}
                <Card title="Danger Zone" accent="danger">
                  <div className="danger-rows">

                    {/* Logout */}
                    <div className="danger-row">
                      <div className="danger-row-text">
                        <p className="danger-row-title">Sign out</p>
                        <p className="danger-row-sub">Log out of your account on this device.</p>
                      </div>
                      <button className="danger-btn danger-btn--outline">
                        <LogOut size={13} /> Sign Out
                      </button>
                    </div>

                    <div className="danger-divider" />

                    {/* Delete */}
                    <div className="danger-row">
                      <div className="danger-row-text">
                        <p className="danger-row-title">Delete account</p>
                        <p className="danger-row-sub">Permanently remove your account and all data. This cannot be undone.</p>
                      </div>
                      <button
                        className="danger-btn danger-btn--solid"
                        onClick={() => setDeleteModal(true)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          </div>
        </div>

        {isSmall && <MobileBottomNav />}
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteModal && (
        <div className="modal-backdrop" onClick={() => setDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <AlertTriangle size={22} color="#e50914" />
            </div>
            <h2 className="modal-title">Delete Account</h2>
            <p className="modal-sub">
              This will permanently delete your account, watch history, and all owned movies. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              className="modal-input"
              placeholder="Type DELETE"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => { setDeleteModal(false); setDeleteInput(""); }}>
                Cancel
              </button>
              <button
                className="modal-confirm"
                disabled={deleteInput !== "DELETE"}
              >
                <Trash2 size={13} /> Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  .root-shell {
    display: flex;
    height: 100svh;
    background: #070709;
    overflow: hidden;
  }
  .content-col {
    flex: 1;
    min-width: 0;
    height: 100svh;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }
  .content-col::-webkit-scrollbar { display: none; }
  .content-col { scrollbar-width: none; }
  .page-body { flex: 1; }

  /* ── Header ── */
  .page-header { margin-bottom: 28px; }
  .page-title {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0 0 4px;
    line-height: 1;
  }
  .page-sub {
    font-family: var(--font-body);
    font-size: 13px;
    color: rgba(255,255,255,0.28);
    margin: 0;
  }

  /* ── Layout grid ── */
  .profile-grid {
    display: grid;
    gap: 16px;
    align-items: start;
  }
  .left-col  { display: flex; flex-direction: column; gap: 16px; }
  .right-col { display: flex; flex-direction: column; gap: 16px; }

  /* ── Section card ── */
  .section-card {
    background: #0e0e13;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 20px;
  }
  .section-card--danger {
    border-color: rgba(229,9,20,0.12);
    background: #0f0c0c;
  }
  .section-title {
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin: 0 0 18px;
  }

  /* ── Avatar ── */
  .avatar-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.08);
    transition: border-color 0.2s;
  }
  .avatar-wrap:hover { border-color: #e50914; }
  .avatar-img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
  }
  .avatar-initials {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #e50914, #7f0509);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.02em;
  }
  .avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    opacity: 0;
    transition: opacity 0.18s;
  }
  .avatar-overlay span {
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .avatar-overlay--visible { opacity: 1; }

  /* ── Identity block ── */
  .identity-block {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .identity-text { min-width: 0; }
  .identity-name {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: -0.01em;
  }
  .identity-email {
    font-family: var(--font-body);
    font-size: 11.5px;
    color: rgba(255,255,255,0.28);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .identity-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 16px 0;
  }
  .identity-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-body);
    font-size: 11px;
    color: rgba(255,255,255,0.22);
  }
  .upgrade-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 600;
    color: #e50914;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: opacity 0.15s;
  }
  .upgrade-btn:hover { opacity: 0.75; }

  /* ── Fields ── */
  .fields-grid {
    display: grid;
    gap: 14px;
    margin-bottom: 18px;
  }
  .field-wrap { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .field-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 9px;
    padding: 0 13px;
    height: 44px;
    transition: border-color 0.15s, background 0.15s;
  }
  .field-box--focused {
    border-color: rgba(229,9,20,0.4);
    background: rgba(229,9,20,0.03);
  }
  .field-box--disabled { opacity: 0.4; cursor: not-allowed; }
  .field-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.82);
    caret-color: #e50914;
    min-width: 0;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.18); }
  .field-input:disabled { cursor: not-allowed; }
  .field-eye {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  /* ── Form actions ── */
  .form-actions { display: flex; justify-content: flex-end; }
  .save-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    background: #e50914;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.04em;
    transition: background 0.15s, transform 0.12s;
  }
  .save-btn:hover { background: #ff1a27; transform: translateY(-1px); }
  .save-btn:active { transform: none; }
  .save-btn--saved { background: #16a34a; }
  .save-btn--saved:hover { background: #15803d; }
  .save-check { font-size: 13px; }

  /* ── Password mismatch ── */
  .pw-mismatch {
    font-family: var(--font-body);
    font-size: 11px;
    color: #e50914;
    margin: -10px 0 12px;
    font-weight: 500;
  }

  /* ── Danger zone ── */
  .danger-rows { display: flex; flex-direction: column; }
  .danger-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .danger-row-text { flex: 1; min-width: 0; }
  .danger-row-title {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    margin: 0 0 3px;
  }
  .danger-row-sub {
    font-family: var(--font-body);
    font-size: 11.5px;
    color: rgba(255,255,255,0.22);
    margin: 0;
    line-height: 1.5;
  }
  .danger-divider {
    height: 1px;
    background: rgba(229,9,20,0.08);
    margin: 16px 0;
  }
  .danger-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.03em;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .danger-btn--outline {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5);
  }
  .danger-btn--outline:hover {
    border-color: rgba(255,255,255,0.22);
    color: rgba(255,255,255,0.8);
  }
  .danger-btn--solid {
    background: rgba(229,9,20,0.1);
    border: 1px solid rgba(229,9,20,0.25);
    color: #e50914;
  }
  .danger-btn--solid:hover {
    background: rgba(229,9,20,0.18);
    border-color: rgba(229,9,20,0.45);
  }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    padding: 20px;
  }
  .modal {
    background: #0e0e13;
    border: 1px solid rgba(229,9,20,0.2);
    border-radius: 16px;
    padding: 28px 24px;
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  .modal-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(229,9,20,0.1);
    border: 1px solid rgba(229,9,20,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }
  .modal-title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
    letter-spacing: -0.01em;
  }
  .modal-sub {
    font-family: var(--font-body);
    font-size: 13px;
    color: rgba(255,255,255,0.38);
    margin: 0;
    line-height: 1.6;
  }
  .modal-sub strong { color: rgba(255,255,255,0.6); font-weight: 600; }
  .modal-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(229,9,20,0.2);
    border-radius: 8px;
    padding: 11px 14px;
    font-family: var(--font-body);
    font-size: 13px;
    color: #fff;
    outline: none;
    text-align: center;
    letter-spacing: 0.1em;
    caret-color: #e50914;
  }
  .modal-input::placeholder { color: rgba(255,255,255,0.2); letter-spacing: 0.04em; }
  .modal-input:focus { border-color: rgba(229,9,20,0.4); }
  .modal-actions {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 4px;
  }
  .modal-cancel {
    flex: 1;
    padding: 11px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.45);
    cursor: pointer;
    transition: all 0.15s;
  }
  .modal-cancel:hover {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.7);
  }
  .modal-confirm {
    flex: 1;
    padding: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #e50914;
    border: none;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    transition: all 0.15s;
  }
  .modal-confirm:hover:not(:disabled) { background: #ff1a27; }
  .modal-confirm:disabled {
    background: rgba(229,9,20,0.2);
    color: rgba(255,255,255,0.2);
    cursor: not-allowed;
  }
`;