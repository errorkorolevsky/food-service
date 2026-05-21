"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import FadeIn from "@/components/ui/FadeIn"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import AnalyticsCard from "@/components/cards/AnalyticsCard"

const features = [
  { emoji: "✨", title: "Smart Reorder",  desc: "Автоматическое формирование закупок"     },
  { emoji: "📈", title: "AI Analytics",   desc: "Анализ продаж и прогноз спроса"          },
  { emoji: "⚡", title: "Fast Supply",    desc: "Мгновенные рекомендации поставок"        },
]

export default function AISection() {
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
            {[
              { label: "Заказ #1247",    sub: "Суши × 3 кг",     val: "₸45 200",  top: "12%",  left: "55%", delay: 0    },
              { label: "AI прогноз",     sub: "Лосось ↑ спрос",  val: "+18%",     top: "55%",  left: "48%", delay: 1.2  },
              { label: "Smart Reorder",  sub: "Через 2 дня",     val: "★ auto",   top: "28%",  left: "72%", delay: 2.4  },
            ].map((card) => (
              <motion.div
                key={card.label}
                className="
                  absolute pointer-events-none
                  bg-white/10 backdrop-blur-sm border border-white/20
                  rounded-2xl px-4 py-3
                  hidden lg:flex flex-col gap-0.5
                "
                style={{ top: card.top, left: card.left }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4 + card.delay, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
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
                  AI Supply System
                </Badge>

                <h2 className="text-heading text-white mt-10">
                  AI для
                  <br />
                  ресторанного
                  <br />
                  бизнеса.
                </h2>

                <p className="text-body-lg text-white/70 mt-8 max-w-lg leading-relaxed">
                  Умная система прогнозирования закупок,
                  автоматических рекомендаций и аналитики
                  продаж для HoReCa бизнеса.
                </p>

                <div className="space-y-6 mt-12">
                  {features.map((f) => (
                    <motion.div
                      key={f.title}
                      className="flex items-start gap-5"
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
                    >
                      <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
                        {f.emoji}
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
                    title="Рост заказов"
                    subtitle="За последние 30 дней"
                    value="+24%"
                    valueColor="text-fs-green"
                  />
                  <AnalyticsCard
                    title="AI прогноз"
                    subtitle="Высокий спрос на bakery"
                    value="📈"
                  />
                  <AnalyticsCard
                    title="Экономия закупок"
                    subtitle="Благодаря AI recommendations"
                    value="₸120K"
                    valueColor="text-purple-400"
                  />
                </div>

                <div className="mt-10">
                  <Link href="/ai">
                    <Button variant="white" size="lg" className="w-full">
                      Открыть AI ассистент
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
