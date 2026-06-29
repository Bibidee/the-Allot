"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Radio, PlusSquare, Coins, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/context/WalletContext";
import { useEffect, useState } from "react";
import { listRounds } from "@/lib/genlayer/contract";

const NAV = [
  { href: "/",           label: "Court",        icon: Scale,       exact: true,  sponsorOnly: false },
  { href: "/rounds",     label: "Live Rounds",  icon: Radio,                     sponsorOnly: false },
  { href: "/rounds/new", label: "Create Round", icon: PlusSquare,                sponsorOnly: false },
  { href: "/claim",      label: "My Claims",    icon: Coins,                     sponsorOnly: false },
  { href: "/sponsor",    label: "Sponsor Desk", icon: LayoutGrid,                sponsorOnly: true  },
];

export function Sidebar() {
  const path = usePathname();
  const { address } = useWallet();
  const [isSponsor, setIsSponsor] = useState(false);

  useEffect(() => {
    if (!address) { setIsSponsor(false); return; }
    listRounds().then((rounds) => {
      setIsSponsor(rounds.some((r) => r.sponsor.toLowerCase() === address.toLowerCase()));
    }).catch(() => setIsSponsor(false));
  }, [address]);

  return (
    <aside className="fixed inset-y-0 left-0 w-48 flex flex-col z-40"
      style={{ background: "var(--vault-black)", borderRight: "1px solid var(--vault-border)" }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid var(--vault-border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 flex items-center justify-center"
            style={{ border: "1px solid var(--gold)", background: "rgba(200,153,30,0.08)" }}>
            <Scale className="w-3 h-3" style={{ color: "var(--gold-text)" }} />
          </div>
          <span className="font-display font-700 text-sm tracking-widest uppercase"
            style={{ color: "var(--gold-text)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            ALLOT
          </span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.2em] mt-0.5 pl-7"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Vault Court System
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.filter(({ sponsorOnly }) => !sponsorOnly || isSponsor).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path === href || (path.startsWith(href + "/") && href !== "/");
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all relative group",
                active ? "font-semibold" : "font-normal"
              )}
              style={{
                color: active ? "var(--gold-text)" : "var(--text-2)",
                background: active ? "rgba(200,153,30,0.06)" : "transparent",
                borderRight: active ? "2px solid var(--gold)" : "2px solid transparent",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Chain status */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--vault-border)" }}>
        <div className="text-[9px] uppercase tracking-widest mb-1.5"
          style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Network
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--mint-bright)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>
            StudioNet · 61999
          </span>
        </div>
      </div>
    </aside>
  );
}
