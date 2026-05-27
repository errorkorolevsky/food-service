"use client"

import { useState, useEffect } from "react"
import { BellRing, BellOff, Loader2 } from "lucide-react"
import { useSession }  from "next-auth/react"
import { useRouter }   from "next/navigation"
import { useLang }     from "@/locales"

type Props = { productId: string; productTitle: string }

export default function RestockNotifyButton({ productId, productTitle }: Props) {
  const { data: session } = useSession() ?? {}
  const router            = useRouter()
  const { t }             = useLang()
  const [subscribed, setSubscribed] = useState(false)
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    if (!session?.user) return
    fetch(`/api/restock?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => setSubscribed(d.subscribed ?? false))
      .catch(() => {})
  }, [productId, session])

  const handleClick = async () => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const method = subscribed ? "DELETE" : "POST"
      await fetch("/api/restock", {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId, productTitle }),
      })
      setSubscribed(!subscribed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-xl
        border text-[13px] font-semibold transition-all duration-200
        ${subscribed
          ? "bg-fs-primary/8 border-fs-primary/30 text-fs-primary hover:bg-fs-primary/12"
          : "bg-fs-offwhite border-fs-border text-fs-gray hover:border-fs-subtle hover:text-fs-graphite"
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
      ) : subscribed ? (
        <BellOff size={15} strokeWidth={1.5} />
      ) : (
        <BellRing size={15} strokeWidth={1.5} />
      )}
      {subscribed ? t.product.restockCancel : t.product.restockNotify}
    </button>
  )
}
