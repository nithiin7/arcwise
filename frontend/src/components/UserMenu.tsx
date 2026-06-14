"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!user) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "5px 10px",
          borderRadius: "var(--radius-sm)",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--color-text-faint)",
          fontSize: 12,
          fontFamily: "inherit",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-faint)")
        }
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name ?? user.email}
            style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {initials}
          </div>
        )}
        {user.name ?? user.email.split("@")[0]}
      </button>

      {open && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              minWidth: 160,
              zIndex: 50,
              padding: "4px 0",
            }}
          >
            <div
              style={{
                padding: "8px 14px 6px",
                borderBottom: "1px solid var(--color-border)",
                marginBottom: 4,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>
                {user.name ?? "Account"}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 2 }}>
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "7px 14px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-text-muted)",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "var(--color-surface-2)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
              }
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
