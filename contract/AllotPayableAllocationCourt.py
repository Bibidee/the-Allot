# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


# ---------------------------------------------------------------------------
# AllotPayableAllocationCourt — GenLayer Intelligent Contract
#
# Sponsors deposit real GEN into allocation rounds. Applicants submit
# evidence-backed requests. GenLayer validators produce a canonical
# allocation verdict. Recipients claim GEN. Sponsors refund the remainder.
# ---------------------------------------------------------------------------


ALLOWED_VERDICTS = [
    "allocate",
    "no_valid_applications",
    "insufficient_evidence",
    "policy_unclear",
    "manual_review_recommended",
]
ALLOWED_CONFIDENCE = ["high", "medium", "low"]
ALLOWED_REASON_CODES = [
    "strong_policy_fit",
    "partial_policy_fit",
    "high_impact",
    "clear_delivery",
    "unique_contribution",
    "weak_evidence",
    "duplicate_submission",
    "outside_scope",
    "insufficient_detail",
    "manipulation_risk",
]
ALLOWED_APP_STATUSES = ["submitted", "included_in_review", "allocated", "rejected", "invalid"]
ALLOWED_ROUND_STATUSES = ["funded_open", "submissions_closed", "under_review", "finalized", "cancelled"]


def _json(v) -> str:
    return json.dumps(v, sort_keys=True, separators=(",", ":"))


def _loads(raw: str, fallback):
    if not raw:
        return fallback
    try:
        return json.loads(raw)
    except Exception:
        return fallback


@gl.evm.contract_interface
class _EOA:
    class View:
        pass
    class Write:
        pass


