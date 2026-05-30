import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
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
import { COLORS, FONT, SCENES, PRODUCTS, SceneData } from "../config/theme";

type SProps = { scene: SceneData; format: Format };
const isWide = (f: Format) => f === "16x9";

/* ─── 1. HOOK ────────────────────────────────────────────────────────────── */
const HookScene: React.FC<SProps> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = isWide(format);
  const brand = spring({ frame: frame - 4, fps, config: { damping: 13 }, durationInFrames: 30 });
  const rise = spring({ frame: frame - 12, fps, config: { damping: 18 }, durationInFrames: 34 });

  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format} noFadeIn>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: wide ? "row" : "column",
            alignItems: "center",
            gap: wide ? 130 : 70,
          }}
        >
          <div style={{ transform: `scale(${0.85 + brand * 0.15})`, opacity: brand }}>
            <BrandMark size={wide ? 92 : 86} white stacked={!wide} />
          </div>
          <div style={{ transform: `translateY(${(1 - rise) * 240}px)`, opacity: rise }}>
            <PhoneMockup src="screenshots/m-catalog.png" height={wide ? 760 : 800} />
          </div>
        </div>
      </AbsoluteFill>
      <ProductPill emoji="🍓" price="₸990" dark style={{ left: wide ? "8%" : "6%", top: "18%" }} />
      <ProductPill emoji="🥐" price="₸350" dark style={{ right: wide ? "10%" : "6%", top: "26%" }} />
      {wide && <ProductPill emoji="🥛" price="₸690" dark style={{ left: "12%", bottom: "22%" }} />}
    </SceneWrap>
  );
};

/* ─── 2. PROBLEM (scrolling catalog) ─────────────────────────────────────── */
const ProblemScene: React.FC<SProps> = ({ scene, format }) => {
  const wide = isWide(format);
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <PhoneMockup
          src="screenshots/m-catalog-full.png"
          height={wide ? 820 : 880}
          panY={[0, -(wide ? 820 : 880) * 1.25]}
        />
      </AbsoluteFill>
      <ProductPill emoji="🍌" price="₸590" style={{ left: wide ? "16%" : "8%", top: "30%" }} />
      <ProductPill emoji="🐟" price="₸5 490" style={{ right: wide ? "16%" : "8%", bottom: "34%" }} />
    </SceneWrap>
  );
};

/* ─── 3. CATALOG ─────────────────────────────────────────────────────────── */
const CatalogScene: React.FC<SProps> = ({ scene, format }) => {
  const wide = isWide(format);
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {wide ? (
          <div style={{ position: "relative", width: 1300, height: 720 }}>
            <KenBurns
              src="screenshots/d-catalog.png"
              from={1.04}
              to={1.14}
              panY={[10, -20]}
              radius={28}
              style={{
                width: 1300,
                height: 720,
                boxShadow: "0 40px 120px rgba(0,91,70,0.18)",
                border: "1px solid rgba(0,91,70,0.08)",
              }}
            />
            <div style={{ position: "absolute", right: -40, bottom: -50 }}>
              <PhoneMockup src="screenshots/m-catalog.png" height={640} />
            </div>
          </div>
        ) : (
          <PhoneMockup src="screenshots/m-catalog.png" height={880} zoom={[1, 1.04]} />
        )}
      </AbsoluteFill>
      <Callout x={wide ? 30 : 30} y={wide ? 30 : 30} label="Категории" delay={14} format={format} />
      <Callout x={wide ? 28 : 70} y={wide ? 52 : 26} label="Поиск" delay={26} format={format} />
      <Callout x={wide ? 64 : 50} y={wide ? 70 : 64} label="Карточки товаров" delay={40} format={format} />
    </SceneWrap>
  );
};

