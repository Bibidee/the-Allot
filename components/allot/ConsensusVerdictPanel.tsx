"use client";

import type { Round, Verdict, Allocation } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { CanonicalHashBadge } from "@/components/ui/CanonicalHashBadge";
import { RiskFlagStack } from "@/components/ui/RiskFlagStack";
import { shortAddr } from "@/lib/genlayer/contract";
import { Gavel, Loader2 } from "lucide-react";

interface Props {
  round: Round;
  allocations: Allocation[];
}

const VERDICT_LABEL: Record<string, { label: string; color: string }> = {
  allocate:                    { label: "ALLOCATE",               color: "var(--mint-bright)" },
  no_valid_applications:       { label: "NO VALID APPLICATIONS",  color: "var(--red-bright)" },
  insufficient_evidence:       { label: "INSUFFICIENT EVIDENCE",  color: "var(--amber)" },
  policy_unclear:              { label: "POLICY UNCLEAR",         color: "var(--amber)" },
  manual_review_recommended:   { label: "MANUAL REVIEW REQUIRED", color: "var(--court-blue-b)" },
};

export function ConsensusVerdictPanel({ round, allocations }: Props) {
  if (round.status !== "finalized" && round.status !== "under_review") {
    return (
      <div style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px", padding: "16px" }}>
        <div className="flex items-center gap-2 mb-3">
          <Gavel className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
          <span className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Consensus Verdict
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          {round.status === "funded_open" ? "Awaiting submissions and close." :
           round.status === "submissions_closed" ? "Ready for allocation request." :
           "Verdict not yet available."}
        </p>
      </div>
    );
  }

  if (round.status === "under_review") {
    return (
      <div style={{ background: "rgba(200,153,30,0.04)", border: "1px solid rgba(200,153,30,0.25)", borderRadius: "3px", padding: "16px" }}>
        <div className="flex items-center gap-2 mb-3">
          <Gavel className="w-3.5 h-3.5" style={{ color: "var(--gold-text)" }} />
          <span className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace" }}>
            Consensus Verdict
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--gold-text)" }} />
          <span className="text-sm" style={{ color: "var(--gold-text)" }}>GenLayer validators deliberating…</span>
        </div>
      </div>
    );
  }

  let verdict: Verdict | null = null;
  try { verdict = round.allocation_verdict_json ? JSON.parse(round.allocation_verdict_json) : null; } catch { /* ignore */ }
  const vcfg = VERDICT_LABEL[verdict?.verdict ?? ""] ?? { label: (verdict?.verdict ?? "VERDICT").toUpperCase(), color: "var(--text-2)" };

  return (
    <div style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px", padding: "16px" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gavel className="w-3.5 h-3.5" style={{ color: "var(--mint)" }} />
          <span className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Consensus Verdict
          </span>
        </div>
        {verdict && (
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest mb-0.5"
              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              Total Allocated
            </div>
            <GenAmount wei={verdict.total_allocated} size="md" highlight />
          </div>
        )}
      </div>

      {/* Verdict stamp */}
      <div className="mb-4 p-3 text-center"
        style={{ background: `${vcfg.color}08`, border: `1px solid ${vcfg.color}30`, borderRadius: "3px" }}>
        <span className="text-lg font-bold tracking-wider"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: vcfg.color }}>
          {vcfg.label}
        </span>
      </div>

      {allocations.length > 0 && (
        <div className="mb-4">
          <div className="text-[9px] uppercase tracking-widest mb-2"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Allocation Breakdown
          </div>
          <div className="space-y-1.5">
            {allocations.map((a) => {
              const cCol = a.confidence === "high" ? "var(--mint-bright)" : a.confidence === "medium" ? "var(--amber)" : "var(--red-bright)";
              return (
                <div key={a.application_id} className="flex items-center gap-2 px-2.5 py-2"
                  style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
                  <span className="text-[10px]"
                    style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                    #{a.application_id}
                  </span>
                  <span className="text-[10px] flex-1 truncate"
                    style={{ color: "var(--court-blue-b)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {shortAddr(a.recipient)}
                  </span>
                  <GenAmount wei={a.amount} size="sm" highlight={false} className="text-[var(--mint-bright)]" />
                  <span className="text-[9px]" style={{ color: cCol }}>{a.confidence}</span>
                  {a.claimed && (
                    <span className="text-[9px] px-1 py-0.5"
                      style={{ color: "var(--mint)", border: "1px solid rgba(13,158,115,0.3)", borderRadius: "2px" }}>
                      PAID
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {verdict?.risk_flags && verdict.risk_flags.length > 0 && (
        <div className="mb-3">
          <div className="text-[9px] uppercase tracking-widest mb-2"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Risk Flags
          </div>
          <RiskFlagStack flags={verdict.risk_flags} />
        </div>
      )}

      {round.canonical_hash && <CanonicalHashBadge hash={round.canonical_hash} />}
    </div>
  );
}
