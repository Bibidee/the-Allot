"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRounds } from "@/lib/genlayer/contract";
import type { RoundSummary } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { RoundStatusPill } from "@/components/ui/RoundStatusPill";
import { formatDeadline, isDeadlinePassed } from "@/lib/utils";
import { PlusCircle, Loader2 } from "lucide-react";

export default function RoundsPage() {
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRounds().then(setRounds).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f4f8]">Allocation Rounds</h1>
          <p className="text-sm text-[#475569] mt-0.5">Active and completed allocation courts on StudioNet</p>
        </div>
        <Link
          href="/rounds/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#f0c040] hover:bg-[#fcd34d] text-[#0a0f1a] font-bold text-sm rounded-lg transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          New Round
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[#475569] py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading rounds…</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#2a0d0d] border border-[#ef4444]/30 rounded-xl text-sm text-[#f87171]">
          {error}. Check contract address in .env.local
        </div>
      )}

      {!loading && !error && rounds.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#475569] mb-4">No rounds yet.</p>
          <Link href="/rounds/new" className="text-sm text-[#f0c040] hover:underline">Create the first round →</Link>
        </div>
      )}

      <div className="space-y-3">
        {rounds.map((r) => (
          <Link key={r.round_id} href={`/rounds/${r.round_id}`} className="block">
            <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 hover:border-[#1e3a5f] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#334155]">#{r.round_id}</span>
                    <RoundStatusPill status={r.status} />
                    <span className="text-xs text-[#334155] bg-[#0a0f1a] border border-[#1e293b] px-2 py-0.5 rounded">{r.category}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#e2e8f0] truncate">{r.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#475569]">
                    <span>{r.app_count} applications</span>
                    <span className={isDeadlinePassed(r.submission_deadline) ? "text-[#f87171]" : ""}>
                      {isDeadlinePassed(r.submission_deadline) ? "Closed" : `Closes ${formatDeadline(r.submission_deadline)}`}
                    </span>
                    <span className="font-mono text-[#334155] text-[10px] truncate">{r.sponsor.slice(0, 10)}…</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">Pool</div>
                  <GenAmount wei={r.pool_amount} size="md" highlight />
                  {r.allocated_amount !== "0" && (
                    <>
                      <div className="text-[9px] uppercase tracking-widest text-[#334155] mt-1 mb-0.5">Allocated</div>
                      <GenAmount wei={r.allocated_amount} size="sm" className="text-[#34d399]" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
