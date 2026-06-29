export interface Round {
  round_id: string;
  sponsor: string;
  title: string;
  summary: string;
  category: string;
  policy: string;
  evidence_requirements: string;
  max_recipients: string;
  min_payout: string;
  max_payout_per_recipient: string;
  pool_amount: string;
  allocated_amount: string;
  claimed_amount: string;
  submission_deadline: string;
  review_deadline: string;
  status: RoundStatus;
  created_at: string;
  closed_at: string;
  finalized_at: string;
  allocation_verdict_json: string;
  canonical_hash: string;
  unallocated_refunded: boolean;
}

export type RoundStatus =
  | "funded_open"
  | "submissions_closed"
  | "under_review"
  | "finalized"
  | "cancelled";

export interface Application {
  application_id: string;
  round_id: string;
  applicant: string;
  recipient_address: string;
  display_name: string;
  request_title: string;
  request_summary: string;
  requested_amount: string;
  evidence_urls: string[];
  self_assessment: string;
  submitted_at: string;
  status: string;
}

export interface Allocation {
  application_id: string;
  recipient: string;
  amount: string;
  confidence: string;
  reason_code: string;
  claimed: boolean;
  claimed_at: string;
}

export interface Verdict {
  round_id: string;
  verdict: string;
  total_allocated: string;
  allocations: VerdictAllocation[];
  rejected_application_ids: string[];
  risk_flags: string[];
}

export interface VerdictAllocation {
  application_id: string;
  recipient: string;
  amount: string;
  confidence: string;
  reason_code: string;
}

export interface RoundFinancials {
  round_id: string;
  pool_amount: string;
  allocated_amount: string;
  claimed_amount: string;
  unallocated_amount: string;
  unclaimed_amount: string;
  unallocated_refunded: boolean;
}

export interface RoundSummary {
  round_id: string;
  title: string;
  category: string;
  sponsor: string;
  pool_amount: string;
  allocated_amount: string;
  status: RoundStatus;
  submission_deadline: string;
  app_count: string;
}

export interface RecipientClaim {
  round_id: string;
  round_title: string;
  application_id: string;
  amount: string;
  claimed: boolean;
  claimed_at: string;
}

export interface TxState {
  status: "idle" | "pending" | "confirming" | "finalized" | "error" | "unconfirmed";
  hash?: string;
  error?: string;
}
