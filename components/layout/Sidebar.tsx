"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, PlusCircle, Search, Coins, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/context/WalletContext";
import { useEffect, useState } from "react";
import { listRounds } from "@/lib/genlayer/contract";

const NAV = [
  { href: "/",           label: "Allot",        icon: Layers,         exact: true,  sponsorOnly: false },
  { href: "/rounds",     label: "Explore",       icon: Search,                       sponsorOnly: false },
  { href: "/rounds/new", label: "New Round",     icon: PlusCircle,                   sponsorOnly: false },
  { href: "/claim",      label: "Claim",         icon: Coins,                        sponsorOnly: false },
  { href: "/sponsor",    label: "Sponsor Desk",  icon: LayoutDashboard,              sponsorOnly: true  },
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
    <aside className="fixed inset-y-0 left-0 w-52 bg-[#04080f] border-r border-[#0d1829] flex flex-col z-40">
      <div className="px-5 py-6 border-b border-[#0d1829]">
        <span className="text-lg font-bold tracking-tight text-[#f0c040]">ALLOT</span>
        <div className="text-[10px] uppercase tracking-widest text-[#334155] mt-0.5">Allocation Court</div>
      </div>

      <nav className="flex-1 py-4 space-y-0.5">
        {NAV.filter(({ sponsorOnly }) => !sponsorOnly || isSponsor).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path === href || (path.startsWith(href + "/") && href !== "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-sm transition-all",
                active
                  ? "text-[#f0c040] bg-[#1e1a0e] border-r-2 border-[#f0c040]"
                  : "text-[#475569] hover:text-[#94a3b8] hover:bg-[#0a0f1a]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#0d1829]">
        <div className="text-[9px] uppercase tracking-widest text-[#1e293b]">GenLayer StudioNet</div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
          <span className="text-[10px] text-[#334155]">Chain 61999</span>
        </div>
      </div>
    </aside>
  );
}
