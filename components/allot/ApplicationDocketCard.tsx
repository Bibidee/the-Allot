"use client";

import type { Application, Allocation } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { EvidenceLinkList } from "./EvidenceLinkList";
import { shortAddr, weiToGen } from "@/lib/genlayer/contract";
import { formatDeadline } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  app: Application;
  allocation?: Allocation;
}

const STATUS_STYLE: Record<string, string> = {
  submitted:          "text-[#94a3b8] border-[#334155]",
  included_in_review: "text-[#f0c040] border-[#f0c040]/30",
  allocated:          "text-[#34d399] border-[#34d399]/30",
  rejected:           "text-[#f87171] border-[#ef4444]/30",
  invalid:            "text-[#f97316] border-[#f97316]/30",
};

export function ApplicationDocketCard({ app, allocation }: Props) {
  const style = STATUS_STYLE[app.status] ?? STATUS_STYLE.submitted;
  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono text-[#475569]">#{app.application_id}</span>
            <span className={cn("text-[9px] uppercase tracking-widest border px-1.5 py-0.5 rounded", style)}>{app.status}</span>
          </div>
          <h4 className="text-sm font-semibold text-[#e2e8f0]">{app.display_name}</h4>
          <div className="text-xs text-[#475569] mt-0.5">{app.request_title}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">Requested</div>
          <GenAmount wei={app.requested_amount} size="sm" />
          {allocation && (
            <>
              <div className="text-[9px] uppercase tracking-widest text-[#334155] mt-1 mb-0.5">Allocated</div>
              <GenAmount wei={allocation.amount} size="sm" className="text-[#34d399]" />
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-[#64748b] leading-relaxed">{app.request_summary}</p>

      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1.5">Evidence</div>
        <EvidenceLinkList urls={app.evidence_urls} />
      </div>

      {allocation && (
        <div className="pt-2 border-t border-[#1e293b] flex items-center gap-3">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[#334155]">Confidence </span>
            <span className={cn("text-xs font-semibold", allocation.confidence === "high" ? "text-[#34d399]" : allocation.confidence === "medium" ? "text-[#f0c040]" : "text-[#f87171]")}>
              {allocation.confidence}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[#334155]">Reason </span>
            <span className="text-xs text-[#94a3b8] font-mono">{allocation.reason_code.replace(/_/g, " ")}</span>
          </div>
          {allocation.claimed && (
            <span className="ml-auto text-[9px] uppercase text-[#34d399] border border-[#34d399]/30 px-1.5 py-0.5 rounded">Claimed</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 text-[10px] text-[#334155]">
        <span>Recipient <span className="font-mono text-[#60a5fa]">{shortAddr(app.recipient_address)}</span></span>
        <span className="ml-auto">{formatDeadline(app.submitted_at)}</span>
      </div>
    </div>
  );
}
