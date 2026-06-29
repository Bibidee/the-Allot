"use client";

import type { RoundStatus } from "@/lib/genlayer/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<RoundStatus, { label: string; cls: string }> = {
  funded_open:        { label: "Open",          cls: "bg-[#0d3d2b] text-[#34d399] border border-[#34d399]/30" },
  submissions_closed: { label: "Closed",        cls: "bg-[#1e293b] text-[#94a3b8] border border-[#475569]/30" },
  under_review:       { label: "Under Review",  cls: "bg-[#1e1a0e] text-[#f0c040] border border-[#f0c040]/30" },
  finalized:          { label: "Finalized",     cls: "bg-[#0d2449] text-[#60a5fa] border border-[#3b82f6]/30" },
  cancelled:          { label: "Cancelled",     cls: "bg-[#2a0d0d] text-[#f87171] border border-[#ef4444]/30" },
};

export function RoundStatusPill({ status, className }: { status: RoundStatus; className?: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: "bg-[#1e293b] text-[#94a3b8]" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest", cfg.cls, className)}>
      {cfg.label}
    </span>
  );
}
