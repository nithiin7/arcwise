import { Bone } from "@/components/Bone";

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        minHeight: "100vh",
      }}
    >
      {/* Header: back link + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <Bone w={48} h={13} />
        <Bone w={88} h={22} radius="var(--radius-sm)" />
      </div>

      {/* Appearance */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}><Bone w={96} h={11} /></div>
        <SectionCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Bone w={56} h={14} />
            <Bone w={160} h={12} />
          </div>
          <Bone w={120} h={28} radius="var(--radius-sm)" />
        </SectionCard>
      </div>

      {/* Model */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}><Bone w={56} h={11} /></div>
        <SectionCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Bone w={108} h={14} />
            <Bone w={180} h={12} />
          </div>
          <Bone w={140} h={36} radius="var(--radius-sm)" />
        </SectionCard>
      </div>

      {/* Diagram */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}><Bone w={72} h={11} /></div>
        <SectionCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Bone w={124} h={14} />
            <Bone w={200} h={12} />
          </div>
          <Bone w={120} h={28} radius="var(--radius-sm)" />
        </SectionCard>
      </div>

      {/* API Keys */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 4 }}><Bone w={76} h={11} /></div>
        <div style={{ marginBottom: 20 }}><Bone w="68%" h={13} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SectionCard key={i}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                <Bone w={120} h={14} />
                <Bone w={80} h={12} />
              </div>
              <Bone h={36} radius="var(--radius-sm)" />
            </SectionCard>
          ))}
        </div>
      </div>

      {/* Data */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}><Bone w={44} h={11} /></div>
        <SectionCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Bone w={136} h={14} />
            <Bone w={220} h={12} />
          </div>
          <Bone w={72} h={28} radius="var(--radius-sm)" />
        </SectionCard>
      </div>

      {/* Local Models (Ollama) */}
      <div>
        <div style={{ marginBottom: 4 }}><Bone w={140} h={11} /></div>
        <div style={{ marginBottom: 16 }}><Bone w="58%" h={13} /></div>
        <SectionCard style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Bone w={60} h={14} />
            <Bone w="62%" h={12} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Bone w="78%" h={13} />
            <Bone w="68%" h={13} />
            <Bone w="52%" h={13} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
