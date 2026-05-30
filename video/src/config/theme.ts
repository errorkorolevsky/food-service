import scriptData from "./script.json";
import scriptDataV2 from "./script-v2.json";

export const FPS = scriptData.fps;

export const COLORS = {
  dark: "#00392D",
  graphite: "#0A0F0D",
  primary: "#005B46",
  soft: "#0A7A5C",
  accent: "#0D9E76",
  emerald: "#34D399",
  mint: "#ECFDF5",
  light: "#F0F4F2",
  white: "#FFFFFF",
  gray: "#6B7280",
  border: "#E5E7EB",
};

export const FONT =
  '"Inter", "Segoe UI", system-ui, -apple-system, Arial, sans-serif';

// Cinematic ease-out (same curve used across the web presentation)
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export type SceneData = {
  id: string;
  title: string;
  subtitle: string;
  seconds: number;
  durationInFrames: number;
};

export const SCENES: SceneData[] = scriptData.scenes.map((s) => ({
  ...s,
  durationInFrames: Math.round(s.seconds * FPS),
}));

export const TOTAL_FRAMES = SCENES.reduce(
  (sum, s) => sum + s.durationInFrames,
  0
);

export const SCENES_V2: SceneData[] = scriptDataV2.scenes.map((s) => ({
  ...s,
  durationInFrames: Math.round(s.seconds * FPS),
}));

export const TOTAL_FRAMES_V2 = SCENES_V2.reduce(
  (sum, s) => sum + s.durationInFrames,
  0
);

// Floating product pills (emoji + price) reused across scenes
export const PRODUCTS = [
  { emoji: "🍓", price: "₸990", label: "Клубника" },
  { emoji: "🐟", price: "₸5 490", label: "Лосось" },
  { emoji: "🥐", price: "₸350", label: "Круассан" },
  { emoji: "🥛", price: "₸690", label: "Молоко" },
  { emoji: "🥑", price: "₸790", label: "Авокадо" },
  { emoji: "🍌", price: "₸590", label: "Бананы" },
];
