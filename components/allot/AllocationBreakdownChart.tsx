"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Allocation } from "@/lib/genlayer/types";
import { weiToGen } from "@/lib/genlayer/contract";

interface Props {
  allocations: Allocation[];
  pool: string;
}

const COLORS = ["#f0c040", "#34d399", "#60a5fa", "#a78bfa", "#f97316", "#e879f9"];

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
    ...(unallocated > 0n ? [{ name: "Unallocated", value: Number(unallocated * 1000n / poolBig) / 10, gen: weiToGen(unallocated) }] : []),
  ];

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#070d1a] p-5">
      <h3 className="text-[10px] uppercase tracking-widest text-[#475569] font-semibold mb-4">Allocation Breakdown</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === data.length - 1 && data[i].name === "Unallocated" ? "#1e293b" : COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#070d1a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, name: any) => [`${(v as number).toFixed(1)}%`, name as string] as any}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 flex-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === data.length - 1 && d.name === "Unallocated" ? "#1e293b" : COLORS[i % COLORS.length] }} />
              <span className="text-xs text-[#94a3b8]">{d.name}</span>
              <span className="ml-auto font-mono text-xs text-[#e2e8f0]">{d.gen} GEN</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
