"use client";

export function MiniAppSplash() {
  return (
    <div
      className="cyber-page fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center"
      role="presentation"
      aria-hidden
    >
      <div className="cyber-scanline" aria-hidden />
      <div className="relative">
        <div className="cyber-title flex h-44 w-44 items-center justify-center border border-[var(--cyber-cyan)] bg-black/80 text-3xl font-black tracking-[0.2em] text-white shadow-[0_0_40px_rgba(0,245,255,0.4)]">
          GMGN
        </div>
        <p className="cyber-label mt-4 text-center">INITIALIZING…</p>
      </div>
    </div>
  );
}
