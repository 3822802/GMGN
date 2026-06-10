"use client";

import { useState } from "react";
import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
} from "wagmi";

import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";

const WALLET_USER_DISCONNECTED_KEY = "gmgn_wallet_disconnected";

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting, connector } =
    useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const { inMiniApp, user } = useFarcasterMiniApp();
  const [showPicker, setShowPicker] = useState(false);

  const farcasterConnector = connectors.find((c) => c.id === "farcaster");
  const extensionConnectors = connectors.filter((c) => c.id !== "farcaster");

  const handleDisconnect = (opts?: { openPicker?: boolean }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(WALLET_USER_DISCONNECTED_KEY, "1");
    }
    disconnect();
    setShowPicker(opts?.openPicker ?? false);
  };

  const handleConnect = (connectorId: string) => {
    const target = connectors.find((c) => c.id === connectorId);
    if (!target) return;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(WALLET_USER_DISCONNECTED_KEY);
    }
    connect({ connector: target });
    setShowPicker(false);
  };

  if (isReconnecting) {
    return (
      <p className="cyber-label text-center text-[var(--cyber-muted)]">
        ▸ WALLET_RECONNECT…
      </p>
    );
  }

  if (isConnected && !showPicker) {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {user?.username && inMiniApp && (
          <p className="cyber-accent-magenta text-center text-xs">
            @{user.username}
          </p>
        )}
        <div className="cyber-panel flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="cyber-label text-[9px] text-[var(--cyber-muted)]">
              {connector?.name ?? "WALLET"}
            </p>
            <p className="truncate font-mono text-xs text-[var(--cyber-cyan)]">
              {address?.slice(0, 6)}…{address?.slice(-4)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => handleDisconnect({ openPicker: true })}
              className="cyber-btn cyber-btn-ghost px-2 py-1 text-[10px] font-bold"
            >
              CHANGE
            </button>
            <button
              type="button"
              onClick={() => handleDisconnect()}
              className="cyber-btn cyber-btn-ghost px-2 py-1 text-[10px] font-bold"
            >
              OUT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <p className="cyber-label text-center text-[10px] text-[var(--cyber-muted)]">
        {showPicker ? "// SELECT_WALLET" : "// CONNECT_TO_TRANSMIT_GM"}
      </p>

      {inMiniApp && farcasterConnector && (
        <button
          type="button"
          onClick={() => handleConnect("farcaster")}
          disabled={isConnecting || isPending}
          className="cyber-btn cyber-btn-magenta py-2 text-xs font-bold disabled:opacity-50"
        >
          ▸ FARCASTER_WALLET
        </button>
      )}

      {extensionConnectors.map((c) => (
        <button
          key={c.uid}
          type="button"
          onClick={() => handleConnect(c.id)}
          disabled={isConnecting || isPending}
          className="cyber-btn cyber-btn-light py-2 text-xs font-bold disabled:opacity-50"
        >
          ▸ {c.name.toUpperCase()}
          {c.id === "injected" ? " // EXT" : ""}
        </button>
      ))}

      {showPicker && isConnected && (
        <button
          type="button"
          onClick={() => setShowPicker(false)}
          className="cyber-label text-center text-[var(--cyber-muted)] hover:text-[var(--cyber-cyan)]"
        >
          // ABORT
        </button>
      )}
    </div>
  );
}
