import { CreateRoundFundingForm } from "@/components/allot/CreateRoundFundingForm";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NewRoundPage() {
  return (
    <div style={{ maxWidth: "720px" }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: "var(--text-2)" }}>
        <Link href="/" style={{ color: "var(--text-2)" }}>Court</Link>
        <ArrowRight className="w-3 h-3" />
        <Link href="/rounds" style={{ color: "var(--text-2)" }}>Live Rounds</Link>
        <ArrowRight className="w-3 h-3" />
        <span style={{ color: "var(--gold-text)" }}>Create Round</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 flex items-center justify-center"
            style={{ background: "rgba(200,153,30,0.08)", border: "1px solid rgba(200,153,30,0.3)" }}>
            <Lock className="w-4 h-4" style={{ color: "var(--gold-text)" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Open Allocation Round
          </h1>
        </div>
        <p className="text-sm ml-11" style={{ color: "var(--text-2)" }}>
          Define policy, set parameters, deposit GEN into escrow.
          GenLayer validators will judge allocations when you request a verdict.
        </p>
      </div>

      <CreateRoundFundingForm />
    </div>
  );
}
