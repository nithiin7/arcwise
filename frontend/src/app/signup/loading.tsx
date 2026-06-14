import { Bone } from "@/components/Bone";

export default function SignupLoading() {
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
        <Bone w={160} h={22} radius="var(--radius-sm)" />
        <div style={{ height: 24 }} />

        {/* OAuth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Bone h={37} radius="var(--radius-sm)" />
          <Bone h={37} radius="var(--radius-sm)" />
        </div>

        {/* Divider */}
        <div style={{ height: 20 }} />
        <Bone h={1} />
        <div style={{ height: 20 }} />

        {/* Name + email + password inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Bone h={36} radius="var(--radius-sm)" />
          <Bone h={36} radius="var(--radius-sm)" />
          <Bone h={36} radius="var(--radius-sm)" />
        </div>
        <div style={{ height: 16 }} />

        {/* Submit button */}
        <Bone h={38} radius="var(--radius-sm)" />

        {/* Footer link */}
        <div style={{ height: 24 }} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Bone w={180} h={12} />
        </div>
      </div>
    </div>
  );
}
