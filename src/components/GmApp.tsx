"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { BUILDER_DATA_SUFFIX } from "@/config/builder";
import { formatEther } from "viem";

import { DeployPanel } from "@/components/DeployPanel";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { useHubStats } from "@/hooks/useHubStats";
import {
  DEPLOY_CHAIN_ID,
  FREE_GM_PER_DAY,
  HUB_CONTRACT_ADDRESS,
  GM_FEE_WEI,
  POINTS_PER_FREE_DEPLOY,
  POINTS_PER_FREE_GM,
  POINTS_PER_PAID_DEPLOY,
  POINTS_PER_PAID_GM,
  hubAbi,
  isContractConfigured,
} from "@/config/contract";

type Tab = "gm" | "deploy";

function explorerTxUrl(hash: string) {
  return `https://basescan.org/tx/${hash}`;
}

export function GmApp() {
  const { inMiniApp } = useFarcasterMiniApp();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [tab, setTab] = useState<Tab>("gm");
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const syncedTxHash = useRef<string | undefined>(undefined);

  const {
    gmCount,
    points,
    lastGmAt,
    freeRemaining,
    deployCount,
    freeDeployAvailable,
    totalGms,
    totalDeploys,
    gmFeeOnChain,
    deployFeeOnChain,
    minInterval,
    refreshStats,
  } = useHubStats();

  const { data: hash, isPending, writeContract, error: writeError } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isSuccess || !hash) return;
    if (syncedTxHash.current === hash) return;
    syncedTxHash.current = hash;

    const sync = async () => {
      await refreshStats();
      window.setTimeout(() => void refreshStats(), 800);
      window.setTimeout(() => void refreshStats(), 2500);
    };
    void sync();
  }, [isSuccess, hash, refreshStats]);

  const feeWei = gmFeeOnChain ?? GM_FEE_WEI;
  const feeLabel = formatEther(feeWei);

  const freeLeft = Number(freeRemaining ?? FREE_GM_PER_DAY);
  const isPaidGm = freeLeft === 0;

  const cooldownEnds = useMemo(() => {
    if (!lastGmAt || !minInterval) return 0;
    const last = Number(lastGmAt);
    if (last === 0) return 0;
    return last + Number(minInterval);
  }, [lastGmAt, minInterval]);

  const secondsLeft = Math.max(0, cooldownEnds - now);
  const canGm = secondsLeft === 0;

  const wrongChain = isConnected && chainId !== DEPLOY_CHAIN_ID;

  const handleGm = () => {
    writeContract({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "gm",
      chainId: DEPLOY_CHAIN_ID,
      value: isPaidGm ? feeWei : BigInt(0),
      dataSuffix: BUILDER_DATA_SUFFIX,
    });
  };

  const showActions =
    isConnected && isContractConfigured && !wrongChain;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <header className="text-center">
        <p className="cyber-label cyber-flicker text-[10px]">
          // BASE · {inMiniApp ? "FARCASTER" : "WEB"}
        </p>
        <h1 className="cyber-title cyber-flicker mt-1.5 text-4xl font-black text-white">
          GMGN
        </h1>
        <p className="mt-2 text-[11px] leading-snug text-[var(--cyber-muted)]">
          GM {FREE_GM_PER_DAY}×<span className="cyber-glow-text">+{POINTS_PER_FREE_GM}</span>
          {" / "}paid <span className="cyber-glow-text">+{POINTS_PER_PAID_GM}</span>
          {" · "}Deploy 1×<span className="cyber-glow-text">+{POINTS_PER_FREE_DEPLOY}</span>
          {" / "}paid <span className="cyber-glow-text">+{POINTS_PER_PAID_DEPLOY}</span>
        </p>
      </header>

      <div className="cyber-panel cyber-panel-warn w-full px-3 py-2 text-center text-[11px] text-[var(--cyber-yellow)]">
        ◈ STACK POINTS FOR AIRDROP
      </div>

      {!isContractConfigured && (
        <div className="cyber-panel cyber-panel-danger w-full px-3 py-2 text-xs text-red-300">
          <span className="cyber-label text-red-400">// CONTRACT_NULL</span>
          <p className="mt-1">
            Deploy <code className="text-[var(--cyber-cyan)]">GMGNHub</code> → set{" "}
            <code className="text-[var(--cyber-cyan)]">HUB_CONTRACT_ADDRESS</code>
          </p>
        </div>
      )}

      <ConnectWallet />

      {wrongChain && (
        <button
          type="button"
          onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
          disabled={isSwitching}
          className="cyber-btn cyber-btn-solid w-full py-3 text-xs font-bold disabled:opacity-40"
        >
          {isSwitching ? "SWITCHING…" : "▸ SWITCH TO BASE"}
        </button>
      )}

      {showActions && (
        <div className="flex w-full gap-2">
          <TabButton active={tab === "gm"} onClick={() => setTab("gm")}>
            ▸ GM
          </TabButton>
          <TabButton active={tab === "deploy"} onClick={() => setTab("deploy")}>
            ▸ DEPLOY
          </TabButton>
        </div>
      )}

      {showActions && tab === "gm" && (
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={handleGm}
            disabled={!canGm || isPending || isConfirming}
            className={`cyber-btn gm-pulse w-full py-7 text-xl font-black disabled:cursor-not-allowed disabled:opacity-40 ${
              isPaidGm ? "cyber-btn-primary cyber-btn-paid" : "cyber-btn-primary"
            }`}
          >
            {isPending
              ? "▸ CONFIRM_IN_WALLET"
              : isConfirming
                ? "▸ ONCHAIN_SYNC…"
                : !canGm
                  ? `▸ COOLDOWN ${secondsLeft}S`
                  : isPaidGm
                    ? `▸ GM · ${feeLabel} ETH`
                    : "▸ GM // FREE"}
          </button>

          <p className="text-center text-[10px] text-[var(--cyber-muted)]">
            {isPaidGm
              ? `PAID · ${feeLabel} ETH · +${POINTS_PER_PAID_GM} PTS`
              : `FREE · +${POINTS_PER_FREE_GM} PTS · ${freeLeft} LEFT`}
          </p>

          {writeError && (
            <p className="text-center text-xs text-red-400">
              {writeError.message.split("\n")[0]}
            </p>
          )}

          {isSuccess && hash && (
            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noreferrer"
              className="cyber-glow-text text-center text-xs hover:underline"
            >
              ▸ VIEW ON BASESCAN
            </a>
          )}
        </div>
      )}

      {showActions && tab === "deploy" && (
        <DeployPanel
          freeDeployAvailable={freeDeployAvailable}
          deployFeeOnChain={deployFeeOnChain}
          onSuccess={() => void refreshStats()}
        />
      )}

      {isConnected && (
        <div className="grid w-full grid-cols-4 gap-2">
          <StatCard label="GMS" value={gmCount?.toString() ?? "0"} />
          <StatCard
            label="PTS"
            value={points?.toString() ?? "0"}
            highlight
          />
          <StatCard label="DEP" value={deployCount?.toString() ?? "0"} />
          <StatCard label="FREE" value={`${freeLeft}/${FREE_GM_PER_DAY}`} />
          <StatCard
            label="DEPLOY"
            value={freeDeployAvailable ? "FREE" : "PAID"}
            className="col-span-2"
          />
          <StatCard
            label="GLOBAL"
            value={`${totalGms?.toString() ?? "0"}·${totalDeploys?.toString() ?? "0"}`}
            className="col-span-2"
          />
        </div>
      )}

      <footer className="text-center text-[10px] text-[var(--cyber-muted)]">
        <span className="opacity-60">GM</span>{" "}
        <a
          href="https://onchaingm.com/"
          className="cyber-accent-magenta hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          onchaingm
        </a>
        {" · "}
        <span className="opacity-60">Deploy</span>{" "}
        <a
          href="https://www.gas.zip/deployer"
          className="cyber-glow-text hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          gas.zip
        </a>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cyber-btn flex-1 py-2.5 text-xs font-bold ${
        active ? "cyber-btn-primary" : "cyber-btn-ghost"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  highlight,
  className = "",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`cyber-stat px-2 py-2 ${className}`}>
      <p className="cyber-label text-[8px] text-[var(--cyber-purple)]">
        {label}
      </p>
      <p
        className={`cyber-stat-value mt-0.5 text-base font-bold ${
          highlight ? "cyber-accent-yellow" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
