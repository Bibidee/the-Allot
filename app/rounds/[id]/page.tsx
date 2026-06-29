"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getRound, getRoundApplications, getAllocations,
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
import { GenAmount } from "@/components/ui/GenAmount";
import { useWallet } from "@/lib/context/WalletContext";
import { formatDeadline } from "@/lib/utils";
import { Loader2, PlusCircle, X, Gavel, Lock, ArrowRight, FileText, Scale } from "lucide-react";

const EXPLORER = "https://explorer-studio.genlayer.com";

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
    const [r, a, al] = await Promise.all([getRound(id), getRoundApplications(id), getAllocations(id)]);
    setRound(r); setApps(a); setAllocs(al); setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function allocForApp(appId: string) { return allocs.find((a) => a.application_id === appId); }

  async function handleClose() {
    try { const hash = await closeSubmissions(id); waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") load(); }); }
    catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  async function handleRequestAllocation() {
    try { const hash = await requestAllocation(id); waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") load(); }); }
    catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  async function handleCancel() {
    if (!confirm("Cancel round and refund all GEN to sponsor?")) return;
    try { const hash = await cancelRoundAndRefund(id); waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") load(); }); }
    catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  async function handleAddFunds() {
    if (!addFundsGEN) return;
    try { const hash = await addFunds(id, genToWei(addFundsGEN)); waitForTx(hash, (s) => { setTxState(s); if (s.status === "finalized") { setAddFundsGEN(""); load(); } }); }
    catch (e) { setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" }); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2" style={{ color: "var(--text-3)" }}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading case file…</span>
    </div>
  );

  if (!round) return (
    <div className="text-center py-20">
      <p className="text-sm mb-2" style={{ color: "var(--red-bright)" }}>Case file not found.</p>
      <Link href="/rounds" className="text-xs hover:underline" style={{ color: "var(--court-blue-b)" }}>← Back to docket</Link>
    </div>
  );

  const isSponsor = address?.toLowerCase() === round.sponsor.toLowerCase();
  const isOpen = round.status === "funded_open";
  const isClosed = round.status === "submissions_closed";
  const isFinalized = round.status === "finalized";

  return (
    <div style={{ maxWidth: "1100px" }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-xs" style={{ color: "var(--text-3)" }}>
        <Link href="/" style={{ color: "var(--text-3)" }}>Court</Link>
        <ArrowRight className="w-3 h-3" />
        <Link href="/rounds" style={{ color: "var(--text-3)" }}>Live Rounds</Link>
        <ArrowRight className="w-3 h-3" />
        <span style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>CASE #{id}</span>
      </div>

      {/* Case Header */}
      <div className="mb-5 p-5"
        style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Scale className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
              <span className="text-[9px]"
                style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                CASE #{round.round_id}
              </span>
              <RoundStatusPill status={round.status} />
              <span className="text-[9px] px-1.5 py-0.5"
                style={{ color: "var(--text-2)", border: "1px solid var(--vault-border2)", borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
                {round.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
              {round.title}
            </h1>
            {round.summary && (
              <p className="text-sm" style={{ color: "var(--text-2)" }}>{round.summary}</p>
            )}
          </div>

          {/* Escrow badge */}
          <div className="text-right flex-shrink-0">
            <div className="text-[9px] uppercase tracking-widest mb-1"
              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              Escrowed
            </div>
            <div className="text-2xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--gold-text)" }}>
              {weiToGen(round.pool_amount)}
              <span className="text-sm ml-1" style={{ color: "var(--text-2)" }}>GEN</span>
            </div>
            <div className="text-[10px] mt-1" style={{ color: "var(--text-3)" }}>
              {apps.length} filing{apps.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Sponsor actions */}
        {isSponsor && (
          <div className="mt-4 pt-4 flex items-center gap-2 flex-wrap"
            style={{ borderTop: "1px solid var(--vault-border)" }}>
            <span className="text-[9px] uppercase tracking-widest mr-1"
              style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace" }}>
              Sponsor Controls
            </span>
            {isOpen && (
              <>
                <button onClick={handleClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", color: "var(--court-blue-b)", borderRadius: "3px" }}>
                  <Lock className="w-3 h-3" /> Close Submissions
                </button>
                <div className="flex items-center gap-1">
                  <input type="number" min="0.001" step="0.001" placeholder="GEN" className="w-20 px-2 py-1.5 text-xs"
                    style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px", color: "var(--text-1)" }}
                    value={addFundsGEN} onChange={(e) => setAddFundsGEN(e.target.value)} />
                  <button onClick={handleAddFunds}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold transition-all"
                    style={{ background: "rgba(200,153,30,0.06)", border: "1px solid rgba(200,153,30,0.25)", color: "var(--gold-text)", borderRadius: "3px" }}>
                    <PlusCircle className="w-3 h-3" /> Add GEN
                  </button>
                </div>
              </>
            )}
            {isClosed && (
              <button onClick={handleRequestAllocation}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition-all"
                style={{ background: "var(--gold)", color: "#030912", borderRadius: "3px", fontFamily: "'Space Grotesk', sans-serif" }}>
                <Gavel className="w-3 h-3" /> Request Allocation Verdict
              </button>
            )}
            {isOpen && apps.length === 0 && (
              <button onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ml-auto"
                style={{ background: "rgba(168,50,50,0.08)", border: "1px solid rgba(168,50,50,0.3)", color: "var(--red-bright)", borderRadius: "3px" }}>
                <X className="w-3 h-3" /> Cancel + Refund
              </button>
            )}
          </div>
        )}
      </div>

      <TransactionStateCard state={txState} className="mb-4" />

      {/* Payout Rail */}
      <div className="mb-5">
        <AllocationRail round={round} />
      </div>

      {/* Main 2+1 grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="space-y-5">

          {/* Verdict Stamp */}
          <ConsensusVerdictPanel round={round} allocations={allocs} />

          {/* Application Docket */}
          <div style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
            <div className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid var(--vault-border)" }}>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
                <span className="text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                  Application Docket
                </span>
                <span className="text-[9px] px-1.5 py-0.5"
                  style={{ color: "var(--text-2)", border: "1px solid var(--vault-border2)", borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
                  {apps.length} filed
                </span>
              </div>
              {isOpen && (
                <Link href={`/rounds/${id}/apply`}
                  className="flex items-center gap-1 text-xs font-semibold transition-all px-2.5 py-1"
                  style={{ background: "rgba(200,153,30,0.06)", border: "1px solid rgba(200,153,30,0.25)", color: "var(--gold-text)", borderRadius: "3px" }}>
                  <PlusCircle className="w-3 h-3" /> File Application
                </Link>
              )}
            </div>
            <div className="p-5">
              {apps.length === 0 ? (
                <div className="py-8 text-center" style={{ border: "1px dashed var(--vault-border2)", borderRadius: "3px" }}>
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>No applications filed yet.</p>
                  {isOpen && (
                    <Link href={`/rounds/${id}/apply`} className="text-xs mt-2 block hover:underline"
                      style={{ color: "var(--gold-text)" }}>
                      Be the first to file →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {apps.map((app) => (
                    <ApplicationDocketCard key={app.application_id} app={app} allocation={allocForApp(app.application_id)} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment Rail */}
          {isFinalized && (
            <div style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--vault-border)" }}>
                <span className="text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                  Payout Claims
                </span>
              </div>
              <div className="p-5 space-y-3">
                {allocs.filter((a) => BigInt(a.amount) > 0n).map((a) => {
                  const isRecipient = address?.toLowerCase() === a.recipient.toLowerCase();
                  if (!isRecipient) return null;
                  return (
                    <div key={a.application_id} className="p-3"
                      style={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
                      <div className="text-[9px] mb-2" style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                        Application #{a.application_id}
                      </div>
                      <PaymentClaimButton roundId={id} allocation={a} onClaimed={load} />
                    </div>
                  );
                })}
                {isSponsor && <SponsorRefundButton round={round} onRefunded={load} />}
                {!address && (
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>Connect wallet to claim payouts.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <EscrowVaultCard round={round} />
          <PolicyPanel round={round} />
          {allocs.length > 0 && <AllocationBreakdownChart allocations={allocs} pool={round.pool_amount} />}

          {/* Chain receipts */}
          <div style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px", padding: "12px" }}>
            <div className="text-[9px] uppercase tracking-[0.2em] mb-3"
              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
              Chain Receipts
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-3)" }}>Created</span>
                <span style={{ color: "var(--text-2)" }}>{formatDeadline(round.created_at)}</span>
              </div>
              {round.closed_at !== "0" && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-3)" }}>Closed</span>
                  <span style={{ color: "var(--amber)" }}>{formatDeadline(round.closed_at)}</span>
                </div>
              )}
              {round.finalized_at !== "0" && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-3)" }}>Finalized</span>
                  <span style={{ color: "var(--mint-bright)" }}>{formatDeadline(round.finalized_at)}</span>
                </div>
              )}
              {round.canonical_hash && (
                <a href={`${EXPLORER}/tx/${round.canonical_hash}`} target="_blank" rel="noopener noreferrer"
                  className="flex justify-between mt-2 pt-2 hover:underline"
                  style={{ borderTop: "1px solid var(--vault-border)", color: "var(--court-blue-b)" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Canonical Hash ↗</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{round.canonical_hash.slice(0, 8)}…</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
