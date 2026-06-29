import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(ts: string | number): string {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function isDeadlinePassed(ts: string | number): boolean {
  return Date.now() / 1000 > Number(ts);
}
