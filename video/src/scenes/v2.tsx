import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {
  SceneWrap,
  BrandMark,
  PhoneMockup,
  KenBurns,
  Callout,
  ProductPill,
  CartIcon,
  Format,
} from "../components";
import { COLORS, FONT, SCENES_V2, SceneData } from "../config/theme";

type SP = { scene: SceneData; format: Format };
const wideOf = (f: Format) => f === "16x9";

/* ════════════════ MICRO-INTERACTION HELPERS ════════════════ */

// expanding tap ring
const TapPulse: React.FC<{ x: number; y: number; at: number; color?: string }> = ({
  x, y, at, color = COLORS.accent,
}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 22) return null;
  const r = interpolate(f, [0, 22], [6, 90]);
  const o = interpolate(f, [0, 22], [0.55, 0]);
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, borderRadius: "50%", border: `4px solid ${color}`, opacity: o }} />
  );
};

// animated + button (press dip + ring)
const PlusButton: React.FC<{ size?: number; pressAt: number }> = ({ size = 92, pressAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const press = spring({ frame: frame - pressAt, fps, durationInFrames: 18, config: { damping: 9 } });
  const dip = Math.sin(Math.min(Math.PI, Math.max(0, press) * Math.PI));
  const scale = 1 - 0.16 * dip;
  const ringF = frame - pressAt;
  const ringR = ringF >= 0 && ringF < 24 ? interpolate(ringF, [0, 24], [size / 2, size]) : 0;
  const ringO = ringF >= 0 && ringF < 24 ? interpolate(ringF, [0, 24], [0.5, 0]) : 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {ringR > 0 && (
        <div style={{ position: "absolute", left: size / 2 - ringR, top: size / 2 - ringR, width: ringR * 2, height: ringR * 2, borderRadius: "50%", border: `4px solid ${COLORS.accent}`, opacity: ringO }} />
      )}
      <div style={{ width: size, height: size, borderRadius: size * 0.28, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${scale})`, boxShadow: "0 10px 30px rgba(0,91,70,0.45)" }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" stroke="#fff" strokeWidth={3} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
    </div>
  );
};

// animated check
const Checkmark: React.FC<{ size?: number; at?: number }> = ({ size = 140, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - at, fps, durationInFrames: 16, config: { damping: 11 } });
  const draw = interpolate(frame - at, [8, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const L = 70;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill={COLORS.primary} style={{ transform: `scale(${c})`, transformOrigin: "50px 50px" }} />
      <path d="M28 52 L44 68 L73 34" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
    </svg>
  );
};

// counting sum
const SumCounter: React.FC<{ to: number; from?: number; to2?: number; startFrame: number; endFrame: number; size: number; color: string }> = ({
  to, startFrame, endFrame, size, color,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [startFrame, endFrame], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color }}>₸{v.toLocaleString("ru-RU")}</span>;
};

// scrolling category chips with moving highlight
const CAT = ["🔥 Скидки", "🍗 Мясо", "🥛 Молочное", "🥦 Овощи", "🍞 Выпечка", "🧃 Напитки", "☕ Кофе", "🍫 Сладкое"];
const CategoryStrip: React.FC<{ width: number; big?: boolean }> = ({ width, big }) => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [0, 90], [0, -260], { extrapolateRight: "clamp" });
  const active = Math.floor(frame / 16) % CAT.length;
  const fs = big ? 34 : 26;
  return (
    <div style={{ width, overflow: "hidden", maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
      <div style={{ display: "flex", gap: 16, transform: `translateX(${scroll}px)`, paddingLeft: 30 }}>
        {CAT.map((c, i) => (
          <span key={c} style={{ flexShrink: 0, fontFamily: FONT, fontWeight: 700, fontSize: fs, padding: big ? "16px 30px" : "12px 24px", borderRadius: 999, whiteSpace: "nowrap", background: i === active ? COLORS.primary : "#fff", color: i === active ? "#fff" : COLORS.gray, border: `1.5px solid ${i === active ? COLORS.primary : COLORS.border}`, boxShadow: "0 6px 18px rgba(0,91,70,0.08)", transition: "none" }}>{c}</span>
        ))}
      </div>
    </div>
  );
};

// mini product card
const MiniCard: React.FC<{ emoji: string; title: string; price: string; img?: string; w: number }> = ({ emoji, title, price, img, w }) => (
  <div style={{ width: w, borderRadius: 20, background: "#fff", border: `1px solid ${COLORS.border}`, boxShadow: "0 14px 40px rgba(0,91,70,0.12)", overflow: "hidden" }}>
    <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "radial-gradient(ellipse 85% 65% at 50% 70%, rgba(0,91,70,0.08), #F0F4F2)" }}>
      {img ? <Img src={staticFile(img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: w * 0.08 }} /> : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: w * 0.34 }}>{emoji}</span>}
    </div>
    <div style={{ padding: w * 0.08 }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: w * 0.085, color: COLORS.graphite, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: w * 0.05 }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: w * 0.1, color: COLORS.graphite }}>{price}</span>
        <span style={{ width: w * 0.16, height: w * 0.16, borderRadius: w * 0.05, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={w * 0.09} height={w * 0.09} viewBox="0 0 24 24" stroke="#fff" strokeWidth={3} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </span>
      </div>
    </div>
  </div>
);

const breathe = (frame: number, amt = 0.04, speed = 90) => 1 + amt * Math.sin((frame / speed) * Math.PI * 2);

/* ════════════════ SCENES ════════════════ */

// 1. HOOK
const S_Hook: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const logo = spring({ frame: frame - 2, fps, config: { damping: 12 }, durationInFrames: 24 });
  const ph = spring({ frame: frame - 8, fps, config: { damping: 16 }, durationInFrames: 28 });
  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format} noFadeIn>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", alignItems: "center", gap: wide ? 110 : 50 }}>
          <div style={{ transform: `scale(${0.8 + logo * 0.2})`, opacity: logo }}><BrandMark size={wide ? 96 : 92} white stacked={!wide} /></div>
          <div style={{ transform: `translateY(${(1 - ph) * 220}px) scale(${breathe(frame, 0.03)})`, opacity: ph }}>
            <PhoneMockup src="screenshots/m-catalog.png" height={wide ? 720 : 820} />
          </div>
        </div>
      </AbsoluteFill>
      <ProductPill emoji="🍓" price="₸990" dark style={{ left: wide ? "9%" : "5%", top: "16%" }} />
      <ProductPill emoji="🥐" price="₸350" dark style={{ right: wide ? "11%" : "6%", top: "22%" }} />
      <ProductPill emoji="🥛" price="₸690" dark style={{ left: wide ? "13%" : "8%", bottom: "26%" }} />
    </SceneWrap>
  );
};

// 2. PROBLEM — fast scrolling catalog + flashing callouts
const S_Problem: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const wide = wideOf(format);
  const h = wide ? 860 : 980;
  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${breathe(frame, 0.03, 70)})` }}>
          <PhoneMockup src="screenshots/m-catalog-full.png" height={h} panY={[0, -h * 1.6]} />
        </div>
      </AbsoluteFill>
      <Callout x={wide ? 26 : 24} y={28} label="Поиск" delay={6} format={format} />
      <Callout x={wide ? 74 : 76} y={48} label="Каталог" delay={20} format={format} />
      <Callout x={wide ? 30 : 26} y={70} label="Корзина" delay={34} format={format} />
    </SceneWrap>
  );
};

