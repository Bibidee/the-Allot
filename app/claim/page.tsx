"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecipientClaims } from "@/lib/genlayer/contract";
import type { RecipientClaim } from "@/lib/genlayer/types";
import { GenAmount } from "@/components/ui/GenAmount";
import { useWallet } from "@/lib/context/WalletContext";
import { Coins, Loader2, CheckCircle2 } from "lucide-react";

export default function ClaimPage() {
  const { address, connect } = useWallet();
  const [claims, setClaims] = useState<RecipientClaim[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getRecipientClaims(address.toLowerCase()).then(setClaims).finally(() => setLoading(false));
  }, [address]);

  const pending = claims.filter((c) => !c.claimed);
  const claimed = claims.filter((c) => c.claimed);

  return (
    <div style={{ maxWidth: "720px" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 flex items-center justify-center"
          style={{ background: "rgba(200,153,30,0.08)", border: "1px solid rgba(200,153,30,0.3)" }}>
          <Coins className="w-4 h-4" style={{ color: "var(--gold-text)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            My Claims
          </h1>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>GEN allocations from finalized rounds</p>
        </div>
      </div>

      {!address ? (
        <div className="text-center py-12"
          style={{ border: "1px dashed var(--vault-border2)", borderRadius: "3px" }}>
          <Coins className="w-6 h-6 mx-auto mb-3" style={{ color: "var(--text-3)" }} />
          <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>
            Connect your wallet to see claimable GEN payouts.
          </p>
          <button onClick={connect}
            className="px-5 py-2.5 text-sm font-bold transition-all"
            style={{ background: "var(--gold)", color: "#030912", borderRadius: "3px", fontFamily: "'Space Grotesk', sans-serif" }}>
            Connect Wallet
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-12" style={{ color: "var(--text-3)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading payout rail…</span>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Wallet badge */}
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--mint-bright)" }} />
            <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-2)" }}>
              {address}
            </span>
          </div>

          {/* Claimable */}
          {pending.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] mb-3"
                style={{ color: "var(--gold-text)", fontFamily: "'JetBrains Mono', monospace" }}>
                Claimable GEN · {pending.length} payout{pending.length !== 1 ? "s" : ""}
              </div>
              <div className="space-y-2">
                {pending.map((c) => (
                  <div key={`${c.round_id}:${c.application_id}`}
                    className="flex items-center justify-between gap-4 p-4"
                    style={{ background: "rgba(200,153,30,0.04)", border: "1px solid rgba(200,153,30,0.2)", borderRadius: "3px" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-1)" }}>
                        {c.round_title || `Round #${c.round_id}`}
                      </p>
                      <p className="text-[10px] mt-0.5"
                        style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                        Application #{c.application_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <GenAmount wei={c.amount} size="md" highlight />
                      <Link href={`/rounds/${c.round_id}`}
                        className="px-3 py-1.5 text-xs font-bold transition-all"
                        style={{ background: "var(--gold)", color: "#030912", borderRadius: "3px", fontFamily: "'Space Grotesk', sans-serif" }}>
                        Claim →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claimed history */}
          {claimed.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] mb-3"
                style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                Claimed History · {claimed.length} payout{claimed.length !== 1 ? "s" : ""}
              </div>
              <div className="space-y-2">
                {claimed.map((c) => (
                  <div key={`${c.round_id}:${c.application_id}`}
                    className="flex items-center justify-between gap-4 p-4"
                    style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px" }}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--mint)" }} />
                      <div className="min-w-0">
                        <p className="text-sm truncate" style={{ color: "var(--text-2)", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {c.round_title || `Round #${c.round_id}`}
                        </p>
                        <p className="text-[10px]"
                          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                          App #{c.application_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <GenAmount wei={c.amount} size="sm" />
                      <span className="text-[9px] px-1.5 py-0.5 uppercase"
                        style={{ color: "var(--mint-bright)", border: "1px solid rgba(13,158,115,0.3)", background: "rgba(13,158,115,0.08)", borderRadius: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
                        PAID
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {claims.length === 0 && (
            <div className="py-12 text-center"
              style={{ border: "1px dashed var(--vault-border2)", borderRadius: "3px" }}>
              <p className="text-sm" style={{ color: "var(--text-3)" }}>No allocations found for this wallet.</p>
              <Link href="/rounds" className="text-xs mt-2 block hover:underline"
                style={{ color: "var(--court-blue-b)" }}>
                Browse open rounds →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
