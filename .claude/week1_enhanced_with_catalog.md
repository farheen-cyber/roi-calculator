# Week 1: Enhance Existing Catalog for Newsletter Automation

**Goal:** Add 6 columns to equity_content_catalog_full.xlsx to enable automated topic selection, source validation, and regulatory currency checks.

**Time estimate:** 4-5 hours (instead of 6)

---

## Overview: What Changes

**You already have:** equity_content_catalog_full.xlsx with 155 posts + rich metadata (Geography, Topic Category, ICP, Funnel Stage, etc.)

**You're adding:** 6 new columns at the end of the existing structure. Do NOT create new sheets; just extend what exists.

**Then:** Use this enriched catalog in place of the three separate sheets I originally suggested.

---

## Task 1: Add Six New Columns to Your Catalog

**Time:** 3 hours  
**File:** equity_content_catalog_full.xlsx

### New columns to add (after column H "Included in marketing nurturing emails?"):

| Column I | Column J | Column K | Column L | Column M | Column N |
|---|---|---|---|---|---|
| **Published Date** | **Newsletter Coverage** | **Newsletter Suitability** | **Content Type** | **Regulatory Currency** | **Last Fact-Check** |
| YYYY-MM-DD | Week / Issue # used | newsletter-ready, outdated, niche | explainer, case-study, announcement, product-update | Current / Needs Refresh | YYYY-MM-DD |

### Column Definitions:

**I. Published Date**
- Format: YYYY-MM-DD (e.g., 2025-03-15)
- Source: Check blog post itself or git history if available
- Why: Enables sorting by recency for topic suggestions
- Rule: Leave blank if unsure; Sujan can fill during onboarding

**J. Newsletter Coverage**
- Format: "Week of MM/DD/YYYY" or "Issue [#]" (e.g., "Week of May 12, 2025")
- Source: Sujan's manual tracking (which posts he's used)
- Why: Prevents suggesting the same topic twice
- Rule: Blank = never used in newsletter yet

**K. Newsletter Suitability**
- Options: 
  - `newsletter-ready` = current, well-sourced, suitable for newsletter concept
  - `outdated` = regulatory rules changed; can't use as current concept
  - `niche` = too specialized for general founder audience
- Source: Your judgment (is this evergreen? is it accurate?)
- Why: Filters out posts that would be factually wrong or off-topic
- Rule: Default to `newsletter-ready` unless you know otherwise

**L. Content Type**
- Options:
  - `explainer` = educational, how-to, concept explanation
  - `case-study` = real example, company story
  - `announcement` = product launch, feature release
  - `compliance-guide` = regulatory, step-by-step process
- Source: Read the post or check existing Topic Category
- Why: Newsletter concepts work best with explainers; case studies are different structure
- Rule: One per post

**M. Regulatory Currency** (India/US posts only)
- Options:
  - `Current (verified [DATE])` = regulations still accurate
  - `Needs Refresh` = law changed, post needs update
  - `N/A` = global/non-regulatory post
- Source: Compare blog post dates against known regulatory changes
- Why: Blog_engine checks this; newsletter should too
- India examples:
  - Companies Act sections → check MCA site
  - SEBI regulations → check latest circular
  - RBI rules → check latest guidelines
  - Tax provisions (Section 17(2)) → check Income Tax Act amendments
- US examples:
  - 409A valuations → check IRS updates
  - SEC rules → check SEC.gov updates
- Rule: If unsure, mark `Current` and note in Last Fact-Check

**N. Last Fact-Check**
- Format: YYYY-MM-DD (date you verified accuracy)
- Source: Today's date when you add the column
- Why: Adaptation of blog_engine's pre-publication validation log
- Rule: Everyone starts with 2025-05-26 (today); update after major regulatory changes

---

## Task 1a: Quick Reference — How to Fill These Columns

### For **Published Date** (Column I):
Open each blog post and find the publication date. If it's on the website, use that. Otherwise, make a reasonable estimate (or ask Sujan).

```
Example row: "409a-valuation" post
→ Column I: 2025-02-14 (found on blog)
```

### For **Newsletter Coverage** (Column J):
Ask Sujan: "Which posts have you already used in newsletters?"

Then mark them:
```
Example row: "Anti-Dilution Clause"
→ Column J: Week of May 12, 2025 (Sujan said this was in last week's digest)
→ Next row: Leave blank (never used yet)
```

### For **Newsletter Suitability** (Column K):
Quick rule of thumb:
- If published in last 24 months AND you recognize the topic = `newsletter-ready`
- If references specific year/law version that's changed = `outdated`
- If it's about a very niche compliance requirement = `niche`
- Default = `newsletter-ready` (Farheen will refine)

```
Example:
→ "What is Cap Table" (fundamental) = newsletter-ready
→ "2024 Tax Changes" (date-specific) = outdated (wrong year)
→ "Section 89 ESOP Complications (India)" (niche) = niche
```