// 3. CATEGORIES — sliding chips close-up
const S_Categories: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const wide = wideOf(format);
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
        <div style={{ transform: `scale(${breathe(frame, 0.02)})` }}>
          <PhoneMockup src="screenshots/m-catalog.png" height={wide ? 560 : 760} zoom={[1.02, 1.08]} />
        </div>
        <div style={{ position: "absolute", top: wide ? "30%" : "26%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <CategoryStrip width={wide ? 1300 : 980} big={!wide} />
        </div>
      </AbsoluteFill>
      <Callout x={50} y={wide ? 22 : 18} label="Свайп категорий" delay={8} format={format} />
    </SceneWrap>
  );
};

// 4. GRID — product cards stagger in
const GRID = [
  { emoji: "🍓", title: "Клубника", price: "₸990", img: "screenshots/m-product.png" },
  { emoji: "🥐", title: "Круассан", price: "₸350" },
  { emoji: "🥛", title: "Молоко", price: "₸690" },
  { emoji: "🧀", title: "Сыр", price: "₸1 290" },
  { emoji: "🍌", title: "Бананы", price: "₸590" },
  { emoji: "🥑", title: "Авокадо", price: "₸790" },
];
const S_Grid: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const cols = wide ? 3 : 2;
  const cardW = wide ? 300 : 360;
  const items = wide ? GRID : GRID.slice(0, 4);
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cardW}px)`, gap: wide ? 28 : 34, marginTop: wide ? 0 : -120 }}>
          {items.map((it, i) => {
            const s = spring({ frame: frame - 4 - i * 5, fps, config: { damping: 14 }, durationInFrames: 20 });
            return (
              <div key={it.title} style={{ opacity: s, transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + s * 0.1})` }}>
                <MiniCard {...it} w={cardW} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

