"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { get, patch, post, del } from "@/lib/api";
import type { AuthUser } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(user?.name ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    get<AuthUser>("/auth/me")
      .then((me) => {
        updateUser(me);
        setName(me.name ?? "");
      })
      .catch(() => {});
  }, [updateUser]);

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameSaving(true);
    setNameError(null);
    setNameSaved(false);
    try {
      const updated = await patch<AuthUser>("/auth/me", { name: name.trim() || null });
      updateUser({ name: updated.name });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      await post("/auth/me/password", { current_password: currentPw, new_password: newPw });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await del("/auth/me");
      logout();
      router.replace("/login");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Top nav bar */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          padding: "0 32px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--color-text-faint)",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-faint)")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Dashboard
        </Link>
        <span style={{ color: "var(--color-border)", fontSize: 16 }}>/</span>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>Profile</span>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "48px 32px",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* ── Left sidebar ── */}
        <div style={{ position: "sticky", top: 48 }}>
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 28 }}>
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name ?? user.email}
                width={80}
                height={80}
                style={{ borderRadius: "50%", objectFit: "cover", marginBottom: 14 }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, #818cf8 100%)",
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
            )}
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
              {user.name ?? user.email.split("@")[0]}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-faint)" }}>{user.email}</div>
          </div>

          {/* Meta */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {memberSince && (
              <MetaRow label="Member since" value={memberSince} />
            )}
            <MetaRow
              label="GitHub"
              value={
                <StatusPill connected={!!user.has_github} />
              }
            />
            <MetaRow
              label="Google"
              value={<StatusPill connected={!!user.has_google} />}
            />
            <MetaRow
              label="Password"
              value={<StatusPill connected={!!user.has_password} />}
              last
            />
          </div>
        </div>

        {/* ── Right content ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Display name */}
          <SectionCard title="Display Name" description="This is your public display name.">
            <form onSubmit={handleSaveName}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <FieldInput
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <SaveButton loading={nameSaving} saved={nameSaved} />
              </div>
              {nameError && <FieldError>{nameError}</FieldError>}
            </form>
          </SectionCard>

          {/* Change password */}
          {user.has_password && (
            <SectionCard title="Change Password" description="Use a strong password you don't use elsewhere.">
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FieldInput type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" />
                <FieldInput type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" />
                <FieldInput type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" />
                {pwError && <FieldError>{pwError}</FieldError>}
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 2 }}>
                  <SaveButton loading={pwSaving} saved={pwSaved} label="Update password" savedLabel="Updated" />
                </div>
              </form>
            </SectionCard>
          )}

          {/* Danger zone */}
          <div style={{ marginTop: 16 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--color-error)",
                marginBottom: 10,
              }}
            >
              Danger Zone
            </p>
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
              }}
            >
              {!deleteConfirm ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)", marginBottom: 3 }}>
                      Delete account
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-text-faint)" }}>
                      Permanently remove your account and all data. This cannot be undone.
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    style={{
                      padding: "8px 16px",
                      background: "transparent",
                      color: "var(--color-error)",
                      border: "1px solid rgba(239,68,68,0.4)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      flexShrink: 0,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-error)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.4)";
                    }}
                  >
                    Delete account
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <p style={{ fontSize: 14, color: "var(--color-text)", margin: 0, lineHeight: 1.55 }}>
                    Are you absolutely sure? All your sessions and data will be permanently deleted and cannot be recovered.
                  </p>
                  {deleteError && <FieldError>{deleteError}</FieldError>}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      style={{
                        padding: "8px 18px",
                        background: "var(--color-error)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: deleting ? "not-allowed" : "pointer",
                        opacity: deleting ? 0.7 : 1,
                        fontFamily: "inherit",
                      }}
                    >
                      {deleting ? "Deleting…" : "Yes, delete my account"}
                    </button>
                    <button
                      onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                      disabled={deleting}
                      style={{
                        padding: "8px 16px",
                        background: "transparent",
                        color: "var(--color-text-muted)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small reusable sub-components ──────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-faint)", marginBottom: description ? 3 : 0 }}>
          {title}
        </p>
        {description && (
          <p style={{ fontSize: 13, color: "var(--color-text-faint)" }}>{description}</p>
        )}
      </div>
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FieldInput({
  type,
  value,
  onChange,
  placeholder,
}: {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        flex: 1,
        background: "var(--color-surface-offset)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "9px 12px",
        fontSize: 14,
        color: "var(--color-text)",
        fontFamily: "inherit",
        outline: "none",
        width: "100%",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
    />
  );
}

function SaveButton({
  loading,
  saved,
  label = "Save",
  savedLabel = "Saved",
}: {
  loading: boolean;
  saved: boolean;
  label?: string;
  savedLabel?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "9px 18px",
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-sm)",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          transition: "opacity 0.15s",
        }}
      >
        {loading ? "Saving…" : label}
      </button>
      {saved && (
        <span style={{ fontSize: 13, color: "var(--color-text-faint)" }}>{savedLabel}</span>
      )}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: "var(--color-error)", margin: "6px 0 0" }}>{children}</p>
  );
}

function MetaRow({
  label,
  value,
  last,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: last ? "none" : "1px solid var(--color-border)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--color-text-faint)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--color-text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "2px 10px",
        borderRadius: 999,
        background: connected
          ? "rgba(99,102,241,0.12)"
          : "var(--color-surface-offset)",
        color: connected ? "var(--color-primary)" : "var(--color-text-faint)",
      }}
    >
      {connected ? "Connected" : "—"}
    </span>
  );
}
