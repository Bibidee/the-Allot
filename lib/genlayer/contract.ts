"use client";

import { getClient, getClientReady } from "@/lib/genlayer/client";
import type {
  Round, Application, Allocation, RoundFinancials,
  RoundSummary, RecipientClaim, TxState,
} from "@/lib/genlayer/types";

function contractAddress(): `0x${string}` {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr) throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set");
  return addr as `0x${string}`;
}

function parseJson<T>(raw: string): T | null {
  try { return JSON.parse(raw) as T; } catch { return null; }
}

// ---- Read methods ----

export async function getRound(round_id: string): Promise<Round | null> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_round",
    args: [round_id],
  });
  const rd = parseJson<Round>(result as string);
  if (!rd || "error" in (rd as object)) return null;
  return rd;
}

export async function getRoundCount(): Promise<number> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_round_count",
    args: [],
  });
  return parseInt(result as string, 10) || 0;
}

export async function listRounds(): Promise<RoundSummary[]> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "list_rounds",
    args: [],
  });
  return parseJson<RoundSummary[]>(result as string) ?? [];
}

export async function getRoundApplications(round_id: string): Promise<Application[]> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_round_applications",
    args: [round_id],
  });
  return parseJson<Application[]>(result as string) ?? [];
}

export async function getApplication(round_id: string, application_id: string): Promise<Application | null> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_application",
    args: [round_id, application_id],
  });
  return parseJson<Application>(result as string);
}

export async function getAllocations(round_id: string): Promise<Allocation[]> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_allocations",
    args: [round_id],
  });
  return parseJson<Allocation[]>(result as string) ?? [];
}

export async function getClaimable(round_id: string, address: string): Promise<Allocation[]> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_claimable",
    args: [round_id, address],
  });
  return parseJson<Allocation[]>(result as string) ?? [];
}

export async function getSponsorRounds(address: string): Promise<Round[]> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_sponsor_rounds",
    args: [address],
  });
  return parseJson<Round[]>(result as string) ?? [];
}

export async function getRecipientClaims(address: string): Promise<RecipientClaim[]> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_recipient_claims",
    args: [address],
  });
  return parseJson<RecipientClaim[]>(result as string) ?? [];
}

export async function getRoundFinancials(round_id: string): Promise<RoundFinancials | null> {
  const client = getClient();
  const result = await client.readContract({
    address: contractAddress(),
    functionName: "get_round_financials",
    args: [round_id],
  });
  return parseJson<RoundFinancials>(result as string);
}

// ---- Write methods ----

export async function createRoundAndFund(params: {
  title: string;
  summary: string;
  category: string;
  policy: string;
  evidence_requirements: string;
  submission_deadline: bigint;
  review_deadline: bigint;
  max_recipients: bigint;
  min_payout: bigint;
  max_payout_per_recipient: bigint;
  value: bigint;
}): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "create_round_and_fund",
    args: [
      params.title, params.summary, params.category, params.policy,
      params.evidence_requirements,
      params.submission_deadline, params.review_deadline,
      params.max_recipients, params.min_payout, params.max_payout_per_recipient,
    ],
    value: params.value,
  });
  return hash as string;
}

export async function addFunds(round_id: string, value: bigint): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "add_funds",
    args: [round_id],
    value,
  });
  return hash as string;
}

export async function submitApplication(params: {
  round_id: string;
  display_name: string;
  request_title: string;
  request_summary: string;
  requested_amount: bigint;
  recipient_address: string;
  evidence_urls: string[];
  self_assessment: string;
}): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "submit_application",
    args: [
      params.round_id, params.display_name, params.request_title,
      params.request_summary, params.requested_amount,
      params.recipient_address, JSON.stringify(params.evidence_urls),
      params.self_assessment,
    ],
    value: 0n,
  });
  return hash as string;
}

export async function closeSubmissions(round_id: string): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "close_submissions",
    args: [round_id],
    value: 0n,
  });
  return hash as string;
}

export async function requestAllocation(round_id: string): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "request_allocation",
    args: [round_id],
    value: 0n,
  });
  return hash as string;
}

export async function claimPayout(round_id: string, application_id: string): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "claim_payout",
    args: [round_id, application_id],
    value: 0n,
  });
  return hash as string;
}

export async function refundUnallocated(round_id: string): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "refund_unallocated",
    args: [round_id],
    value: 0n,
  });
  return hash as string;
}

export async function cancelRoundAndRefund(round_id: string): Promise<string> {
  const client = await getClientReady();
  const hash = await client.writeContract({
    address: contractAddress(),
    functionName: "cancel_round_and_refund",
    args: [round_id],
    value: 0n,
  });
  return hash as string;
}

// ---- Helpers ----

export function genToWei(gen: string): bigint {
  const parts = gen.split(".");
  const whole = BigInt(parts[0] || "0");
  let frac = BigInt(0);
  if (parts[1]) {
    const padded = parts[1].padEnd(18, "0").slice(0, 18);
    frac = BigInt(padded);
  }
  return whole * BigInt("1000000000000000000") + frac;
}

export function weiToGen(wei: string | bigint): string {
  const w = BigInt(wei);
  const one = BigInt("1000000000000000000");
  const whole = w / one;
  const frac = w % one;
  if (frac === BigInt(0)) return whole.toString();
  const fracStr = frac.toString().padStart(18, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function waitForTx(
  hash: string,
  onUpdate: (state: TxState) => void
): void {
  const client = getClient();
  onUpdate({ status: "pending", hash });
  (async () => {
    try {
      // @ts-expect-error waitForTransactionReceipt may not be typed
      await client.waitForTransactionReceipt({ hash });
      onUpdate({ status: "finalized", hash });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Network fetch errors mean we lost the connection, not that the tx failed
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) {
        onUpdate({ status: "unconfirmed", hash, error: "Transaction sent — confirmation timed out. Check the explorer to verify." });
      } else {
        onUpdate({ status: "error", hash, error: msg });
      }
    }
  })();
}