// 5. SEARCH — search bar typing
const S_Search: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const wide = wideOf(format);
  const full = "Клубника";
  const chars = Math.floor(interpolate(frame, [6, 40], [0, full.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const typed = full.slice(0, chars);
  const cursor = Math.floor(frame / 8) % 2 === 0;
  const barW = wide ? 1100 : 920;
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: barW, display: "flex", alignItems: "center", gap: 24, background: "#fff", border: `2px solid ${COLORS.primary}`, borderRadius: 999, padding: wide ? "26px 40px" : "34px 46px", boxShadow: "0 20px 60px rgba(0,91,70,0.16)", transform: `scale(${breathe(frame, 0.015)})` }}>
          <svg width={wide ? 44 : 56} height={wide ? 44 : 56} viewBox="0 0 24 24" stroke={COLORS.primary} strokeWidth={2.4} fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: wide ? 46 : 58, color: COLORS.graphite }}>
            {typed}<span style={{ opacity: cursor ? 1 : 0, color: COLORS.primary }}>|</span>
          </span>
        </div>
      </AbsoluteFill>
      <Callout x={wide ? 70 : 76} y={wide ? 38 : 40} label="Поиск" delay={10} format={format} />
    </SceneWrap>
  );
};

// 6. PRODUCT — big card + plus press
const S_Product: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const inn = spring({ frame: frame - 4, fps, config: { damping: 15 }, durationInFrames: 22 });
  const cardW = wide ? 520 : 760;
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: inn, transform: `translateY(${(1 - inn) * 40}px) scale(${breathe(frame, 0.015)})`, width: cardW, borderRadius: 32, background: "#fff", border: `1px solid ${COLORS.border}`, boxShadow: "0 30px 80px rgba(0,91,70,0.18)", overflow: "hidden" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1.2/1", background: "radial-gradient(ellipse 85% 65% at 50% 60%, rgba(0,91,70,0.10), #F0F4F2)" }}>
            <Img src={staticFile("screenshots/m-product.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%" }} />
          </div>
          <div style={{ padding: cardW * 0.07, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: cardW * 0.07, color: COLORS.graphite }}>Клубника</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: cardW * 0.09, color: COLORS.graphite }}>₸990</span>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: cardW * 0.05, color: "#F59E0B" }}>★ 4.9</span>
              </div>
            </div>
            <PlusButton size={cardW * 0.18} pressAt={Math.round(scene.durationInFrames * 0.6)} />
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

