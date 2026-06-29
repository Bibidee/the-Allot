"use client";

import { useState } from "react";
import type { Round, TxState } from "@/lib/genlayer/types";
import { refundUnallocated, waitForTx, weiToGen } from "@/lib/genlayer/contract";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { RotateCcw, CheckCircle2 } from "lucide-react";

interface Props { round: Round; onRefunded?: () => void }

export function SponsorRefundButton({ round, onRefunded }: Props) {
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const unallocated = BigInt(round.pool_amount) - BigInt(round.allocated_amount);

  if (round.unallocated_refunded) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 text-sm"
        style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px", color: "var(--text-2)" }}>
        <CheckCircle2 className="w-4 h-4" style={{ color: "var(--mint)" }} />
        Unallocated GEN refunded
      </div>
    );
  }

  if (unallocated <= 0n) {
    return (
      <p className="text-xs px-2 py-2" style={{ color: "var(--text-3)" }}>
        All GEN was allocated — no refund available.
      </p>
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
      <button onClick={handle}
        disabled={txState.status === "pending" || txState.status === "confirming"}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
        style={{
          background: "var(--vault-panel)", border: "1px solid var(--vault-border)",
          color: "var(--court-blue-b)", borderRadius: "3px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
        <RotateCcw className="w-4 h-4" />
        Refund Unallocated · {weiToGen(unallocated.toString())} GEN
      </button>
      <TransactionStateCard state={txState} />
    </div>
  );
}
