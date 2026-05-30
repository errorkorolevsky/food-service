import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  random,
} from "remotion";
import { COLORS, FONT } from "../config/theme";

export type Format = "16x9" | "9x16";

/* ─── BRAND MARK ─────────────────────────────────────────────────────────── */

export const BrandMark: React.FC<{ size?: number; white?: boolean; stacked?: boolean }> = ({
  size = 64,
  white = false,
  stacked = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: "center",
        gap: stacked ? 18 : size * 0.35,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect width="80" height="80" rx="18" fill={white ? "rgba(255,255,255,0.14)" : COLORS.primary} />
        <rect x="8" y="8" width="64" height="64" rx="14" fill={white ? "rgba(255,255,255,0.10)" : "#006B54"} />
        <rect x="20" y="20" width="38" height="8" rx="4" fill="white" />
        <rect x="20" y="34" width="28" height="7" rx="3.5" fill="white" />
        <rect x="20" y="20" width="8" height="40" rx="4" fill="white" />
      </svg>
      <div style={{ textAlign: stacked ? "center" : "left", lineHeight: 1 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: size * 0.46,
            letterSpacing: "-0.03em",
            color: white ? "#fff" : COLORS.graphite,
          }}
        >
          Food Service
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: size * 0.2,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginTop: 6,
            color: white ? "rgba(255,255,255,0.6)" : COLORS.primary,
          }}
        >
          Kazakhstan
        </div>
      </div>
    </div>
  );
};

/* ─── PHONE MOCKUP (with optional vertical pan = "scrolling") ─────────────── */

export const PhoneMockup: React.FC<{
  src: string;
  height: number;
  panY?: [number, number]; // fraction of overflow to pan across the sequence
  zoom?: [number, number];
}> = ({ src, height, panY, zoom }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const screenW = height * (390 / 844);
  const bezel = height * 0.02;

  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = panY ? interpolate(t, [0, 1], panY) : 0;
  const scale = zoom ? interpolate(t, [0, 1], zoom) : 1;

  return (
    <div
      style={{
        width: screenW + bezel * 2,
        height: height + bezel * 2,
        borderRadius: height * 0.085,
        padding: bezel,
        background: "linear-gradient(160deg,#2a2a2e,#0e0e10)",
        boxShadow: "0 50px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset",
      }}
    >
      <div
        style={{
          position: "relative",
          width: screenW,
          height,
          borderRadius: height * 0.07,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: panY ? "auto" : "100%",
            objectFit: "cover",
            transform: `translateY(${translateY}px) scale(${scale})`,
            transformOrigin: "center top",
          }}
        />
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: screenW * 0.4,
            height: height * 0.025,
            background: "#000",
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        />
      </div>
    </div>
  );
};

/* ─── KEN BURNS (slow zoom/pan over a still) ─────────────────────────────── */

