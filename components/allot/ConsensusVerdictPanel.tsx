"use client";

import type { Round, Verdict, Allocation } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { CanonicalHashBadge } from "@/components/ui/CanonicalHashBadge";
import { RiskFlagStack } from "@/components/ui/RiskFlagStack";
import { shortAddr } from "@/lib/genlayer/contract";
import { cn } from "@/lib/utils";

interface Props {
  round: Round;
  allocations: Allocation[];
}

const VERDICT_CONFIG: Record<string, { label: string; cls: string }> = {
  allocate:                    { label: "Allocate",                 cls: "text-[#34d399]" },
  no_valid_applications:       { label: "No Valid Applications",   cls: "text-[#f87171]" },
  insufficient_evidence:       { label: "Insufficient Evidence",   cls: "text-[#f97316]" },
  policy_unclear:              { label: "Policy Unclear",          cls: "text-[#f0c040]" },
  manual_review_recommended:   { label: "Manual Review Required",  cls: "text-[#a78bfa]" },
};

export function ConsensusVerdictPanel({ round, allocations }: Props) {
  if (round.status !== "finalized" && round.status !== "under_review") {
    return (
      <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5">
        <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold mb-2">Consensus Verdict</h3>
        <p className="text-sm text-[#334155]">
          {round.status === "funded_open" ? "Awaiting submissions and close." :
           round.status === "submissions_closed" ? "Ready for allocation request." :
           "Verdict not yet available."}
        </p>
      </div>
    );
  }

  if (round.status === "under_review") {
    return (
      <div className="rounded-xl border border-[#f0c040]/30 bg-[#1e1a0e] p-5">
        <h3 className="text-[10px] uppercase tracking-widest text-[#f0c040] font-semibold mb-2">Consensus Verdict</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f0c040] animate-pulse" />
          <span className="text-sm text-[#f0c040]">GenLayer validators deliberating…</span>
        </div>
      </div>
    );
  }

  let verdict: Verdict | null = null;
  try { verdict = round.allocation_verdict_json ? JSON.parse(round.allocation_verdict_json) : null; } catch { }

  const verdictStr = verdict?.verdict ?? "";
  const vcfg = VERDICT_CONFIG[verdictStr] ?? { label: verdictStr, cls: "text-[#94a3b8]" };

  return (
    <div className="rounded-xl border border-[#1e3a5f] bg-[#070d1a] p-5 space-y-4">
      <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Consensus Verdict</h3>

      <div className="flex items-center gap-3">
        <span className={cn("text-xl font-bold", vcfg.cls)}>{vcfg.label}</span>
        {verdict && (
          <div className="ml-auto text-right">
            <div className="text-[9px] uppercase tracking-widest text-[#334155]">Total Allocated</div>
            <GenAmount wei={verdict.total_allocated} size="md" highlight />
          </div>
        )}
      </div>

      {allocations.length > 0 && (
        <div className="space-y-2">
          <div className="text-[9px] uppercase tracking-widest text-[#334155]">Allocation Breakdown</div>
          {allocations.map((a) => (
            <div key={a.application_id} className="flex items-center gap-2 p-2 bg-[#0a1628] rounded border border-[#1e3a5f]/50">
              <span className="font-mono text-xs text-[#475569]">#{a.application_id}</span>
              <span className="font-mono text-xs text-[#60a5fa]">{shortAddr(a.recipient)}</span>
              <GenAmount wei={a.amount} size="sm" className="ml-auto text-[#34d399]" />
              <span className={cn("text-[9px] uppercase", a.confidence === "high" ? "text-[#34d399]" : a.confidence === "medium" ? "text-[#f0c040]" : "text-[#f87171]")}>{a.confidence}</span>
              {a.claimed && <span className="text-[9px] border border-[#34d399]/30 text-[#34d399] px-1 rounded">PAID</span>}
            </div>
          ))}
        </div>
      )}

      {verdict?.risk_flags && verdict.risk_flags.length > 0 && (
        <div>
          <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2">Risk Flags</div>
          <RiskFlagStack flags={verdict.risk_flags} />
        </div>
      )}

      {round.canonical_hash && <CanonicalHashBadge hash={round.canonical_hash} />}
    </div>
  );
}
