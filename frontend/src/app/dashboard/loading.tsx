import { Bone } from "@/components/Bone";

export default function DashboardLoading() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "0 16px",
        background: "var(--color-bg)",
      }}
    >
      {/* Settings link top-right */}
      <div style={{ position: "fixed", top: 14, right: 20 }}>
        <Bone w={76} h={24} radius="var(--radius-sm)" />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 672,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
      >
        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <Bone w={18} h={18} radius="4px" />
          <Bone w={64} h={12} />
        </div>

        {/* Heading */}
        <Bone w="72%" h={42} radius="var(--radius-md)" />
        <div style={{ height: 12 }} />

        {/* Sub-text */}
        <Bone w="62%" h={14} />
        <div style={{ height: 7 }} />
        <Bone w="48%" h={14} />
        <div style={{ height: 32 }} />

        {/* Textarea card */}
        <div
          style={{
            width: "100%",
            position: "relative",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 14px 52px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Bone h={14} w="78%" />
          <Bone h={14} w="52%" />
          {/* Bottom toolbar */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Bone w={116} h={30} radius="var(--radius-sm)" />
            <div style={{ flex: 1 }} />
            <Bone w={88} h={30} radius="var(--radius-sm)" />
          </div>
        </div>

        {/* Example pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[88, 116, 78, 104, 92, 124, 84, 98, 108, 72].map((w, i) => (
            <Bone key={i} w={w} h={30} radius="999px" />
          ))}
        </div>

        {/* Recent designs section */}
        <div style={{ width: "100%", marginTop: 40 }}>
          {/* Divider row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Bone w={100} h={10} />
            <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
            <Bone w={104} h={26} radius="var(--radius-sm)" />
          </div>

          {/* Session card stubs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { title: "75%", tags: [60, 72] },
              { title: "60%", tags: [80, 56] },
              { title: "68%", tags: [64, 68] },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Bone w={card.title} h={13} />
                  <Bone w={36} h={10} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {card.tags.map((tw, j) => (
                    <Bone key={j} w={tw} h={20} radius="999px" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
