export function Bone({ w, h, radius }: { w?: string | number; h: number | string; radius?: string }) {
  return (
    <div
      style={{
        width: w ?? "100%",
        height: h,
        borderRadius: radius ?? "var(--radius-sm)",
        background: "var(--color-surface-offset)",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          animation: "bone-shimmer 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}
