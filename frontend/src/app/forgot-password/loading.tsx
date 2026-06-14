import { Bone } from "@/components/Bone";

export default function ForgotPasswordLoading() {
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
        <Bone w={140} h={22} radius="var(--radius-sm)" />
        <div style={{ height: 8 }} />

        {/* Description */}
        <Bone w="90%" h={12} />
        <div style={{ height: 6 }} />
        <Bone w="70%" h={12} />
        <div style={{ height: 24 }} />

        {/* Email input */}
        <Bone h={36} radius="var(--radius-sm)" />
        <div style={{ height: 16 }} />

        {/* Submit button */}
        <Bone h={38} radius="var(--radius-sm)" />

        {/* Footer link */}
        <div style={{ height: 20 }} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Bone w={100} h={12} />
        </div>
      </div>
    </div>
  );
}