export const KenBurns: React.FC<{
  src: string;
  from?: number;
  to?: number;
  panX?: [number, number];
  panY?: [number, number];
  radius?: number;
  style?: React.CSSProperties;
}> = ({ src, from = 1.05, to = 1.18, panX = [0, 0], panY = [0, 0], radius = 24, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(t, [0, 1], [from, to]);
  const x = interpolate(t, [0, 1], panX);
  const y = interpolate(t, [0, 1], panY);
  return (
    <div style={{ overflow: "hidden", borderRadius: radius, ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
        }}
      />
    </div>
  );
};

/* ─── AMBIENT BACKGROUND (moving glows + particles + grain) ──────────────── */

export const AmbientBackground: React.FC<{ variant?: "dark" | "light" }> = ({
  variant = "light",
}) => {
  const frame = useCurrentFrame();
  const dark = variant === "dark";

  // Cheap, GPU-friendly soft glows via layered radial-gradients (no blur filter,
  // which is extremely slow in headless software rendering).
  const osc = (speed: number, amp: number, phase = 0) =>
    Math.sin((frame / speed) * Math.PI * 2 + phase) * amp;

  const g1x = 16 + osc(240, 7);
  const g1y = 22 + osc(260, 6, 1);
  const g2x = 84 + osc(300, 6, 2);
  const g2y = 76 + osc(280, 7, 0.5);
  const g3x = 60 + osc(360, 8, 1.5);
  const g3y = 40 + osc(340, 6, 2.5);

  const baseColor = dark ? "#0A0F0D" : "#F6FAF8";
  const a1 = dark ? 0.55 : 0.3;
  const a2 = dark ? 0.5 : 0.26;
  const layers = [
    `radial-gradient(circle at ${g1x}% ${g1y}%, rgba(13,158,118,${a1}) 0%, transparent 42%)`,
    `radial-gradient(circle at ${g2x}% ${g2y}%, rgba(0,91,70,${a2}) 0%, transparent 44%)`,
    dark
      ? `radial-gradient(circle at ${g3x}% ${g3y}%, rgba(52,211,153,0.32) 0%, transparent 38%)`
      : `radial-gradient(circle at ${g3x}% ${g3y}%, rgba(10,122,92,0.14) 0%, transparent 40%)`,
    dark
      ? "radial-gradient(ellipse 120% 90% at 50% 0%, #0d2a20 0%, #0A0F0D 62%)"
      : "linear-gradient(160deg,#F8FAF9 0%,#EAF3EF 50%,#F8FAF9 100%)",
  ];

  return (
    <AbsoluteFill style={{ background: baseColor, backgroundImage: layers.join(",") }}>
      {/* particles */}
      {new Array(10).fill(0).map((_, i) => {
        const px = random(`px-${i}`) * 100;
        const py = random(`py-${i}`) * 100;
        const s = 2 + random(`ps-${i}`) * 4;
        const drift = Math.sin((frame / (90 + i * 6)) * Math.PI * 2) * 18;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${px}%`,
              top: `${py}%`,
              width: s,
              height: s,
              borderRadius: "50%",
              background: dark ? "rgba(255,255,255,0.45)" : "rgba(13,158,118,0.5)",
              transform: `translateY(${drift}px)`,
              opacity: 0.4,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ─── ANIMATED SUBTITLE (word-by-word reveal) ────────────────────────────── */

export const Subtitle: React.FC<{ text: string; format: Format }> = ({ text, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const start = 8;
  const wide = format === "16x9";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: wide ? 80 : 230,
        display: "flex",
        justifyContent: "center",
        padding: wide ? "0 200px" : "0 70px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: wide ? "10px 14px" : "8px 12px",
          maxWidth: wide ? 1300 : 900,
        }}
      >
        {words.map((w, i) => {
          const appear = spring({
            frame: frame - start - i * 2.2,
            fps,
            config: { damping: 18, stiffness: 120 },
            durationInFrames: 20,
          });
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: wide ? 38 : 44,
                lineHeight: 1.25,
                color: "#fff",
                opacity: appear,
                transform: `translateY(${(1 - appear) * 18}px)`,
                textShadow: "0 2px 18px rgba(0,0,0,0.55)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ─── LOWER THIRD (section label) ────────────────────────────────────────── */

export const LowerThird: React.FC<{ title: string; format: Format }> = ({ title, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!title) return null;
  const s = spring({ frame: frame - 6, fps, config: { damping: 16 }, durationInFrames: 18 });
  const wide = format === "16x9";
  return (
    <div
      style={{
        position: "absolute",
        left: wide ? 90 : 70,
        bottom: wide ? 170 : 340,
        opacity: s,
        transform: `translateX(${(1 - s) * -30}px)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.20)",
          borderRadius: 999,
          padding: wide ? "10px 22px" : "12px 26px",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.emerald }} />
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: wide ? 24 : 30,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
};

/* ─── CALLOUT (animated pointer badge) ───────────────────────────────────── */

export const Callout: React.FC<{
  x: number;
  y: number;
  label: string;
  delay?: number;
  format: Format;
}> = ({ x, y, label, delay = 0, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 }, durationInFrames: 20 });
  const wide = format === "16x9";
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%,-50%) scale(${s})`,
        opacity: s,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "#fff",
          borderRadius: 999,
          padding: wide ? "10px 18px" : "12px 22px",
          boxShadow: "0 10px 40px rgba(0,91,70,0.25)",
          border: `1.5px solid ${COLORS.accent}`,
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: COLORS.accent }} />
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: wide ? 22 : 28,
            color: COLORS.graphite,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

/* ─── PRODUCT PILL (floating emoji + price) ──────────────────────────────── */

export const ProductPill: React.FC<{
  emoji: string;
  price: string;
  style?: React.CSSProperties;
  dark?: boolean;
}> = ({ emoji, price, style, dark }) => {
  const frame = useCurrentFrame();
  const float = Math.sin((frame / 50) * Math.PI * 2) * 8;
  return (
    <div
      style={{
        position: "absolute",
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 22px 10px 12px",
        borderRadius: 999,
        background: dark ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.92)",
        border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 10px 36px rgba(0,91,70,0.16)",
        transform: `translateY(${float}px)`,
        ...style,
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: dark ? "rgba(255,255,255,0.1)" : COLORS.light,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        {emoji}
      </span>
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 26,
          color: dark ? "#fff" : COLORS.graphite,
        }}
      >
        {price}
      </span>
    </div>
  );
};

/* ─── CART ICON ──────────────────────────────────────────────────────────── */

export const CartIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = "#fff",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

/* ─── SCENE WRAP (fade in/out + ambient + lower third + subtitle) ────────── */

export const SceneWrap: React.FC<{
  variant: "dark" | "light";
  title: string;
  subtitle: string;
  format: Format;
  children: React.ReactNode;
}> = ({ variant, title, subtitle, format, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = interpolate(frame, [0, 18], [1.02, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <AmbientBackground variant={variant} />
        {children}
      </AbsoluteFill>
      <LowerThird title={title} format={format} />
      <Subtitle text={subtitle} format={format} />
    </AbsoluteFill>
  );
};