// 7. ADD TO CART — fly to cart
const S_AddCart: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const fly = spring({ frame: frame - 6, fps, config: { damping: 15 }, durationInFrames: 28 });
  const fx = interpolate(fly, [0, 1], [0, wide ? 420 : 0]);
  const fy = interpolate(fly, [0, 1], [0, wide ? -260 : -360]);
  const fs = interpolate(fly, [0, 1], [1, 0.35]);
  const fo = interpolate(fly, [0, 0.75, 1], [1, 1, 0]);
  const badge = spring({ frame: frame - 26, fps, durationInFrames: 14, config: { damping: 8 } });
  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* cart target */}
        <div style={{ position: "relative", transform: `translate(${wide ? 220 : 0}px, ${wide ? -130 : -180}px) scale(${breathe(frame, 0.04, 50)})` }}>
          <div style={{ width: 150, height: 150, borderRadius: 40, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,91,70,0.5)" }}>
            <CartIcon size={74} />
          </div>
          <div style={{ position: "absolute", top: -16, right: -16, minWidth: 56, height: 56, borderRadius: 28, background: COLORS.emerald, color: COLORS.graphite, fontFamily: FONT, fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${badge})` }}>1</div>
        </div>
      </AbsoluteFill>
      {/* flying product */}
      <div style={{ position: "absolute", left: "42%", top: "56%", transform: `translate(${fx}px,${fy}px) scale(${fs})`, opacity: fo }}>
        <ProductPill emoji="🍓" price="₸990" dark style={{ position: "relative", left: 0, top: 0 }} />
      </div>
    </SceneWrap>
  );
};

// 8. CART SHEET — bottom sheet rises
const S_CartSheet: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const sheet = spring({ frame: frame - 4, fps, config: { damping: 18 }, durationInFrames: 26 });
  const items = [
    { e: "🍓", t: "Клубника", q: "×2" },
    { e: "🐟", t: "Лосось филе", q: "×1" },
    { e: "🥐", t: "Круассан", q: "×1" },
  ];
  const sheetW = wide ? 720 : 920;
  return (
    <SceneWrap variant="dark" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: sheetW, borderRadius: 36, background: "#fff", padding: 44, boxShadow: "0 -10px 60px rgba(0,0,0,0.4)", transform: `translateY(${(1 - sheet) * 400}px)` }}>
          <div style={{ width: 70, height: 7, borderRadius: 4, background: COLORS.border, margin: "0 auto 28px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><CartIcon size={34} /></div>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: COLORS.graphite }}>Корзина</span>
          </div>
          {items.map((it, i) => {
            const s = spring({ frame: frame - 16 - i * 6, fps, durationInFrames: 14, config: { damping: 16 } });
            return (
              <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 0", borderBottom: `1px solid ${COLORS.border}`, opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
                <span style={{ fontSize: 40 }}>{it.e}</span>
                <span style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 32, color: COLORS.graphite }}>{it.t}</span>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: COLORS.gray }}>{it.q}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

// 9. CART SUM — sum counts + checkout button glow
const S_CartSum: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const wide = wideOf(format);
  const glow = 0.4 + 0.3 * Math.sin((frame / 18) * Math.PI * 2);
  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: wide ? 760 : 900 }}>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: wide ? 44 : 54, color: "rgba(255,255,255,0.6)" }}>Итого</span>
          <SumCounter to={7170} startFrame={4} endFrame={50} size={wide ? 96 : 120} color="#fff" />
        </div>
        <div style={{ width: wide ? 760 : 900, borderRadius: 26, background: COLORS.primary, padding: wide ? "30px 0" : "40px 0", textAlign: "center", boxShadow: `0 0 ${40 + glow * 60}px rgba(13,158,118,${glow})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: wide ? 40 : 50, color: "#fff" }}>Оформить заказ →</span>
        </div>
      </AbsoluteFill>
      <TapPulse x={50} y={wide ? 66 : 60} at={Math.round(scene.durationInFrames * 0.7)} color="#fff" />
    </SceneWrap>
  );
};

