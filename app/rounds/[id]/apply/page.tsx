"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getRound, submitApplication, waitForTx, genToWei } from "@/lib/genlayer/contract";
import type { Round, TxState } from "@/lib/genlayer/types";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { useWallet } from "@/lib/context/WalletContext";
import { GenAmount } from "@/components/ui/GenAmount";
import { PlusCircle, Trash2, FileText } from "lucide-react";

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

  useEffect(() => {
    getRound(id).then(setRound);
  }, [id]);

  useEffect(() => {
    if (address) setForm((f) => ({ ...f, recipient_address: address }));
  }, [address]);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) { alert("Connect wallet first"); return; }
    if (txState.status === "pending") return;

    const urls = evidenceUrls.filter((u) => u.trim());
    if (urls.length === 0) { alert("At least one evidence URL is required"); return; }

    try {
      const hash = await submitApplication({
        round_id: id,
        display_name: form.display_name,
        request_title: form.request_title,
        request_summary: form.request_summary,
        requested_amount: genToWei(form.requested_amount),
        recipient_address: form.recipient_address,
        evidence_urls: urls,
        self_assessment: form.self_assessment,
      });
      waitForTx(hash, (s) => {
        setTxState(s);
        if (s.status === "finalized") setTimeout(() => router.push(`/rounds/${id}`), 1500);
      });
    } catch (e) {
      setTxState({ status: "error", error: e instanceof Error ? e.message : "Failed" });
    }
  }

  const labelCls = "text-[10px] uppercase tracking-widest text-[#475569] font-semibold block mb-1.5";
  const inputCls = "w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-sm text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] transition-colors";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/rounds/${id}`} className="text-xs text-[#475569] hover:text-[#94a3b8]">← Back to round</Link>
        <div className="flex items-center gap-2 mt-2">
          <FileText className="w-5 h-5 text-[#f0c040]" />
          <h1 className="text-2xl font-bold text-[#f0f4f8]">Submit Application</h1>
        </div>
        {round && (
          <div className="mt-2 p-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg">
            <p className="text-sm font-semibold text-[#e2e8f0]">{round.title}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-[#475569]">
              <span>Pool: <GenAmount wei={round.pool_amount} size="sm" /></span>
              <span>Max per recipient: <GenAmount wei={round.max_payout_per_recipient} size="sm" /></span>
            </div>
          </div>
        )}
        <p className="text-sm text-[#475569] mt-3 italic">Ask for what you can prove. Allot rewards evidence-backed fit, not noise.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 space-y-4">
          <h2 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Identity</h2>
          <div>
            <label className={labelCls}>Display Name</label>
            <input className={inputCls} placeholder="Builder A" required value={form.display_name} onChange={(e) => set("display_name", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Request Title</label>
            <input className={inputCls} placeholder="Deep Tutorial on GenLayer Intelligent Contracts" required value={form.request_title} onChange={(e) => set("request_title", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Request Summary</label>
            <textarea className={inputCls + " resize-none"} rows={3} required placeholder="Describe what you built, wrote, or contributed..." value={form.request_summary} onChange={(e) => set("request_summary", e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 space-y-4">
          <h2 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Evidence</h2>
          <div>
            <label className={labelCls}>Evidence URLs</label>
            <div className="space-y-2">
              {evidenceUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    placeholder="https://github.com/..."
                    value={url}
                    onChange={(e) => {
                      const u = [...evidenceUrls]; u[i] = e.target.value; setEvidenceUrls(u);
                    }}
                  />
                  {evidenceUrls.length > 1 && (
                    <button type="button" onClick={() => setEvidenceUrls(evidenceUrls.filter((_, j) => j !== i))}
                      className="p-2 text-[#f87171] hover:text-[#f87171]/80">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setEvidenceUrls([...evidenceUrls, ""])}
                className="flex items-center gap-1 text-xs text-[#60a5fa] hover:text-[#93c5fd] mt-1">
                <PlusCircle className="w-3 h-3" /> Add Evidence URL
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Self-Assessment Against Policy</label>
            <textarea className={inputCls + " resize-none"} rows={3} placeholder="Explain why your work fits the sponsor's policy..." value={form.self_assessment} onChange={(e) => set("self_assessment", e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-[#f0c040]/30 bg-[#1e1a0e] p-5 space-y-4">
          <h2 className="text-[10px] uppercase tracking-widest text-[#f0c040] font-semibold">GEN Request</h2>
          <div>
            <label className={labelCls.replace("[#475569]", "[#f0c040]")}>Requested Amount (GEN)</label>
            <input type="number" min="0.001" step="0.001" className={inputCls} required placeholder="8" value={form.requested_amount} onChange={(e) => set("requested_amount", e.target.value)} />
          </div>
          <div>
            <label className={labelCls.replace("[#475569]", "[#f0c040]")}>Recipient Wallet Address</label>
            <input className={inputCls + " font-mono"} required placeholder="0x..." value={form.recipient_address} onChange={(e) => set("recipient_address", e.target.value)} />
            <p className="text-[10px] text-[#475569] mt-1">GEN will be sent to this address if your application is approved.</p>
          </div>
        </div>

        <TransactionStateCard state={txState} />

        <button
          type="submit"
          disabled={!address || txState.status === "pending" || txState.status === "confirming"}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#f0c040] hover:bg-[#fcd34d] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1a] font-bold text-sm rounded-xl transition-all"
        >
          <FileText className="w-4 h-4" />
          {!address ? "Connect wallet to apply" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
