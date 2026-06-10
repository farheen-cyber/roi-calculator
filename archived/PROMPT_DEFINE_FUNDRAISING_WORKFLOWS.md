# Prompt: Define Fundraising Workflows for ROI Calculator

## Context
We're building an ROI calculator that estimates equity administration costs for startups. One component calculates the cost of secretarial/legal work during fundraising rounds.

The model assumes:
- **3 "cap table workflows"** happen during a fundraising round
- **4 "secretarial prep workflows"** happen during a fundraising round
- **Total: 7 additional workflows** (beyond base governance requirements)
- Each workflow takes ~2.5 hours of Company Secretary/Legal effort

## What We Know About "Workflows"

From the PRD, one "workflow" represents ~2.5 hours of effort and includes:
- Documentation (drafting, formatting, filing)
- Approvals/coordination (getting signatures, tracking decisions)
- Meetings (prep, attendance, minutes)
- Record-keeping (updating registers, filing with regulators)

Examples of workflows in general governance:
- **Board Meeting** — Agenda prep, notice, circulation, minutes, approval tracking, filing
- **Shareholder Approval** — Notice of proposed action, voting materials, collection, documentation
- **Statutory Filing** — SH-6 register update, Form 251, ROC filings, etc.
- **Equity Amendment** — Documentation for grants, conversions, surrenders, retirements
- **Compliance Report** — Annual compliance summary, register reconciliation, certifications

## What We Don't Know

**The specific breakdown of the 7 workflows:**

We have the aggregate numbers (3 cap table + 4 secretarial), but not the detailed definition of each:
- What are the 3 cap table workflows specifically?
- What are the 4 secretarial workflows specifically?
- Why is it 3 and not 2 or 4?
- Why is it 4 and not 3 or 5?
- Do these change by geography or round type (SAFE vs Series A vs Series C)?

## Your Task

**Enumerate and define the 7 fundraising workflows.**

For each of the 3 cap table workflows, specify:
1. **Name** — Short title (e.g., "Investor Onboarding")
2. **Definition** — What actually gets done (2-3 sentences)
3. **Effort breakdown** — How the 2.5 hours breaks down (e.g., 1h documentation + 0.5h coordination + 1h meetings)
4. **Why it's necessary** — Why this must happen during fundraising (legal requirement? operational requirement? investor expectation?)
5. **Applies to which rounds?** — All rounds, or only Series A+?

For each of the 4 secretarial workflows, specify the same 5 questions.

## Guiding Questions

These may help your thinking:

**Cap Table Workflows (3):**
- What happens to the cap table itself during a fundraising round?
- How do new investors get added to the cap table?
- Does the stock option pool need to be adjusted?
- Are there amendments to the certificate of incorporation?
- What new classes of stock need to be documented?

**Secretarial Workflows (4):**
- What approvals are needed from the board and/or existing shareholders?
- What agreements need to be drafted or executed (investor agreements, SAFE, stock purchase agreement)?
- What regulatory filings are triggered by the fundraising?
- Are there updates to bylaws or corporate governance documents?
- What investor communications/disclosures are required?

## Output Format

Please structure your answer as follows:

```markdown
# Fundraising Workflows Breakdown

## Cap Table Workflows (3)

### 1. [Workflow Name]
- **Definition:** [2-3 sentences]
- **Effort Breakdown:** [Documentation hours] + [Coordination hours] + [Meetings hours] = 2.5h
- **Why Necessary:** [Legal/operational/investor requirement]
- **Applies To:** [All rounds / Series A+ / etc.]

### 2. [Workflow Name]
...

### 3. [Workflow Name]
...

## Secretarial Workflows (4)

### 1. [Workflow Name]
...

### 2. [Workflow Name]
...

### 3. [Workflow Name]
...

### 4. [Workflow Name]
...

## Summary & Rationale
[Explain why this breakdown makes sense and how you arrived at these 3 + 4 = 7 workflows]

## Assumptions Made
[List any assumptions about round type, geography, company stage, etc.]
```

## Notes for Responder

- **You don't need to be 100% certain.** If you're not sure about a specific breakdown, note your uncertainty.
- **Consider different perspectives:** What does the company secretary need to do? What does the investor expect? What does the regulator require?
- **Round types matter:** SAFE rounds are simpler than Series A rounds. SAFEs might have fewer workflows. Consider if this changes.
- **This is for documentation.** The goal is to make the "3 and 4" intelligible and defensible in the ROI calculator, not to achieve perfect accuracy.
- **Feedback will be incorporated.** If you propose this and we find it doesn't match reality, we'll adjust and document what you learned.

## Context for Credibility

This is being used in: **EquityList ROI Calculator** — a tool that helps startups understand their equity administration costs across different geographies and funding stages. The calculator is used by founders and equity administrators to budget for legal/secretarial support.

See the full PRD at: `/Users/farheenshaikh/Documents/roi-calculator/roi-calculator-prd.md`
