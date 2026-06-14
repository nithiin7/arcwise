"use client";

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import { getOllamaModels } from "@/api/ollama";
import type { ModelGroup, ModelOption, ModelSelectProps, OllamaModel } from "@/types";

export type { ModelGroup, ModelOption };

function formatModelName(name: string): string {
  // "qwen3:14b" → "qwen3", "llama3.2:latest" → "llama3.2"
  const base = name.split(":")[0];
  // capitalise first letter, leave the rest as-is
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function resolveLabel(groups: ModelGroup[], value: string): string {
  for (const g of groups) {
    const opt = g.options.find((o) => o.value === value);
    if (opt) return opt.label;
  }
  return value;
}

function resolveSize(groups: ModelGroup[], value: string): string | undefined {
  for (const g of groups) {
    const opt = g.options.find((o) => o.value === value);
    if (opt) return opt.size;
  }
}

export default function ModelSelect({ groups: baseGroups, value, onChange, direction = "up" }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState<string>(value);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getOllamaModels().then(setOllamaModels);
  }, []);

  const groups: ModelGroup[] = baseGroups
    .map((g) => {
      if (g.group !== "Ollama (Local)" || ollamaModels === null) return g;
      if (ollamaModels.length === 0) return { ...g, options: [] };
      return {
        ...g,
        options: ollamaModels.map((m) => ({
          value: `ollama/${m.name}`,
          label: formatModelName(m.name),
          size: m.paramSize || undefined,
        })),
      };
    })
    .filter((g) => g.options.length > 0);

  const flatOptions = groups.flatMap((g) => g.options);

  const select = useCallback(
    (v: string) => {
      onChange(v);
      setFocused(v);
      setOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(focused)}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focused, open]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocused(value);
      }
      return;
    }
    const idx = flatOptions.findIndex((o) => o.value === focused);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(flatOptions[Math.min(idx + 1, flatOptions.length - 1)].value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused(flatOptions[Math.max(idx - 1, 0)].value);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(focused);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const panelId = "model-select-panel";
  const selectedLabel = resolveLabel(groups, value);
  const selectedSize = resolveSize(groups, value);
  const isOllama = value.startsWith("ollama/");

  return (
    <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }}>
      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={panelId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          setOpen((o) => !o);
          setFocused(value);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--color-surface-offset)",
          border: `1px solid ${open ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-sm)",
          color: "var(--color-text-muted)",
          fontSize: 12,
          fontFamily: "inherit",
          padding: "5px 8px",
          cursor: "pointer",
          outline: "none",
          userSelect: "none",
          transition: "border-color 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {isOllama && (
          <span
            style={{
              fontSize: 10,
              color: "var(--color-success, #22c55e)",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            LOCAL
          </span>
        )}
        <span>{selectedLabel}</span>
        {selectedSize && (
          <span style={{ opacity: 0.5, fontSize: 11 }}>{selectedSize}</span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            opacity: 0.5,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
            flexShrink: 0,
          }}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="listbox"
          style={{
            position: "absolute",
            ...(direction === "down" ? { top: "calc(100% + 6px)" } : { bottom: "calc(100% + 6px)" }),
            left: 0,
            minWidth: 200,
            maxHeight: 280,
            overflowY: "auto",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            zIndex: 50,
            padding: "4px 0",
          }}
        >
          {groups.map((g, gi) => (
            <div key={g.group}>
              {gi > 0 && (
                <div style={{ height: 1, background: "var(--color-border)", margin: "4px 0" }} />
              )}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--color-text-faint)",
                  padding: "6px 12px 2px",
                }}
              >
                {g.group}
              </div>
              {g.options.map((opt) => {
                const isFocused = opt.value === focused;
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    data-value={opt.value}
                    onMouseEnter={() => setFocused(opt.value)}
                    onClick={() => select(opt.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 12px",
                      fontSize: 13,
                      cursor: "pointer",
                      color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                      background: isFocused ? "var(--color-surface-offset)" : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {opt.label}
                      {opt.size && (
                        <span
                          style={{
                            fontSize: 11,
                            color: isSelected
                              ? "var(--color-primary)"
                              : "var(--color-text-faint)",
                            opacity: 0.8,
                          }}
                        >
                          {opt.size}
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {ollamaModels !== null && ollamaModels.length === 0 && (
            <div style={{ padding: "8px 12px", fontSize: 12, color: "var(--color-text-faint)" }}>
              No Ollama models found — is Ollama running?
            </div>
          )}
        </div>
      )}
    </div>
  );
}
