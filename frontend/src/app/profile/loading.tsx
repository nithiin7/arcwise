import { Bone } from "@/components/Bone";

export default function ProfileLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Top nav bar */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          padding: "0 32px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Bone w={80} h={13} />
        <Bone w={1} h={16} />
        <Bone w={48} h={13} />
      </div>

      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "48px 32px",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* ── Left sidebar skeleton ── */}
        <div>
          {/* Avatar + name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              marginBottom: 28,
            }}
          >
            <Bone w={80} h={80} radius="50%" />
            <Bone w={120} h={17} />
            <Bone w={160} h={13} />
          </div>

          {/* Meta card */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: i < 4 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <Bone w={70} h={13} />
                <Bone w={64} h={22} radius="999px" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Right content skeleton ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Display name */}
          <SkeletonSection labelW={96} descW={200}>
            <SkeletonCard>
              <div style={{ display: "flex", gap: 10 }}>
                <Bone h={36} radius="var(--radius-sm)" />
                <Bone w={64} h={36} radius="var(--radius-sm)" />
              </div>
            </SkeletonCard>
          </SkeletonSection>

          {/* Change password */}
          <SkeletonSection labelW={116} descW={240}>
            <SkeletonCard>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Bone h={36} radius="var(--radius-sm)" />
                <Bone h={36} radius="var(--radius-sm)" />
                <Bone h={36} radius="var(--radius-sm)" />
                <div style={{ paddingTop: 2 }}>
                  <Bone w={128} h={36} radius="var(--radius-sm)" />
                </div>
              </div>
            </SkeletonCard>
          </SkeletonSection>

          {/* Danger zone */}
          <div>
            <div style={{ marginBottom: 10 }}>
              <Bone w={88} h={10} />
            </div>
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Bone w={110} h={14} />
                  <Bone w={280} h={12} />
                </div>
                <Bone w={112} h={34} radius="var(--radius-sm)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonSection({
  labelW,
  descW,
  children,
}: {
  labelW: number;
  descW?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 4 }}>
        <Bone w={labelW} h={10} />
        {descW && <Bone w={descW} h={12} />}
      </div>
      {children}
    </div>
  );
}

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
      }}
    >
      {children}
    </div>
  );
}
