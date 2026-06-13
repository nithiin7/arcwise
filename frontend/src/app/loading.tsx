import { Bone } from "@/components/Bone";

export default function HomeLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Nav */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bone w={18} h={18} radius="4px" />
          <Bone w={64} h={12} />
        </div>
        <Bone w={82} h={30} radius="var(--radius-sm)" />
      </div>

      {/* Hero */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 80px",
        }}
      >
        {/* Badge */}
        <Bone w={196} h={26} radius="999px" />
        <div style={{ height: 28 }} />

        {/* Heading */}
        <Bone w="52%" h={52} radius="var(--radius-md)" />
        <div style={{ height: 10 }} />
        <Bone w="38%" h={52} radius="var(--radius-md)" />
        <div style={{ height: 20 }} />

        {/* Subtext */}
        <Bone w="50%" h={14} />
        <div style={{ height: 7 }} />
        <Bone w="42%" h={14} />
        <div style={{ height: 7 }} />
        <Bone w="35%" h={14} />
        <div style={{ height: 40 }} />

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12 }}>
          <Bone w={148} h={44} radius="var(--radius-sm)" />
          <Bone w={118} h={44} radius="var(--radius-sm)" />
        </div>
      </div>
    </div>
  );
}
