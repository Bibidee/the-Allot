"use client";

import { useState } from "react";
import type { Round, TxState } from "@/lib/genlayer/types";
import { refundUnallocated, waitForTx, weiToGen } from "@/lib/genlayer/contract";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { RotateCcw } from "lucide-react";

interface Props { round: Round; onRefunded?: () => void }

export function SponsorRefundButton({ round, onRefunded }: Props) {
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const unallocated = BigInt(round.pool_amount) - BigInt(round.allocated_amount);

  if (round.unallocated_refunded) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0d1829] border border-[#1e3a5f] rounded-lg text-sm text-[#475569]">
        <RotateCcw className="w-4 h-4" />
        Unallocated GEN refunded
      </div>
    );
  }

  if (unallocated <= 0n) {
    return (
      <div className="text-xs text-[#475569] px-4 py-2">All GEN was allocated — no refund available.</div>
    );
  }

  async function handle() {
    if (txState.status === "pending" || txState.status === "confirming") return;
    try {
      const hash = await refundUnallocated(round.round_id);
      waitForTx(hash, (state) => {
        setTxState(state);
        if (state.status === "finalized") onRefunded?.();
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
        className="flex items-center gap-2 px-4 py-2.5 bg-[#0a1628] hover:bg-[#0d2049] disabled:opacity-50 border border-[#1e3a5f] text-[#60a5fa] font-semibold text-sm rounded-lg transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Refund Unallocated GEN · {weiToGen(unallocated.toString())} GEN
      </button>
      <TransactionStateCard state={txState} />
    </div>
  );
}
