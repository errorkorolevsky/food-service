import { ImageResponse } from "next/og"

export const size        = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        background: "#0a0a0a",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 16,
        fontWeight: 900,
        fontFamily: "system-ui",
        letterSpacing: "-1px",
      }}>
        FS
      </div>
    ),
    { ...size }
  )
}
