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

export default function HomeLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "0 16px",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 672,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <Bone w={18} h={18} radius="4px" />
          <Bone w={70} h={12} />
        </div>

        {/* Heading */}
        <Bone w="65%" h={40} radius="var(--radius-md)" />
        <div style={{ height: 8 }} />
        <Bone w="45%" h={40} radius="var(--radius-md)" />
        <div style={{ height: 16 }} />

        {/* Subtitle */}
        <Bone w="60%" h={14} />
        <div style={{ height: 6 }} />
        <Bone w="45%" h={14} />
        <div style={{ height: 32 }} />

        {/* Textarea card */}
        <div
          style={{
            width: "100%",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 14px 48px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Bone h={14} w="80%" />
          <Bone h={14} w="55%" />
        </div>

        {/* Example pills */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {[100, 130, 110, 80, 120].map((w, i) => (
            <Bone key={i} w={w} h={32} radius="999px" />
          ))}
        </div>
      </div>
    </div>
  );
}
