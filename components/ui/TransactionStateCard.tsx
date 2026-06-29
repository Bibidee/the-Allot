"use client";

import type { TxState } from "@/lib/genlayer/types";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { state: TxState; className?: string }

const EXPLORER = "https://explorer-studio.genlayer.com";

export function TransactionStateCard({ state, className }: Props) {
  if (state.status === "idle") return null;

  const config = {
    pending:    { icon: <Loader2 className="animate-spin w-4 h-4 text-[#f0c040]" />, label: "Broadcasting", cls: "border-[#f0c040]/30" },
    confirming: { icon: <Clock className="w-4 h-4 text-[#60a5fa]" />, label: "Confirming", cls: "border-[#3b82f6]/30" },
    finalized:  { icon: <CheckCircle2 className="w-4 h-4 text-[#34d399]" />, label: "Finalized", cls: "border-[#34d399]/30" },
    error:      { icon: <XCircle className="w-4 h-4 text-[#f87171]" />, label: "Failed", cls: "border-[#ef4444]/30" },
    idle:       { icon: null, label: "", cls: "" },
  }[state.status];

  return (
    <div className={cn("p-3 bg-[#0a0f1a] border rounded-lg", config.cls, className)}>
      <div className="flex items-center gap-2 mb-1">
        {config.icon}
        <span className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-widest">{config.label}</span>
      </div>
      {state.hash && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#475569] uppercase tracking-wider">Tx Hash</span>
          <a
            href={`${EXPLORER}/tx/${state.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-[#60a5fa] hover:underline break-all"
          >
            {state.hash.slice(0, 20)}…{state.hash.slice(-8)}
          </a>
        </div>
      )}
      {state.error && <p className="text-xs text-[#f87171] mt-1">{state.error}</p>}
    </div>
  );
}
