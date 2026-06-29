"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRounds, getRound, weiToGen } from "@/lib/genlayer/contract";
import type { Round } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { RoundStatusPill } from "@/components/ui/RoundStatusPill";
import { useWallet } from "@/lib/context/WalletContext";
import { LayoutDashboard, PlusCircle, Loader2 } from "lucide-react";

export default function SponsorPage() {
  const { address, connect } = useWallet();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    listRounds().then((summaries) => {
      const mine = summaries.filter(
        (r) => r.sponsor.toLowerCase() === address.toLowerCase()
      );
      return Promise.all(mine.map((r) => getRound(r.round_id)));
    }).then((full) => setRounds(full.filter(Boolean) as Round[])).finally(() => setLoading(false));
  }, [address]);

  const totalEscrowed = rounds.reduce((s, r) => s + BigInt(r.pool_amount), 0n);
  const pendingReviews = rounds.filter((r) => r.status === "submissions_closed").length;
  const refundsAvailable = rounds.filter((r) => {
    const unalloc = BigInt(r.pool_amount) - BigInt(r.allocated_amount);
    return r.status === "finalized" && !r.unallocated_refunded && unalloc > 0n;
  }).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-[#f0c040]" />
          <h1 className="text-2xl font-bold text-[#f0f4f8]">Sponsor Desk</h1>
        </div>
        <Link href="/rounds/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#f0c040] hover:bg-[#fcd34d] text-[#0a0f1a] font-bold text-sm rounded-lg transition-all">
          <PlusCircle className="w-4 h-4" /> New Round
        </Link>
      </div>

      {!address ? (
        <div className="text-center py-12">
          <p className="text-[#475569] mb-4">Connect wallet to see your rounds.</p>
          <button onClick={connect} className="px-4 py-2 bg-[#f0c040] text-[#0a0f1a] font-bold text-sm rounded-lg">Connect Wallet</button>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 text-[#475569] py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Rounds", value: rounds.length.toString(), mono: false },
              { label: "Total Escrowed", value: `${weiToGen(totalEscrowed.toString())} GEN`, mono: true },
              { label: "Pending Review", value: pendingReviews.toString(), mono: false },
              { label: "Refunds Available", value: refundsAvailable.toString(), mono: false },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-4">
                <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">{s.label}</div>
                <div className={`text-xl font-bold text-[#e2e8f0] ${s.mono ? "font-mono text-[#f0c040] text-base" : ""}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Rounds */}
          {rounds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#475569] text-sm">No rounds created yet.</p>
              <Link href="/rounds/new" className="text-sm text-[#f0c040] hover:underline mt-2 block">Create first round →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {rounds.map((r) => {
                const unalloc = BigInt(r.pool_amount) - BigInt(r.allocated_amount);
                const hasRefund = r.status === "finalized" && !r.unallocated_refunded && unalloc > 0n;
                return (
                  <Link key={r.round_id} href={`/rounds/${r.round_id}`} className="block">
                    <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 hover:border-[#1e3a5f] transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <RoundStatusPill status={r.status} />
                            {hasRefund && (
                              <span className="text-[9px] bg-[#1e1a0e] border border-[#f0c040]/30 text-[#f0c040] px-2 py-0.5 rounded uppercase tracking-wider">Refund Available</span>
                            )}
                            {r.status === "submissions_closed" && (
                              <span className="text-[9px] bg-[#0d2049] border border-[#3b82f6]/30 text-[#60a5fa] px-2 py-0.5 rounded uppercase tracking-wider">Ready for Verdict</span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-[#e2e8f0]">{r.title}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] uppercase tracking-widest text-[#334155] mb-1">Pool</div>
                          <GenAmount wei={r.pool_amount} size="sm" highlight />
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
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
