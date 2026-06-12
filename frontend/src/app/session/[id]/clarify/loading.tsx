import { Bone } from "@/components/Bone";

export default function ClarifyLoading() {
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
      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 40 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Bone key={i} w={i === 1 ? 24 : 8} h={8} radius="999px" />
          ))}
        </div>

        {/* Question card */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Step label */}
          <Bone w={80} h={11} />

          {/* Question text */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Bone h={20} w="90%" radius="var(--radius-sm)" />
            <Bone h={20} w="65%" radius="var(--radius-sm)" />
          </div>

          {/* Textarea */}
          <Bone h={96} radius="var(--radius-md)" />

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Bone w={72} h={36} radius="var(--radius-sm)" />
            <Bone w={80} h={36} radius="var(--radius-sm)" />
          </div>
        </div>
      </div>
    </div>
  );
}
