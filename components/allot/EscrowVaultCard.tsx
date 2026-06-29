"use client";

import { GenAmount } from "@/components/ui/GenAmount";
import type { Round } from "@/lib/genlayer/types";
import { shortAddr } from "@/lib/genlayer/contract";

interface Props { round: Round }

export function EscrowVaultCard({ round }: Props) {
  const pool = BigInt(round.pool_amount);
  const allocated = BigInt(round.allocated_amount);
  const claimed = BigInt(round.claimed_amount);
  const unallocated = pool - allocated;
  const unclaimed = allocated - claimed;

  const pct = pool > 0n ? Number((allocated * 100n) / pool) : 0;

  return (
    <div className="rounded-xl border border-[#1e3a5f] bg-[#070d1a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Escrow Vault</h3>
        <span className="text-[10px] font-mono text-[#334155]">CONTRACT HOLDS GEN</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 bg-[#0a1628] rounded-lg border border-[#1e3a5f]/50">
          <div className="text-[9px] uppercase tracking-widest text-[#475569] mb-1">Total Pool</div>
          <GenAmount wei={pool} size="lg" highlight />
        </div>
        <div className="p-3 bg-[#0a1628] rounded-lg border border-[#1e3a5f]/50">
          <div className="text-[9px] uppercase tracking-widest text-[#475569] mb-1">Allocated</div>
          <GenAmount wei={allocated} size="lg" />
        </div>
        <div className="p-3 bg-[#0a1628] rounded-lg border border-[#1e3a5f]/50">
          <div className="text-[9px] uppercase tracking-widest text-[#475569] mb-1">Claimed</div>
          <GenAmount wei={claimed} size="lg" className="text-[#34d399]" />
        </div>
        <div className="p-3 bg-[#0a1628] rounded-lg border border-[#1e3a5f]/50">
          <div className="text-[9px] uppercase tracking-widest text-[#475569] mb-1">Unallocated</div>
          <GenAmount wei={unallocated} size="lg" className="text-[#94a3b8]" />
        </div>
      </div>

      {/* Allocation bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-[#475569] mb-1">
          <span>Allocation Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#f0c040] to-[#f59e0b] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-[#475569]">
        <span>Sponsor</span>
        <span className="font-mono text-[#60a5fa]">{shortAddr(round.sponsor)}</span>
        {round.unallocated_refunded && (
          <span className="ml-auto px-2 py-0.5 bg-[#0d3d2b] text-[#34d399] border border-[#34d399]/30 rounded text-[9px] uppercase tracking-wider">Refunded</span>
        )}
      </div>

      {unclaimed > 0n && (
        <div className="mt-2 text-[10px] text-[#f0c040]">
          <GenAmount wei={unclaimed} size="sm" /> awaiting claim
        </div>
      )}
    </div>
  );
}
