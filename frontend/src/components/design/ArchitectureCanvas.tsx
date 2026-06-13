"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mermaidLib from "mermaid";
import { useSettingsStore } from "@/store/settingsStore";
import Spinner from "@/components/icons/Spinner";
import type { ArchitectureCanvasProps } from "@/types";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const PADDING = 48;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ArchitectureCanvas({ mermaid: diagram, isLoading }: ArchitectureCanvasProps) {
  const [svg, setSvg] = useState("");
  const [svgKey, setSvgKey] = useState(0);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const renderCountRef = useRef(0);
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
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
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
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
        </div>
      )}
    </div>
  );
}