### For **Content Type** (Column L):
Match to the post:
- Title says "How to...", "A Guide to..." → `explainer`
- Title says "Case Study: [Company]" or tells a story → `case-study`
- Title says "Announcing...", "New Feature" → `announcement`
- Title is about regulations, forms, steps → `compliance-guide`

```
Example:
→ "Understanding Cap Tables" = explainer
→ "How Acme Corp Built Their Equity Plan" = case-study
→ "Introducing Beneficiary Workflow" = announcement
→ "ESOP Taxation: Step-by-Step" = compliance-guide
```

### For **Regulatory Currency** (Column M):
Only fill this for **India** or **US** posts. Leave **Global** posts as `N/A`.

India posts: Cross-check against MCA/SEBI/RBI latest versions.
US posts: Cross-check against IRS/SEC latest versions.

```
Example (India):
→ "Angel Tax Section 56(2)(viib)" post published 2024
→ You check: Latest RBI circular is from May 2025 → still covers this rule
→ Column M: Current (verified 2025-05-26)

Example (US):
→ "409A Valuations" post published 2023
→ You check: IRS hasn't changed 409A rules since 2023
→ Column M: Current (verified 2025-05-26)

Example (outdated):
→ "GST for Startups" post published 2022
→ You check: GST rules changed in 2024
→ Column M: Needs Refresh
```

### For **Last Fact-Check** (Column N):
Everyone starts with today's date (2025-05-26). Update this if you later discover an inaccuracy.

```
Example:
→ Column N: 2025-05-26 (filled today)
→ Later, if you find a regulatory error: 2025-06-15 (when you fixed it)
```

---

## Task 2: Get Published Dates from Sujan

**Time:** 30 min  
**Owner:** You (Farheen) + Sujan

### What to do:
Ask Sujan: "Can you help me fill in the Published Date column? Either you have a record of blog post dates, or we can check the website."

### How to get dates:
1. **Best option:** Sujan has a publication calendar or git history
2. **Fallback:** Visit equitylist.co/blog and check each post's date (tedious but doable)
3. **Reasonable estimate:** If you can't find exact date, use quarter (e.g., "2025-Q1" → estimate as "2025-03-15")

**Action:** Add 30 minutes to task 1 if you're filling these manually.

---

## Task 3: Map Newsletter Coverage from Sujan's History

**Time:** 1 hour  
**Owner:** You (Farheen) + Sujan

### What to do:
Ask Sujan: "Which blog posts have you already used as 'Concept of the Week' in newsletters?"

Expected answer: A list like:
- "Cap Table Dilution" (Week of May 12)
- "409A Valuations" (Week of April 28)
- etc.

### How to fill:
For each post Sujan mentions:
1. Find it in your catalog
2. Fill Column J with the week it was used (e.g., "Week of May 12, 2025")
3. Leave others blank (= not used yet)

**Tip:** Only do this for posts that Sujan explicitly mentions. Don't guess.

---

## Task 4: Mark Newsletter Suitability

**Time:** 1 hour  
**Owner:** You (Farheen)

### What to do:
For each of the 155 posts, decide: **newsletter-ready** or **outdated** or **niche**?

### Quick filter rules:

**Mark as `outdated`:**
- Title references specific year that's now wrong (e.g., "2024 Tax Changes")
- Published >3 years ago and about regulations (likely outdated)
- You know the law changed (e.g., "Old Section 89 Rule" but rule was repealed)
- Sujan explicitly says it's outdated

**Mark as `niche`:**
- Very specialized compliance requirement (unlikely to be newsletter-worthy)
- Only relevant to one country/specific situation
- Sujan says "not suitable for general founder audience"

**Mark as `newsletter-ready`:**
- Everything else (default)
- Published within last 2-3 years
- No known regulatory changes
- General enough for founder audience

### Time-saver:
You don't need to read every post. Use these rules:
- Skim the title and URL slug
- Check the Published Date you just added
- Ask yourself: "Would a founder find this useful? Is it still accurate?"
- Default to `newsletter-ready` unless you have a specific reason not to

**Example 1-minute decision:**
```
Post: "Advisory Shares Explained"
→ URL: advisory-shares
→ Published: 2025-01-20
→ Decision: newsletter-ready (recent, general topic, no year in title)
→ Fill K: newsletter-ready
```

---

## Task 5: Add Content Type

**Time:** 45 min  
**Owner:** You (Farheen)

### What to do:
For each post, choose ONE:
- `explainer` (most common for newsletters)
- `case-study`
- `announcement`
- `compliance-guide`

### Rule:
Check the URL/title:
- "How to..." → `explainer`
- "Case Study" or "Learn how [Company]..." → `case-study`
- "Announcing" or "New Feature" → `announcement`
- "Step-by-Step", "Guide to", "Compliance" → `compliance-guide`

### Shortcut:
Most of your posts are probably `explainer`. Only change if you see clear case-study or announcement language.

---

## Task 6: Add Regulatory Currency (India/US Only)

**Time:** 1 hour 30 min  
**Owner:** You (Farheen)

### What to do:
For posts where Geography = "India" or "US":

