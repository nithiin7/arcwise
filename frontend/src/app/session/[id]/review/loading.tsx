import { Bone } from "@/components/Bone";

export default function ReviewLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          background: "var(--color-bg)",
          zIndex: 10,
        }}
      >
        <Bone w={28} h={28} radius="var(--radius-sm)" />
        <Bone w={140} h={14} />
        <div style={{ flex: 1 }} />
        <Bone w={110} h={32} radius="var(--radius-sm)" />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px", display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Overall score */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Bone w={72} h={72} radius="var(--radius-lg)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <Bone w={180} h={22} />
            <Bone w={120} h={14} />
          </div>
        </div>

        {/* Score cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Bone w="60%" h={12} />
              <Bone w={40} h={28} radius="var(--radius-sm)" />
              <Bone h={8} radius="999px" />
            </div>
          ))}
        </div>

        {/* Feedback sections */}
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Bone w={120} h={14} />
            <Bone h={14} />
            <Bone h={14} w="85%" />
            <Bone h={14} w="70%" />
          </div>
        ))}
      </div>
    </div>
  );
}
