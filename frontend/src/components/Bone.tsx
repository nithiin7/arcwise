export function Bone({ w, h, radius }: { w?: string | number; h: number | string; radius?: string }) {
  return (
    <div
      className="animate-pulse"
      style={{
        width: w ?? "100%",
        height: h,
        borderRadius: radius ?? "var(--radius-sm)",
        background: "var(--color-surface-offset)",
        flexShrink: 0,
      }}
    />
  );
}
