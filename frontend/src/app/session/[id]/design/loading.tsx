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
        {/* Back arrow */}
        <Bone w={28} h={28} radius="var(--radius-sm)" />
        {/* Session title */}
        <Bone w={200} h={13} />
        <div style={{ flex: 1 }} />
        {/* History pill */}
        <Bone w={80} h={26} radius="999px" />
        {/* Share */}
        <Bone w={72} h={30} radius="var(--radius-sm)" />
        {/* Refine / Review tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          <Bone w={64} h={30} radius="var(--radius-sm)" />
          <Bone w={64} h={30} radius="var(--radius-sm)" />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: diagram canvas */}
        <div
          style={{
            flex: 1,
            padding: 16,
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <Bone h="100%" radius="var(--radius-md)" />
        </div>

        {/* Right: chat sidebar */}
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { sender: 60, lines: ["80%", "60%"] },
              { sender: 56, lines: ["65%"] },
              { sender: 64, lines: ["75%", "55%", "48%"] },
              { sender: 60, lines: ["70%", "52%"] },
            ].map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Bone w={msg.sender} h={10} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {msg.lines.map((lw, j) => (
                    <Bone key={j} w={lw} h={12} />
                  ))}
                </div>
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
