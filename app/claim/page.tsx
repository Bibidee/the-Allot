"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecipientClaims } from "@/lib/genlayer/contract";
import type { RecipientClaim } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { useWallet } from "@/lib/context/WalletContext";
import { Coins, Loader2 } from "lucide-react";

export default function ClaimPage() {
  const { address, connect } = useWallet();
  const [claims, setClaims] = useState<RecipientClaim[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getRecipientClaims(address).then(setClaims).finally(() => setLoading(false));
  }, [address]);

  const pending = claims.filter((c) => !c.claimed);
  const claimed = claims.filter((c) => c.claimed);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="w-5 h-5 text-[#f0c040]" />
        <h1 className="text-2xl font-bold text-[#f0f4f8]">Claim Center</h1>
      </div>

      {!address ? (
        <div className="text-center py-12">
          <p className="text-[#475569] mb-4">Connect your wallet to see claimable GEN payouts.</p>
          <button onClick={connect} className="px-4 py-2 bg-[#f0c040] text-[#0a0f1a] font-bold text-sm rounded-lg">
            Connect Wallet
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 text-[#475569] py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading claims…</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-4 text-xs flex items-center gap-3">
            <Coins className="w-4 h-4 text-[#f0c040]" />
            <span className="font-mono text-[#60a5fa]">{address}</span>
          </div>

          {pending.length > 0 && (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-[#f0c040] font-semibold mb-3">Claimable GEN</h2>
              <div className="space-y-2">
                {pending.map((c) => (
                  <div key={`${c.round_id}:${c.application_id}`} className="rounded-xl border border-[#f0c040]/30 bg-[#1e1a0e] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#e2e8f0]">{c.round_title || `Round #${c.round_id}`}</p>
                      <p className="text-xs text-[#475569]">Application #{c.application_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <GenAmount wei={c.amount} size="md" highlight />
                      <Link href={`/rounds/${c.round_id}`}
                        className="px-3 py-1.5 bg-[#f0c040] text-[#0a0f1a] font-bold text-xs rounded-lg hover:bg-[#fcd34d] transition-all">
                        Claim GEN Payout
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {claimed.length > 0 && (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold mb-3">Claimed History</h2>
              <div className="space-y-2">
                {claimed.map((c) => (
                  <div key={`${c.round_id}:${c.application_id}`} className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#64748b]">{c.round_title || `Round #${c.round_id}`}</p>
                      <p className="text-xs text-[#334155]">Application #{c.application_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <GenAmount wei={c.amount} size="sm" className="text-[#34d399]" />
                      <span className="text-[9px] border border-[#34d399]/30 text-[#34d399] px-2 py-0.5 rounded uppercase tracking-wider">Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {claims.length === 0 && (
            <p className="text-center text-[#475569] py-8 text-sm">No allocations found for this wallet.</p>
          )}
        </div>
      )}
    </div>
  );
}
