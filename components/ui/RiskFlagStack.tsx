"use client";

interface Props { flags: string[] }

export function RiskFlagStack({ flags }: Props) {
  if (!flags || flags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag, i) => (
        <span key={i} className="px-2 py-1 bg-[#2a1a0d] border border-[#f97316]/30 rounded text-[10px] font-mono text-[#fb923c] uppercase tracking-wider">
          {flag.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}
