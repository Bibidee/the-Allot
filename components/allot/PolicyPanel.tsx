"use client";

import type { Round } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { formatDeadline } from "@/lib/utils";
import { ScrollText } from "lucide-react";

interface Props { round: Round }

export function PolicyPanel({ round }: Props) {
  return (
    <div style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px", padding: "16px" }}>
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
        <span className="text-[9px] uppercase tracking-[0.2em]"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Allocation Policy
        </span>
      </div>

      <div className="mb-4">
        <div className="text-[9px] uppercase tracking-widest mb-2"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Policy
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-1)" }}>
          {round.policy}
        </p>
      </div>

      <div className="mb-4">
        <div className="text-[9px] uppercase tracking-widest mb-2"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Evidence Requirements
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>
          {round.evidence_requirements}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3"
        style={{ borderTop: "1px solid var(--vault-border)" }}>
        {[
          { label: "Max Recipients", value: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-1)", fontSize: "13px" }}>{round.max_recipients}</span> },
          { label: "Min Payout", value: <GenAmount wei={round.min_payout} size="sm" /> },
          { label: "Max Per Recipient", value: <GenAmount wei={round.max_payout_per_recipient} size="sm" /> },
          { label: "Submission Deadline", value: <span className="text-xs" style={{ color: "var(--text-2)" }}>{formatDeadline(round.submission_deadline)}</span> },
        ].map(({ label, value }) => (
          <div key={label} className="p-2"
            style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
            <div className="text-[9px] uppercase tracking-widest mb-1"
              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              {label}
            </div>
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}
