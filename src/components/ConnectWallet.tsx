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
      <div className="flex w-full max-w-xs flex-col items-center gap-2">
        {user?.username && inMiniApp && (
          <p className="cyber-accent-magenta text-sm">@{user.username}</p>
        )}
        <div className="cyber-panel w-full px-4 py-3">
          <p className="cyber-label text-[10px] text-[var(--cyber-muted)]">
            {connector?.name ?? "WALLET"}
          </p>
          <p className="mt-1 truncate font-mono text-sm text-[var(--cyber-cyan)]">
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </p>
        </div>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => handleDisconnect()}
            className="cyber-btn cyber-btn-ghost flex-1 py-2.5 text-xs font-bold"
          >
            DISCONNECT
          </button>
          <button
            type="button"
            onClick={() => handleDisconnect({ openPicker: true })}
            className="cyber-btn cyber-btn-solid flex-1 py-2.5 text-xs font-bold"
          >
            CHANGE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <p className="cyber-label text-center text-[var(--cyber-muted)]">
        {showPicker ? "// SELECT_WALLET" : "// CONNECT_TO_TRANSMIT_GM"}
      </p>

      {inMiniApp && farcasterConnector && (
        <button
          type="button"
          onClick={() => handleConnect("farcaster")}
          disabled={isConnecting || isPending}
          className="cyber-btn cyber-btn-magenta py-3 text-xs font-bold disabled:opacity-50"
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
          className="cyber-btn cyber-btn-light py-3 text-xs font-bold disabled:opacity-50"
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
