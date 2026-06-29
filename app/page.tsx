import Link from "next/link";
import { ArrowRight, Vault, Gavel, Coins, Shield } from "lucide-react";

export default function Home() {
  const steps = [
    { icon: Vault, title: "Fund a Round", desc: "Sponsor deposits GEN into escrow. No GEN, no round." },
    { icon: ArrowRight, title: "Collect Applications", desc: "Applicants submit evidence-backed requests with proof of work." },
    { icon: Gavel, title: "GenLayer Judges", desc: "Validators reach consensus on who deserves allocation and how much." },
    { icon: Coins, title: "Pay Recipients in GEN", desc: "Approved applicants claim GEN payouts directly from escrow." },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e1a0e] border border-[#f0c040]/30 rounded-full text-[10px] uppercase tracking-widest text-[#f0c040] mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f0c040] animate-pulse" />
          GenLayer StudioNet · Live Escrow
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-[#f0f4f8] mb-4 leading-tight">
          Fair allocation,<br />
          <span className="text-[#f0c040]">enforced by escrow.</span>
        </h1>

        <p className="text-lg text-[#64748b] max-w-2xl mx-auto mb-8 leading-relaxed">
          Allot turns grant rounds, bounty pools, hackathon prizes, and contributor rewards into
          payable GenLayer allocation courts. Real GEN. Real verdicts. Real payouts.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/rounds/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#f0c040] hover:bg-[#fcd34d] text-[#0a0f1a] font-bold rounded-xl transition-all text-sm"
          >
            <Vault className="w-4 h-4" />
            Create Payable Round
          </Link>
          <Link
            href="/rounds"
            className="flex items-center gap-2 px-5 py-3 bg-[#0a1628] hover:bg-[#0d2049] border border-[#1e3a5f] text-[#60a5fa] font-semibold rounded-xl transition-all text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            Explore Live Rounds
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-[10px] uppercase tracking-widest text-[#334155] text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded border border-[#1e3a5f] flex items-center justify-center">
                  <span className="text-xs font-mono text-[#475569]">{i + 1}</span>
                </div>
                <s.icon className="w-4 h-4 text-[#f0c040]" />
              </div>
              <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">{s.title}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#070d1a] p-8 mb-8">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-[#f0c040] flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-[#f0f4f8] mb-2">Allocation without settlement is theater.</h2>
            <p className="text-[#64748b] leading-relaxed">
              Traditional systems separate the rules from the judgment from the payment. Allot makes them inseparable.
              The sponsor funds first. GenLayer judges fairly. Recipients claim real GEN.
              No manual winners. No fake balances. No hidden committee.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          ["Contributor Rewards", "Retroactive rewards for public ecosystem work"],
          ["Hackathon Prizes", "Fair multi-winner prize distribution"],
          ["Grant Micro-Rounds", "Policy-filtered micro grant allocation"],
          ["Bounty Review", "Full, partial, or reject bounty payouts"],
          ["Community Work", "Threads, PRs, support, docs, content"],
          ["Custom Policy", "Any evidence-backed allocation need"],
        ].map(([title, desc]) => (
          <div key={title} className="p-4 rounded-xl border border-[#1e293b] bg-[#04080f] hover:border-[#1e3a5f] transition-all cursor-default">
            <div className="text-sm font-semibold text-[#cbd5e1] mb-1">{title}</div>
            <div className="text-xs text-[#475569]">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
