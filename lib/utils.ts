import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(ts: string | number): string {
  const n = Number(ts);
  if (!n || n === 0) return "—";
  const d = new Date(n * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function isDeadlinePassed(ts: string | number): boolean {
  const n = Number(ts);
  if (!n || n === 0) return false;
  return Date.now() / 1000 > n;
}
