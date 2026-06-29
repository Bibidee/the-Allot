"use client";

import type { Round } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { formatDeadline } from "@/lib/utils";

interface Props { round: Round }

export function PolicyPanel({ round }: Props) {
  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 space-y-4">
      <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Allocation Policy</h3>

      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2">Policy</div>
        <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">{round.policy}</p>
      </div>

      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-2">Evidence Requirements</div>
        <p className="text-sm text-[#94a3b8] leading-relaxed whitespace-pre-wrap">{round.evidence_requirements}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1e293b]">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">Max Recipients</div>
          <span className="font-mono text-[#e2e8f0] text-sm">{round.max_recipients}</span>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">Min Payout</div>
          <GenAmount wei={round.min_payout} size="sm" />
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">Max Per Recipient</div>
          <GenAmount wei={round.max_payout_per_recipient} size="sm" />
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">Submission Deadline</div>
          <span className="text-xs text-[#94a3b8]">{formatDeadline(round.submission_deadline)}</span>
        </div>
      </div>
    </div>
  );
}
