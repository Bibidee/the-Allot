"use client";

import { useState } from "react";
import type { Allocation, TxState } from "@/lib/genlayer/types";
import { claimPayout, waitForTx, weiToGen } from "@/lib/genlayer/contract";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { Coins, CheckCircle2 } from "lucide-react";

interface Props {
  roundId: string;
  allocation: Allocation;
  onClaimed?: () => void;
}

export function PaymentClaimButton({ roundId, allocation, onClaimed }: Props) {
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const gen = weiToGen(allocation.amount);

  if (allocation.claimed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 text-sm"
        style={{ background: "rgba(13,158,115,0.06)", border: "1px solid rgba(13,158,115,0.25)", borderRadius: "3px", color: "var(--mint-bright)" }}>
        <CheckCircle2 className="w-4 h-4" />
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{gen} GEN claimed</span>
      </div>
    );
  }

  async function handle() {
    if (txState.status === "pending" || txState.status === "confirming") return;
    try {
      const hash = await claimPayout(roundId, allocation.application_id);
      waitForTx(hash, (state) => {
        setTxState(state);
        if (state.status === "finalized") onClaimed?.();
      });
    } catch (e) {
      setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" });
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={handle}
        disabled={txState.status === "pending" || txState.status === "confirming"}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
        style={{
          background: "var(--gold)", color: "#030912", borderRadius: "3px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
        <Coins className="w-4 h-4" />
        Claim GEN Payout · {gen} GEN
      </button>
      <TransactionStateCard state={txState} />
    </div>
  );
}
