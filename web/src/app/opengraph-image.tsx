import { ImageResponse } from "next/og";

export const alt = "Faizan Ali, Software Engineer & IT Project Manager";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The link-preview image, in the V21 dark theme colours.
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
        background: "#0c0e12",
        color: "#f6f6f7",
      }}
    >
      <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
        Faizan&nbsp;<span style={{ color: "#f97338" }}>Ali.</span>
      </div>
      <div style={{ fontSize: 40, marginTop: 24, color: "#b6bac2" }}>
        Software Engineer &amp; IT Project Manager
      </div>
    </div>,
    size,
  );
}
