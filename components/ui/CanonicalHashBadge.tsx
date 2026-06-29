"use client";

interface Props { hash: string }

export function CanonicalHashBadge({ hash }: Props) {
  if (!hash) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1829] border border-[#1e3a5f] rounded text-xs">
      <span className="text-[#475569] uppercase tracking-widest text-[10px]">Canonical Hash</span>
      <span className="font-mono text-[#60a5fa] break-all">{hash}</span>
    </div>
  );
}