// 10. CHECKOUT — 5 fast steps + progress line
const STEPS = ["Контакты", "Адрес", "Время", "Оплата", "Готово"];
const S_Checkout: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const prog = interpolate(frame, [10, scene.durationInFrames - 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 26 : 18, alignItems: "center" }}>
          {/* progress line */}
          <div style={{ position: "absolute", background: COLORS.border, ...(wide ? { left: 60, right: 60, top: 46, height: 4 } : { top: 50, bottom: 50, left: 46, width: 4 }) }} />
          <div style={{ position: "absolute", background: COLORS.accent, transformOrigin: wide ? "left center" : "top center", ...(wide ? { left: 60, right: 60, top: 46, height: 4, transform: `scaleX(${prog})` } : { top: 50, bottom: 50, left: 46, width: 4, transform: `scaleY(${prog})` }) }} />
          {STEPS.map((label, i) => {
            const s = spring({ frame: frame - 6 - i * 9, fps, config: { damping: 14 }, durationInFrames: 18 });
            const done = i === STEPS.length - 1;
            return (
              <div key={label} style={{ position: "relative", zIndex: 1, width: wide ? 230 : 560, background: "#fff", border: `1px solid ${done ? COLORS.accent : COLORS.border}`, borderRadius: 22, padding: wide ? "26px 20px" : "24px 30px", boxShadow: "0 14px 44px rgba(0,91,70,0.10)", opacity: s, transform: `scale(${0.9 + s * 0.1})`, display: "flex", flexDirection: wide ? "column" : "row", alignItems: "center", gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: done ? COLORS.primary : COLORS.mint, color: done ? "#fff" : COLORS.primary, fontFamily: FONT, fontWeight: 900, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{done ? "✓" : i + 1}</div>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: wide ? 28 : 36, color: COLORS.graphite }}>{label}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

// 11. CONFIRM — big check
const S_Confirm: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const t = spring({ frame: frame - 18, fps, config: { damping: 14 }, durationInFrames: 18 });
  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 40 }}>
        <Checkmark size={wide ? 220 : 280} at={2} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: wide ? 60 : 76, color: "#fff", opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>Заказ принят</div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

// 12. MOBILE FIRST
const SizeBadge: React.FC<{ label: string; s: number; style: React.CSSProperties; big?: boolean }> = ({ label, s, style, big }) => (
  <div style={{ position: "absolute", opacity: s, transform: `scale(${s})`, fontFamily: FONT, fontWeight: 800, fontSize: big ? 40 : 30, color: COLORS.primary, background: "rgba(255,255,255,0.92)", border: `2px solid ${COLORS.accent}`, borderRadius: 999, padding: big ? "14px 30px" : "8px 24px", boxShadow: "0 10px 30px rgba(0,91,70,0.15)", ...style }}>{label}</div>
);
const S_Mobile: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const sp = (d: number) => spring({ frame: frame - d, fps, config: { damping: 14 }, durationInFrames: 22 });

  if (wide) {
    // three phones side by side
    const sizes = [
      { w: "360px", h: 520 },
      { w: "390px", h: 600 },
      { w: "430px", h: 520 },
    ];
    return (
      <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 70, alignItems: "center" }}>
            {sizes.map((sz, i) => {
              const s = sp(4 + i * 7);
              return (
                <div key={sz.w} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: s, transform: `translateY(${(1 - s) * 50}px) scale(${0.9 + s * 0.1})` }}>
                  <PhoneMockup src={i === 1 ? "screenshots/m-product.png" : "screenshots/m-catalog.png"} height={sz.h} glow={i === 1} />
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: COLORS.primary, background: "rgba(13,158,118,0.1)", border: `1.5px solid rgba(13,158,118,0.25)`, borderRadius: 999, padding: "8px 24px" }}>{sz.w}</span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </SceneWrap>
    );
  }

  // 9:16 — one big phone with a continuous width "morph" + floating size badges
  const morph = 0.94 + 0.06 * Math.sin((frame / 36) * Math.PI * 2);
  const phoneIn = sp(2);
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: phoneIn, transform: `scaleX(${morph}) scale(${0.92 + phoneIn * 0.08})` }}>
          <PhoneMockup src="screenshots/m-catalog.png" height={1040} glow />
        </div>
      </AbsoluteFill>
      <SizeBadge label="360px" s={sp(10)} big style={{ left: "8%", top: "26%" }} />
      <SizeBadge label="390px" s={sp(18)} big style={{ right: "8%", top: "40%" }} />
      <SizeBadge label="430px" s={sp(26)} big style={{ left: "10%", bottom: "30%" }} />
    </SceneWrap>
  );
};

