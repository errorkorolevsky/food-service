"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <html lang="ru">
      <body style={{ margin: 0, background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: "0 16px", maxWidth: 360 }}>
          <p style={{ fontSize: 64, fontWeight: 900, color: "rgba(255,255,255,0.08)", margin: 0, lineHeight: 1 }}>500</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "8px 0 0" }}>
            Что-то пошло не так
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.5 }}>
            Критическая ошибка приложения. Попробуйте обновить страницу.
          </p>
          {process.env.NODE_ENV !== "production" || error.message ? (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 8, fontFamily: "monospace", wordBreak: "break-all" }}>
              {error.message}{error.digest ? ` [${error.digest}]` : ""}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
            <button
              onClick={reset}
              style={{ padding: "10px 20px", borderRadius: 12, background: "#005B46", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Попробовать снова
            </button>
            <a
              href="/"
              style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
            >
              На главную
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
