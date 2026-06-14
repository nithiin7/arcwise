import { Bone } from "@/components/Bone";

export default function SettingsLoading() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {/* Header: back link + title + theme toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Bone w={48} h={13} />
        <Bone w={88} h={22} radius="var(--radius-sm)" />
        <div style={{ marginLeft: "auto" }}>
          <Bone w={60} h={28} radius="var(--radius-sm)" />
        </div>
      </div>

      {/* API Keys section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
          <Bone w={76} h={11} />
          <Bone w="68%" h={13} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Bone w={120} h={14} />
              <Bone w={68} h={11} />
            </div>
            <Bone h={36} radius="var(--radius-sm)" />
          </div>
        ))}
      </div>

      {/* Local Models (Ollama) section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
          <Bone w={140} h={11} />
          <Bone w="58%" h={13} />
        </div>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Bone w={60} h={14} />
            <Bone w="62%" h={12} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Bone w="78%" h={13} />
            <Bone w="68%" h={13} />
            <Bone w="52%" h={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
