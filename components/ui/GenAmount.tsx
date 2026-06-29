"use client";

import { weiToGen } from "@/lib/genlayer/contract";

interface Props {
  wei: string | bigint;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  highlight?: boolean;
}

export function GenAmount({ wei, className, size = "md", showLabel = true, highlight }: Props) {
  const gen = weiToGen(wei);
  const sz = { sm: "text-xs", md: "text-sm", lg: "text-base font-bold", xl: "text-xl font-bold" }[size];
  const col = highlight ? "var(--gold-text)" : "var(--text-1)";
  return (
    <span className={`${sz}${className ? ` ${className}` : ""}`}
      style={{ fontFamily: "'JetBrains Mono', monospace", color: className ? undefined : col }}>
      {gen}
      {showLabel && <span className="ml-1 text-[0.8em]" style={{ color: "var(--text-3)" }}>GEN</span>}
    </span>
  );
}
