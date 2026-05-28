"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"

const YM_ID = process.env.NEXT_PUBLIC_YM_ID

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void
  }
}

export function ymGoal(target: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.ym && YM_ID) {
    window.ym(Number(YM_ID), "reachGoal", target, params)
  }
}

function YMPageTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (typeof window !== "undefined" && window.ym && YM_ID) {
      window.ym(Number(YM_ID), "hit", pathname)
    }
  }, [pathname])
  return null
}

export default function YandexMetrica() {
  if (!YM_ID) return null

  // Patch window.ja to a no-op before loading YM script — tag.js sets this.ja=[]
  // (array) but may call it as a function in certain browser environments.
  const initScript = `if(typeof window.ja!=='function'){window.ja=function(){};}(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`

  return (
    <>
      <Script id="ym" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: initScript }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <noscript><img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: -9999 }} alt="" /></noscript>
      <YMPageTracker />
    </>
  )
}
