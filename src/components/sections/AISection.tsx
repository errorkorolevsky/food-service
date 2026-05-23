"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import FadeIn from "@/components/ui/FadeIn"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import AnalyticsCard from "@/components/cards/AnalyticsCard"
import { useLang } from "@/locales"

const FEATURE_EMOJIS = ["✨", "📈", "⚡"]
const CARD_POSITIONS = [
  { top: "12%", left: "55%", delay: 0   },
  { top: "55%", left: "48%", delay: 1.2 },
  { top: "28%", left: "72%", delay: 2.4 },
]

export default function AISection() {
  const { t } = useLang()

  return (
    <section className="fs-section relative overflow-hidden bg-fs-light">
      <div className="fs-container py-28 relative z-10">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden shadow-green-lg">

            {/* ANIMATED GRADIENT BACKGROUND */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, #00392D 0%, #005B46 40%, #0A7A5C 70%, #0D9E76 100%)",
                backgroundSize: "200% 200%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ORB ACCENTS */}
            <motion.div
              className="absolute top-[-20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-fs-accent/20 blur-[100px] pointer-events-none"
              animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-[-10%] left-[20%] w-[300px] h-[300px] rounded-full bg-white/5 blur-[80px] pointer-events-none"
              animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            />

            {/* FLOATING CARDS */}
            {t.ai.floatingCards.map((card, i) => (
              <motion.div
                key={i}
                className="
                  absolute pointer-events-none
                  bg-white/10 backdrop-blur-sm border border-white/20
                  rounded-2xl px-4 py-3
                  hidden lg:flex flex-col gap-0.5
                "
                style={{ top: CARD_POSITIONS[i].top, left: CARD_POSITIONS[i].left }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4 + CARD_POSITIONS[i].delay, repeat: Infinity, ease: "easeInOut", delay: CARD_POSITIONS[i].delay }}
              >
                <span className="text-label font-semibold text-white/90 whitespace-nowrap">{card.label}</span>
                <span className="text-[10px] text-white/55 whitespace-nowrap">{card.sub}</span>
                <span className="text-caption font-bold text-white mt-1">{card.val}</span>
              </motion.div>
            ))}

            {/* CONTENT GRID */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

              {/* LEFT */}
              <div className="p-10 lg:p-16">
                <Badge variant="ai" dot>
                  {t.ai.badge}
                </Badge>

                <h2 className="text-heading text-white mt-10">
                  {t.ai.title1}
                  <br />
                  {t.ai.title2}
                  <br />
                  {t.ai.title3}
                </h2>

                <p className="text-body-lg text-white/70 mt-8 max-w-lg leading-relaxed">
                  {t.ai.subtitle}
                </p>

                <div className="space-y-6 mt-12">
                  {t.ai.features.map((f, i) => (
                    <motion.div
                      key={f.title}
                      className="flex items-start gap-5"
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
                    >
                      <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
                        {FEATURE_EMOJIS[i]}
                      </div>
                      <div>
                        <h3 className="text-title text-white">{f.title}</h3>
                        <p className="text-body text-white/65 mt-1">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* RIGHT */}
              <div className="border-t lg:border-t-0 lg:border-l border-white/10 p-10 lg:p-16 bg-black/15">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-white/50 uppercase tracking-widest">AI Dashboard</p>
                    <h3 className="text-title text-white mt-2">Food Analytics</h3>
                  </div>
                  <Badge variant="success" dot>Live</Badge>
                </div>

                <div className="space-y-4 mt-10">
                  <AnalyticsCard
                    title={t.ai.analytics.orders.title}
                    subtitle={t.ai.analytics.orders.subtitle}
                    value="+24%"
                    valueColor="text-fs-green"
                  />
                  <AnalyticsCard
                    title={t.ai.analytics.forecast.title}
                    subtitle={t.ai.analytics.forecast.subtitle}
                    value="📈"
                  />
                  <AnalyticsCard
                    title={t.ai.analytics.savings.title}
                    subtitle={t.ai.analytics.savings.subtitle}
                    value="₸120K"
                    valueColor="text-purple-400"
                  />
                </div>

                <div className="mt-10">
                  <Link href="/ai">
                    <Button variant="white" size="lg" className="w-full">
                      {t.ai.openBtn}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
