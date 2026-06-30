"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRounds } from "@/lib/genlayer/contract";
import { weiToGen } from "@/lib/genlayer/contract";
import type { RoundSummary } from "@/lib/genlayer/types";
import { Scale, Lock, Gavel, ArrowRight, PlusSquare, TrendingUp, CheckCircle2, Clock } from "lucide-react";

function statusColor(s: string) {
  if (s === "funded_open") return "var(--gold-text)";
  if (s === "submissions_closed") return "var(--amber)";
  if (s === "under_review") return "var(--court-blue-b)";
  if (s === "finalized") return "var(--mint-bright)";
  if (s === "cancelled") return "var(--text-2)";
  return "var(--text-2)";
}

function statusLabel(s: string) {
  if (s === "funded_open") return "OPEN";
  if (s === "submissions_closed") return "CLOSED";
  if (s === "under_review") return "IN REVIEW";
  if (s === "finalized") return "FINALIZED";
  if (s === "cancelled") return "CANCELLED";
  return s.toUpperCase();
}

export default function CourtPage() {
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRounds().then(setRounds).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalEscrowed = rounds.reduce((s, r) => s + BigInt(r.pool_amount), 0n);
  const openRounds = rounds.filter(r => r.status === "funded_open").length;
  const finalizedRounds = rounds.filter(r => r.status === "finalized").length;
  const totalAllocated = rounds.reduce((s, r) => s + BigInt(r.allocated_amount || "0"), 0n);

  return (
    <div style={{ maxWidth: "1100px" }}>

      {/* Court header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-px h-4" style={{ background: "var(--gold)" }} />
            <span className="text-[10px] uppercase tracking-[0.25em]"
              style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>
              Allocation Court · StudioNet
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
            Vault Court System
          </h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Sponsors escrow GEN. GenLayer judges. Recipients claim.
          </p>
        </div>
        <Link href="/rounds/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all"
          style={{
            background: "var(--gold)", color: "#030912", borderRadius: "3px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
          <PlusSquare className="w-4 h-4" />
          Open a Round
        </Link>
      </div>

      {/* Three-column court room */}
      <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]">

        {/* LEFT — Vault Stats */}
        <div className="space-y-3 min-w-0">
          <div className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            <Lock className="w-3 h-3" style={{ color: "var(--gold)" }} />
            Vault Status
          </div>

          {/* GEN in escrow */}
          <div className="p-4" style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
            <div className="text-[9px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>
              Total Escrowed
            </div>
            <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--gold-text)" }}>
              {weiToGen(totalEscrowed.toString())}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              GEN locked in contract
            </div>
          </div>

          <div className="p-4" style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
            <div className="text-[9px] uppercase tracking-widest mb-2"
              style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>
              Total Allocated
            </div>
            <div className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--mint-bright)" }}>
              {weiToGen(totalAllocated.toString())}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              GEN awarded by verdict
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3" style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
              <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-2)" }}>Open</div>
              <div className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--gold-text)" }}>{openRounds}</div>
            </div>
            <div className="p-3" style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
              <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-2)" }}>Closed</div>
              <div className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--mint-bright)" }}>{finalizedRounds}</div>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-4 space-y-2">
            {[
              { icon: Lock, label: "Sponsor escrows GEN" },
              { icon: Gavel, label: "GenLayer judges evidence" },
              { icon: TrendingUp, label: "Verdict allocates GEN" },
              { icon: CheckCircle2, label: "Recipients claim payout" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-3)" }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — Allocation Table */}
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            <Scale className="w-3 h-3" style={{ color: "var(--court-blue-b)" }} />
            Allocation Docket · {rounds.length} rounds
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs" style={{ color: "var(--text-2)" }}>
              Loading docket…
            </div>
          ) : rounds.length === 0 ? (
            <div className="py-16 text-center" style={{ border: "1px dashed var(--vault-border2)", borderRadius: "3px" }}>
              <Scale className="w-6 h-6 mx-auto mb-3" style={{ color: "var(--text-3)" }} />
              <p className="text-sm mb-1" style={{ color: "var(--text-2)" }}>No rounds on the docket yet.</p>
              <Link href="/rounds/new" className="text-xs" style={{ color: "var(--gold-text)" }}>
                Open the first allocation round →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {rounds.slice().reverse().map((r) => (
                <Link key={r.round_id} href={`/rounds/${r.round_id}`} className="block group">
                  <div className="p-4 transition-all"
                    style={{
                      background: "var(--vault-panel)", border: "1px solid var(--vault-border)",
                      borderRadius: "3px",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--vault-border2)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--vault-border)")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px]" style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                            #{r.round_id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 uppercase tracking-widest"
                            style={{
                              color: statusColor(r.status),
                              border: `1px solid ${statusColor(r.status)}30`,
                              background: `${statusColor(r.status)}0a`,
                              borderRadius: "2px",
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
                        <div className="text-sm font-semibold truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
                          {r.title}
                        </div>
                        <div className="text-[11px] mt-1" style={{ color: "var(--text-2)" }}>
                          {r.app_count} filings · {r.sponsor.slice(0, 10)}…
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[9px] uppercase tracking-widest mb-0.5"
                          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                          Pool
                        </div>
                        <div className="text-sm font-bold"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--gold-text)" }}>
                          {weiToGen(r.pool_amount)} <span style={{ color: "var(--text-2)", fontSize: "10px" }}>GEN</span>
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
                    {r.pool_amount !== "0" && (
                      <div className="mt-3">
                        <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "var(--vault-border2)" }}>
                          <div className="h-full transition-all"
                            style={{
                              width: `${Math.min(100, Number((BigInt(r.allocated_amount || "0") * 100n) / BigInt(r.pool_amount)))}%`,
                              background: "linear-gradient(90deg, var(--mint), var(--mint-bright))",
                            }} />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Verdict rail */}
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            <Gavel className="w-3 h-3" style={{ color: "var(--court-blue-b)" }} />
            Verdict Rail
          </div>

          <div className="space-y-2">
            {rounds.filter(r => r.status === "finalized" || r.status === "under_review").slice(0, 6).map(r => (
              <Link key={r.round_id} href={`/rounds/${r.round_id}`}>
                <div className="p-3 mb-2 transition-all"
                  style={{
                    background: "var(--vault-surface)", border: "1px solid var(--vault-border)",
                    borderLeft: r.status === "finalized" ? "2px solid var(--mint)" : "2px solid var(--court-blue-b)",
                    borderRadius: "3px",
                  }}>
                  <div className="text-[9px] uppercase tracking-widest mb-1"
                    style={{
                      color: r.status === "finalized" ? "var(--mint-bright)" : "var(--court-blue-b)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                    {r.status === "finalized" ? "✓ Verdict Issued" : "⟳ Under Review"}
                  </div>
                  <div className="text-xs font-semibold truncate"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
                    {r.title}
                  </div>
                  {r.status === "finalized" && r.allocated_amount !== "0" && (
                    <div className="text-[10px] mt-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--mint-bright)" }}>
                      {weiToGen(r.allocated_amount)} GEN allocated
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {rounds.filter(r => r.status === "finalized" || r.status === "under_review").length === 0 && (
              <div className="p-4 text-center"
                style={{ border: "1px dashed var(--vault-border)", borderRadius: "3px" }}>
                <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--text-3)" }} />
                <p className="text-[11px]" style={{ color: "var(--text-2)" }}>No verdicts yet</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-6 p-4" style={{ background: "rgba(200,153,30,0.05)", border: "1px solid rgba(200,153,30,0.15)", borderRadius: "3px" }}>
            <div className="text-xs font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--gold-text)" }}>
              Allocation without settlement is theater.
            </div>
            <p className="text-[11px] mb-3" style={{ color: "var(--text-2)" }}>
              Real GEN escrowed. Real verdicts from GenLayer validators. Real payouts on-chain.
            </p>
            <Link href="/rounds/new"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--gold-text)", fontFamily: "'Space Grotesk', sans-serif" }}>
              Open a round <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Lifecycle strip */}
      <div className="p-4" style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
        <div className="text-[9px] uppercase tracking-[0.2em] mb-4"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Round Lifecycle
        </div>
        <div className="flex items-center overflow-x-auto">
          {[
            { label: "Fund", desc: "Sponsor deposits GEN", color: "var(--gold-text)" },
            { label: "Collect", desc: "Applicants file dossiers", color: "var(--court-blue-b)" },
            { label: "Judge", desc: "GenLayer evaluates evidence", color: "var(--amber)" },
            { label: "Allocate", desc: "Verdict splits the pool", color: "var(--mint-bright)" },
            { label: "Claim", desc: "Recipients claim GEN", color: "var(--mint-bright)" },
            { label: "Refund", desc: "Sponsor reclaims unallocated", color: "var(--gold-text)" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-1 min-w-[100px]">
              <div className="flex-1 text-center">
                <div className="text-[10px] font-semibold mb-0.5"
                  style={{ color: step.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {step.label}
                </div>
                <div className="text-[10px] whitespace-nowrap" style={{ color: "var(--text-2)" }}>{step.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-3 h-3 flex-shrink-0 mx-1" style={{ color: "var(--text-3)" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
