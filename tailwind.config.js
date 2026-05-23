/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {

      colors: {
        fs: {
          // PRIMARY BRAND — Food Service Kazakhstan (fixed, no dark-mode change)
          primary:   "#005B46",
          dark:      "#00392D",
          soft:      "#0A7A5C",
          accent:    "#0D9E76",

          // SURFACES — CSS variables, auto dark-mode
          white:     "rgb(var(--fs-white) / <alpha-value>)",
          offwhite:  "rgb(var(--fs-offwhite) / <alpha-value>)",
          light:     "rgb(var(--fs-light) / <alpha-value>)",
          border:    "rgb(var(--fs-border) / <alpha-value>)",
          muted:     "rgb(var(--fs-muted) / <alpha-value>)",

          // TEXT — CSS variables, auto dark-mode
          graphite:  "rgb(var(--fs-graphite) / <alpha-value>)",
          gray:      "rgb(var(--fs-gray) / <alpha-value>)",
          slate:     "rgb(var(--fs-slate) / <alpha-value>)",

          // LEGACY — kept for auth/admin pages
          black:     "#1E1E1E",
          surface:   "#F5F5F5",
          subtle:    "#E5E7EB",

          // SEMANTIC
          green:     "#22c55e",
          red:       "#ef4444",
          gold:      "#c9a84c",
          amber:     "#F59E0B",
        },
      },

      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },

      fontSize: {
        // DESKTOP — fluid clamp
        "display-xl": ["clamp(4rem, 12vw, 10rem)",  { lineHeight: "0.9",  letterSpacing: "-0.05em", fontWeight: "900" }],
        "display":    ["clamp(3.5rem, 9vw,  8rem)",  { lineHeight: "1",    letterSpacing: "-0.03em", fontWeight: "800" }],
        "hero":       ["clamp(2.5rem, 6vw,  5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" }],
        "heading":    ["clamp(1.75rem, 4vw, 3rem)",   { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title":      ["clamp(1.25rem, 3vw, 2rem)",   { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-lg":    ["1.125rem",                    { lineHeight: "1.75", letterSpacing: "-0.01em" }],
        "body":       ["1rem",                        { lineHeight: "1.65", letterSpacing: "-0.01em" }],
        "caption":    ["0.875rem",                    { lineHeight: "1.5",  letterSpacing: "0em"     }],
        "label":      ["0.75rem",                     { lineHeight: "1.4",  letterSpacing: "0.06em",  fontWeight: "600" }],

        // MOBILE-SPECIFIC — tighter scale
        "m-hero":    ["2rem",    { lineHeight: "1.1",  letterSpacing: "-0.03em", fontWeight: "800" }],
        "m-heading": ["1.5rem",  { lineHeight: "1.2",  letterSpacing: "-0.02em", fontWeight: "700" }],
        "m-title":   ["1.125rem",{ lineHeight: "1.3",  letterSpacing: "-0.01em", fontWeight: "600" }],
        "m-body":    ["0.9375rem",{ lineHeight: "1.6",  letterSpacing: "0em"     }],
        "m-caption": ["0.8125rem",{ lineHeight: "1.5",  letterSpacing: "0em"     }],
      },

      borderRadius: {
        "xs":  "6px",
        "sm":  "10px",
        "md":  "14px",
        "lg":  "20px",
        "xl":  "28px",
        "2xl": "36px",
        "3xl": "48px",
        "pill":"9999px",
      },

      boxShadow: {
        "sm":      "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "md":      "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)",
        "lg":      "0 8px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)",
        "xl":      "0 16px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
        "card":    "0 2px 8px rgba(0,91,70,0.06), 0 1px 3px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 24px rgba(0,91,70,0.12), 0 2px 6px rgba(0,0,0,0.08)",
        "green":   "0 4px 20px rgba(0,91,70,0.25)",
        "green-lg":"0 8px 40px rgba(0,91,70,0.30)",
        "float":   "0 24px 64px rgba(0,0,0,0.12)",

        // legacy
        "glow-sm": "0 0 20px rgba(0,91,70,0.08)",
        "glow":    "0 0 40px rgba(0,91,70,0.12)",
        "glow-lg": "0 0 80px rgba(0,91,70,0.16)",
      },

      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero":    "linear-gradient(135deg, #00392D 0%, #005B46 50%, #0A7A5C 100%)",
        "gradient-green":   "linear-gradient(135deg, #005B46 0%, #0A7A5C 100%)",
        "gradient-subtle":  "linear-gradient(180deg, #F0F4F2 0%, #FFFFFF 100%)",
        "gradient-card":    "linear-gradient(135deg, rgba(0,91,70,0.04) 0%, transparent 100%)",
        "grid-pattern":     "linear-gradient(rgba(0,91,70,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,91,70,0.05) 1px, transparent 1px)",
      },

      backgroundSize: {
        "grid": "48px 48px",
      },

      backdropBlur: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "40px",
      },

      transitionDuration: {
        "400": "400ms",
      },

      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "out":    "cubic-bezier(0, 0, 0.2, 1)",
      },

      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
      },

      animation: {
        "fade-up":    "fade-up 0.6s cubic-bezier(0,0,0.2,1) both",
        "fade-in":    "fade-in 0.5s cubic-bezier(0,0,0.2,1) both",
        "slide-in":   "slide-in 0.5s cubic-bezier(0,0,0.2,1) both",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "shimmer":    "shimmer 2s linear infinite",
        "float":      "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
