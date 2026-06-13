"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mermaidLib from "mermaid";
import { useSettingsStore } from "@/store/settingsStore";
import Spinner from "@/components/icons/Spinner";
import type { ArchitectureCanvasProps, Improvement } from "@/types";
import { PRIORITY_COLORS } from "@/constants/review";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const PADDING = 48;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface TooltipState {
  displayName: string;
  improvements: Improvement[];
  x: number;
  y: number;
}

export function ArchitectureCanvas({ mermaid: diagram, isLoading, onEditCode, improvements }: ArchitectureCanvasProps) {
  const [svg, setSvg] = useState("");
  const [svgKey, setSvgKey] = useState(0);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState<TooltipState | null>(null);
  const renderCountRef = useRef(0);
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    mermaidLib.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      themeVariables: isDark
        ? {
            background: "#18181b",
            primaryColor: "#6366f1",
            primaryBorderColor: "#4f46e5",
            primaryTextColor: "#f4f4f5",
            lineColor: "#52525b",
            secondaryColor: "#27272a",
          }
        : {
            background: "#ffffff",
            primaryColor: "#6366f1",
            primaryBorderColor: "#4f46e5",
            primaryTextColor: "#18181b",
            lineColor: "#a1a1aa",
            secondaryColor: "#f4f4f5",
          },
    });
  }, [resolvedTheme]);

  useEffect(() => {
    if (!diagram) return;
    const id = `mermaid-render-${++renderCountRef.current}`;
    mermaidLib
      .render(id, diagram)
      .then(({ svg: rendered }) => {
        setError("");
        setSvg(rendered);
        setSvgKey((k) => k + 1);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      });
  }, [diagram, resolvedTheme]);

  // Fit diagram to container after each new render
  useEffect(() => {
    if (!svg) return;
    requestAnimationFrame(() => {
      const container = canvasRef.current;
      const svgEl = svgWrapperRef.current?.querySelector("svg");
      if (!container || !svgEl) return;
      const cw = container.clientWidth - PADDING * 2;
      const ch = container.clientHeight - PADDING * 2;
      const sw = svgEl.scrollWidth;
      const sh = svgEl.scrollHeight;
      if (sw > 0 && sh > 0) {
        setZoom(clamp(Math.min(cw / sw, ch / sh), MIN_ZOOM, MAX_ZOOM));
        setOffset({ x: 0, y: 0 });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgKey]);

  // Highlight SVG nodes that have improvements and attach click detection
  useEffect(() => {
    if (!svg || !improvements?.length) return;
    const wrapper = svgWrapperRef.current;
    if (!wrapper) return;

    // Build component key → { displayName, improvements } map
    const componentMap = new Map<string, { displayName: string; improvements: Improvement[] }>();
    for (const imp of improvements) {
      for (const comp of imp.components) {
        const key = comp.toLowerCase();
        if (!componentMap.has(key)) componentMap.set(key, { displayName: comp, improvements: [] });
        componentMap.get(key)!.improvements.push(imp);
      }
    }

    // Find and annotate matching SVG nodes
    const nodeEls = wrapper.querySelectorAll<HTMLElement>(".node, .cluster");
    nodeEls.forEach((el) => {
      const labelEl =
        el.querySelector(".label foreignObject span") ??
        el.querySelector(".nodeLabel") ??
        el.querySelector(".label") ??
        el.querySelector("text");
      const labelText = labelEl?.textContent?.trim().toLowerCase() ?? "";

      // Also try matching by Mermaid node ID (e.g. "flowchart-LB-1" → "lb")
      const nodeIdMatch = el.id?.match(/^(?:flowchart-)?(.+?)-\d+$/);
      const nodeId = nodeIdMatch ? nodeIdMatch[1].toLowerCase() : "";

      const key = componentMap.has(labelText)
        ? labelText
        : componentMap.has(nodeId)
        ? nodeId
        : null;
      if (!key) return;

      const data = componentMap.get(key)!;
      const shape = el.querySelector("rect, circle, polygon, ellipse, path");
      if (shape) {
        shape.setAttribute("stroke", "#f59e0b");
        shape.setAttribute("stroke-width", "2.5");
      }
      el.dataset.hasImprovement = "true";
      el.dataset.componentKey = key;
      el.dataset.componentName = data.displayName;
      el.style.cursor = "pointer";
    });

    function handleClick(e: MouseEvent) {
      if (hasDragged.current) return;
      const target = e.target as Element;
      const nodeEl = target.closest("[data-has-improvement]") as HTMLElement | null;
      if (!nodeEl) {
        setActiveTooltip(null);
        return;
      }
      const key = nodeEl.dataset.componentKey ?? "";
      const entry = componentMap.get(key);
      if (!entry) return;
      setActiveTooltip({ displayName: entry.displayName, improvements: entry.improvements, x: e.clientX, y: e.clientY });
    }

    wrapper.addEventListener("click", handleClick);
    return () => wrapper.removeEventListener("click", handleClick);
  }, [svg, improvements]);

  // Dismiss tooltip on Escape
  useEffect(() => {
    if (!activeTooltip) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveTooltip(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTooltip]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => clamp(z * factor, MIN_ZOOM, MAX_ZOOM));
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };

  const stopDrag = (e: React.MouseEvent) => {
    isDragging.current = false;
    (e.currentTarget as HTMLElement).style.cursor = "grab";
  };

  return (
    <div
      ref={canvasRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "var(--color-bg)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        }}
      />

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "var(--color-text-muted)",
            }}
          >
            <Spinner size={24} />
            <span style={{ fontSize: 14 }}>Generating architecture…</span>
          </motion.div>
        )}

        {!isLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                maxWidth: 480,
              }}
            >
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--color-error)", marginBottom: 4 }}>
                Render error
              </p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {!isLoading && svg && !error && (
          <motion.div
            key={`svg-${svgKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              cursor: "grab",
              userSelect: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <div ref={svgWrapperRef} dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && svg && !error && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "4px 6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <button
            onClick={() => setZoom((z) => clamp(z / 1.2, MIN_ZOOM, MAX_ZOOM))}
            title="Zoom out"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            −
          </button>
          <button
            onClick={() => {
              requestAnimationFrame(() => {
                const container = canvasRef.current;
                const svgEl = svgWrapperRef.current?.querySelector("svg");
                if (!container || !svgEl) return;
                const cw = container.clientWidth - PADDING * 2;
                const ch = container.clientHeight - PADDING * 2;
                const sw = svgEl.scrollWidth;
                const sh = svgEl.scrollHeight;
                if (sw > 0 && sh > 0) {
                  setZoom(clamp(Math.min(cw / sw, ch / sh), MIN_ZOOM, MAX_ZOOM));
                  setOffset({ x: 0, y: 0 });
                }
              });
            }}
            title="Fit to screen"
            style={{
              minWidth: 44,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: 12,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom((z) => clamp(z * 1.2, MIN_ZOOM, MAX_ZOOM))}
            title="Zoom in"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            +
          </button>

          <div style={{ width: 1, height: 16, background: "var(--color-border)", margin: "0 2px" }} />

          <button
            onClick={() => {
              const svgEl = svgWrapperRef.current?.querySelector("svg");
              if (!svgEl) return;
              const serialized = new XMLSerializer().serializeToString(svgEl);
              const blob = new Blob([serialized], { type: "image/svg+xml" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "architecture.svg";
              a.click();
              URL.revokeObjectURL(url);
            }}
            title="Download as SVG"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ↓
          </button>

          {onEditCode && (
            <>
              <div style={{ width: 1, height: 16, background: "var(--color-border)", margin: "0 2px" }} />
              <button
                onClick={onEditCode}
                title="Edit diagram code"
                style={{
                  height: 28,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                {"</>"}
              </button>
            </>
          )}
        </div>
      )}

      {activeTooltip && (
        <NodeImprovementTooltip
          displayName={activeTooltip.displayName}
          improvements={activeTooltip.improvements}
          x={activeTooltip.x}
          y={activeTooltip.y}
          onClose={() => setActiveTooltip(null)}
        />
      )}
    </div>
  );
}

function NodeImprovementTooltip({
  displayName,
  improvements,
  x,
  y,
  onClose,
}: {
  displayName: string;
  improvements: Improvement[];
  x: number;
  y: number;
  onClose: () => void;
}) {
  const W = 312;
  const left = clamp(x + 12, 12, (typeof window !== "undefined" ? window.innerWidth : 1200) - W - 12);
  const top = clamp(y + 12, 12, (typeof window !== "undefined" ? window.innerHeight : 800) - 380);

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 200,
        width: W,
        background: "var(--color-surface)",
        border: "1px solid rgba(245,158,11,0.4)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        padding: "12px 12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#f59e0b",
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 4,
            padding: "2px 8px",
            maxWidth: "85%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
        </span>
        <button
          onClick={onClose}
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: "transparent",
            color: "var(--color-text-faint)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            borderRadius: "var(--radius-sm)",
            flexShrink: 0,
            fontFamily: "inherit",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
        {improvements.map((imp, i) => {
          const colors = PRIORITY_COLORS[imp.priority] ?? PRIORITY_COLORS.medium;
          return (
            <div
              key={i}
              style={{
                padding: "9px 11px",
                background: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 600,
                  background: colors.bg,
                  color: colors.text,
                  padding: "2px 6px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 5,
                }}
              >
                {imp.priority}
              </span>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)", marginBottom: 3, lineHeight: 1.4 }}>
                {imp.gap}
              </p>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
                {imp.fix}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
