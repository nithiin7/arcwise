"use client";

import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { ArchitectureCanvas } from "./ArchitectureCanvas";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/store/settingsStore";

interface MermaidEditorModalProps {
  initialMermaid: string;
  onApply: (mermaid: string) => Promise<void>;
  onClose: () => void;
}

export function MermaidEditorModal({ initialMermaid, onApply, onClose }: MermaidEditorModalProps) {
  const [code, setCode] = useState(initialMermaid);
  const [previewCode, setPreviewCode] = useState(initialMermaid);
  const [isApplying, setIsApplying] = useState(false);
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPreviewCode(code), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleApply() {
    setIsApplying(true);
    try {
      await onApply(code);
      onClose();
    } finally {
      setIsApplying(false);
    }
  }

  const isUnchanged = code === initialMermaid;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(90vw, 1100px)",
          height: "min(85vh, 720px)",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>
            Edit Diagram Code
          </span>
          <button
            onClick={onClose}
            title="Close"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              color: "var(--color-text-faint)",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              borderRadius: "var(--radius-sm)",
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Editor pane */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--color-border)",
              minWidth: 0,
            }}
          >
            <div
              style={{
                height: 32,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-text-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontFamily: "monospace",
                }}
              >
                Mermaid DSL
              </span>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <CodeMirror
                value={code}
                onChange={setCode}
                theme={resolvedTheme === "dark" ? vscodeDark : vscodeLight}
                height="100%"
                autoFocus
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  autocompletion: false,
                  indentOnInput: true,
                  tabSize: 2,
                }}
                style={{ height: "100%", fontSize: 13 }}
              />
            </div>
          </div>

          {/* Preview pane */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <div
              style={{
                height: 32,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-text-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Preview
              </span>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ArchitectureCanvas mermaid={previewCode} isLoading={false} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            padding: "0 16px",
            borderTop: "1px solid var(--color-border)",
            flexShrink: 0,
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isApplying || isUnchanged}>
            {isApplying ? "Applying…" : "Apply changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
