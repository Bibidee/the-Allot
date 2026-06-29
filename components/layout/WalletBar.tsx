"use client";

import { useWallet } from "@/lib/context/WalletContext";
import { shortAddr } from "@/lib/genlayer/contract";
import { Wallet, AlertTriangle } from "lucide-react";

export function WalletBar() {
  const { address, chainId, isConnecting, error, connect, disconnect, switchNetwork } = useWallet();
  const isWrongNetwork = chainId !== null && chainId !== 61999;

  return (
    <div className="flex items-center gap-3">
      {isWrongNetwork && (
        <button
          onClick={switchNetwork}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1a0d] border border-[#f97316]/40 rounded-lg text-xs text-[#f97316] hover:bg-[#3a2a1d] transition-all"
        >
          <AlertTriangle className="w-3 h-3" />
          Switch to StudioNet
        </button>
      )}
      {address ? (
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-xs text-[#60a5fa] hover:bg-[#0d2049] transition-all"
        >
          <Wallet className="w-3 h-3" />
          <span className="font-mono">{shortAddr(address)}</span>
        </button>
      ) : (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#f0c040] hover:bg-[#fcd34d] disabled:opacity-60 rounded-lg text-xs font-bold text-[#0a0f1a] transition-all"
        >
          <Wallet className="w-3 h-3" />
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </button>
      )}
      {error && <span className="text-xs text-[#f87171]">{error}</span>}
    </div>
  );
}
