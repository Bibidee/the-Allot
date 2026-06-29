"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRounds, weiToGen } from "@/lib/genlayer/contract";
import type { RoundSummary } from "@/lib/genlayer/types";
import { formatDeadline, isDeadlinePassed } from "@/lib/utils";
import { Radio, PlusSquare, Loader2, Lock } from "lucide-react";

function statusLabel(s: string) {
  const map: Record<string, string> = {
    funded_open: "OPEN", submissions_closed: "CLOSED",
    under_review: "IN REVIEW", finalized: "FINALIZED", cancelled: "VOID",
  };
  return map[s] ?? s.toUpperCase();
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    funded_open: "var(--gold-text)", submissions_closed: "var(--amber)",
    under_review: "var(--court-blue-b)", finalized: "var(--mint-bright)",
    cancelled: "var(--text-2)",
  };
  return map[s] ?? "var(--text-2)";
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    listRounds().then(setRounds).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const statuses = ["all", "funded_open", "submissions_closed", "under_review", "finalized"];
  const filtered = filter === "all" ? rounds : rounds.filter(r => r.status === filter);

  return (
    <div style={{ maxWidth: "900px" }}>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4" style={{ color: "var(--court-blue-b)" }} />
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Live Rounds
            </h1>
          </div>
          <p className="text-xs" style={{ color: "var(--text-2)" }}>
            Active allocation courts on GenLayer StudioNet
          </p>
        </div>
        <Link href="/rounds/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all"
          style={{ background: "var(--gold)", color: "#030912", borderRadius: "3px", fontFamily: "'Space Grotesk', sans-serif" }}>
          <PlusSquare className="w-4 h-4" />
          Create Round
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1 text-[11px] uppercase tracking-widest transition-all whitespace-nowrap"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              borderRadius: "3px",
              border: filter === s ? "1px solid var(--gold)" : "1px solid var(--vault-border2)",
              background: filter === s ? "rgba(200,153,30,0.08)" : "var(--vault-surface)",
              color: filter === s ? "var(--gold-text)" : "var(--text-2)",
            }}>
            {s === "all" ? "All" : statusLabel(s)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-16 justify-center" style={{ color: "var(--text-2)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading docket…</span>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm" style={{ background: "rgba(168,50,50,0.08)", border: "1px solid rgba(168,50,50,0.3)", borderRadius: "3px", color: "var(--red-bright)" }}>
          {error} — check contract address
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center" style={{ border: "1px dashed var(--vault-border2)", borderRadius: "3px" }}>
          <Lock className="w-6 h-6 mx-auto mb-3" style={{ color: "var(--text-3)" }} />
          <p className="text-sm mb-2" style={{ color: "var(--text-2)" }}>No rounds on this docket.</p>
          <Link href="/rounds/new" className="text-xs" style={{ color: "var(--gold-text)" }}>
            Open first allocation round →
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {filtered.slice().reverse().map((r) => {
          const pct = r.pool_amount !== "0"
            ? Number((BigInt(r.allocated_amount || "0") * 100n) / BigInt(r.pool_amount))
            : 0;
          const col = statusColor(r.status);
          return (
            <Link key={r.round_id} href={`/rounds/${r.round_id}`} className="block group">
              <div className="p-5 transition-all"
                style={{
                  background: "var(--vault-panel)",
                  border: "1px solid var(--vault-border)",
                  borderLeft: `3px solid ${col}`,
                  borderRadius: "3px",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--vault-panel2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--vault-panel)")}>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[9px]"
                        style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                        CASE #{r.round_id}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 uppercase tracking-widest"
                        style={{
                          color: col, border: `1px solid ${col}30`,
                          background: `${col}0a`, borderRadius: "2px",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                        {statusLabel(r.status)}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5"
                        style={{
                          color: "var(--text-2)", border: "1px solid var(--vault-border2)",
                          borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace",
                        }}>
                        {r.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold truncate mb-1"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-2)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {r.app_count} filings
                      </span>
                      <span style={{ color: isDeadlinePassed(r.submission_deadline) ? "var(--amber)" : "var(--text-2)" }}>
                        {r.submission_deadline === "0" ? "—" :
                          isDeadlinePassed(r.submission_deadline) ? "Submissions closed" : `Closes ${formatDeadline(r.submission_deadline)}`}
                      </span>
                      <span className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
                        {r.sponsor.slice(0, 10)}…
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[9px] uppercase tracking-widest mb-1"
                      style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                      Vault
                    </div>
                    <div className="text-base font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--gold-text)" }}>
                      {weiToGen(r.pool_amount)}
                      <span className="text-[10px] ml-1" style={{ color: "var(--text-2)" }}>GEN</span>
                    </div>
                    {r.allocated_amount !== "0" && (
                      <div className="text-[11px] mt-0.5"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--mint-bright)" }}>
                        {weiToGen(r.allocated_amount)} alloc.
                      </div>
                    )}
                  </div>
                </div>

                {/* Allocation rail */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--vault-border2)" }}>
                    <div className="h-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, var(--mint), var(--mint-bright))",
                      }} />
                  </div>
                  <span className="text-[9px]"
                    style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", minWidth: "28px" }}>
                    {pct}%
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
