"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "system" | "light" | "dark"

type ThemeContextType = {
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType>({
  theme:         "system",
  setTheme:      () => {},
  resolvedTheme: "light",
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(theme: Theme): "light" | "dark" {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches

  const resolved: "light" | "dark" =
    theme === "dark" ? "dark" :
    theme === "light" ? "light" :
    prefersDark ? "dark" : "light"

  document.documentElement.classList.toggle("dark", resolved === "dark")
  return resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem("fs-theme") as Theme | null) ?? "system"
    setThemeState(stored)
    setResolvedTheme(applyTheme(stored))
    setMounted(true)

    // Listen for system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      setThemeState((prev) => {
        if (prev === "system") {
          setResolvedTheme(applyTheme("system"))
        }
        return prev
      })
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem("fs-theme", t)
    setResolvedTheme(applyTheme(t))
  }

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
