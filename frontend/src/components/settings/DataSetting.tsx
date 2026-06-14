"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { listSessions, deleteSession } from "@/api/sessions";

export function DataSetting() {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    setClearing(true);
    try {
      const sessions = await listSessions();
      await Promise.all(sessions.map((s) => deleteSession(s.id)));
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    } finally {
      setClearing(false);
      setConfirming(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", display: "block", marginBottom: 4 }}>
          Clear All Sessions
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
          Permanently delete all sessions and their diagrams
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {confirming ? (
          <>
            <button
              onClick={() => setConfirming(false)}
              disabled={clearing}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-offset)",
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleClear}
              disabled={clearing}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "var(--color-error, #ef4444)",
                color: "#fff",
                cursor: clearing ? "not-allowed" : "pointer",
                opacity: clearing ? 0.7 : 1,
              }}
            >
              {clearing ? "Clearing…" : "Confirm"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{
              padding: "5px 12px",
              fontSize: 12,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-offset)",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-error, #ef4444)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-error, #ef4444)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
