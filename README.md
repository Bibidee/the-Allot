# Allot — Payable GEN Allocation Court

> **Fair allocation, enforced by escrow.**

Allot turns grant rounds, bounty pools, hackathon prizes, and contributor rewards into payable GenLayer allocation courts. Sponsors deposit real GEN. Applicants submit evidence. GenLayer validators produce a canonical allocation verdict. Recipients claim GEN payouts.

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Contract | GenLayer Intelligent Contract (Python) |
| Chain | GenLayer StudioNet (Chain ID 61999) |
| Wallet | Injected (MetaMask, etc.) |
| Asset | Native GEN only |

No backend. No database. No Supabase. All state lives on-chain.

---

## Quick Start

### 1. Install dependencies

```bash
cd Allot
npm install
```

### 2. Deploy the contract

Install the GenLayer CLI:

```bash
npm install -g @genlayer/cli
```

Deploy to StudioNet:

```bash
genlayer network set studionet
genlayer deploy contract/AllotPayableAllocationCourt.py
```

Copy the deployed contract address.

### 3. Configure environment

Edit `.env.local`:

```
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Scenario: June GenLayer Builder Rewards

### Setup

1. Connect MetaMask to StudioNet (Chain 61999, RPC: `https://studio.genlayer.com/api`)
2. Get test GEN from the StudioNet faucet

### Step 1 — Sponsor creates a round

Go to `/rounds/new` and fill in:

- **Title:** `June GenLayer Builder Rewards`
- **Category:** Contributor Rewards
- **Policy:** `Reward public GenLayer ecosystem contributions from June 2026. Stronger rewards go to work that is original, public, educational, technically useful, and clearly tied to GenLayer. Low-effort posts, copied work, unverifiable claims, or unrelated content should receive no allocation.`
- **Evidence Requirements:** `GitHub repos, deployment links, written articles, threads, or screenshots of public support activity.`
- **Submission Deadline:** 7 days from now
- **Review Deadline:** 14 days from now
- **Max Recipients:** 10
- **Min Payout:** 0
- **Max Per Recipient:** 10 GEN
- **Initial Deposit:** `20 GEN`

Click **Create Round + Deposit GEN**. MetaMask prompts for 20 GEN. The contract holds it in escrow.

### Step 2 — Applicants submit

Go to `/rounds/[id]/apply` (four times from different wallets):

| Applicant | Request Title | Requested | Evidence |
|---|---|---|---|
| Builder A | Deep GenLayer Tutorial | 8 GEN | GitHub repo + deployment + writeup |
| Writer B | GenLayer Intelligent Contracts Explainer | 4 GEN | Original public thread + article |
| Builder C | GenLayer UI Demo | 5 GEN | Weak copied UI demo link |
| Supporter D | GenLayer Community Support | 3 GEN | Screenshots of answers + support links |

### Step 3 — Sponsor closes submissions

On the round page, click **Close Submissions**.

### Step 4 — Request allocation verdict

Click **Request Allocation Verdict**. GenLayer validators evaluate the policy and evidence. This is non-deterministic — validators reach consensus using the Equivalence Principle.

Expected verdict:
- Builder A: **8 GEN** (strong_policy_fit, high confidence)
- Writer B: **4 GEN** (unique_contribution, high confidence)
- Supporter D: **3 GEN** (partial_policy_fit, medium confidence)
- Builder C: **0 GEN** (rejected — weak_evidence)
- Refund to sponsor: **5 GEN**

### Step 5 — Recipients claim GEN

Each approved recipient connects their wallet and clicks **Claim GEN Payout** on `/claim` or the round page. The contract transfers GEN to their address.

### Step 6 — Sponsor refunds unallocated GEN

Sponsor clicks **Refund Unallocated GEN** on the round page. The 5 GEN is returned.

---

## Contract Methods

### Payable (GEN-receiving)

| Method | Description |
|---|---|
| `create_round_and_fund(...)` | Create a round and deposit GEN escrow |
| `add_funds(round_id)` | Add more GEN to an existing round |

### Write

| Method | Description |
|---|---|
| `submit_application(...)` | Submit an evidence-backed application |
| `close_submissions(round_id)` | Close the application intake window |
| `request_allocation(round_id)` | Trigger GenLayer AI consensus allocation |
| `claim_payout(round_id, app_id)` | Recipient claims their allocated GEN |
| `refund_unallocated(round_id)` | Sponsor claims unallocated GEN back |
| `cancel_round_and_refund(round_id)` | Cancel (only if no applications) |

### View

| Method | Description |
|---|---|
| `get_round(round_id)` | Full round data |
| `get_round_count()` | Total rounds created |
| `list_rounds()` | Summary of all rounds |
| `get_round_applications(round_id)` | All applications for a round |
| `get_allocations(round_id)` | All allocations for a round |
| `get_claimable(round_id, address)` | Unclaimed allocations for an address |
| `get_sponsor_rounds(address)` | All rounds created by an address |
| `get_recipient_claims(address)` | All claim history for an address |
| `get_round_financials(round_id)` | Pool, allocated, claimed, unallocated |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing — product overview |
| `/rounds` | Public round index |
| `/rounds/new` | Create payable round |
| `/rounds/[id]` | Round command page with full money rail |
| `/rounds/[id]/apply` | Submit application |
| `/claim` | Recipient claim center |
| `/sponsor` | Sponsor control desk |

---

## Money Flow

```
Sponsor Wallet
  → create_round_and_fund (payable, GEN deposited)
    → Escrow Vault (contract holds GEN)
      → request_allocation (GenLayer consensus)
        → finalized verdict stored on-chain
          → claim_payout (recipient claims GEN)
          → refund_unallocated (sponsor claims remainder)
```

Every GEN movement is a real on-chain transaction. No simulated balances.

---

## Allocation Verdict Schema

```json
{
  "round_id": "1",
  "verdict": "allocate",
  "total_allocated": "15000000000000000000",
  "allocations": [
    {
      "application_id": "1",
      "recipient": "0x...",
      "amount": "8000000000000000000",
      "confidence": "high",
      "reason_code": "strong_policy_fit"
    }
  ],
  "rejected_application_ids": ["3"],
  "risk_flags": ["weak_evidence_on_rejected_submission"]
}
```

Amounts are in wei (1 GEN = 10^18 wei).

---

## Network

| Property | Value |
|---|---|
| Network | GenLayer StudioNet |
| Chain ID | 61999 |
| RPC | https://studio.genlayer.com/api |
| Explorer | https://explorer-studio.genlayer.com |