1. **Determine the regulatory topic** (from Title or Column L)
   - India: Is it about Companies Act, SEBI, RBI, Income Tax?
   - US: Is it about IRS, SEC, GAAP, Delaware?

2. **Quick currency check:**
   - India posts: Check if the specific section/rule is still in force on SEBI.gov.in or MCA.gov.in
   - US posts: Check if the specific rule is still in force on SEC.gov or IRS.gov
   - Global posts: Leave as `N/A`

3. **Fill column M:**
   - If you verified it's current: `Current (verified 2025-05-26)`
   - If you found it changed: `Needs Refresh`
   - If it's global/non-regulatory: `N/A`

### Example checks:
```
India post: "Angel Tax Section 56(2)(viib) Exemptions"
→ Check: Is this section still live? Go to incometax.gov.in
→ Result: Yes, still valid
→ Fill M: Current (verified 2025-05-26)

US post: "409A Valuations for Series A"
→ Check: Is 409A still a valid IRS provision? (Yes, always has been)
→ Fill M: Current (verified 2025-05-26)

India post: "GST for Startups"
→ Check: Is GST still relevant? (Yes, but rules updated in 2024)
→ If post mentions specific 2022 rates: Needs Refresh
→ Fill M: Needs Refresh (checked 2025-05-26, rules updated 2024)
```

### Shortcut for this task:
If you're uncertain, mark as `Current (verified 2025-05-26)` and ask Sujan to verify later. Don't get stuck on this.

---

## Task 7: Add Last Fact-Check Date

**Time:** 5 min  
**Owner:** You (Farheen)

### What to do:
For all 155 posts, fill Column N with today's date: `2025-05-26`

This is a baseline. You'll update it when you later discover inaccuracies or regulations change.

---

## End-of-Week Deliverable

**By Friday night, you should have:**
- ✅ equity_content_catalog_full.xlsx with 6 new columns added
- ✅ Column I (Published Date) — 90% filled (ask Sujan for missing dates)
- ✅ Column J (Newsletter Coverage) — Marked for posts Sujan confirms he used
- ✅ Column K (Newsletter Suitability) — All 155 posts marked (default newsletter-ready)
- ✅ Column L (Content Type) — All 155 posts marked (mostly explainer)
- ✅ Column M (Regulatory Currency) — India/US posts verified; Global = N/A
- ✅ Column N (Last Fact-Check) — All = 2025-05-26

---

## How This Enables Automation

Once enriched, this single catalog replaces all three spreadsheets I originally suggested:

### ✅ Replaces "Blog Tracker"
- Filter: `Newsletter Suitability = newsletter-ready` + `Newsletter Coverage = blank` (never used) → Get topic options
- Sort by: Published Date (descending) → Get newest posts first

### ✅ Replaces "Trusted Sources"
- Not needed; this catalog IS your source of truth for blog topics
- For "What we're watching" news, you'll still create a separate Trusted Sources list (news sources, not blog sources)

### ✅ Replaces "Geo-Compliance Checklist"
- Before each send, filter by: Geography = "India" or "US" in newsletter
- Verify: Column M shows "Current (verified [DATE])" not "Needs Refresh"
- If any are "Needs Refresh," don't use that blog post as concept until updated

---

## Next: Week 2 Tasks

Once you complete Week 1:

1. **Create Trusted Sources Sheet** (for news research only, not blogs)
2. **Get Sujan's Claude project link** → Duplicate into your account
3. **Build first newsletter independently** using enriched catalog

---

## Questions While You Fill?

- **Published dates:** Ask Sujan if he has a record
- **Newsletter coverage:** Ask Sujan which posts he remembers using
- **Regulatory currency:** Ask Sujan if he knows of any rule changes in blog posts
- **Content type:** Skim the post URL/title; default to explainer

---

## Estimated Time Breakdown

| Task | Time |
|------|------|
| Add 6 columns + headers | 15 min |
| Published Date (with Sujan) | 1 hour |
| Newsletter Coverage (ask Sujan) | 30 min |
| Newsletter Suitability (all 155) | 1 hour |
| Content Type (all 155) | 45 min |
| Regulatory Currency (India/US only) | 1 hour 30 min |
| Last Fact-Check (fill all) | 5 min |
| **TOTAL** | **~5 hours** |

---

## How to Save the File

When you're done:
1. Keep filename as: `equity_content_catalog_full.xlsx`
2. **Save to:** /Users/farheenshaikh/Documents/roi-calculator/.claude/ (for Claude reference)
3. **Also save backup to:** Google Drive (in case)
4. **Share with Sujan** so he can reference during Week 2 onboarding

---

## Success Criteria

By end of Week 1:
- ✅ All 155 posts have Published Date (or estimated)
- ✅ All posts marked for Newsletter Suitability
- ✅ All posts have Content Type
- ✅ India/US posts have Regulatory Currency status
- ✅ You know which posts Sujan has already used (and marked in Column J)
- ✅ Catalog is ready to query for next newsletter

---

This becomes your **single source of truth** for topic selection, source validation, and geo/regulatory compliance going forward.
