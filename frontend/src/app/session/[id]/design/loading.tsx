import { Bone } from "@/components/Bone";

export default function DesignLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--color-bg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <Bone w={28} h={28} radius="var(--radius-sm)" />
        <Bone w={160} h={14} />
        <div style={{ flex: 1 }} />
        <Bone w={100} h={32} radius="var(--radius-sm)" />
      </div>

      {/* Body: diagram + chat */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: diagram canvas */}
        <div
          style={{
            flex: 1,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <Bone h="100%" radius="var(--radius-md)" />
        </div>

        {/* Right: chat + input */}
        <div
          style={{
            width: 320,
            display: "flex",
            flexDirection: "column",
            padding: 16,
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* Chat messages */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {[85, 60, 90, 55, 70].map((w, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Bone w={w} h={12} />
                <Bone w={`${w - 15}%`} h={12} />
              </div>
            ))}
          </div>

          {/* Input */}
          <Bone h={40} radius="var(--radius-sm)" />
        </div>
      </div>
    </div>
  );
}
