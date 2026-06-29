"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRounds, getRound, weiToGen } from "@/lib/genlayer/contract";
import type { Round } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { RoundStatusPill } from "@/components/ui/RoundStatusPill";
import { useWallet } from "@/lib/context/WalletContext";
import { LayoutGrid, PlusSquare, Loader2, Gavel, RotateCcw } from "lucide-react";

export default function SponsorPage() {
  const { address, connect } = useWallet();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    listRounds()
      .then((summaries) => {
        const mine = summaries.filter((r) => r.sponsor.toLowerCase() === address.toLowerCase());
        return Promise.all(mine.map((r) => getRound(r.round_id)));
      })
      .then((full) => setRounds(full.filter(Boolean) as Round[]))
      .finally(() => setLoading(false));
  }, [address]);

  const totalEscrowed = rounds.reduce((s, r) => s + BigInt(r.pool_amount), 0n);
  const pendingReviews = rounds.filter((r) => r.status === "submissions_closed").length;
  const refundsAvailable = rounds.filter((r) => {
    const unalloc = BigInt(r.pool_amount) - BigInt(r.allocated_amount);
    return r.status === "finalized" && !r.unallocated_refunded && unalloc > 0n;
  }).length;

  return (
    <div style={{ maxWidth: "900px" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center"
            style={{ background: "rgba(200,153,30,0.08)", border: "1px solid rgba(200,153,30,0.3)" }}>
            <LayoutGrid className="w-4 h-4" style={{ color: "var(--gold-text)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Sponsor Desk
            </h1>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>Your allocation rounds and vault activity</p>
          </div>
        </div>
        <Link href="/rounds/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all"
          style={{ background: "var(--gold)", color: "#030912", borderRadius: "3px", fontFamily: "'Space Grotesk', sans-serif" }}>
          <PlusSquare className="w-4 h-4" /> New Round
        </Link>
      </div>

      {!address ? (
        <div className="text-center py-12"
          style={{ border: "1px dashed var(--vault-border2)", borderRadius: "3px" }}>
          <LayoutGrid className="w-6 h-6 mx-auto mb-3" style={{ color: "var(--text-3)" }} />
          <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>Connect wallet to see your rounds.</p>
          <button onClick={connect}
            className="px-5 py-2.5 text-sm font-bold"
            style={{ background: "var(--gold)", color: "#030912", borderRadius: "3px", fontFamily: "'Space Grotesk', sans-serif" }}>
            Connect Wallet
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-12" style={{ color: "var(--text-3)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading sponsor vault…</span>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Rounds", value: <span className="text-xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{rounds.length}</span> },
              { label: "Total Escrowed", value: <span className="text-base font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--gold-text)" }}>{weiToGen(totalEscrowed.toString())} GEN</span> },
              { label: "Pending Verdict", value: <span className="text-xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: pendingReviews > 0 ? "var(--amber)" : "var(--text-1)" }}>{pendingReviews}</span> },
              { label: "Refunds Available", value: <span className="text-xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: refundsAvailable > 0 ? "var(--mint-bright)" : "var(--text-1)" }}>{refundsAvailable}</span> },
            ].map((s) => (
              <div key={s.label} className="p-4"
                style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
                <div className="text-[9px] uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.label}
                </div>
                {s.value}
              </div>
            ))}
          </div>

          {/* Rounds */}
          {rounds.length === 0 ? (
            <div className="text-center py-8"
              style={{ border: "1px dashed var(--vault-border2)", borderRadius: "3px" }}>
              <p className="text-sm mb-2" style={{ color: "var(--text-3)" }}>No rounds created yet.</p>
              <Link href="/rounds/new" className="text-xs hover:underline"
                style={{ color: "var(--gold-text)" }}>
                Open first allocation round →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {rounds.map((r) => {
                const unalloc = BigInt(r.pool_amount) - BigInt(r.allocated_amount);
                const hasRefund = r.status === "finalized" && !r.unallocated_refunded && unalloc > 0n;
                const needsVerdict = r.status === "submissions_closed";
                return (
                  <Link key={r.round_id} href={`/rounds/${r.round_id}`} className="block group">
                    <div className="p-5 transition-all"
                      style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--vault-panel2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--vault-panel)")}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[9px]"
                              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                              CASE #{r.round_id}
                            </span>
                            <RoundStatusPill status={r.status} />
                            {hasRefund && (
                              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5"
                                style={{ color: "var(--mint-bright)", border: "1px solid rgba(13,158,115,0.3)", background: "rgba(13,158,115,0.08)", borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
                                <RotateCcw className="w-2.5 h-2.5" /> REFUND AVAILABLE
                              </span>
                            )}
                            {needsVerdict && (
                              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5"
                                style={{ color: "var(--gold-text)", border: "1px solid rgba(200,153,30,0.3)", background: "rgba(200,153,30,0.06)", borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
                                <Gavel className="w-2.5 h-2.5" /> READY FOR VERDICT
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
                            {r.title}
                          </h3>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[9px] uppercase tracking-widest mb-1"
                            style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                            Pool
                          </div>
                          <GenAmount wei={r.pool_amount} size="sm" highlight />
                          {r.allocated_amount !== "0" && (
                            <>
                              <div className="text-[9px] uppercase tracking-widest mt-1.5 mb-0.5"
                                style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                                Allocated
                              </div>
                              <GenAmount wei={r.allocated_amount} size="sm" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
