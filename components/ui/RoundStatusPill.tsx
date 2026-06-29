"use client";

import type { RoundStatus } from "@/lib/genlayer/types";

const MAP: Record<string, { label: string; color: string }> = {
  funded_open:         { label: "OPEN",      color: "var(--gold-text)" },
  submissions_closed:  { label: "CLOSED",    color: "var(--amber)" },
  under_review:        { label: "IN REVIEW", color: "var(--court-blue-b)" },
  finalized:           { label: "FINALIZED", color: "var(--mint-bright)" },
  cancelled:           { label: "VOID",      color: "var(--text-2)" },
};

export function RoundStatusPill({ status, className }: { status: RoundStatus | string; className?: string }) {
  const { label, color } = MAP[status] ?? { label: status.toUpperCase(), color: "var(--text-2)" };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 uppercase tracking-widest ${className ?? ""}`}
      style={{
        color, border: `1px solid ${color}30`, background: `${color}0a`,
        borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace",
      }}>
      {label}
    </span>
  );
}
