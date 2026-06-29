"use client";

import type { TxState } from "@/lib/genlayer/types";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

const EXPLORER = "https://explorer-studio.genlayer.com";

interface Props { state: TxState; className?: string }

export function TransactionStateCard({ state, className }: Props) {
  if (state.status === "idle") return null;

  const cfg = {
    pending:     { icon: <Loader2 className="animate-spin w-4 h-4" />, color: "var(--gold-text)", border: "rgba(200,153,30,0.25)", bg: "rgba(200,153,30,0.06)", label: "Broadcasting transaction…" },
    confirming:  { icon: <Clock className="w-4 h-4" />, color: "var(--court-blue-b)", border: "rgba(96,165,250,0.25)", bg: "rgba(96,165,250,0.04)", label: "Awaiting confirmation…" },
    finalized:   { icon: <CheckCircle2 className="w-4 h-4" />, color: "var(--mint-bright)", border: "rgba(13,158,115,0.25)", bg: "rgba(13,158,115,0.06)", label: "Finalized on-chain" },
    error:       { icon: <XCircle className="w-4 h-4" />, color: "var(--red-bright)", border: "rgba(168,50,50,0.3)", bg: "rgba(168,50,50,0.08)", label: state.error ?? "Transaction failed" },
    unconfirmed: { icon: <Clock className="w-4 h-4" />, color: "var(--amber)", border: "rgba(200,120,30,0.3)", bg: "rgba(200,120,30,0.06)", label: "Sent — confirmation timed out" },
    idle:        { icon: null, color: "", border: "", bg: "", label: "" },
  }[state.status];

  if (!cfg || !cfg.icon) return null;

  return (
    <div className={`p-3 flex items-start gap-3 ${className ?? ""}`}
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "3px" }}>
      <span style={{ color: cfg.color, flexShrink: 0, marginTop: "1px" }}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</p>
        {state.hash && (
          <a href={`${EXPLORER}/tx/${state.hash}`} target="_blank" rel="noopener noreferrer"
            className="text-[10px] truncate block mt-1 hover:underline"
            style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>
            ↗ {state.hash.slice(0, 20)}…{state.hash.slice(-8)}
          </a>
        )}
        {state.error && state.status === "unconfirmed" && (
          <p className="text-[11px] mt-1" style={{ color: "var(--amber)" }}>{state.error}</p>
        )}
      </div>
    </div>
  );
}
