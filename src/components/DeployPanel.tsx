"use client";

import { useEffect, useRef, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { BUILDER_DATA_SUFFIX } from "@/config/builder";
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
      dataSuffix: BUILDER_DATA_SUFFIX,
    });
  };

  const canSubmit =
    tokenName.trim().length > 0 &&
    tokenSymbol.trim().length > 0 &&
    initialSupply.trim().length > 0;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="cyber-panel grid grid-cols-2 gap-2 p-3">
        <label className="col-span-2 flex flex-col gap-0.5">
          <span className="cyber-label text-[8px] text-[var(--cyber-purple)]">
            NAME
          </span>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="My Token"
            maxLength={32}
            className="rounded border border-[var(--cyber-cyan)]/30 bg-black/50 px-2 py-1.5 text-xs text-white outline-none focus:border-[var(--cyber-cyan)]"
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <span className="cyber-label text-[8px] text-[var(--cyber-purple)]">
            SYMBOL
          </span>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            placeholder="MTK"
            maxLength={11}
            className="rounded border border-[var(--cyber-cyan)]/30 bg-black/50 px-2 py-1.5 font-mono text-xs uppercase text-white outline-none focus:border-[var(--cyber-cyan)]"
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <span className="cyber-label text-[8px] text-[var(--cyber-purple)]">
            SUPPLY
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
            placeholder="1000000"
            className="rounded border border-[var(--cyber-cyan)]/30 bg-black/50 px-2 py-1.5 font-mono text-xs text-white outline-none focus:border-[var(--cyber-cyan)]"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleDeploy}
        disabled={!canSubmit || isPending || isConfirming}
        className={`cyber-btn w-full py-7 text-xl font-black disabled:cursor-not-allowed disabled:opacity-40 ${
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

      <p className="text-center text-[10px] text-[var(--cyber-muted)]">
        {freeDeployAvailable
          ? `FREE · +${POINTS_PER_FREE_DEPLOY} PTS`
          : `PAID · ${feeLabel} ETH · +${POINTS_PER_PAID_DEPLOY} PTS`}
      </p>

      {writeError && (
        <p className="text-center text-sm text-red-400">
          {writeError.message.split("\n")[0]}
        </p>
      )}

      {isSuccess && hash && (
        <div className="cyber-panel flex flex-col gap-1.5 p-3 text-center text-xs">
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
