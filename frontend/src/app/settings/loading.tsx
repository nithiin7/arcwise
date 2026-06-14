import { Bone } from "@/components/Bone";

export default function SettingsLoading() {
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
        <Bone w={56} h={13} />
      </div>

      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "48px 32px",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* Left nav skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { label: 80, items: [72, 52, 64] },
            { label: 36, items: [60, 88] },
            { label: 40, items: [56] },
          ].map((group, gi) => (
            <div key={gi}>
              <div style={{ padding: "0 8px", marginBottom: 8 }}>
                <Bone w={group.label} h={10} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map((w, i) => (
                  <div key={i} style={{ padding: "6px 8px" }}>
                    <Bone w={w} h={13} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right content skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Appearance */}
          <SkeletonSection labelW={88}>
            <SkeletonCard>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Bone w={52} h={14} />
                  <Bone w={180} h={12} />
                </div>
                <Bone w={116} h={30} radius="var(--radius-sm)" />
              </div>
            </SkeletonCard>
          </SkeletonSection>

          {/* Model */}
          <SkeletonSection labelW={52}>
            <SkeletonCard>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Bone w={110} h={14} />
                  <Bone w={200} h={12} />
                </div>
                <Bone w={144} h={36} radius="var(--radius-sm)" />
              </div>
            </SkeletonCard>
          </SkeletonSection>

          {/* Diagram */}
          <SkeletonSection labelW={64}>
            <SkeletonCard>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Bone w={130} h={14} />
                  <Bone w={240} h={12} />
                </div>
                <Bone w={116} h={30} radius="var(--radius-sm)" />
              </div>
            </SkeletonCard>
          </SkeletonSection>

          {/* API Keys */}
          <SkeletonSection labelW={60} descW={260}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <Bone w={120} h={14} />
                      <Bone w={80} h={12} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Bone h={36} radius="var(--radius-sm)" />
                    <Bone w={52} h={36} radius="var(--radius-sm)" />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Bone w={160} h={11} />
                  </div>
                </SkeletonCard>
              ))}
            </div>
          </SkeletonSection>

          {/* Local Models */}
          <SkeletonSection labelW={100} descW={300}>
            <SkeletonCard>
              <div style={{ marginBottom: 14 }}>
                <div style={{ marginBottom: 5 }}><Bone w={64} h={14} /></div>
                <Bone w={200} h={12} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Bone w="78%" h={13} />
                <Bone w="64%" h={13} />
                <Bone w="52%" h={13} />
              </div>
            </SkeletonCard>
          </SkeletonSection>

          {/* Data */}
          <SkeletonSection labelW={44}>
            <SkeletonCard>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Bone w={140} h={14} />
                  <Bone w={230} h={12} />
                </div>
                <Bone w={72} h={30} radius="var(--radius-sm)" />
              </div>
            </SkeletonCard>
          </SkeletonSection>
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
      <div style={{ marginBottom: 10 }}>
        <div style={{ marginBottom: descW ? 5 : 0 }}><Bone w={labelW} h={10} /></div>
        {descW && <Bone w={descW} h={12} />}
      </div>
      {children}
    </div>
  );
}

function SkeletonCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
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
