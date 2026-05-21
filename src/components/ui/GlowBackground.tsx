export default function GlowBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <div className="
        absolute top-[-200px] right-[-200px]
        w-[700px] h-[700px]
        bg-fs-primary/[0.04] blur-[180px]
        rounded-full
      " />
      <div className="
        absolute bottom-[-200px] left-[-200px]
        w-[600px] h-[600px]
        bg-fs-soft/[0.03] blur-[160px]
        rounded-full
      " />
    </div>
  )
}
