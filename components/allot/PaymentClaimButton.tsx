"use client";

import { useState } from "react";
import type { Allocation, TxState } from "@/lib/genlayer/types";
import { claimPayout, waitForTx, weiToGen } from "@/lib/genlayer/contract";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { Coins } from "lucide-react";

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
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0d3d2b] border border-[#34d399]/30 rounded-lg text-sm text-[#34d399]">
        <Coins className="w-4 h-4" />
        <span>{gen} GEN claimed</span>
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
      <button
        onClick={handle}
        disabled={txState.status === "pending" || txState.status === "confirming"}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#f0c040] hover:bg-[#fcd34d] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1a] font-bold text-sm rounded-lg transition-all"
      >
        <Coins className="w-4 h-4" />
        Claim GEN Payout · {gen} GEN
      </button>
      <TransactionStateCard state={txState} />
    </div>
  );
}
