"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mermaidLib from "mermaid";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settingsStore";
import Spinner from "@/components/icons/Spinner";
import type { Annotation, AnnotationColor, ArchitectureCanvasProps } from "@/types";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const PADDING = 48;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const ANN_COLORS: Record<AnnotationColor, { bg: string; border: string; header: string; dot: string }> = {
  yellow: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.4)", header: "rgba(234,179,8,0.18)", dot: "#eab308" },
  blue:   { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.4)", header: "rgba(99,102,241,0.18)", dot: "#6366f1" },
  green:  { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.4)", header: "rgba(34,197,94,0.18)", dot: "#22c55e" },
  pink:   { bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.4)", header: "rgba(236,72,153,0.18)", dot: "#ec4899" },
};
const ANN_COLOR_KEYS = Object.keys(ANN_COLORS) as AnnotationColor[];

interface AnnotationCardProps {
  annotation: Annotation;
  isEditing: boolean;
  annotateMode: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onToggleEdit: () => void;
  onChange: (patch: Partial<Annotation>) => void;
  onDelete: () => void;
}

function AnnotationCard({
  annotation,
  isEditing,
  annotateMode,
  onDragStart,
  onToggleEdit,
  onChange,
  onDelete,
}: AnnotationCardProps) {
  const c = ANN_COLORS[annotation.color as AnnotationColor] ?? ANN_COLORS.yellow;

  return (
    <div
      style={{
        position: "absolute",
        left: `${annotation.x * 100}%`,
        top: `${annotation.y * 100}%`,
        transform: "translateX(-50%)",
        width: 200,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        zIndex: 20,
        userSelect: "none",
      }}
      onClick={(e) => { e.stopPropagation(); if (annotateMode) onToggleEdit(); }}
    >
      {/* Header — drag handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (annotateMode) onDragStart(e);
        }}
        style={{
          background: c.header,
          borderBottom: `1px solid ${c.border}`,
          padding: "5px 8px",
          cursor: annotateMode ? "grab" : "default",
          display: "flex",
          alignItems: "center",
          gap: 4,
          borderRadius: "7px 7px 0 0",
        }}
      >
        {isEditing ? (
          <>
            <div style={{ display: "flex", gap: 4, flex: 1 }}>
              {ANN_COLOR_KEYS.map((col) => (
                <button
                  key={col}
                  onClick={(e) => { e.stopPropagation(); onChange({ color: col }); }}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: ANN_COLORS[col].dot,
                    border: annotation.color === col ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete annotation"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                lineHeight: 1,
                padding: "0 2px",
              }}
            >
              ×
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
            {annotation.owner && (
              <span style={{ fontSize: 10, color: "var(--color-text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {annotation.owner}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "8px 10px" }}>
        {isEditing ? (
          <>
            <textarea
              autoFocus
              value={annotation.text}
              onChange={(e) => onChange({ text: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Add a note…"
              rows={3}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--color-text)",
                fontSize: 12,
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                padding: 0,
                boxSizing: "border-box",
              }}
            />
            <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 6, paddingTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
              <input
                value={annotation.doc_url ?? ""}
                onChange={(e) => onChange({ doc_url: e.target.value || undefined })}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Doc URL (optional)"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontSize: 11,
                  outline: "none",
                  fontFamily: "inherit",
                  padding: 0,
                  boxSizing: "border-box",
                }}
              />
              <input
                value={annotation.owner ?? ""}
                onChange={(e) => onChange({ owner: e.target.value || undefined })}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Owner / team (optional)"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontSize: 11,
                  outline: "none",
                  fontFamily: "inherit",
                  padding: 0,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </>
        ) : (
          <>
            {annotation.text ? (
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text)", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {annotation.text}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-faint)", fontStyle: "italic" }}>
                {annotateMode ? "Click to edit" : "No content"}
              </p>
            )}
            {annotation.doc_url && (
              <a
                href={annotation.doc_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: "block", fontSize: 11, color: "var(--color-primary)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                Docs ↗
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ArchitectureCanvas({
  mermaid: diagram,
  isLoading,
  onEditCode,
  onExportJson,
  annotations: propAnnotations,
  onAnnotationsChange,
  onNodeClick,
  selectedNodeLabel,
}: ArchitectureCanvasProps) {
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

  // Node click / highlight state
  const highlightedNodeRef = useRef<SVGGElement | null>(null);
  const panStartPosRef = useRef({ x: 0, y: 0 });

  function clearNodeHighlight() {
    if (highlightedNodeRef.current) {
      highlightedNodeRef.current.style.filter = "";
      highlightedNodeRef.current = null;
    }
  }

  // Clear stale DOM ref when SVG is replaced by a new render
  useEffect(() => {
    highlightedNodeRef.current = null;
  }, [svgKey]);

  // Sync with parent: when selectedNodeLabel becomes falsy, remove the highlight
  useEffect(() => {
    if (!selectedNodeLabel) clearNodeHighlight();
  }, [selectedNodeLabel]);

  // Annotation state
  const [localAnnotations, setLocalAnnotations] = useState<Annotation[]>(propAnnotations ?? []);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const annDragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const annDragMoved = useRef(false);

  // Sync annotation list when session first loads (prop changes from undefined → data)
  const propAnnotationsRef = useRef(propAnnotations);
  useEffect(() => {
    if (propAnnotationsRef.current === undefined && propAnnotations !== undefined) {
      setLocalAnnotations(propAnnotations);
    }
    propAnnotationsRef.current = propAnnotations;
  }, [propAnnotations]);

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    mermaidLib.initialize({
      startOnLoad: false,
      suppressErrorRendering: true,
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
      .catch(() => {
        if (svg) {
          toast.error("Syntax error in diagram — the previous valid diagram is still shown.");
        } else {
          setError("Syntax error in diagram");
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram, resolvedTheme]);

  // Fit diagram to container after each new render.
  useEffect(() => {
    if (!svg) return;
    requestAnimationFrame(() => {
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

  // --- Annotation helpers ---
  function commitAnnotations(next: Annotation[]) {
    setLocalAnnotations(next);
    onAnnotationsChange?.(next);
  }

  function handleAnnotationDragStart(e: React.MouseEvent, ann: Annotation) {
    annDragRef.current = {
      id: ann.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: ann.x,
      origY: ann.y,
    };
    annDragMoved.current = false;
  }

  // --- Unified mouse handlers on the outer canvas div ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (annDragRef.current) {
      const container = canvasRef.current;
      if (!container) return;
      const dx = e.clientX - annDragRef.current.startX;
      const dy = e.clientY - annDragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        annDragMoved.current = true;
        const rect = container.getBoundingClientRect();
        const newX = clamp(annDragRef.current.origX + dx / rect.width, 0.02, 0.98);
        const newY = clamp(annDragRef.current.origY + dy / rect.height, 0.02, 0.98);
        setLocalAnnotations((prev) =>
          prev.map((a) => a.id === annDragRef.current!.id ? { ...a, x: newX, y: newY } : a)
        );
      }
      return;
    }
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (annDragRef.current) {
      if (annDragMoved.current) {
        onAnnotationsChange?.(localAnnotations);
      }
      // If no movement, the card's onClick handles the edit toggle.
      annDragRef.current = null;
      annDragMoved.current = false;
      return;
    }
    isDragging.current = false;
    (e.currentTarget as HTMLElement).style.cursor = annotateMode ? "crosshair" : "grab";
  };

  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (annotateMode) return; // pan disabled in annotate mode
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    panStartPosRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  };

  const handlePanLayerClick = (e: React.MouseEvent) => {
    if (!onNodeClick) return;
    // Ignore if the mouse moved significantly (was a pan, not a click)
    if (
      Math.abs(e.clientX - panStartPosRef.current.x) > 5 ||
      Math.abs(e.clientY - panStartPosRef.current.y) > 5
    ) return;

    let el = e.target as Element | null;
    while (el && el !== e.currentTarget) {
      if (el instanceof SVGGElement && el.classList.contains("node")) {
        const labelEl =
          el.querySelector(".nodeLabel") ??
          el.querySelector(".label text") ??
          el.querySelector("text");
        const label = (labelEl?.textContent ?? "").trim();
        if (label) {
          clearNodeHighlight();
          el.style.filter = "drop-shadow(0 0 6px rgba(99,102,241,0.85))";
          highlightedNodeRef.current = el;
          onNodeClick(label, el.getBoundingClientRect());
          return;
        }
        break;
      }
      el = el.parentElement;
    }
    // Clicked empty canvas space — clear selection
    clearNodeHighlight();
    onNodeClick(null);
  };

  // Click on the annotation overlay (empty area) to place a new note
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!annotateMode || !onAnnotationsChange) return;
    const container = canvasRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0.02, 0.95);
    const y = clamp((e.clientY - rect.top) / rect.height, 0.02, 0.95);
    const newAnn: Annotation = {
      id: crypto.randomUUID(),
      x,
      y,
      text: "",
      color: "yellow",
    };
    const next = [...localAnnotations, newAnn];
    setLocalAnnotations(next);
    setEditingId(newAnn.id);
    onAnnotationsChange(next);
  };

  const showAnnotations = localAnnotations.length > 0 || annotateMode;

  return (
    <div
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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

        {!isLoading && error && !svg && (
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
                Syntax error in diagram
              </p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                Check the diagram code for syntax errors.
              </p>
            </div>
          </motion.div>
        )}

        {!isLoading && svg && !error && (
          <motion.div
            key={`svg-${svgKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={handlePanMouseDown}
            onClick={handlePanLayerClick}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              cursor: annotateMode ? "crosshair" : "grab",
              userSelect: "none",
              // In annotate mode let the overlay capture events; pan layer is passive
              pointerEvents: annotateMode ? "none" : "auto",
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

      {/* Annotation overlay */}
      {showAnnotations && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            // In annotate mode: capture clicks for new-note placement.
            // In view mode: transparent except for the cards themselves.
            pointerEvents: annotateMode ? "all" : "none",
            cursor: annotateMode ? "crosshair" : "default",
          }}
          onClick={handleOverlayClick}
        >
          {localAnnotations.map((ann) => (
            <AnnotationCard
              key={ann.id}
              annotation={ann}
              isEditing={editingId === ann.id}
              annotateMode={annotateMode}
              onDragStart={(e) => handleAnnotationDragStart(e, ann)}
              onToggleEdit={() => setEditingId((prev) => (prev === ann.id ? null : ann.id))}
              onChange={(patch) => {
                const next = localAnnotations.map((a) =>
                  a.id === ann.id ? { ...a, ...patch } : a
                );
                commitAnnotations(next);
              }}
              onDelete={() => {
                const next = localAnnotations.filter((a) => a.id !== ann.id);
                if (editingId === ann.id) setEditingId(null);
                commitAnnotations(next);
              }}
            />
          ))}
        </div>
      )}

      {/* Toolbar */}
      {!isLoading && svg && !error && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 30,
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
              height: 28,
              padding: "0 7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            SVG
          </button>

          <button
            onClick={() => {
              const svgEl = svgWrapperRef.current?.querySelector("svg");
              if (!svgEl) return;
              const bbox = svgEl.getBoundingClientRect();
              if (!bbox.width || !bbox.height) return;
              const scale = 2;
              const cloned = svgEl.cloneNode(true) as SVGSVGElement;
              cloned.setAttribute("width", String(bbox.width));
              cloned.setAttribute("height", String(bbox.height));
              const serialized = new XMLSerializer().serializeToString(cloned);
              const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
              const svgUrl = URL.createObjectURL(svgBlob);
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = bbox.width * scale;
                canvas.height = bbox.height * scale;
                const ctx = canvas.getContext("2d")!;
                ctx.scale(scale, scale);
                ctx.fillStyle = resolvedTheme === "dark" ? "#18181b" : "#ffffff";
                ctx.fillRect(0, 0, bbox.width, bbox.height);
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(svgUrl);
                canvas.toBlob((pngBlob) => {
                  if (!pngBlob) return;
                  const pngUrl = URL.createObjectURL(pngBlob);
                  const a = document.createElement("a");
                  a.href = pngUrl;
                  a.download = "architecture.png";
                  a.click();
                  URL.revokeObjectURL(pngUrl);
                }, "image/png");
              };
              img.src = svgUrl;
            }}
            title="Download as PNG"
            style={{
              height: 28,
              padding: "0 7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            PNG
          </button>

          {onExportJson && (
            <button
              onClick={onExportJson}
              title="Download as JSON spec"
              style={{
                height: 28,
                padding: "0 7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "transparent",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              JSON
            </button>
          )}

          {onAnnotationsChange && (
            <>
              <div style={{ width: 1, height: 16, background: "var(--color-border)", margin: "0 2px" }} />
              <button
                onClick={() => {
                  setAnnotateMode((m) => {
                    if (m) setEditingId(null);
                    return !m;
                  });
                }}
                title={annotateMode ? "Exit annotate mode" : "Annotate diagram"}
                style={{
                  height: 28,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-sm)",
                  border: annotateMode ? "1px solid var(--color-primary)" : "none",
                  background: annotateMode ? "rgba(99,102,241,0.15)" : "transparent",
                  color: annotateMode ? "var(--color-primary)" : "var(--color-text-muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  lineHeight: 1,
                }}
              >
                ✎
              </button>
            </>
          )}

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

      {/* Annotate mode hint */}
      {annotateMode && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: "var(--radius-md)",
            padding: "5px 12px",
            fontSize: 12,
            color: "var(--color-primary)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          Click anywhere to add a note · Click a note to edit · Drag to reposition
        </div>
      )}
    </div>
  );
}
