export default function GlowBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <div
        className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] rounded-full bg-fs-primary/[0.04]"
        style={{ filter: "blur(120px)", transform: "translateZ(0)" }}
      />
      <div
        className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-fs-soft/[0.03]"
        style={{ filter: "blur(100px)", transform: "translateZ(0)" }}
      />
    </div>
  )
}
