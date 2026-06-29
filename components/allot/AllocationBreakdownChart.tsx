"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Allocation } from "@/lib/genlayer/types";
import { weiToGen } from "@/lib/genlayer/contract";

interface Props {
  allocations: Allocation[];
  pool: string;
}

const COLORS = ["#c8991e", "#0d9e73", "#4a9ebb", "#a78bfa", "#f97316", "#e879f9"];

export function AllocationBreakdownChart({ allocations, pool }: Props) {
  if (!allocations || allocations.length === 0) return null;

  const poolBig = BigInt(pool);
  const totalAllocated = allocations.reduce((s, a) => s + BigInt(a.amount), 0n);
  const unallocated = poolBig - totalAllocated;

  const data = [
    ...allocations.map((a, i) => ({
      name: `App #${a.application_id}`,
      value: Number(BigInt(a.amount) * 1000n / poolBig) / 10,
      gen: weiToGen(a.amount),
    })),
    ...(unallocated > 0n ? [{ name: "Unallocated", value: Number(unallocated * 1000n / poolBig) / 10, gen: weiToGen(unallocated.toString()) }] : []),
  ];

  return (
    <div style={{ background: "var(--vault-panel)", border: "1px solid var(--vault-border)", borderRadius: "3px", padding: "16px" }}>
      <div className="text-[9px] uppercase tracking-[0.2em] mb-4"
        style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
        Allocation Breakdown
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={60} dataKey="value" strokeWidth={0}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.name === "Unallocated" ? "rgba(255,255,255,0.08)" : COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--vault-surface)", border: "1px solid var(--vault-border)", borderRadius: "3px", fontSize: 11 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, name: any) => [`${(v as number).toFixed(1)}%`, name as string] as any}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 flex-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 flex-shrink-0"
                style={{ background: d.name === "Unallocated" ? "rgba(255,255,255,0.08)" : COLORS[i % COLORS.length], borderRadius: "2px" }} />
              <span className="text-xs flex-1" style={{ color: "var(--text-2)" }}>{d.name}</span>
              <span className="text-xs ml-auto" style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-1)" }}>{d.gen} GEN</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
