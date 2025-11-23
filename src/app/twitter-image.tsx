import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Shadow - Privacy and Security Built Into Your Payments";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        backgroundImage: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        padding: "80px",
        textAlign: "center",
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          display: "flex",
          fontSize: 84,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 40,
          letterSpacing: "-0.02em",
        }}
      >
        Shadow
      </div>

      {/* Main Headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 44,
          fontWeight: 300,
          color: "#a0a0a0",
          lineHeight: 1.4,
          maxWidth: 900,
        }}
      >
        <span>Privacy and security</span>
        <span>built into your payments</span>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          marginTop: 60,
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "16px 28px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 12,
            fontSize: 24,
            color: "#fff",
          }}
        >
          🔒 Secure
        </div>
        <div
          style={{
            display: "flex",
            padding: "16px 28px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 12,
            fontSize: 24,
            color: "#fff",
          }}
        >
          🛡️ Private
        </div>
        <div
          style={{
            display: "flex",
            padding: "16px 28px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 12,
            fontSize: 24,
            color: "#fff",
          }}
        >
          💳 Virtual
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
