"use client";

import { useWallet } from "@/lib/context/WalletContext";
import { shortAddr } from "@/lib/genlayer/contract";
import { Wallet, AlertTriangle, ChevronRight } from "lucide-react";

export function WalletBar() {
  const { address, chainId, isConnecting, error, connect, disconnect, switchNetwork } = useWallet();
  const isWrongNetwork = chainId !== null && chainId !== 61999;

  return (
    <div className="flex items-center gap-3">
      {isWrongNetwork && (
        <button onClick={switchNetwork}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all"
          style={{
            background: "rgba(201,125,6,0.08)",
            border: "1px solid rgba(201,125,6,0.3)",
            color: "var(--amber)",
            borderRadius: "3px",
          }}>
          <AlertTriangle className="w-3 h-3" />
          Switch to StudioNet
        </button>
      )}
      {address ? (
        <button onClick={disconnect}
          className="flex items-center gap-2 px-3 py-1.5 text-xs transition-all"
          style={{
            background: "var(--vault-panel)",
            border: "1px solid var(--vault-border2)",
            color: "var(--court-blue-b)",
            borderRadius: "3px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--mint-bright)" }} />
          {shortAddr(address)}
        </button>
      ) : (
        <button onClick={connect} disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
          style={{
            background: "var(--gold)",
            color: "#030912",
            borderRadius: "3px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}>
          <Wallet className="w-3 h-3" />
          {isConnecting ? "Connecting…" : "Connect Wallet"}
          {!isConnecting && <ChevronRight className="w-3 h-3" />}
        </button>
      )}
      {error && (
        <span className="text-xs" style={{ color: "var(--red-bright)", fontFamily: "'JetBrains Mono', monospace" }}>
          {error}
        </span>
      )}
    </div>
  );
}
