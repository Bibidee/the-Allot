"use client";

import { ArrowRight, Wallet, Lock, Gavel, Coins, RotateCcw } from "lucide-react";
import { GenAmount } from "@/components/ui/GenAmount";
import type { Round } from "@/lib/genlayer/types";

interface Props { round: Round }

type State = "empty" | "active" | "complete" | "blocked";

const STATE_STYLE: Record<State, { border: string; bg: string; color: string }> = {
  empty:    { border: "var(--vault-border)", bg: "var(--vault-panel)", color: "var(--text-3)" },
  active:   { border: "rgba(200,153,30,0.4)", bg: "rgba(200,153,30,0.05)", color: "var(--gold-text)" },
  complete: { border: "rgba(13,158,115,0.4)", bg: "rgba(13,158,115,0.05)", color: "var(--mint-bright)" },
  blocked:  { border: "var(--vault-border)", bg: "var(--vault-surface)", color: "var(--text-3)" },
};

export function AllocationRail({ round }: Props) {
  const pool = BigInt(round.pool_amount);
  const allocated = BigInt(round.allocated_amount);
  const claimed = BigInt(round.claimed_amount);
  const unallocated = pool - allocated;
  const s = round.status;

  function st(stage: string): State {
    switch (stage) {
      case "deposit": return pool > 0n ? "complete" : "empty";
      case "escrow":  return s === "funded_open" ? "active" : pool > 0n ? "complete" : "empty";
      case "verdict": return s === "under_review" ? "active" : s === "finalized" ? "complete" : s === "submissions_closed" ? "active" : "empty";
      case "claims":  return s !== "finalized" ? "blocked" : claimed > 0n ? (claimed >= allocated ? "complete" : "active") : "active";
      case "refund":  return s !== "finalized" ? "blocked" : round.unallocated_refunded ? "complete" : unallocated > 0n ? "active" : "empty";
      default: return "empty";
    }
  }

  const stages = [
    { id: "deposit", label: "Sponsor Wallet", sub: "Deposit", icon: <Wallet className="w-3.5 h-3.5" />, amount: pool },
    { id: "escrow",  label: "Escrow Vault",   sub: "Locked", icon: <Lock className="w-3.5 h-3.5" />,   amount: pool },
    { id: "verdict", label: "AI Verdict",     sub: "Consensus", icon: <Gavel className="w-3.5 h-3.5" />, amount: allocated },
    { id: "claims",  label: "Recipient",      sub: "Claimed", icon: <Coins className="w-3.5 h-3.5" />, amount: claimed },
    { id: "refund",  label: "Sponsor",        sub: "Refund", icon: <RotateCcw className="w-3.5 h-3.5" />, amount: unallocated },
  ];

  return (
    <div style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px", padding: "16px" }}>
      <div className="text-[9px] uppercase tracking-[0.2em] mb-4"
        style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
        Payout Rail
      </div>
      <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {stages.map((stage, i) => {
          const state = st(stage.id);
          const style = STATE_STYLE[state];
          return (
            <div key={stage.id} className="flex items-center gap-1 flex-1 min-w-[90px]">
              <div className="flex-1 p-2.5 transition-all"
                style={{ border: `1px solid ${style.border}`, background: style.bg, borderRadius: "3px", opacity: state === "blocked" ? 0.4 : 1 }}>
                <div className="flex items-center gap-1 mb-1" style={{ color: style.color }}>
                  {stage.icon}
                  <span className="text-[8px] uppercase tracking-widest font-semibold"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {stage.label}
                  </span>
                </div>
                <div className="text-[8px] mb-1" style={{ color: "var(--text-3)" }}>{stage.sub}</div>
                <GenAmount wei={stage.amount} size="sm" showLabel={false} />
              </div>
              {i < stages.length - 1 && (
                <ArrowRight className="w-2.5 h-2.5 flex-shrink-0"
                  style={{ color: state === "complete" ? "var(--mint)" : "var(--vault-border2)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
