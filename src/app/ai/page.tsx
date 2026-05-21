"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, RotateCcw, History, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import FadeIn from "@/components/ui/FadeIn"
import PageHero from "@/components/ui/PageHero"

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Message = {
  role:    "user" | "assistant"
  content: string
}

type OrderItem = {
  id:       string
  title:    string
  emoji:    string
  price:    number
  quantity: number
}

type OrderContext = {
  id:         string
  created_at: string
  items:      OrderItem[]
  total:      number
  status:     string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "fs_ai_history"
const MAX_STORED  = 40

const WELCOME_MSG: Message = {
  role:    "assistant",
  content: "Привет! Я AI-ассистент Food Service 👋\n\nПомогу подобрать продукты, спланировать закупки и оптимизировать расходы для вашего заведения. Расскажите, что вам нужно?",
}

const QUICK_PROMPTS = [
  "Что нужно для открытия суши-бара на 40 мест?",
  "Составь закупку для кофейни на неделю",
  "Какие продукты нужны для пиццерии?",
  "Помоги оптимизировать расходы на seafood",
]

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}
    >
      {!isUser && (
        <div className="
          w-8 h-8 rounded-xl flex-shrink-0 mt-1
          bg-purple-500/20 border border-purple-500/30
          flex items-center justify-center
        ">
          <Sparkles size={14} className="text-purple-300" />
        </div>
      )}

      <div className={`
        max-w-[80%] rounded-2xl px-5 py-4 text-body leading-relaxed
        ${isUser
          ? "bg-fs-primary text-white rounded-tr-sm"
          : "bg-white border border-fs-border text-fs-graphite rounded-tl-sm"
        }
      `}>
        {msg.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
        ))}
      </div>
    </motion.div>
  )
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-3">
      <div className="
        w-8 h-8 rounded-xl flex-shrink-0
        bg-purple-500/20 border border-purple-500/30
        flex items-center justify-center
      ">
        <Sparkles size={14} className="text-purple-300" />
      </div>
      <div className="bg-white border border-fs-border rounded-2xl rounded-tl-sm px-5 py-4">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-fs-muted"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── HISTORY BANNER ───────────────────────────────────────────────────────────

