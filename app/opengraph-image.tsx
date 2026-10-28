import { ImageResponse } from "next/og";
export const alt = "Mharc Angelo S. Cardenas — Developer Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: 90,
        background: "#080b16",
        color: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          color: "#89acff",
          marginBottom: 35,
        }}
      >
        THOUGHTFUL CODE. MEANINGFUL EXPERIENCES.
      </div>
      <div style={{ display: "flex", fontSize: 68, fontWeight: 700 }}>
        Mharc Angelo
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 68,
          fontWeight: 700,
          color: "#a898ff",
        }}
      >
        S. Cardenas.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 25,
          color: "#94a3b8",
          marginTop: 35,
        }}
      >
        Aspiring IT Professional · Full-Stack Developer
      </div>
    </div>,
    size,
  );
}