/* ─── 4. CART (animated add + sum) ───────────────────────────────────────── */
const CartScene: React.FC<SProps> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = isWide(format);

  // product flies into the cart card
  const fly = spring({ frame: frame - 18, fps, config: { damping: 16 }, durationInFrames: 30 });
  const flyX = interpolate(fly, [0, 1], [0, wide ? 360 : 0]);
  const flyY = interpolate(fly, [0, 1], [0, wide ? -120 : -260]);
  const flyScale = interpolate(fly, [0, 1], [1, 0.4]);
  const flyOpacity = interpolate(fly, [0, 0.7, 1], [1, 1, 0]);

  // sum counts up
  const sum = Math.round(interpolate(frame, [40, 95], [0, 7170], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cardIn = spring({ frame: frame - 30, fps, config: { damping: 16 }, durationInFrames: 24 });

  return (
    <SceneWrap variant="dark" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill
        style={{
          flexDirection: wide ? "row" : "column",
          justifyContent: "center",
          alignItems: "center",
          gap: wide ? 90 : 40,
        }}
      >
        <PhoneMockup src="screenshots/m-catalog.png" height={wide ? 720 : 720} />

        {/* cart summary card */}
        <div
          style={{
            position: "relative",
            width: wide ? 460 : 620,
            borderRadius: 28,
            padding: 34,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            opacity: cardIn,
            transform: `translateY(${(1 - cardIn) * 40}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: COLORS.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <CartIcon size={30} />
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  minWidth: 26,
                  height: 26,
                  borderRadius: 13,
                  background: COLORS.emerald,
                  color: COLORS.graphite,
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${cardIn})`,
                }}
              >
                3
              </div>
            </div>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#fff" }}>Корзина</span>
          </div>

          {["🍓 Клубника", "🐟 Лосось филе", "🥐 Круассан"].map((t, i) => (
            <div
              key={t}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: FONT,
                fontSize: 24,
                color: "rgba(255,255,255,0.85)",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                opacity: spring({ frame: frame - 34 - i * 6, fps, durationInFrames: 16, config: { damping: 18 } }),
              }}
            >
              <span>{t}</span>
              <span style={{ fontWeight: 700 }}>×{i === 0 ? 2 : 1}</span>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
            <span style={{ fontFamily: FONT, fontSize: 24, color: "rgba(255,255,255,0.6)" }}>Итого</span>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff" }}>
              ₸{sum.toLocaleString("ru-RU")}
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* flying product */}
      <div
        style={{
          position: "absolute",
          left: "42%",
          top: "44%",
          transform: `translate(${flyX}px, ${flyY}px) scale(${flyScale})`,
          opacity: flyOpacity,
        }}
      >
        <ProductPill emoji="🍓" price="₸990" dark style={{ position: "relative", left: 0, top: 0 }} />
      </div>
    </SceneWrap>
  );
};

/* ─── 5. CHECKOUT (5 steps) ──────────────────────────────────────────────── */
const STEPS = ["Контакты", "Адрес", "Время доставки", "Оплата", "Готово"];
const CheckoutScene: React.FC<SProps> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = isWide(format);
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: wide ? "row" : "column",
            alignItems: "center",
            gap: wide ? 28 : 22,
          }}
        >
          {STEPS.map((label, i) => {
            const s = spring({ frame: frame - 10 - i * 14, fps, config: { damping: 15 }, durationInFrames: 22 });
            const done = i === STEPS.length - 1;
            return (
              <React.Fragment key={label}>
                <div
                  style={{
                    width: wide ? 230 : 540,
                    borderRadius: 22,
                    padding: wide ? "30px 26px" : "26px 30px",
                    background: "#fff",
                    border: `1px solid ${done ? COLORS.accent : COLORS.border}`,
                    boxShadow: "0 14px 44px rgba(0,91,70,0.10)",
                    opacity: s,
                    transform: `translateY(${(1 - s) * 30}px) scale(${0.92 + s * 0.08})`,
                    display: "flex",
                    flexDirection: wide ? "column" : "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 16,
                      background: done ? COLORS.primary : COLORS.mint,
                      color: done ? "#fff" : COLORS.primary,
                      fontFamily: FONT,
                      fontWeight: 900,
                      fontSize: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: wide ? 24 : 30,
                      color: COLORS.graphite,
                      textAlign: wide ? "center" : "left",
                    }}
                  >
                    {label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

/* ─── 6. TRUST ───────────────────────────────────────────────────────────── */
const CHIPS = ["Mobile First", "PWA Ready", "Fast Checkout"];
const TrustScene: React.FC<SProps> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = isWide(format);
  return (
    <SceneWrap variant="light" title={scene.title} subtitle={scene.subtitle} format={format}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <KenBurns
          src={wide ? "screenshots/d-catalog.png" : "screenshots/m-catalog.png"}
          from={1.05}
          to={1.16}
          panY={[0, -24]}
          radius={28}
          style={{
            width: wide ? 1180 : 720,
            height: wide ? 660 : 880,
            boxShadow: "0 40px 120px rgba(0,91,70,0.18)",
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: wide ? "16%" : "12%",
          display: "flex",
          justifyContent: "center",
          gap: 18,
          flexWrap: "wrap",
          padding: "0 60px",
        }}
      >
        {CHIPS.map((c, i) => {
          const s = spring({ frame: frame - 14 - i * 8, fps, config: { damping: 14 }, durationInFrames: 20 });
          return (
            <div
              key={c}
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: wide ? 26 : 30,
                color: COLORS.primary,
                background: "rgba(255,255,255,0.92)",
                border: `1.5px solid ${COLORS.accent}`,
                borderRadius: 999,
                padding: "12px 26px",
                opacity: s,
                transform: `translateY(${(1 - s) * 20}px)`,
                boxShadow: "0 10px 30px rgba(0,91,70,0.12)",
              }}
            >
              ✓ {c}
            </div>
          );
        })}
      </div>
    </SceneWrap>
  );
};

/* ─── 7. FINAL ───────────────────────────────────────────────────────────── */
const FinalScene: React.FC<SProps> = ({ scene, format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wide = isWide(format);
  const brand = spring({ frame: frame - 6, fps, config: { damping: 14 }, durationInFrames: 30 });
  const rayOpacity = interpolate(frame % 120, [0, 60, 120], [0.5, 0.9, 0.5]);

  return (
    <SceneWrap variant="dark" title="" subtitle={scene.subtitle} format={format} fadeOut>
      {/* light rays */}
      <AbsoluteFill
        style={{
          background:
            "conic-gradient(from 180deg at 50% -10%, transparent 0deg, rgba(13,158,118,0.16) 25deg, transparent 55deg, rgba(52,211,153,0.12) 80deg, transparent 120deg)",
          opacity: rayOpacity,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${0.86 + brand * 0.14})`, opacity: brand, textAlign: "center" }}>
          <BrandMark size={wide ? 120 : 100} white stacked />
        </div>
      </AbsoluteFill>
      {PRODUCTS.slice(0, wide ? 5 : 3).map((p, i) => {
        const pos = [
          { left: "12%", top: "20%" },
          { right: "14%", top: "26%" },
          { left: "16%", bottom: "24%" },
          { right: "12%", bottom: "28%" },
          { left: "6%", top: "48%" },
        ][i];
        return <ProductPill key={p.label} emoji={p.emoji} price={p.price} dark style={pos} />;
      })}
    </SceneWrap>
  );
};

/* ─── SCENE REGISTRY + TIMELINE ──────────────────────────────────────────── */
const SCENE_MAP: Record<string, React.FC<SProps>> = {
  hook: HookScene,
  problem: ProblemScene,
  catalog: CatalogScene,
  cart: CartScene,
  checkout: CheckoutScene,
  trust: TrustScene,
  final: FinalScene,
};

// Scenes overlap by this many frames so the incoming scene crossfades over the
// previous one (no dip to black between scenes).
const OVERLAP = 12;

export const Timeline: React.FC<{ format: Format }> = ({ format }) => {
  let from = 0;
  const last = SCENES.length - 1;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.graphite }}>
      {SCENES.map((scene, i) => {
        const Comp = SCENE_MAP[scene.id];
        // Non-last scenes linger OVERLAP frames into the next so they stay
        // visible underneath its fade-in.
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
