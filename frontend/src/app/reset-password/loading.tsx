import { Bone } from "@/components/Bone";

export default function ResetPasswordLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "24px 16px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
        <Bone w={18} h={18} radius="4px" />
        <Bone w={64} h={12} />
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 28px",
        }}
      >
        {/* Title */}
        <Bone w={150} h={22} radius="var(--radius-sm)" />
        <div style={{ height: 24 }} />

        {/* Password + confirm inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Bone h={36} radius="var(--radius-sm)" />
          <Bone h={36} radius="var(--radius-sm)" />
        </div>
        <div style={{ height: 16 }} />

        {/* Submit button */}
        <Bone h={38} radius="var(--radius-sm)" />
      </div>
    </div>
  );
}
