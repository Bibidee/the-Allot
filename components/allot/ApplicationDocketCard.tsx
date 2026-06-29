"use client";

import type { Application, Allocation } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { EvidenceLinkList } from "./EvidenceLinkList";
import { shortAddr } from "@/lib/genlayer/contract";
import { formatDeadline } from "@/lib/utils";
import { FileText } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  submitted:          { label: "FILED",     color: "var(--text-2)" },
  included_in_review: { label: "IN REVIEW", color: "var(--court-blue-b)" },
  allocated:          { label: "APPROVED",  color: "var(--mint-bright)" },
  rejected:           { label: "REJECTED",  color: "var(--red-bright)" },
  invalid:            { label: "INVALID",   color: "var(--amber)" },
};

interface Props {
  app: Application;
  allocation?: Allocation;
}

export function ApplicationDocketCard({ app, allocation }: Props) {
  const s = STATUS_MAP[app.status] ?? { label: app.status.toUpperCase(), color: "var(--text-2)" };
  const confidenceColor = allocation
    ? allocation.confidence === "high" ? "var(--mint-bright)"
    : allocation.confidence === "medium" ? "var(--amber)"
    : "var(--red-bright)"
    : "";

  return (
    <div style={{
      background: "var(--vault-panel)", border: "1px solid var(--vault-border)",
      borderLeft: `3px solid ${s.color}`, borderRadius: "3px", padding: "16px",
    }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <FileText className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-3)" }} />
            <span className="text-[9px]"
              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              DOC-{app.application_id}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 uppercase tracking-widest"
              style={{ color: s.color, border: `1px solid ${s.color}30`, background: `${s.color}0a`, borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
              {s.label}
            </span>
          </div>
          <h4 className="text-sm font-semibold mb-0.5"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
            {app.display_name}
          </h4>
          <p className="text-xs" style={{ color: "var(--text-2)" }}>{app.request_title}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[9px] uppercase tracking-widest mb-1"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Requested
          </div>
          <GenAmount wei={app.requested_amount} size="sm" />
          {allocation && (
            <>
              <div className="text-[9px] uppercase tracking-widest mt-2 mb-0.5"
                style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                Allocated
              </div>
              <span className="text-sm font-semibold"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--mint-bright)" }}>
                {/* safe to call weiToGen via GenAmount */}
              </span>
              <GenAmount wei={allocation.amount} size="sm" highlight={false}
                className="text-[var(--mint-bright)]" />
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-2)" }}>
        {app.request_summary}
      </p>

      {/* Evidence */}
      <div className="mb-3">
        <div className="text-[9px] uppercase tracking-widest mb-1.5"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Evidence
        </div>
        <EvidenceLinkList urls={app.evidence_urls} />
      </div>

      {/* Verdict */}
      {allocation && (
        <div className="pt-2 flex items-center gap-4 flex-wrap"
          style={{ borderTop: "1px solid var(--vault-border)" }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>Confidence</span>
            <span className="text-xs font-semibold" style={{ color: confidenceColor }}>{allocation.confidence}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>Reason</span>
            <span className="text-xs" style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>{allocation.reason_code.replace(/_/g, " ")}</span>
          </div>
          {allocation.claimed && (
            <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5"
              style={{ color: "var(--mint-bright)", border: "1px solid var(--mint-bright)30", background: "rgba(13,158,115,0.08)", borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
              CLAIMED
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center gap-3 text-[10px]" style={{ color: "var(--text-3)" }}>
        <span>Recipient: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--court-blue-b)" }}>{shortAddr(app.recipient_address)}</span></span>
        <span className="ml-auto">{formatDeadline(app.submitted_at)}</span>
      </div>
    </div>
  );
}