function HistoryBanner({ count, onLoad, onDismiss }: {
  count:     number
  onLoad:    () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="
        mx-6 mt-4 px-4 py-3 rounded-xl
        bg-purple-500/10 border border-purple-500/20
        flex items-center justify-between gap-3
      "
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <History size={14} className="text-purple-500 flex-shrink-0" />
        <p className="text-caption text-purple-700 truncate">
          Найдена история: {count} сообщений
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onLoad}
          className="text-label text-purple-600 hover:text-purple-800 transition-colors font-medium"
        >
          Загрузить
        </button>
        <span className="text-fs-border text-label">·</span>
        <button
          onClick={onDismiss}
          className="text-label text-fs-gray hover:text-fs-graphite transition-colors"
        >
          Нет
        </button>
      </div>
    </motion.div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function AIPageInner() {
  const { data: session } = useSession()
  const searchParams      = useSearchParams()
  const autoQuery         = searchParams.get("q")

  const [messages,      setMessages]      = useState<Message[]>([WELCOME_MSG])
  const [input,         setInput]         = useState("")
  const [loading,       setLoading]       = useState(false)
  const [orderContext,  setOrderContext]  = useState<OrderContext[]>([])
  const [savedHistory,  setSavedHistory]  = useState<Message[] | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)

  // ─── SEND ─────────────────────────────────────────────────────────────────

  const send = useCallback(async (text: string) => {
    const content = text.trim()
    if (!content || loading) return

    const userMsg: Message = { role: "user", content }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput("")
    setLoading(true)
    setSavedHistory(null)

    try {
      const res  = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:     next,
          orderContext: orderContext.length ? orderContext : undefined,
        }),
      })
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message ?? "Ошибка. Попробуйте снова." },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Нет соединения с AI сервисом." },
      ])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, orderContext])

  // ─── LOAD ORDER CONTEXT ───────────────────────────────────────────────────

  useEffect(() => {
    const identifier = session?.user?.email ?? localStorage.getItem("fs_phone")
    if (!identifier) return

    fetch(`/api/orders/track?q=${encodeURIComponent(identifier)}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data)) setOrderContext(data) })
      .catch(() => {})
  }, [session])

  // ─── AUTO-SEND FROM URL ?q= ───────────────────────────────────────────────

  const autoSentRef = useRef(false)
  useEffect(() => {
    if (!autoQuery || autoSentRef.current) return
    autoSentRef.current = true
    const t = setTimeout(() => send(autoQuery), 300)
    return () => clearTimeout(t)
  }, [autoQuery, send])

  // ─── CHECK SAVED HISTORY ──────────────────────────────────────────────────

  useEffect(() => {
    if (autoQuery) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const stored: Message[] = JSON.parse(raw)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored.length > 1) setSavedHistory(stored)
    } catch {}
  }, [autoQuery])

  // ─── SCROLL TRACKING ──────────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }, [])

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  // ─── PERSIST HISTORY ──────────────────────────────────────────────────────

  useEffect(() => {
    if (messages.length <= 1) return
    const toStore = messages.slice(-MAX_STORED)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch {}
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const reset = () => {
    setMessages([WELCOME_MSG])
    setInput("")
    setSavedHistory(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const loadHistory = () => {
    if (savedHistory) setMessages(savedHistory)
    setSavedHistory(null)
  }

  const showQuickPrompts = messages.length === 1

  // ─── DYNAMIC QUICK PROMPTS ────────────────────────────────────────────────

  const prompts = orderContext.length > 0
    ? ["Что я заказывал раньше?", ...QUICK_PROMPTS.slice(0, 3)]
    : QUICK_PROMPTS

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen flex flex-col">
      <Navbar />
      <PageHero
        badge="AI Procurement Assistant"
        title={<>Smart закупки<br />для HoReCa</>}
        subtitle="Умный ассистент для подбора продуктов, планирования закупок и оптимизации расходов"
        stats={[
          { value: "AI",     label: "Claude Sonnet" },
          { value: "500+",   label: "позиций в базе" },
          { value: "HoReCa", label: "специализация" },
        ]}
      />
      <CartDrawer />

      <div className="fs-container py-10 flex-1 flex flex-col max-w-3xl">

        {/* CHAT ACTIONS */}
        <FadeIn>
          <div className="flex items-center justify-end mb-8 gap-2">
            <div className="flex items-center gap-2">
              {orderContext.length > 0 && (
                <div className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-purple-50 border border-purple-200
                ">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="text-label text-purple-600 font-medium">
                    {orderContext.length} заказ{orderContext.length === 1 ? "" : orderContext.length < 5 ? "а" : "ов"}
                  </span>
                </div>
              )}

              {messages.length > 1 && (
                <button
                  onClick={reset}
                  className="
                    flex items-center gap-2 px-4 py-2.5 rounded-xl
                    border border-fs-border text-caption text-fs-gray
                    hover:border-fs-subtle hover:text-fs-primary
                    transition-all duration-200
                  "
                >
                  <RotateCcw size={14} strokeWidth={1.5} />
                  Новый чат
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        {/* CHAT AREA */}
        <FadeIn delay={0.1} className="flex-1 flex flex-col">
          <div className="
            flex-1 bg-white border border-fs-border rounded-2xl
            flex flex-col overflow-hidden relative
          ">

            {/* HISTORY BANNER */}
            <AnimatePresence>
              {savedHistory && (
                <HistoryBanner
                  count={savedHistory.length}
                  onLoad={loadHistory}
                  onDismiss={() => setSavedHistory(null)}
                />
              )}
            </AnimatePresence>

            {/* MESSAGES */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-5 min-h-[400px] max-h-[520px]"
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}

              <AnimatePresence>
                {loading && <TypingIndicator />}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* SCROLL TO BOTTOM BUTTON */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom()}
                  className="
                    absolute bottom-24 right-6
                    w-8 h-8 rounded-full
                    bg-fs-offwhite border border-fs-border
                    flex items-center justify-center
                    text-fs-gray hover:text-fs-primary
                    transition-colors duration-200 shadow-lg
                  "
                >
                  <ChevronDown size={16} strokeWidth={1.5} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* QUICK PROMPTS */}
            <AnimatePresence>
              {showQuickPrompts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4 border-t border-fs-border pt-4"
                >
                  <p className="text-label text-fs-gray uppercase tracking-widest mb-3">
                    Быстрый старт
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => send(prompt)}
                        className="
                          px-3 py-2 rounded-xl text-caption text-fs-gray
                          border border-fs-border bg-fs-offwhite
                          hover:border-fs-subtle hover:text-fs-primary
                          transition-all duration-200 text-left
                        "
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INPUT */}
            <div className="border-t border-fs-border p-4">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Спросите об ассортименте, закупках, ценах..."
                  rows={1}
                  disabled={loading}
                  className="
                    flex-1 bg-white border border-fs-border rounded-xl
                    px-4 py-3 text-body text-fs-graphite
                    placeholder:text-fs-gray
                    resize-none focus:outline-none focus:border-fs-primary focus:ring-2 focus:ring-fs-primary/10
                    transition-colors duration-200
                    disabled:opacity-50
                    max-h-32 overflow-y-auto
                  "
                  style={{ minHeight: "48px" }}
                />

                <motion.button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="
                    w-12 h-12 rounded-xl flex-shrink-0
                    bg-fs-primary text-white
                    flex items-center justify-center
                    hover:bg-fs-soft transition-colors duration-200
                    disabled:opacity-30 disabled:cursor-not-allowed
                  "
                >
                  <Send size={18} strokeWidth={2} />
                </motion.button>
              </div>

              <p className="text-label text-fs-subtle mt-2 text-center">
                Enter — отправить · Shift+Enter — новая строка
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}

export default function AIPage() {
  return (
    <Suspense fallback={
      <main className="fs-page-bg text-fs-graphite min-h-screen flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0,1,2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-fs-subtle"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </main>
    }>
      <AIPageInner />
    </Suspense>
  )
}
