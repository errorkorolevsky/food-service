"use client"

import { Bell, BellOff, Loader2 } from "lucide-react"
import { usePushNotifications }   from "@/hooks/usePushNotifications"
import { useLang }                 from "@/locales"

export default function PushNotificationToggle() {
  const { supported, subscribed, loading, permission, subscribe, unsubscribe } = usePushNotifications()
  const { t } = useLang()

  if (!supported) return null
  if (permission === "denied") return null

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      aria-pressed={subscribed}
      className={`
        flex items-center gap-3 w-full px-4 py-3.5 rounded-xl
        border transition-all duration-200 text-left
        ${subscribed
          ? "bg-fs-primary/8 border-fs-primary/30 text-fs-primary hover:bg-fs-primary/12"
          : "bg-fs-offwhite border-fs-border text-fs-gray hover:border-fs-subtle hover:text-fs-graphite"
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <Loader2 size={18} strokeWidth={1.5} className="animate-spin flex-shrink-0" />
      ) : subscribed ? (
        <Bell size={18} strokeWidth={1.5} className="flex-shrink-0" />
      ) : (
        <BellOff size={18} strokeWidth={1.5} className="flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-caption font-semibold leading-tight">
          {subscribed ? t.profile.pushOn : t.profile.pushOff}
        </p>
        <p className="text-[11px] text-fs-muted mt-0.5 leading-tight">
          {subscribed ? t.profile.pushOnSub : t.profile.pushOffSub}
        </p>
      </div>
    </button>
  )
}
