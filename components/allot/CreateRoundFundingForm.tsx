"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoundAndFund, genToWei, waitForTx } from "@/lib/genlayer/contract";
import type { TxState } from "@/lib/genlayer/types";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { getClient } from "@/lib/genlayer/client";
import { Vault } from "lucide-react";

const CATEGORIES = ["Contributor Rewards", "Hackathon", "Grant", "Bounty", "Community Work", "Other"];

export function CreateRoundFundingForm() {
  const router = useRouter();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const [form, setForm] = useState({
    title: "", summary: "", category: "Contributor Rewards",
    policy: "", evidence_requirements: "",
    submission_deadline: "", review_deadline: "",
    max_recipients: "10", min_payout: "0",
    max_payout_per_recipient: "10", deposit_gen: "",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (txState.status === "pending") return;
    setTxState({ status: "idle" });

    const subDeadline = BigInt(Math.floor(new Date(form.submission_deadline).getTime() / 1000));
    const revDeadline = BigInt(Math.floor(new Date(form.review_deadline).getTime() / 1000));
    const value = genToWei(form.deposit_gen);

    try {
      const hash = await createRoundAndFund({
        title: form.title, summary: form.summary, category: form.category,
        policy: form.policy, evidence_requirements: form.evidence_requirements,
        submission_deadline: subDeadline, review_deadline: revDeadline,
        max_recipients: BigInt(form.max_recipients),
        min_payout: genToWei(form.min_payout || "0"),
        max_payout_per_recipient: genToWei(form.max_payout_per_recipient),
        value,
      });
      waitForTx(hash, (state) => {
        setTxState(state);
        if (state.status === "finalized") {
          setTimeout(() => router.push("/rounds"), 1500);
        }
      });
    } catch (e) {
      setTxState({ status: "error", error: e instanceof Error ? e.message : "Transaction failed" });
    }
  }

  const labelCls = "text-[10px] uppercase tracking-widest text-[#475569] font-semibold block mb-1.5";
  const inputCls = "w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-sm text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] transition-colors";
  const textareaCls = inputCls + " resize-none";

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Round identity */}
      <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 space-y-4">
        <h2 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Round Identity</h2>
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} placeholder="June GenLayer Builder Rewards" required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Summary</label>
          <textarea className={textareaCls} rows={2} placeholder="Brief description of this allocation round" value={form.summary} onChange={(e) => set("summary", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Policy */}
      <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 space-y-4">
        <h2 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Allocation Policy</h2>
        <div>
          <label className={labelCls}>Policy</label>
          <textarea className={textareaCls} rows={4} required placeholder="Describe what work qualifies for allocation, what evidence is expected, and how quality should be weighted..." value={form.policy} onChange={(e) => set("policy", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Evidence Requirements</label>
          <textarea className={textareaCls} rows={2} required placeholder="GitHub repos, deployment links, articles, screenshots..." value={form.evidence_requirements} onChange={(e) => set("evidence_requirements", e.target.value)} />
        </div>
      </div>

      {/* Parameters */}
      <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5 space-y-4">
        <h2 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold">Parameters</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Submission Deadline</label>
            <input type="datetime-local" className={inputCls} required value={form.submission_deadline} onChange={(e) => set("submission_deadline", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Review Deadline</label>
            <input type="datetime-local" className={inputCls} required value={form.review_deadline} onChange={(e) => set("review_deadline", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Max Recipients</label>
            <input type="number" min="1" className={inputCls} required value={form.max_recipients} onChange={(e) => set("max_recipients", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Min Payout (GEN)</label>
            <input type="number" min="0" step="0.001" className={inputCls} value={form.min_payout} onChange={(e) => set("min_payout", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Max Payout Per Recipient (GEN)</label>
            <input type="number" min="0.001" step="0.001" className={inputCls} required value={form.max_payout_per_recipient} onChange={(e) => set("max_payout_per_recipient", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Funding */}
      <div className="rounded-xl border border-[#f0c040]/30 bg-[#1e1a0e] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Vault className="w-4 h-4 text-[#f0c040]" />
          <h2 className="text-[10px] uppercase tracking-widest text-[#f0c040] font-semibold">GEN Escrow</h2>
        </div>
        <p className="text-xs text-[#94a3b8]">GEN escrow is required. A round cannot exist without funding. The deposited GEN is held in the contract until verdicts are claimed or refunded.</p>
        <div>
          <label className={labelCls.replace("[#475569]", "[#f0c040]")}>Initial Deposit (GEN)</label>
          <input
            type="number" min="0.001" step="0.001"
            className={inputCls.replace("border-[#1e3a5f]", "border-[#f0c040]/40").replace("focus:border-[#3b82f6]", "focus:border-[#f0c040]")}
            placeholder="20"
            required
            value={form.deposit_gen}
            onChange={(e) => set("deposit_gen", e.target.value)}
          />
        </div>
        {form.deposit_gen && (
          <p className="text-xs text-[#f0c040] font-mono">
            Depositing {form.deposit_gen} GEN into escrow
          </p>
        )}
      </div>

      <TransactionStateCard state={txState} />

      <button
        type="submit"
        disabled={txState.status === "pending" || txState.status === "confirming"}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#f0c040] hover:bg-[#fcd34d] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1a] font-bold text-sm rounded-xl transition-all"
      >
        <Vault className="w-4 h-4" />
        Create Round + Deposit GEN
      </button>
    </form>
  );
}
