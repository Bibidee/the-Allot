"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getRound, getRoundApplications, getAllocations, getRoundFinancials,
  closeSubmissions, requestAllocation, cancelRoundAndRefund, addFunds,
  waitForTx, genToWei, weiToGen,
} from "@/lib/genlayer/contract";
import type { Round, Application, Allocation, TxState } from "@/lib/genlayer/types";
import { AllocationRail } from "@/components/allot/AllocationRail";
import { EscrowVaultCard } from "@/components/allot/EscrowVaultCard";
import { PolicyPanel } from "@/components/allot/PolicyPanel";
import { ApplicationDocketCard } from "@/components/allot/ApplicationDocketCard";
import { ConsensusVerdictPanel } from "@/components/allot/ConsensusVerdictPanel";
import { AllocationBreakdownChart } from "@/components/allot/AllocationBreakdownChart";
import { PaymentClaimButton } from "@/components/allot/PaymentClaimButton";
import { SponsorRefundButton } from "@/components/allot/SponsorRefundButton";
import { RoundStatusPill } from "@/components/ui/RoundStatusPill";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { useWallet } from "@/lib/context/WalletContext";
import { formatDeadline } from "@/lib/utils";
import { Loader2, PlusCircle, X, Gavel, Lock } from "lucide-react";