// 13. TRUST — phone + product pills flying around
const S_Trust: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const pills = [
    { e: "🥛", p: "₸690", pos: { left: "10%", top: "18%" } },
    { e: "🧃", p: "₸490", pos: { right: "12%", top: "22%" } },
    { e: "🍫", p: "₸850", pos: { left: "12%", bottom: "30%" } },
    { e: "🌾", p: "₸390", pos: { right: "10%", bottom: "26%" } },
    { e: "🍿", p: "₸450", pos: { left: "16%", top: "48%" } },
    { e: "☕", p: "₸2 990", pos: { right: "16%", top: "50%" } },
  ];
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${breathe(frame, 0.025)})` }}>
          <PhoneMockup src="screenshots/m-catalog.png" height={wide ? 680 : 820} />
        </div>
      </AbsoluteFill>
      {pills.map((pl, i) => {
        const s = spring({ frame: frame - 4 - i * 4, fps, config: { damping: 13 }, durationInFrames: 20 });
        return (
          <div key={i} style={{ opacity: s, transform: `scale(${s})` }}>
            <ProductPill emoji={pl.e} price={pl.p} style={pl.pos} />
          </div>
        );
      })}
    </SceneWrap>
  );
};

// 14. BUSINESS — value chips grid
const VALUES = ["Каталог", "Корзина", "Checkout", "Mobile UX", "PWA Ready", "Fast Checkout"];
const S_Business: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  return (
    <SceneWrap variant="dark" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "repeat(3,1fr)" : "repeat(2,1fr)", gap: wide ? 26 : 30, width: wide ? 1200 : 940 }}>
          {VALUES.map((v, i) => {
            const s = spring({ frame: frame - 4 - i * 6, fps, config: { damping: 14 }, durationInFrames: 20 });
            return (
              <div key={v} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: wide ? "34px 30px" : "44px 34px", display: "flex", alignItems: "center", gap: 20, opacity: s, transform: `translateY(${(1 - s) * 34}px) scale(${0.92 + s * 0.08})` }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(13,158,118,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" stroke={COLORS.emerald} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: wide ? 34 : 40, color: "#fff" }}>{v}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

// 15. FINAL
const S_Final: React.FC<SP> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = wideOf(format);
  const logo = spring({ frame: frame - 4, fps, config: { damping: 13 }, durationInFrames: 28 });
  const rays = 0.5 + 0.4 * Math.sin((frame / 40) * Math.PI * 2);
  const pills = [
    { e: "🍓", p: "₸990", pos: { left: "12%", top: "20%" } },
    { e: "🐟", p: "₸5 490", pos: { right: "13%", top: "24%" } },
    { e: "🥐", p: "₸350", pos: { left: "15%", bottom: "24%" } },
    { e: "🥛", p: "₸690", pos: { right: "12%", bottom: "26%" } },
  ];
  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format} fadeOut>
      <AbsoluteFill style={{ background: "conic-gradient(from 180deg at 50% -10%, transparent 0deg, rgba(13,158,118,0.18) 25deg, transparent 55deg, rgba(52,211,153,0.13) 80deg, transparent 120deg)", opacity: rays }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${0.85 + logo * 0.15})`, opacity: logo }}><BrandMark size={wide ? 120 : 116} white stacked /></div>
      </AbsoluteFill>
      {(wide ? pills : pills.slice(0, 3)).map((pl, i) => (
        <ProductPill key={i} emoji={pl.e} price={pl.p} dark style={pl.pos} />
      ))}
    </SceneWrap>
  );
};

/* ════════════════ TIMELINE V2 ════════════════ */
const MAP: Record<string, React.FC<SP>> = {
  hook: S_Hook, problem: S_Problem, categories: S_Categories, grid: S_Grid,
  search: S_Search, product: S_Product, addcart: S_AddCart, cartsheet: S_CartSheet,
  cartsum: S_CartSum, checkout: S_Checkout, confirm: S_Confirm, mobile: S_Mobile,
  trust: S_Trust, business: S_Business, final: S_Final,
};
const OVERLAP = 9;

export const TimelineV2: React.FC<{ format: Format }> = ({ format }) => {
  let from = 0;
  const last = SCENES_V2.length - 1;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.graphite }}>
      {SCENES_V2.map((scene, i) => {
        const Comp = MAP[scene.id];
        const dur = scene.durationInFrames + (i === last ? 0 : OVERLAP);
        const seq = (
          <Sequence key={scene.id} from={from} durationInFrames={dur} name={scene.id}>
            <Comp scene={scene} format={format} />
          </Sequence>
        );
        from += scene.durationInFrames;
        return seq;
      })}
    </AbsoluteFill>
  );
};
