import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff"          },
  { key: "X-Frame-Options",           value: "DENY"             },
  { key: "X-XSS-Protection",          value: "1; mode=block"    },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com"       },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },

  // Compress output for faster delivery
  compress: true,

  typescript: { ignoreBuildErrors: false },
}

export default nextConfig
