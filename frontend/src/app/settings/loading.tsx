function Bone({ w, h, radius }: { w?: string | number; h: number; radius?: string }) {
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

export default function SettingsLoading() {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "48px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {/* Back link + title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Bone w={80} h={12} />
        <Bone w={120} h={24} />
        <Bone w="70%" h={14} />
      </div>

      {/* Provider rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Bone w={130} h={14} />
            <Bone w={80} h={11} />
          </div>
          <Bone h={38} radius="var(--radius-sm)" />
        </div>
      ))}
    </div>
  );
}