class AllotPayableAllocationCourt(gl.Contract):
    # round_id (str) -> round JSON
    rounds: TreeMap[str, str]
    # f"{round_id}:{app_id}" -> application JSON
    applications: TreeMap[str, str]
    # f"{round_id}:{app_id}" -> allocation JSON
    allocations: TreeMap[str, str]
    # round counter
    round_count: u256
    # round_id -> number of applications
    app_counts: TreeMap[str, u256]
    # address -> JSON array of round_ids
    sponsor_rounds: TreeMap[str, str]
    # address -> JSON array of round_ids with allocations
    recipient_rounds: TreeMap[str, str]

    def __init__(self) -> None:
        self.rounds = TreeMap()
        self.applications = TreeMap()
        self.allocations = TreeMap()
        self.round_count = u256(0)
        self.app_counts = TreeMap()
        self.sponsor_rounds = TreeMap()
        self.recipient_rounds = TreeMap()

    # -----------------------------------------------------------------------
    # create_round_and_fund  (PAYABLE)
    # -----------------------------------------------------------------------

    @gl.public.write.payable
    def create_round_and_fund(
        self,
        title: str,
        summary: str,
        category: str,
        policy: str,
        evidence_requirements: str,
        submission_deadline: u256,
        review_deadline: u256,
        max_recipients: u256,
        min_payout: u256,
        max_payout_per_recipient: u256,
    ) -> str:
        value = gl.message.value
        assert value > u256(0), "GEN escrow is required to create a round"
        assert title.strip(), "title must not be empty"
        assert policy.strip(), "policy must not be empty"
        assert evidence_requirements.strip(), "evidence_requirements must not be empty"
        assert int(submission_deadline) > int(gl.message.timestamp), "submission_deadline must be in the future"
        assert int(review_deadline) > int(submission_deadline), "review_deadline must be after submission_deadline"
        assert int(max_recipients) > 0, "max_recipients must be > 0"
        assert int(max_payout_per_recipient) > 0, "max_payout_per_recipient must be > 0"

        self.round_count = self.round_count + u256(1)
        round_id = str(int(self.round_count))
        sponsor = str(gl.message.sender_address)
        now = int(gl.message.timestamp)

        round_data = {
            "round_id": round_id,
            "sponsor": sponsor,
            "title": title,
            "summary": summary,
            "category": category,
            "policy": policy,
            "evidence_requirements": evidence_requirements,
            "max_recipients": str(int(max_recipients)),
            "min_payout": str(int(min_payout)),
            "max_payout_per_recipient": str(int(max_payout_per_recipient)),
            "pool_amount": str(int(value)),
            "allocated_amount": "0",
            "claimed_amount": "0",
            "submission_deadline": str(int(submission_deadline)),
            "review_deadline": str(int(review_deadline)),
            "status": "funded_open",
            "created_at": str(now),
            "closed_at": "0",
            "finalized_at": "0",
            "allocation_verdict_json": "",
            "canonical_hash": "",
            "unallocated_refunded": False,
        }
        self.rounds[round_id] = _json(round_data)
        self.app_counts[round_id] = u256(0)

        existing = _loads(self.sponsor_rounds.get(sponsor, ""), [])
        existing.append(round_id)
        self.sponsor_rounds[sponsor] = _json(existing)

        return round_id

    # -----------------------------------------------------------------------
    # add_funds  (PAYABLE)
    # -----------------------------------------------------------------------

    @gl.public.write.payable
    def add_funds(self, round_id: str) -> None:
        value = gl.message.value
        assert value > u256(0), "Must send GEN to add funds"
        raw = self.rounds.get(round_id, "")
        assert raw, "Round not found"
        rd = _loads(raw, {})
        assert str(gl.message.sender_address) == rd["sponsor"], "Only sponsor can add funds"
        status = rd["status"]
        assert status in ("funded_open", "submissions_closed"), f"Cannot add funds in status: {status}"
        rd["pool_amount"] = str(int(rd["pool_amount"]) + int(value))
        self.rounds[round_id] = _json(rd)

    # -----------------------------------------------------------------------
    # submit_application
    # -----------------------------------------------------------------------

    @gl.public.write
    def submit_application(
        self,
        round_id: str,
        display_name: str,
        request_title: str,
        request_summary: str,
        requested_amount: u256,
        recipient_address: str,
        evidence_urls: str,
        self_assessment: str,
    ) -> str:
        raw = self.rounds.get(round_id, "")
        assert raw, "Round not found"
        rd = _loads(raw, {})
        assert rd["status"] == "funded_open", "Round is not accepting applications"
        assert int(gl.message.timestamp) < int(rd["submission_deadline"]), "Submission deadline has passed"
        assert int(requested_amount) > 0, "Requested amount must be > 0"
        assert int(requested_amount) <= int(rd["pool_amount"]), "Requested amount exceeds pool"
        assert recipient_address.strip(), "Recipient address must not be empty"
        urls = _loads(evidence_urls, [])
        assert isinstance(urls, list) and len(urls) > 0, "At least one evidence URL is required"

        app_count = self.app_counts.get(round_id, u256(0))
        app_count = app_count + u256(1)
        self.app_counts[round_id] = app_count
        app_id = str(int(app_count))

        app_data = {
            "application_id": app_id,
            "round_id": round_id,
            "applicant": str(gl.message.sender_address),
            "recipient_address": recipient_address,
            "display_name": display_name,
            "request_title": request_title,
            "request_summary": request_summary,
            "requested_amount": str(int(requested_amount)),
            "evidence_urls": urls,
            "self_assessment": self_assessment,
            "submitted_at": str(int(gl.message.timestamp)),
            "status": "submitted",
        }
        key = f"{round_id}:{app_id}"
        self.applications[key] = _json(app_data)
        return app_id

    # -----------------------------------------------------------------------
    # close_submissions
    # -----------------------------------------------------------------------

    @gl.public.write
    def close_submissions(self, round_id: str) -> None:
        raw = self.rounds.get(round_id, "")
        assert raw, "Round not found"
        rd = _loads(raw, {})
        assert rd["status"] == "funded_open", "Round is not open for submissions"
        caller = str(gl.message.sender_address)
        is_sponsor = caller == rd["sponsor"]
        deadline_passed = int(gl.message.timestamp) >= int(rd["submission_deadline"])
        assert is_sponsor or deadline_passed, "Only sponsor can close before deadline"
        rd["status"] = "submissions_closed"
        rd["closed_at"] = str(int(gl.message.timestamp))
        self.rounds[round_id] = _json(rd)

    # -----------------------------------------------------------------------
    # request_allocation  (non-deterministic GenLayer consensus)
    # -----------------------------------------------------------------------

    @gl.public.write
    def request_allocation(self, round_id: str) -> None:
        raw = self.rounds.get(round_id, "")
        assert raw, "Round not found"
        rd = _loads(raw, {})
        assert rd["status"] == "submissions_closed", "Submissions must be closed before requesting allocation"
        app_count = int(self.app_counts.get(round_id, u256(0)))
        assert app_count > 0, "No applications to review"
        assert int(rd["pool_amount"]) > 0, "Pool has no GEN"

        # Mark under review
        rd["status"] = "under_review"
        self.rounds[round_id] = _json(rd)

        # Gather application data into local variables before nondet block
        apps_list = []
        for i in range(1, app_count + 1):
            app_raw = self.applications.get(f"{round_id}:{i}", "")
            if app_raw:
                apps_list.append(_loads(app_raw, {}))

        title = rd["title"]
        policy = rd["policy"]
        ev_req = rd["evidence_requirements"]
        pool = rd["pool_amount"]
        max_rec = rd["max_recipients"]
        min_pay = rd["min_payout"]
        max_pay = rd["max_payout_per_recipient"]

        apps_text = ""
        for a in apps_list:
            apps_text += (
                f"\nApplication ID: {a.get('application_id', '')}"
                f"\nApplicant: {a.get('display_name', '')}"
                f"\nRecipient Address: {a.get('recipient_address', '')}"
                f"\nRequested Amount (wei): {a.get('requested_amount', '0')}"
                f"\nRequest Title: {a.get('request_title', '')}"
                f"\nRequest Summary: {a.get('request_summary', '')}"
                f"\nEvidence URLs: {', '.join(a.get('evidence_urls', []))}"
                f"\nSelf-Assessment: {a.get('self_assessment', '')}"
                f"\n---"
            )

        prompt_text = f"""You are a neutral GenLayer allocation validator for the round:

ROUND TITLE: {title}
ROUND_ID: {round_id}

SPONSOR POLICY:
{policy}

EVIDENCE REQUIREMENTS:
{ev_req}

POOL AMOUNT (wei): {pool}
MAX RECIPIENTS: {max_rec}
MIN PAYOUT (wei): {min_pay}
MAX PAYOUT PER RECIPIENT (wei): {max_pay}

APPLICATIONS:
{apps_text}

Your task: allocate GEN from the pool to the applicants that best fit the policy and have strong evidence. The total allocated must NEVER exceed the pool amount ({pool} wei). Each allocation must not exceed {max_pay} wei. You may allocate to at most {max_rec} recipients.

Return ONLY the following minimal canonical JSON — no explanation, no markdown:
{{
  "round_id": "{round_id}",
  "verdict": "allocate",
  "total_allocated": "0",
  "allocations": [
    {{
      "application_id": "1",
      "recipient": "0x...",
      "amount": "0",
      "confidence": "high",
      "reason_code": "strong_policy_fit"
    }}
  ],
  "rejected_application_ids": [],
  "risk_flags": []
}}

verdict must be one of: allocate, no_valid_applications, insufficient_evidence, policy_unclear, manual_review_recommended
confidence must be one of: high, medium, low
reason_code must be one of: strong_policy_fit, partial_policy_fit, high_impact, clear_delivery, unique_contribution, weak_evidence, duplicate_submission, outside_scope, insufficient_detail, manipulation_risk
All amounts are strings in wei (1 GEN = 1000000000000000000 wei).
If verdict is not 'allocate', return empty allocations array."""

        task = (
            "Evaluate the applicants against the sponsor policy and evidence requirements. "
            "Allocate GEN from the pool fairly to qualified applicants. "
            "Return a minimal canonical JSON allocation verdict only."
        )
        criteria = (
            "The response must be valid JSON only. "
            f"verdict must be one of: {', '.join(ALLOWED_VERDICTS)}. "
            f"confidence for each allocation must be one of: {', '.join(ALLOWED_CONFIDENCE)}. "
            f"reason_code for each allocation must be one of: {', '.join(ALLOWED_REASON_CODES)}. "
            "total_allocated must not exceed pool amount. "
            "All amounts must be non-negative integer strings in wei. "
            "application_id and recipient must match submitted applications exactly."
        )

        def nondet_allocate() -> str:
            return prompt_text

        try:
            result_raw = gl.eq_principle.prompt_non_comparative(
                nondet_allocate,
                task=task,
                criteria=criteria,
            )
        except Exception:
            rd2 = _loads(self.rounds.get(round_id, ""), {})
            rd2["status"] = "submissions_closed"
            self.rounds[round_id] = _json(rd2)
            return

        raw_str = result_raw.strip() if isinstance(result_raw, str) else str(result_raw)
        backticks = "``" + "`"
        raw_str = raw_str.replace(backticks + "json", "").replace(backticks, "").strip()

        verdict_dict = _loads(raw_str, None)
        if not verdict_dict or not isinstance(verdict_dict, dict):
            rd2 = _loads(self.rounds.get(round_id, ""), {})
            rd2["status"] = "submissions_closed"
            self.rounds[round_id] = _json(rd2)
            return

        # ---- Hard validation ----
        verdict_str = str(verdict_dict.get("verdict", "")).lower()
        if verdict_str not in ALLOWED_VERDICTS:
            rd2 = _loads(self.rounds.get(round_id, ""), {})
            rd2["status"] = "submissions_closed"
            self.rounds[round_id] = _json(rd2)
            return

        pool_amount = int(rd["pool_amount"])
        max_payout = int(rd["max_payout_per_recipient"])
        max_recipients_int = int(rd["max_recipients"])
        alloc_list = verdict_dict.get("allocations", [])

        if not isinstance(alloc_list, list):
            alloc_list = []

        total_alloc = 0
        seen_app_ids = set()
        valid_allocs = []

        # Build app lookup
        app_lookup = {}
        for a in apps_list:
            app_lookup[str(a.get("application_id", ""))] = a

        if verdict_str == "allocate":
            if len(alloc_list) > max_recipients_int:
                rd2 = _loads(self.rounds.get(round_id, ""), {})
                rd2["status"] = "submissions_closed"
                self.rounds[round_id] = _json(rd2)
                return

            for alloc in alloc_list:
                if not isinstance(alloc, dict):
                    continue
                aid = str(alloc.get("application_id", ""))
                recipient = str(alloc.get("recipient", ""))
                try:
                    amount = int(alloc.get("amount", "0"))
                except Exception:
                    amount = 0
                conf = str(alloc.get("confidence", "")).lower()
                rc = str(alloc.get("reason_code", "")).lower()

                # Validate
                if aid not in app_lookup:
                    continue
                if aid in seen_app_ids:
                    continue
                if amount <= 0:
                    continue
                if amount > max_payout:
                    continue
                app_recipient = app_lookup[aid].get("recipient_address", "")
                if recipient.lower() != app_recipient.lower():
                    recipient = app_recipient
                if conf not in ALLOWED_CONFIDENCE:
                    conf = "low"
                if rc not in ALLOWED_REASON_CODES:
                    rc = "partial_policy_fit"

                seen_app_ids.add(aid)
                total_alloc += amount
                if total_alloc > pool_amount:
                    total_alloc -= amount
                    break
                valid_allocs.append({
                    "application_id": aid,
                    "recipient": recipient,
                    "amount": str(amount),
                    "confidence": conf,
                    "reason_code": rc,
                    "claimed": False,
                    "claimed_at": "0",
                })

        # Store allocations
        for alloc in valid_allocs:
            aid = alloc["application_id"]
            self.allocations[f"{round_id}:{aid}"] = _json(alloc)
            app_key = f"{round_id}:{aid}"
            app_raw = self.applications.get(app_key, "")
            if app_raw:
                app_data = _loads(app_raw, {})
                app_data["status"] = "allocated"
                self.applications[app_key] = _json(app_data)

            # Track recipient rounds
            rec_addr = alloc["recipient"]
            rec_rids = _loads(self.recipient_rounds.get(rec_addr, ""), [])
            if round_id not in rec_rids:
                rec_rids.append(round_id)
            self.recipient_rounds[rec_addr] = _json(rec_rids)

        # Mark rejected applications
        allocated_ids = {a["application_id"] for a in valid_allocs}
        for a in apps_list:
            aid = str(a.get("application_id", ""))
            if aid not in allocated_ids:
                app_key = f"{round_id}:{aid}"
                app_raw = self.applications.get(app_key, "")
                if app_raw:
                    app_data = _loads(app_raw, {})
                    app_data["status"] = "rejected"
                    self.applications[app_key] = _json(app_data)

        # Canonical verdict for storage (EP-minimal fields only)
        sorted_allocs = sorted(valid_allocs, key=lambda x: int(x["application_id"]))
        rejected_ids_raw = verdict_dict.get("rejected_application_ids", [])
        if not isinstance(rejected_ids_raw, list):
            rejected_ids_raw = []
        sorted_rejected = sorted([str(x) for x in rejected_ids_raw], key=lambda x: int(x) if x.isdigit() else 0)
        risk_flags = verdict_dict.get("risk_flags", [])
        if not isinstance(risk_flags, list):
            risk_flags = []

        canonical = {
            "round_id": round_id,
            "verdict": verdict_str,
            "total_allocated": str(total_alloc),
            "allocations": [
                {
                    "application_id": a["application_id"],
                    "recipient": a["recipient"],
                    "amount": a["amount"],
                    "confidence": a["confidence"],
                    "reason_code": a["reason_code"],
                }
                for a in sorted_allocs
            ],
            "rejected_application_ids": sorted_rejected,
            "risk_flags": risk_flags,
        }

        rd2 = _loads(self.rounds.get(round_id, ""), {})
        rd2["status"] = "finalized"
        rd2["allocated_amount"] = str(total_alloc)
        rd2["finalized_at"] = str(int(gl.message.timestamp))
        rd2["allocation_verdict_json"] = _json(canonical)
        rd2["canonical_hash"] = str(hash(_json(canonical)))
        self.rounds[round_id] = _json(rd2)

    # -----------------------------------------------------------------------
    # claim_payout
    # -----------------------------------------------------------------------

    @gl.public.write
    def claim_payout(self, round_id: str, application_id: str) -> None:
        raw = self.rounds.get(round_id, "")
        assert raw, "Round not found"
        rd = _loads(raw, {})
        assert rd["status"] == "finalized", "Round is not finalized"

        alloc_key = f"{round_id}:{application_id}"
        alloc_raw = self.allocations.get(alloc_key, "")
        assert alloc_raw, "No allocation found for this application"
        alloc = _loads(alloc_raw, {})
        assert not alloc.get("claimed", False), "Payout already claimed"

        caller = str(gl.message.sender_address)
        recipient = alloc.get("recipient", "")
        assert caller.lower() == recipient.lower(), "Caller is not the allocation recipient"

        amount = int(alloc.get("amount", "0"))
        assert amount > 0, "Allocation amount is zero"

        # Mark claimed BEFORE transfer (prevent re-entrancy)
        alloc["claimed"] = True
        alloc["claimed_at"] = str(int(gl.message.timestamp))
        self.allocations[alloc_key] = _json(alloc)

        rd["claimed_amount"] = str(int(rd.get("claimed_amount", "0")) + amount)
        self.rounds[round_id] = _json(rd)

        # Transfer GEN to recipient EOA
        _EOA(Address(recipient)).emit_transfer(value=u256(amount))

    # -----------------------------------------------------------------------
    # refund_unallocated
    # -----------------------------------------------------------------------

    @gl.public.write
    def refund_unallocated(self, round_id: str) -> None:
        raw = self.rounds.get(round_id, "")
        assert raw, "Round not found"
        rd = _loads(raw, {})
        assert rd["status"] == "finalized", "Round is not finalized"

        caller = str(gl.message.sender_address)
        assert caller == rd["sponsor"], "Only sponsor can claim refund"
        assert not rd.get("unallocated_refunded", False), "Refund already claimed"

        pool = int(rd["pool_amount"])
        allocated = int(rd["allocated_amount"])
        refund_amount = pool - allocated
        assert refund_amount > 0, "No unallocated GEN to refund"

        # Mark before transfer
        rd["unallocated_refunded"] = True
        self.rounds[round_id] = _json(rd)

        _EOA(Address(caller)).emit_transfer(value=u256(refund_amount))

    # -----------------------------------------------------------------------
    # cancel_round_and_refund
    # -----------------------------------------------------------------------

    @gl.public.write
    def cancel_round_and_refund(self, round_id: str) -> None:
        raw = self.rounds.get(round_id, "")
        assert raw, "Round not found"
        rd = _loads(raw, {})

        caller = str(gl.message.sender_address)
        assert caller == rd["sponsor"], "Only sponsor can cancel"
        assert rd["status"] not in ("finalized", "cancelled"), "Round cannot be cancelled in this state"

        app_count = int(self.app_counts.get(round_id, u256(0)))
        deadline_passed = int(gl.message.timestamp) >= int(rd["submission_deadline"])

        can_cancel = (
            app_count == 0
            or (deadline_passed and app_count == 0)
            or rd["status"] in ("funded_open",)
        )
        assert can_cancel, "Cannot cancel a round that has received applications"

        pool = int(rd["pool_amount"])
        assert pool > 0, "No GEN to refund"

        rd["status"] = "cancelled"
        rd["unallocated_refunded"] = True
        self.rounds[round_id] = _json(rd)

        _EOA(Address(caller)).emit_transfer(value=u256(pool))

    # -----------------------------------------------------------------------
    # View methods
    # -----------------------------------------------------------------------

    @gl.public.view
    def get_round(self, round_id: str) -> str:
        raw = self.rounds.get(round_id, "")
        if not raw:
            return _json({"error": "not_found"})
        return raw

    @gl.public.view
    def get_round_count(self) -> str:
        return str(int(self.round_count))

    @gl.public.view
    def get_round_applications(self, round_id: str) -> str:
        app_count = int(self.app_counts.get(round_id, u256(0)))
        result = []
        for i in range(1, app_count + 1):
            raw = self.applications.get(f"{round_id}:{i}", "")
            if raw:
                result.append(_loads(raw, {}))
        return _json(result)

    @gl.public.view
    def get_application(self, round_id: str, application_id: str) -> str:
        raw = self.applications.get(f"{round_id}:{application_id}", "")
        if not raw:
            return _json({"error": "not_found"})
        return raw

    @gl.public.view
    def get_allocations(self, round_id: str) -> str:
        app_count = int(self.app_counts.get(round_id, u256(0)))
        result = []
        for i in range(1, app_count + 1):
            raw = self.allocations.get(f"{round_id}:{i}", "")
            if raw:
                result.append(_loads(raw, {}))
        return _json(result)

    @gl.public.view
    def get_claimable(self, round_id: str, address: str) -> str:
        app_count = int(self.app_counts.get(round_id, u256(0)))
        result = []
        for i in range(1, app_count + 1):
            raw = self.allocations.get(f"{round_id}:{i}", "")
            if raw:
                alloc = _loads(raw, {})
                if alloc.get("recipient", "").lower() == address.lower() and not alloc.get("claimed", False):
                    result.append(alloc)
        return _json(result)

    @gl.public.view
    def get_sponsor_rounds(self, address: str) -> str:
        ids = _loads(self.sponsor_rounds.get(address, ""), [])
        result = []
        for rid in ids:
            raw = self.rounds.get(rid, "")
            if raw:
                result.append(_loads(raw, {}))
        return _json(result)

    @gl.public.view
    def get_recipient_claims(self, address: str) -> str:
        rids = _loads(self.recipient_rounds.get(address, ""), [])
        result = []
        for rid in rids:
            rd = _loads(self.rounds.get(rid, ""), {})
            app_count = int(self.app_counts.get(rid, u256(0)))
            for i in range(1, app_count + 1):
                alloc_raw = self.allocations.get(f"{rid}:{i}", "")
                if alloc_raw:
                    alloc = _loads(alloc_raw, {})
                    if alloc.get("recipient", "").lower() == address.lower():
                        result.append({
                            "round_id": rid,
                            "round_title": rd.get("title", ""),
                            "application_id": str(i),
                            "amount": alloc.get("amount", "0"),
                            "claimed": alloc.get("claimed", False),
                            "claimed_at": alloc.get("claimed_at", "0"),
                        })
        return _json(result)

    @gl.public.view
    def get_round_financials(self, round_id: str) -> str:
        raw = self.rounds.get(round_id, "")
        if not raw:
            return _json({"error": "not_found"})
        rd = _loads(raw, {})
        pool = int(rd.get("pool_amount", "0"))
        allocated = int(rd.get("allocated_amount", "0"))
        claimed = int(rd.get("claimed_amount", "0"))
        return _json({
            "round_id": round_id,
            "pool_amount": str(pool),
            "allocated_amount": str(allocated),
            "claimed_amount": str(claimed),
            "unallocated_amount": str(pool - allocated),
            "unclaimed_amount": str(allocated - claimed),
            "unallocated_refunded": rd.get("unallocated_refunded", False),
        })

    @gl.public.view
    def list_rounds(self) -> str:
        total = int(self.round_count)
        result = []
        for i in range(1, total + 1):
            raw = self.rounds.get(str(i), "")
            if raw:
                rd = _loads(raw, {})
                result.append({
                    "round_id": rd.get("round_id"),
                    "title": rd.get("title"),
                    "category": rd.get("category"),
                    "sponsor": rd.get("sponsor"),
                    "pool_amount": rd.get("pool_amount"),
                    "allocated_amount": rd.get("allocated_amount"),
                    "status": rd.get("status"),
                    "submission_deadline": rd.get("submission_deadline"),
                    "app_count": str(int(self.app_counts.get(str(i), u256(0)))),
                })
        return _json(result)
