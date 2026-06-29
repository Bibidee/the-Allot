"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoundAndFund, genToWei, waitForTx } from "@/lib/genlayer/contract";
import type { TxState } from "@/lib/genlayer/types";
import { TransactionStateCard } from "@/components/ui/TransactionStateCard";
import { Lock, ChevronRight } from "lucide-react";

const CATEGORIES = ["Contributor Rewards", "Hackathon", "Grant", "Bounty", "Community Work", "Other"];

const label = "block text-[9px] uppercase tracking-widest mb-1.5 font-semibold";
const inp = "w-full px-3 py-2 text-sm";
const section = "p-5 space-y-4 mb-4";

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

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

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
        if (state.status === "finalized") setTimeout(() => router.push("/rounds"), 1500);
      });
    } catch (e) {
      setTxState({ status: "error", error: e instanceof Error ? e.message : "Transaction failed" });
    }
  }

  return (
    <form onSubmit={submit}>

      {/* Section: Identity */}
      <div className={section} style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
        <div className="text-[9px] uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid var(--vault-border)", paddingBottom: "12px", marginBottom: "4px" }}>
          <span style={{ color: "var(--gold-text)" }}>01</span> Round Identity
        </div>
        <div>
          <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Title</label>
          <input className={inp} placeholder="June GenLayer Builder Rewards" required value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div>
          <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Summary</label>
          <textarea className={inp} rows={2} placeholder="Brief purpose of this allocation round" value={form.summary} onChange={e => set("summary", e.target.value)} />
        </div>
        <div>
          <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Category</label>
          <select className={inp} value={form.category} onChange={e => set("category", e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Section: Policy */}
      <div className={section} style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
        <div className="text-[9px] uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid var(--vault-border)", paddingBottom: "12px", marginBottom: "4px" }}>
          <span style={{ color: "var(--gold-text)" }}>02</span> Eligibility Policy
        </div>
        <div>
          <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Policy</label>
          <textarea className={inp} rows={4} required
            placeholder="Who qualifies? What work counts? How should quality be weighted? The AI will use this to judge applications."
            value={form.policy} onChange={e => set("policy", e.target.value)} />
        </div>
        <div>
          <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Evidence Requirements</label>
          <textarea className={inp} rows={2} required
            placeholder="GitHub repos, articles, deployment links, screenshots…"
            value={form.evidence_requirements} onChange={e => set("evidence_requirements", e.target.value)} />
        </div>
      </div>

      {/* Section: Parameters */}
      <div className={section} style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
        <div className="text-[9px] uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid var(--vault-border)", paddingBottom: "12px", marginBottom: "4px" }}>
          <span style={{ color: "var(--gold-text)" }}>03</span> Court Parameters
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Submission Deadline</label>
            <input type="datetime-local" className={inp} required value={form.submission_deadline} onChange={e => set("submission_deadline", e.target.value)} />
          </div>
          <div>
            <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Review Deadline</label>
            <input type="datetime-local" className={inp} required value={form.review_deadline} onChange={e => set("review_deadline", e.target.value)} />
          </div>
          <div>
            <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Max Recipients</label>
            <input type="number" min="1" className={inp} required value={form.max_recipients} onChange={e => set("max_recipients", e.target.value)} />
          </div>
          <div>
            <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Min Payout (GEN)</label>
            <input type="number" min="0" step="0.001" className={inp} value={form.min_payout} onChange={e => set("min_payout", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={label} style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>Max Payout Per Recipient (GEN)</label>
            <input type="number" min="0.001" step="0.001" className={inp} required value={form.max_payout_per_recipient} onChange={e => set("max_payout_per_recipient", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Section: Escrow */}
      <div className={section} style={{ background: "rgba(200,153,30,0.04)", border: "1px solid rgba(200,153,30,0.2)", borderRadius: "3px" }}>
        <div className="text-[9px] uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid rgba(200,153,30,0.15)", paddingBottom: "12px", marginBottom: "4px" }}>
          <Lock className="w-3 h-3" />
          <span style={{ color: "var(--gold-text)" }}>04</span> GEN Escrow Deposit
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--text-2)" }}>
          GEN escrow is required. The deposited GEN is locked in the contract until verdicts are claimed or refunded.
          No GEN deposit = no round.
        </p>
        <div>
          <label className={label} style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace" }}>Initial Deposit (GEN)</label>
          <input type="number" min="0.001" step="0.001" className={inp} placeholder="20" required
            style={{ borderColor: "rgba(200,153,30,0.3)", background: "rgba(200,153,30,0.04)" }}
            value={form.deposit_gen} onChange={e => set("deposit_gen", e.target.value)} />
        </div>
        {form.deposit_gen && (
          <div className="mt-3 p-3 flex items-center justify-between"
            style={{ background: "rgba(200,153,30,0.06)", border: "1px solid rgba(200,153,30,0.15)", borderRadius: "3px" }}>
            <span className="text-xs" style={{ color: "var(--text-2)" }}>This round will lock</span>
            <span className="text-sm font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--gold-text)" }}>
              {form.deposit_gen} GEN
            </span>
            <span className="text-xs" style={{ color: "var(--text-2)" }}>into escrow</span>
          </div>
        )}
      </div>

      <TransactionStateCard state={txState} className="mb-4" />

      <button type="submit"
        disabled={txState.status === "pending" || txState.status === "confirming"}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all disabled:opacity-40"
        style={{
          background: "var(--gold)", color: "#030912", borderRadius: "3px",
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
        }}>
        <Lock className="w-4 h-4" />
        Create Round + Lock GEN into Escrow
        <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}
