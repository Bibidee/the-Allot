"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getRound, submitApplication, waitForTx, genToWei } from "@/lib/genlayer/contract";
import type { Round, TxState } from "@/lib/genlayer/types";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { GenAmount } from "@/components/ui/GenAmount";
import { useWallet } from "@/lib/context/WalletContext";
import { PlusCircle, Trash2, FileText, ArrowRight } from "lucide-react";

const labelCls = "block text-[9px] uppercase tracking-widest mb-1.5 font-semibold";
const inputCls = "w-full px-3 py-2 text-sm";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useWallet();
  const id = params.id as string;

  const [round, setRound] = useState<Round | null>(null);
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([""]);
  const [form, setForm] = useState({
    display_name: "", request_title: "", request_summary: "",
    requested_amount: "", recipient_address: "", self_assessment: "",
  });

  useEffect(() => { getRound(id).then(setRound); }, [id]);
  useEffect(() => { if (address) setForm((f) => ({ ...f, recipient_address: address })); }, [address]);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) { alert("Connect wallet first"); return; }
    if (txState.status === "pending") return;
    const urls = evidenceUrls.filter((u) => u.trim());
    if (urls.length === 0) { alert("At least one evidence URL is required"); return; }
    try {
      const hash = await submitApplication({
        round_id: id, display_name: form.display_name,
        request_title: form.request_title, request_summary: form.request_summary,
        requested_amount: genToWei(form.requested_amount),
        recipient_address: form.recipient_address,
        evidence_urls: urls, self_assessment: form.self_assessment,
      });
      waitForTx(hash, (s) => {
        setTxState(s);
        if (s.status === "finalized") setTimeout(() => router.push(`/rounds/${id}`), 1500);
      });
    } catch (e) {
      setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" });
    }
  }

  return (
    <div style={{ maxWidth: "720px" }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: "var(--text-3)" }}>
        <Link href="/" style={{ color: "var(--text-3)" }}>Court</Link>
        <ArrowRight className="w-3 h-3" />
        <Link href="/rounds" style={{ color: "var(--text-3)" }}>Live Rounds</Link>
        <ArrowRight className="w-3 h-3" />
        <Link href={`/rounds/${id}`} style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>CASE #{id}</Link>
        <ArrowRight className="w-3 h-3" />
        <span style={{ color: "var(--gold-text)" }}>File Application</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 flex items-center justify-center"
            style={{ background: "rgba(200,153,30,0.08)", border: "1px solid rgba(200,153,30,0.3)" }}>
            <FileText className="w-4 h-4" style={{ color: "var(--gold-text)" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            File Application Dossier
          </h1>
        </div>
        {round && (
          <div className="ml-11 p-3"
            style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)", fontFamily: "'Space Grotesk', sans-serif" }}>
              {round.title}
            </p>
            <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-2)" }}>
              <span>Pool: <GenAmount wei={round.pool_amount} size="sm" /></span>
              <span>Max per recipient: <GenAmount wei={round.max_payout_per_recipient} size="sm" /></span>
            </div>
          </div>
        )}
        <p className="text-xs mt-3 ml-11 italic" style={{ color: "var(--text-3)" }}>
          Ask for what you can prove. Allot rewards evidence-backed fit, not noise.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">

        {/* Section 01: Identity */}
        <div className="p-5 space-y-4"
          style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
          <div className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid var(--vault-border)", paddingBottom: "10px" }}>
            <span style={{ color: "var(--gold-text)" }}>01</span> Applicant Identity
          </div>
          <div>
            <label className={labelCls} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Display Name</label>
            <input className={inputCls} placeholder="Builder A" required value={form.display_name} onChange={(e) => set("display_name", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Request Title</label>
            <input className={inputCls} placeholder="Deep Tutorial on GenLayer Intelligent Contracts" required value={form.request_title} onChange={(e) => set("request_title", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Request Summary</label>
            <textarea className={inputCls} rows={3} required placeholder="Describe what you built, wrote, or contributed..." value={form.request_summary} onChange={(e) => set("request_summary", e.target.value)} />
          </div>
        </div>

        {/* Section 02: Evidence */}
        <div className="p-5 space-y-4"
          style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
          <div className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid var(--vault-border)", paddingBottom: "10px" }}>
            <span style={{ color: "var(--gold-text)" }}>02</span> Evidence Chain
          </div>
          <div>
            <label className={labelCls} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Evidence URLs</label>
            <div className="space-y-2">
              {evidenceUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={inputCls} placeholder="https://github.com/..." value={url}
                    onChange={(e) => { const u = [...evidenceUrls]; u[i] = e.target.value; setEvidenceUrls(u); }} />
                  {evidenceUrls.length > 1 && (
                    <button type="button" onClick={() => setEvidenceUrls(evidenceUrls.filter((_, j) => j !== i))}
                      className="p-1.5" style={{ color: "var(--red-bright)" }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setEvidenceUrls([...evidenceUrls, ""])}
                className="flex items-center gap-1 text-xs mt-1 hover:underline"
                style={{ color: "var(--court-blue-b)" }}>
                <PlusCircle className="w-3 h-3" /> Add Evidence URL
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Self-Assessment Against Policy</label>
            <textarea className={inputCls} rows={3} placeholder="Explain why your work fits the sponsor's policy..."
              value={form.self_assessment} onChange={(e) => set("self_assessment", e.target.value)} />
          </div>
        </div>

        {/* Section 03: GEN Request */}
        <div className="p-5 space-y-4"
          style={{ background: "rgba(200,153,30,0.03)", border: "1px solid rgba(200,153,30,0.2)", borderRadius: "3px" }}>
          <div className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid rgba(200,153,30,0.15)", paddingBottom: "10px" }}>
            <span style={{ color: "var(--gold-text)" }}>03</span> GEN Allocation Request
          </div>
          <div>
            <label className={labelCls} style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace" }}>Requested Amount (GEN)</label>
            <input type="number" min="0.001" step="0.001" className={inputCls} placeholder="8" required
              value={form.requested_amount} onChange={(e) => set("requested_amount", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace" }}>Recipient Wallet Address</label>
            <input className={inputCls} required placeholder="0x..." value={form.recipient_address}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              onChange={(e) => set("recipient_address", e.target.value)} />
            <p className="text-[10px] mt-1" style={{ color: "var(--text-3)" }}>
              GEN will be sent to this address if your application is approved.
            </p>
          </div>
        </div>

        <TransactionStateCard state={txState} />

        <button type="submit"
          disabled={!address || txState.status === "pending" || txState.status === "confirming"}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all disabled:opacity-40"
          style={{
            background: "var(--gold)", color: "#030912", borderRadius: "3px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
          <FileText className="w-4 h-4" />
          {!address ? "Connect wallet to apply" : "Submit Application Dossier"}
        </button>
      </form>
    </div>
  );
}
