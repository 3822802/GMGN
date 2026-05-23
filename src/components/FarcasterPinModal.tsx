"use client";

import { useFarcasterAddMiniApp } from "@/hooks/useFarcasterAddMiniApp";

export function FarcasterPinModal() {
  const {
    showPinPrompt,
    isPending,
    status,
    promptAddMiniApp,
    dismissPinPrompt,
    isAdded,
  } = useFarcasterAddMiniApp();

  if (!showPinPrompt || isAdded) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="cyber-panel w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center">
          <div className="cyber-title flex h-24 w-24 items-center justify-center border border-[var(--cyber-magenta)] bg-black/60 text-xl font-black tracking-widest text-white shadow-[0_0_30px_rgba(255,0,170,0.35)]">
            GMGN
          </div>
          <h2 className="cyber-title mt-4 text-xl font-bold text-white">
            PIN_GMGN
          </h2>
          <p className="mt-2 text-sm text-[var(--cyber-muted)]">
            Add to Warpcast for quick access and daily GM sync.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => void promptAddMiniApp()}
            className="cyber-btn cyber-btn-primary py-3 text-xs font-bold disabled:opacity-50"
          >
            {isPending ? "▸ OPENING…" : "▸ PIN_APP"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={dismissPinPrompt}
            className="cyber-btn cyber-btn-ghost py-3 text-xs font-bold"
          >
            // LATER
          </button>
        </div>

        {status ? (
          <p className="cyber-label mt-3 text-center text-[var(--cyber-muted)]">
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
