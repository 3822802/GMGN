"use client";

import { useEffect, useRef, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseUnits } from "viem";

import {
  DEPLOY_CHAIN_ID,
  DEPLOY_FEE_WEI,
  HUB_CONTRACT_ADDRESS,
  POINTS_PER_FREE_DEPLOY,
  POINTS_PER_PAID_DEPLOY,
  hubAbi,
} from "@/config/contract";

function explorerAddressUrl(address: string) {
  return `https://basescan.org/address/${address}`;
}

function explorerTxUrl(hash: string) {
  return `https://basescan.org/tx/${hash}`;
}

type DeployPanelProps = {
  freeDeployAvailable?: boolean;
  deployFeeOnChain?: bigint;
  onSuccess?: () => void;
};

export function DeployPanel({
  freeDeployAvailable = true,
  deployFeeOnChain,
  onSuccess,
}: DeployPanelProps) {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [deployedToken, setDeployedToken] = useState<string | null>(null);
  const syncedTxHash = useRef<string | undefined>(undefined);

  const feeWei = deployFeeOnChain ?? DEPLOY_FEE_WEI;
  const feeLabel = formatEther(feeWei);
  const isPaidDeploy = !freeDeployAvailable;

  const { data: hash, isPending, writeContract, error: writeError, reset } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isSuccess || !hash || !receipt) return;
    if (syncedTxHash.current === hash) return;
    syncedTxHash.current = hash;

    const tokenLog = receipt.logs.find(
      (log) => log.topics.length >= 3 && log.address !== HUB_CONTRACT_ADDRESS,
    );
    if (tokenLog) {
      setDeployedToken(tokenLog.address);
    }

    onSuccess?.();
  }, [isSuccess, hash, receipt, onSuccess]);

  const handleDeploy = () => {
    const name = tokenName.trim();
    const symbol = tokenSymbol.trim().toUpperCase();
    if (!name || !symbol) return;

    let supply: bigint;
    try {
      supply = parseUnits(initialSupply.trim() || "0", 18);
      if (supply <= BigInt(0)) return;
    } catch {
      return;
    }

    reset();
    setDeployedToken(null);
    syncedTxHash.current = undefined;

    writeContract({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "deployToken",
      args: [name, symbol, supply],
      chainId: DEPLOY_CHAIN_ID,
      value: isPaidDeploy ? feeWei : BigInt(0),
    });
  };

  const canSubmit =
    tokenName.trim().length > 0 &&
    tokenSymbol.trim().length > 0 &&
    initialSupply.trim().length > 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-center text-xs text-[var(--cyber-muted)]">
        {freeDeployAvailable
          ? `1 FREE DEPLOY · +${POINTS_PER_FREE_DEPLOY} PTS`
          : `PAID DEPLOY · ${feeLabel} ETH · +${POINTS_PER_PAID_DEPLOY} PTS`}
      </p>

      <div className="cyber-panel flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1">
          <span className="cyber-label text-[10px] text-[var(--cyber-purple)]">
            TOKEN_NAME
          </span>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="My Token"
            maxLength={32}
            className="rounded border border-[var(--cyber-cyan)]/30 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_12px_rgba(0,245,255,0.2)]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="cyber-label text-[10px] text-[var(--cyber-purple)]">
            TOKEN_SYMBOL
          </span>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            placeholder="MTK"
            maxLength={11}
            className="rounded border border-[var(--cyber-cyan)]/30 bg-black/50 px-3 py-2.5 font-mono text-sm uppercase text-white outline-none focus:border-[var(--cyber-cyan)]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="cyber-label text-[10px] text-[var(--cyber-purple)]">
            INITIAL_SUPPLY
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
            placeholder="1000000"
            className="rounded border border-[var(--cyber-cyan)]/30 bg-black/50 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-[var(--cyber-cyan)]"
          />
          <span className="text-[10px] text-[var(--cyber-muted)]">
            Whole tokens (18 decimals applied onchain)
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleDeploy}
        disabled={!canSubmit || isPending || isConfirming}
        className={`cyber-btn w-full py-6 text-lg font-black disabled:cursor-not-allowed disabled:opacity-40 ${
          isPaidDeploy ? "cyber-btn-primary cyber-btn-paid" : "cyber-btn-primary"
        }`}
      >
        {isPending
          ? "▸ CONFIRM_IN_WALLET"
          : isConfirming
            ? "▸ DEPLOYING…"
            : isPaidDeploy
              ? `▸ DEPLOY · ${feeLabel} ETH`
              : "▸ DEPLOY // FREE"}
      </button>

      {writeError && (
        <p className="text-center text-sm text-red-400">
          {writeError.message.split("\n")[0]}
        </p>
      )}

      {isSuccess && hash && (
        <div className="cyber-panel flex flex-col gap-2 p-4 text-center text-sm">
          <p className="cyber-accent-yellow font-bold">▸ TOKEN_DEPLOYED</p>
          {deployedToken && (
            <a
              href={explorerAddressUrl(deployedToken)}
              target="_blank"
              rel="noreferrer"
              className="cyber-glow-text break-all font-mono text-xs hover:underline"
            >
              {deployedToken}
            </a>
          )}
          <a
            href={explorerTxUrl(hash)}
            target="_blank"
            rel="noreferrer"
            className="cyber-glow-text text-xs hover:underline"
          >
            ▸ VIEW TX ON BASESCAN
          </a>
        </div>
      )}
    </div>
  );
}
