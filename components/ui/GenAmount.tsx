"use client";

import { weiToGen } from "@/lib/genlayer/contract";
import { cn } from "@/lib/utils";

interface Props {
  wei: string | bigint;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  highlight?: boolean;
}

export function GenAmount({ wei, className, size = "md", showLabel = true, highlight }: Props) {
  const gen = weiToGen(wei);
  const sizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-xl",
  }[size];

  return (
    <span
      className={cn(
        "font-mono tabular-nums tracking-tight",
        sizeClass,
        highlight ? "text-[#f0c040]" : "text-[#e2e8f0]",
        className
      )}
    >
      {gen}
      {showLabel && <span className="text-[#94a3b8] ml-1 text-[0.8em]">GEN</span>}
    </span>
  );
}
