"use client";

import { ArrowRight, Vault, Gavel, Coins, RotateCcw, Wallet } from "lucide-react";
import { GenAmount } from "@/components/ui/GenAmount";
import type { Round } from "@/lib/genlayer/types";
import { cn } from "@/lib/utils";

interface Props { round: Round }

type StageState = "empty" | "active" | "complete" | "blocked";

interface Stage {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  amount?: bigint;
  state: StageState;
}

export function AllocationRail({ round }: Props) {
  const pool = BigInt(round.pool_amount);
  const allocated = BigInt(round.allocated_amount);
  const claimed = BigInt(round.claimed_amount);
  const unallocated = pool - allocated;

  function getStageState(stage: string): StageState {
    const s = round.status;
    switch (stage) {
      case "deposit":
        return pool > 0n ? "complete" : "empty";
      case "escrow":
        return s === "funded_open" ? "active" : pool > 0n ? "complete" : "empty";
      case "verdict":
        if (s === "under_review") return "active";
        if (s === "finalized") return "complete";
        if (s === "submissions_closed") return "active";
        return "empty";
      case "claims":
        if (s !== "finalized") return "blocked";
        return claimed > 0n ? (claimed >= allocated ? "complete" : "active") : "active";
      case "refund":
        if (s !== "finalized") return "blocked";
        return round.unallocated_refunded ? "complete" : unallocated > 0n ? "active" : "empty";
      default:
        return "empty";
    }
  }

  const stages: Stage[] = [
    {
      id: "deposit",
      label: "Sponsor Wallet",
      sublabel: "Deposit",
      icon: <Wallet className="w-4 h-4" />,
      amount: pool,
      state: getStageState("deposit"),
    },
    {
      id: "escrow",
      label: "Escrow Vault",
      sublabel: "Locked GEN",
      icon: <Vault className="w-4 h-4" />,
      amount: pool,
      state: getStageState("escrow"),
    },
    {
      id: "verdict",
      label: "GenLayer Verdict",
      sublabel: "AI Consensus",
      icon: <Gavel className="w-4 h-4" />,
      amount: allocated,
      state: getStageState("verdict"),
    },
    {
      id: "claims",
      label: "Recipient Claims",
      sublabel: "GEN Payouts",
      icon: <Coins className="w-4 h-4" />,
      amount: claimed,
      state: getStageState("claims"),
    },
    {
      id: "refund",
      label: "Sponsor Refund",
      sublabel: "Unallocated",
      icon: <RotateCcw className="w-4 h-4" />,
      amount: unallocated,
      state: getStageState("refund"),
    },
  ];

  const stateClasses: Record<StageState, string> = {
    empty:    "border-[#1e293b] bg-[#070d1a] text-[#334155]",
    active:   "border-[#f0c040]/50 bg-[#1e1a0e] text-[#f0c040]",
    complete: "border-[#34d399]/50 bg-[#0d3d2b] text-[#34d399]",
    blocked:  "border-[#1e293b] bg-[#070d1a] text-[#1e293b] opacity-40",
  };

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#040810] p-5">
      <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold mb-4">Allocation Rail</h3>
      <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center gap-1 flex-1 min-w-[120px]">
            <div className={cn("flex-1 rounded-lg border p-3 flex flex-col gap-1 transition-all", stateClasses[stage.state])}>
              <div className="flex items-center gap-1.5">
                {stage.icon}
                <span className="text-[9px] uppercase tracking-widest font-semibold">{stage.label}</span>
              </div>
              <div className="text-[9px] opacity-60">{stage.sublabel}</div>
              {stage.amount !== undefined && (
                <GenAmount wei={stage.amount} size="sm" className={stage.state === "complete" ? "text-[#34d399]" : stage.state === "active" ? "text-[#f0c040]" : ""} />
              )}
            </div>
            {i < stages.length - 1 && (
              <ArrowRight className={cn("w-3 h-3 flex-shrink-0", stage.state === "complete" ? "text-[#34d399]" : "text-[#1e293b]")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
