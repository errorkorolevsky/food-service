"use client"

import { useState, useRef, useEffect, useCallback, Suspense, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, RotateCcw, History, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import FadeIn from "@/components/ui/FadeIn"
import PageHero from "@/components/ui/PageHero"
import { useLang } from "@/locales"

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


// ─── STREAMING CURSOR ─────────────────────────────────────────────────────────

function StreamingCursor() {
  return (
    <motion.span
      className="inline-block w-0.5 h-[1em] bg-current align-middle ml-[2px] rounded-[1px]"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  )
}

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────

function parseBold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      : part
  )
}

function renderMarkdown(text: string, isStreaming?: boolean): ReactNode {
  const lines  = text.split("\n")
  const result: ReactNode[] = []
  let listBuffer: ReactNode[] = []
  let listType: "ul" | "ol" | null = null

  const flushList = () => {
    if (!listBuffer.length) return
    if (listType === "ul") result.push(<ul key={`ul-${result.length}`} className="list-disc pl-5 space-y-1 my-2">{listBuffer}</ul>)
    else                   result.push(<ol key={`ol-${result.length}`} className="list-decimal pl-5 space-y-1 my-2">{listBuffer}</ol>)
    listBuffer = []
    listType   = null
  }

  lines.forEach((line, i) => {
    const isLast = i === lines.length - 1
    const cursor = isStreaming && isLast ? <StreamingCursor /> : null

    const bulletMatch    = line.match(/^[-*]\s(.+)/)
    const numberedMatch  = line.match(/^\d+\.\s(.+)/)
    const headingMatch   = line.match(/^#{1,3}\s(.+)/)

    if (bulletMatch) {
      if (listType !== "ul") { flushList(); listType = "ul" }
      listBuffer.push(<li key={i}>{parseBold(bulletMatch[1])}{cursor}</li>)
    } else if (numberedMatch) {
      if (listType !== "ol") { flushList(); listType = "ol" }
      listBuffer.push(<li key={i}>{parseBold(numberedMatch[1])}{cursor}</li>)
    } else {
      flushList()
      if (headingMatch) {
        result.push(<p key={i} className="font-bold text-[15px] mt-2 mb-0.5">{parseBold(headingMatch[1])}{cursor}</p>)
      } else if (!line.trim()) {
        result.push(<div key={i} className="h-2" />)
      } else {
        result.push(<p key={i} className={result.length > 0 ? "mt-1" : ""}>{parseBold(line)}{cursor}</p>)
      }
    }
  })
  flushList()
  return result
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
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
          : "bg-fs-white border border-fs-border text-fs-graphite rounded-tl-sm"
        }
      `}>
        {msg.content
          ? renderMarkdown(msg.content, isStreaming)
          : <StreamingCursor />
        }
      </div>
    </motion.div>
  )
}

// ─── TYPING INDICATOR — shown while waiting for first byte ───────────────────

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
      <div className="bg-fs-white border border-fs-border rounded-2xl rounded-tl-sm px-5 py-4">
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
  const { t } = useLang()
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
          {t.ai.historyFound}: {count} {t.ai.historySuffix}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onLoad}
          className="text-label text-purple-600 hover:text-purple-800 transition-colors font-medium"
        >
          {t.ai.historyLoad}
        </button>
        <span className="text-fs-border text-label">·</span>
        <button
          onClick={onDismiss}
          className="text-label text-fs-gray hover:text-fs-graphite transition-colors"
        >
          {t.ai.historyDismiss}
        </button>
      </div>
    </motion.div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function AIPageInner() {
  const { t, lang }       = useLang()
  const { data: session } = useSession()
  const searchParams      = useSearchParams()
  const autoQuery         = searchParams.get("q")

  const [messages,      setMessages]      = useState<Message[]>(() => [{ role: "assistant" as const, content: t.ai.greeting }])
  const [input,         setInput]         = useState("")
  const [loading,       setLoading]       = useState(false)   // waiting for first byte
  const [isStreaming,   setIsStreaming]   = useState(false)   // text is arriving
  const [orderContext,  setOrderContext]  = useState<OrderContext[]>([])
  const [savedHistory,  setSavedHistory]  = useState<Message[] | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)
  const abortRef    = useRef<AbortController | null>(null)

  // ─── SEND (streaming) ─────────────────────────────────────────────────────

  const send = useCallback(async (text: string) => {
    const content = text.trim()
    if (!content || loading || isStreaming) return

    // Abort any in-flight stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMsg: Message = { role: "user", content }
    const context = [...messages, userMsg]
    setMessages(context)
    setInput("")
    setLoading(true)
    setSavedHistory(null)

    try {
      const res = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:     context,
          orderContext: orderContext.length ? orderContext : undefined,
          locale:       lang,
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error("API error")

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      let firstChunk  = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        accumulated += decoder.decode(value, { stream: true })

        if (firstChunk) {
          firstChunk = false
          setLoading(false)
          setIsStreaming(true)
          setMessages((prev) => [...prev, { role: "assistant", content: accumulated }])
        } else {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: accumulated },
          ])
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t.ai.noConn },
      ])
    } finally {
      setLoading(false)
      setIsStreaming(false)
    }
  }, [messages, loading, isStreaming, orderContext, t, lang])

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
      if (stored.length > 1) setSavedHistory(stored)
    } catch {}
  }, [autoQuery])

  // ─── SCROLL TRACKING ──────────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
  }, [])

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  // ─── PERSIST HISTORY (only complete messages) ─────────────────────────────

  useEffect(() => {
    if (isStreaming || messages.length <= 1) return
    const toStore = messages.slice(-MAX_STORED)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore)) } catch {}
  }, [messages, isStreaming])

  // ─── CLEANUP on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setMessages([{ role: "assistant", content: t.ai.greeting }])
    setInput("")
    setSavedHistory(null)
    setLoading(false)
    setIsStreaming(false)
    localStorage.removeItem(STORAGE_KEY)
  }

  const loadHistory = () => {
    if (savedHistory) setMessages(savedHistory)
    setSavedHistory(null)
  }

  const showQuickPrompts = messages.length === 1
  const isBusy = loading || isStreaming

  const prompts = orderContext.length > 0
    ? [t.ai.historyBtn, ...t.ai.quickPrompts.slice(0, 3)]
    : t.ai.quickPrompts

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen flex flex-col">
      <Navbar />
      <PageHero
        badge={t.ai.pageBadge}
        title={<>{t.ai.pageTitle1}<br />{t.ai.pageTitle2}</>}
        subtitle={t.ai.pageSubtitle}
        stats={[
          { value: "AI",     label: t.ai.statAI      },
          { value: "500+",   label: t.ai.statsItems   },
          { value: "HoReCa", label: t.ai.statsSpec    },
        ]}
      />
      <CartDrawer />

      <div className="fs-container py-10 flex-1 flex flex-col max-w-3xl">

        {/* CHAT ACTIONS */}
        <FadeIn>
          <div className="flex items-center justify-end mb-8 gap-2">
            <div className="flex items-center gap-2">
              {orderContext.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="text-label text-purple-600 font-medium">
                    {orderContext.length} {orderContext.length === 1 ? t.ai.ordersContext : orderContext.length < 5 ? t.ai.ordersContextFew : t.ai.ordersContextMany}
                  </span>
                </div>
              )}

              {messages.length > 1 && !isBusy && (
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
                  {t.ai.newChat}
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        {/* CHAT AREA */}
        <FadeIn delay={0.1} className="flex-1 flex flex-col">
          <div className="
            flex-1 bg-fs-white border border-fs-border rounded-2xl
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
              {messages.map((msg, i) => {
                const isLastAssistant = !loading && i === messages.length - 1 && msg.role === "assistant"
                return (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    isStreaming={isStreaming && isLastAssistant}
                  />
                )
              })}

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
                  aria-label={t.scrollDown}
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
                    {t.ai.quickStart}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => send(prompt)}
                        disabled={isBusy}
                        className="
                          px-3 py-2 rounded-xl text-caption text-fs-gray
                          border border-fs-border bg-fs-offwhite
                          hover:border-fs-subtle hover:text-fs-primary
                          transition-all duration-200 text-left
                          disabled:opacity-40 disabled:cursor-not-allowed
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
                  aria-label={t.ai.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.ai.placeholder}
                  rows={1}
                  disabled={isBusy}
                  className="
                    flex-1 bg-fs-white border border-fs-border rounded-xl
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
                  aria-label={t.ai.send}
                  disabled={!input.trim() || isBusy}
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
                {t.ai.enterHint}
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