export default function RoundDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { address } = useWallet();

  const [round, setRound] = useState<Round | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [allocs, setAllocs] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [addFundsGEN, setAddFundsGEN] = useState("");

  const load = useCallback(async () => {
    const [r, a, al] = await Promise.all([
      getRound(id), getRoundApplications(id), getAllocations(id),
    ]);
    setRound(r);
    setApps(a);
    setAllocs(al);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function allocForApp(appId: string) {
    return allocs.find((a) => a.application_id === appId);
  }

  async function handleClose() {
    if (!id) return;
    try {
      const hash = await closeSubmissions(id);
      waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") load(); });
    } catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  async function handleRequestAllocation() {
    if (!id) return;
    try {
      const hash = await requestAllocation(id);
      waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") load(); });
    } catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  async function handleCancel() {
    if (!id || !confirm("Cancel round and refund all GEN to sponsor?")) return;
    try {
      const hash = await cancelRoundAndRefund(id);
      waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") load(); });
    } catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  async function handleAddFunds() {
    if (!id || !addFundsGEN) return;
    try {
      const hash = await addFunds(id, genToWei(addFundsGEN));
      waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") { setAddFundsGEN(""); load(); } });
    } catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-[#475569]">
      <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading round…</span>
    </div>
  );

  if (!round) return (
    <div className="text-center py-20">
      <p className="text-[#f87171]">Round not found.</p>
      <Link href="/rounds" className="text-sm text-[#60a5fa] mt-2 block hover:underline">← Back to rounds</Link>
    </div>
  );

  const isSponsor = address?.toLowerCase() === round.sponsor.toLowerCase();
  const isOpen = round.status === "funded_open";
  const isClosed = round.status === "submissions_closed";
  const isFinalized = round.status === "finalized";

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/rounds" className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors">← Rounds</Link>
          <h1 className="text-2xl font-bold text-[#f0f4f8] mt-1">{round.title}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <RoundStatusPill status={round.status} />
            <span className="text-xs text-[#334155] bg-[#0a0f1a] border border-[#1e293b] px-2 py-0.5 rounded">{round.category}</span>
            <span className="text-xs text-[#475569]">#{round.round_id}</span>
          </div>
          {round.summary && <p className="text-sm text-[#64748b] mt-2 max-w-xl">{round.summary}</p>}
        </div>

        {/* Sponsor actions */}
        {isSponsor && (
          <div className="flex flex-col gap-2">
            {isOpen && (
              <>
                <button onClick={handleClose}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] text-[#60a5fa] text-xs font-semibold rounded-lg hover:bg-[#0d2049] transition-all">
                  <Lock className="w-3 h-3" /> Close Submissions
                </button>
                <div className="flex items-center gap-1">
                  <input type="number" min="0.001" step="0.001" placeholder="GEN" className="w-20 px-2 py-1.5 text-xs bg-[#0a1628] border border-[#1e3a5f] rounded text-[#e2e8f0] placeholder-[#334155] focus:outline-none" value={addFundsGEN} onChange={(e) => setAddFundsGEN(e.target.value)} />
                  <button onClick={handleAddFunds}
                    className="flex items-center gap-1 px-2 py-1.5 bg-[#0a1628] border border-[#1e3a5f] text-[#f0c040] text-xs rounded-lg hover:bg-[#1e1a0e] transition-all">
                    <PlusCircle className="w-3 h-3" /> Add GEN
                  </button>
                </div>
              </>
            )}
            {isClosed && (
              <button onClick={handleRequestAllocation}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f0c040] text-[#0a0f1a] font-bold text-xs rounded-lg hover:bg-[#fcd34d] transition-all">
                <Gavel className="w-3 h-3" /> Request Allocation Verdict
              </button>
            )}
            {(isOpen && apps.length === 0) && (
              <button onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#2a0d0d] border border-[#ef4444]/30 text-[#f87171] text-xs rounded-lg hover:bg-[#3a1515] transition-all">
                <X className="w-3 h-3" /> Cancel + Refund Sponsor
              </button>
            )}
          </div>
        )}
      </div>

      <TransactionStateCard state={txState} />

      {/* Allocation Rail */}
      <AllocationRail round={round} />

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Consensus */}
          <ConsensusVerdictPanel round={round} allocations={allocs} />

          {/* Applications */}
          <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">
                Application Docket · {apps.length} submitted
              </h3>
              {isOpen && (
                <Link href={`/rounds/${id}/apply`} className="flex items-center gap-1 text-xs text-[#f0c040] hover:underline">
                  <PlusCircle className="w-3 h-3" /> Apply
                </Link>
              )}
            </div>
            {apps.length === 0 ? (
              <p className="text-sm text-[#334155] text-center py-4">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {apps.map((app) => (
                  <ApplicationDocketCard key={app.application_id} app={app} allocation={allocForApp(app.application_id)} />
                ))}
              </div>
            )}
          </div>

          {/* Payment Rail */}
          {isFinalized && (
            <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Payment Rail</h3>

              {allocs.filter((a) => BigInt(a.amount) > 0n).map((a) => {
                const isRecipient = address?.toLowerCase() === a.recipient.toLowerCase();
                if (!isRecipient) return null;
                return (
                  <div key={a.application_id} className="p-3 bg-[#0a1628] rounded-lg border border-[#1e3a5f]/50">
                    <div className="text-xs text-[#475569] mb-2">Application #{a.application_id}</div>
                    <PaymentClaimButton roundId={id} allocation={a} onClaimed={load} />
                  </div>
                );
              })}

              {isSponsor && <SponsorRefundButton round={round} onRefunded={load} />}

              {!address && <p className="text-xs text-[#475569]">Connect wallet to claim payouts.</p>}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <EscrowVaultCard round={round} />
          <PolicyPanel round={round} />
          {allocs.length > 0 && <AllocationBreakdownChart allocations={allocs} pool={round.pool_amount} />}
          <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-4 text-xs space-y-2 text-[#475569]">
            <div className="text-[9px] uppercase tracking-widest text-[#334155] font-semibold mb-2">Timestamps</div>
            <div><span>Created</span><span className="float-right text-[#475569]">{formatDeadline(round.created_at)}</span></div>
            {round.closed_at !== "0" && <div><span>Closed</span><span className="float-right">{formatDeadline(round.closed_at)}</span></div>}
            {round.finalized_at !== "0" && <div><span>Finalized</span><span className="float-right text-[#34d399]">{formatDeadline(round.finalized_at)}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
