"use client";

import { GenAmount } from "@/components/ui/GenAmount";
import type { Round } from "@/lib/genlayer/types";
import { shortAddr } from "@/lib/genlayer/contract";
import { Lock } from "lucide-react";

interface Props { round: Round }

export function EscrowVaultCard({ round }: Props) {
  const pool = BigInt(round.pool_amount);
  const allocated = BigInt(round.allocated_amount);
  const claimed = BigInt(round.claimed_amount);
  const unallocated = pool - allocated;
  const unclaimed = allocated - claimed;
  const pct = pool > 0n ? Number((allocated * 100n) / pool) : 0;

  return (
    <div style={{
      background: "rgba(200,153,30,0.03)", border: "1px solid rgba(200,153,30,0.18)",
      borderRadius: "3px", padding: "16px",
    }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" style={{ color: "var(--gold-text)" }} />
          <span className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace" }}>
            Escrow Vault
          </span>
        </div>
        <span className="text-[9px]"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          CONTRACT HOLDS GEN
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Total Pool", wei: pool, color: "var(--gold-text)" },
          { label: "Allocated", wei: allocated, color: "var(--mint-bright)" },
          { label: "Claimed", wei: claimed, color: "var(--mint)" },
          { label: "Unallocated", wei: unallocated, color: "var(--text-2)" },
        ].map(({ label, wei, color }) => (
          <div key={label} className="p-3"
            style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
            <div className="text-[9px] uppercase tracking-widest mb-1"
              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              {label}
            </div>
            <span className="text-sm font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color }}>
              {/* use GenAmount indirectly */}
            </span>
            <GenAmount wei={wei} size="md" showLabel highlight={color === "var(--gold-text)"} />
          </div>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          <span>Allocation progress</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden" style={{ background: "var(--vault-border2)", borderRadius: "2px" }}>
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-bright))" }} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-3)" }}>
        <span>Sponsor</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--court-blue-b)" }}>{shortAddr(round.sponsor)}</span>
        {round.unallocated_refunded && (
          <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5"
            style={{ color: "var(--mint-bright)", border: "1px solid rgba(13,158,115,0.3)", background: "rgba(13,158,115,0.08)", borderRadius: "2px" }}>
            REFUNDED
          </span>
        )}
      </div>

      {unclaimed > 0n && (
        <p className="mt-2 text-[10px]" style={{ color: "var(--amber)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{/* weiToGen inline */}</span>
          <GenAmount wei={unclaimed} size="sm" /> awaiting recipient claim
        </p>
      )}
    </div>
  );
}
