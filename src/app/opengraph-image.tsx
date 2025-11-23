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
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#000",
        backgroundImage: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        padding: "80px",
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 24,
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
          fontSize: 52,
          fontWeight: 300,
          color: "#a0a0a0",
          lineHeight: 1.3,
          maxWidth: 900,
          marginBottom: 40,
        }}
      >
        <span>Privacy and security built into</span>
        <span>your payments</span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 80,
          height: 4,
          backgroundColor: "#fff",
          marginBottom: 40,
        }}
      />

      {/* Description */}
      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#808080",
          maxWidth: 800,
        }}
      >
        Virtual cards that protect your financial data
      </div>

      {/* Features badges */}
      <div
        style={{
          display: "flex",
          marginTop: 50,
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "12px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 8,
            fontSize: 20,
            color: "#fff",
          }}
        >
          Secure
        </div>
        <div
          style={{
            display: "flex",
            padding: "12px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 8,
            fontSize: 20,
            color: "#fff",
          }}
        >
          Private
        </div>
        <div
          style={{
            display: "flex",
            padding: "12px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 8,
            fontSize: 20,
            color: "#fff",
          }}
        >
          Virtual
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
