# Fundraising Workflows: Detailed Breakdown

## Cap Table Workflows (3)

Each workflow represents ~2.5 hours of cap table management effort during fundraising.

### 1. Pre-Round Cap Table Modeling
**What happens:** Dilution modeling, SAFE/conversion scenarios, ownership calculations
- Analyze proposed round terms and their effect on existing shareholders
- Model dilution scenarios (investors at different valuations, conversion rates)
- Calculate pro-forma cap table with new securities
- **Effort:** 1.5h analysis + 0.5h documentation + 0.5h stakeholder communication = 2.5h
- **Why necessary:** Founders and investors need to understand ownership impact before committing
- **Applies to:** All rounds (SAFE, Series A+)

### 2. Security Issuance Updates
**What happens:** Creating/updating securities, investor allocations, ESOP adjustments
- Create new stock class or security type if needed (preferred stock, new series)
- Calculate investor share allocation based on investment amount and valuation
- Update ESOP pool allocation or create new option grants for new stage
- Issue option letters or securities to investors
- **Effort:** 1h documentation + 0.75h coordination + 0.75h legal review = 2.5h
- **Why necessary:** Legal requirement to formally issue securities; investor protection; tax/compliance documentation
- **Applies to:** All rounds

### 3. Post-Close Cap Table Reconciliation
**What happens:** Final ownership updates and stakeholder reconciliation
- Reconcile actual closing numbers against pro-forma (cap table true-up)
- Update cap table register with new shareholders and stake percentages
- Generate cap table summary for all stakeholders
- File required statutory updates (SH-4 in US, SH-6 in India, etc.)
- **Effort:** 1h reconciliation + 0.75h documentation + 0.75h filing/distribution = 2.5h
- **Why necessary:** Maintain accurate official record; meet statutory requirements; provide stakeholders with final numbers
- **Applies to:** All rounds

---

## Secretarial & Legal Workflows (3-4?)

Each workflow represents ~2.5 hours of Company Secretary/Legal effort during fundraising.

### 1. Board Approvals
**What happens:** Board resolutions, notices, approvals
- Prepare board resolutions authorizing the fundraising round
- Send notices to all board members
- Schedule and conduct board meeting (or circular resolution)
- Document board approvals and decisions
- File board minutes
- **Effort:** 0.75h documentation + 0.75h coordination + 1h meeting = 2.5h
- **Why necessary:** Legal requirement; investors require board approval; governs terms and authorization
- **Applies to:** All rounds

### 2. Shareholder Approvals
**What happens:** Shareholder consents/resolutions
- Prepare written consents or shareholder resolution authorizing the round
- Distribute to all shareholders with explanation
- Collect signatures/approvals
- Maintain records of approvals
- **Effort:** 1h documentation + 0.75h collection/coordination + 0.75h legal review = 2.5h
- **Why necessary:** Many companies require shareholder approval for capital raises; charter/bylaws requirements
- **Applies to:** All rounds (though some companies may not require if board-only authority)

### 3. Documentation Coordination
**What happens:** Agreements, signatures, closing coordination
- Coordinate stock purchase agreement (or SAFE) execution
- Collect investor signatures and investor documentation (accredited investor certifications, etc.)
- Manage closing mechanics (fund transfer, share delivery, etc.)
- Prepare closing documents and final cap table
- **Effort:** 1h agreement coordination + 1h signature collection + 0.5h closing mechanics = 2.5h
- **Why necessary:** Legal documentation required for the investment; investor protection; audit trail
- **Applies to:** All rounds

---

## Summary

| Workflow Type | Count | Total Effort | Notes |
|---|---|---|---|
| Cap Table | 3 | 7.5h | Pre-round modeling, security issuance, post-close reconciliation |
| Secretarial/Legal | 3 | 7.5h | Board approvals, shareholder approvals, documentation coordination |
| **Total** | **6** | **15h** | Per fundraising round |

---

## Notes

- **PRD Discrepancy:** The PRD (line 227) states "3 for cap table + 4 for secretarial prep" (7 total), but the actual requirement is 3+3=6 workflows. The code has been updated to reflect the correct count of 3 secretarial workflows.
- **Future Consideration:** Some companies may require additional workflows (regulatory filings, bylaws updates) depending on geography or round type, but the base case is 6 workflows.

---

## Source
- Documented: 2026-05-26
- Status: ✅ Finalized with actual workflow breakdown
- Code Impact: `FUNDRAISING_WORKFLOWS.secretarial` updated from 4 to 3
