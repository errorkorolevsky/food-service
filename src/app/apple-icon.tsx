import { ImageResponse } from "next/og"

export const size        = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        background: "#0a0a0a",
        borderRadius: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 80,
        fontWeight: 900,
        fontFamily: "system-ui",
        letterSpacing: "-4px",
      }}>
        FS
      </div>
    ),
    { ...size }
  )
}
