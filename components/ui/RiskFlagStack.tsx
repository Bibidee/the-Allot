"use client";

interface Props { flags: string[] }

export function RiskFlagStack({ flags }: Props) {
  if (!flags || flags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag, i) => (
        <span key={i} className="px-2 py-1 text-[10px] uppercase tracking-wider"
          style={{
            background: "rgba(201,125,6,0.08)", border: "1px solid rgba(201,125,6,0.3)",
            borderRadius: "3px", fontFamily: "'JetBrains Mono', monospace", color: "var(--amber)",
          }}>
          {flag.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}
