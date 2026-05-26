# EquityList Digest Automation System v2
## Integrating Blog Engine + Newsletter Workflow

---

## PART 1: CRITICAL IMPROVEMENTS

### 1. **Structured Blog Metadata Layer** (REQUIRED FIRST)
The newsletter depends on `all_posts_combined.md` (blog catalog), but it needs enrichment:

**Add to each blog post entry:**
```yaml
---
Title: [blog title]
URL: [verified slug]
Geo: [US | India | Global]
Topic: [cap-table | fundraising | compliance | esop | etc]
Suitability: [newsletter-ready | not-suitable]
Recency_score: [0-100, where 100 = published this month]
Content_type: [explainer | case-study | compliance | commercial]
Character_count: [body length for newsletter concept drafting]
Regulatory_source: [primary source URL if applicable]
---
```

**Why:** The blog engine already validates sources and geo-targeting. Reuse that metadata to:
- Auto-filter which blogs can become newsletter concepts
- Avoid publishing outdated regulatory content (blog engine checks amendment currency)
- Suggest only India-specific posts for India edition
- Ensure newsletter "Concept of the week" source is already fact-checked

---

### 2. **Auto-Generate Topic Options Using Blog Engine Data**

**Current workflow (manual):**
- Sujan: "Here are 22 covered topics. Suggest 2 new topics."
- Claude generates options, user picks one

**Improved workflow:**
- Daily cron syncs blog sitemap to tracking sheet (Sujan's action item)
- When newsletter cycle begins, Claude queries:
  - All blog posts published in past 30 days (recency)
  - All posts NOT yet mentioned in newsletter (covered topics list)
  - Geo-specific posts (India blogs → India edition, global blogs → both editions)
  - Posts already fact-checked by blog engine (regulatory currency verified)
- Claude outputs: Top 3 options per geo with rationale

**System requirement:** 
```
Blog Post Tracker (Google Sheet):
├── Title | URL | Published | Covered_in_newsletter | Geo | Topic | Status
├── Updates daily from sitemap
└── Links to all_posts_combined.md for full content
```

---

### 3. **Trusted Source List for "What We're Watching"** (CRITICAL GAP)

The blog engine enforces **primary source citation** (Sections 12 & 12A). Apply the same rigor to news research:

**Create a Source Hierarchy Spreadsheet:**

| Tier | Type | Examples | Use Case |
|------|------|----------|----------|
| **Tier 1** | Official regulatory/government | SEBI, RBI, MCA websites, company filings | Regulatory changes |
| **Tier 1** | VC/accelerator official | a16z blog, YC blog, Stripe blog, company announcements | Ecosystem moves |
| **Tier 2** | Business journalism | TechCrunch, Bloomberg, Reuters, Economic Times | Startup funding |
| **Tier 2** | Industry research | Pitchbook, Crunchbase premium, Gartner (verified) | Market trends |
| **Tier 3** (avoid) | Aggregators | SEO blogs, financial news roundups | Too secondary |

**For each source, maintain:**
- URL verification (does it resolve?)
- Last-checked date
- Reliability score (0-10)
- Typical latency (when do they publish breaking news?)

**Claude's "What We're Watching" workflow:**
1. Search Tier 1 sources first (regulatory, company announcements)
2. Cross-reference with Tier 2 (journalism confirmation)
3. Reject if only found in Tier 3
4. Validate all URLs before publishing

---

### 4. **Geo-Specific Regulatory Calibration**

Blog engine enforces this (Sections 6 & 13). Formalize for newsletter:

**US/ROW Edition must include:**
- USD ($) for all figures
- US regulatory frameworks (IRS, SEC, 409A, Delaware C-Corp, GAAP)
- Examples: SAFE, standard 4-year vesting + 1-year cliff
- Reference sources: SEC, IRS, Bloomberg

**India Edition must include:**
- INR (₹) for all figures, USD in parentheses
- Indian regulatory frameworks (Companies Act 2013, SEBI, RBI, Income Tax Act)
- Examples: ESOP taxation at exercise (Section 17(2)), FEMA compliance, Angel Tax
- Reference sources: MCA, SEBI, RBI, DPIIT

**Pre-publish checklist per geo:**
```
[ ] All monetary values in correct currency (USD vs INR)
[ ] All regulatory references are India-specific (India edition only)
[ ] All regulatory references are US/US-standard (US edition only)
[ ] No cross-geo regulatory mixing
[ ] All sources are primary (not SEO blogs)
```

---

### 5. **URL Validation Protocol (from Blog Engine Section 12)**

The blog engine requires every external URL to be **verified before publication**. Apply to newsletter:

**Validation requirement:**
- Every link in "This week's highlights" → Must resolve AND contain stated fact
- Every link in "What we're watching" → Must be primary source, not aggregator
- Every "Learn more" link to blog → Must exist in all_posts_combined.md

**Pre-send checklist (add to Beehiiv workflow):**
```
[ ] Click every external URL in the draft email
[ ] Confirm the page loads and contains the claim being made
[ ] Flag any 404s or paywalled content
[ ] Check image links resolve (avoid Crunchbase screenshots)
[ ] Verify blog URLs match all_posts_combined.md catalog
```

**Red flags:**
- Links to homepages instead of specific content pages
- Broken links (404)
- Paywalled content without indication
- Screenshots instead of links to original source

---

## PART 2: AUTOMATION ROADMAP

### Phase 1: Blog Metadata (Foundation)
**Owner:** Farheen  
**Timeline:** Week 1  
**Deliverable:** Enriched all_posts_combined.md with metadata YAML headers

```markdown
---
Title: Cap Table Dilution During a Series A
URL: /blog/cap-table-dilution-series-a
Geo: Global
Topic: cap-table
Suitability: newsletter-ready
Recency_score: 95  [published 2 weeks ago]
Content_type: explainer
Regulatory_source: https://ca2013.com/section-61  [for India edition]
---

[Full blog post content...]
```

**Then:** Google Sheets tracker auto-pulls from sitemap; Claude queries it during topic selection.

---

### Phase 2: Topic Selection Automation (Weeks 2-3)
**Owner:** Farheen + Claude  
**Input:** Sitemap, tracked topics, geo filters  
**Output:** Top 3 topic recommendations per geo

```
When: Wednesday evening (before Sujan picks topics)
Process:
1. Sync sitemap → blog tracker
2. Run Claude with query:
   "All posts from past 30 days, not yet in newsletters, 
    sorted by Recency_score DESC, geo=India (for India edition)"
3. Output: [Concept title | URL | Rationale | Suitability score]
4. Sujan picks one → Farheen confirms blog source is in all_posts_combined.md
```

---

### Phase 3: Source Trust Layer (Weeks 3-4)
**Owner:** Farheen  
**Deliverable:** Trusted Sources spreadsheet (linked in Claude prompt)

When drafting "What we're watching," Claude references this list:
```
Claude prompt addition:
"For news research, use ONLY sources from the Trusted Sources list 
at [Sheet URL]. Tier 1 > Tier 2. Reject Tier 3.
Before outputting, confirm each URL resolves and contains the stated fact."
```

---

### Phase 4: Validation Checklist (Week 4)
**Owner:** Farheen  
**Deliverable:** Pre-send validation checklist (add to Beehiiv)

Adapt blog engine's validation log (Section 11) for newsletter:

```markdown
## Pre-Publication Validation Log (Newsletter)

### Source Audit
- [ ] Every regulatory reference has inline source link
- [ ] All sources are primary (government, company, verified journalism)
- [ ] No broken links

### URL Verification
- [ ] Every external URL resolves and contains stated fact
- [ ] No homepages instead of specific pages
- [ ] All blog URLs exist in all_posts_combined.md

### Geo Compliance
- [ ] US edition: all $ in USD, US regulatory refs only
- [ ] India edition: all ₹ in INR, Indian regulatory refs only
- [ ] No currency mixing

### Terminology Check
- [ ] Every regulatory term has inline definition
- [ ] Every technical term is explained in plain English
- [ ] Consistency check: no contradicting claims across sections

### Character Counts
- [ ] Subject line ≤ 45 characters
- [ ] Preview text ≤ 65 characters
- [ ] Concept body: 800–1050 characters
- [ ] "What we're watching": 650–850 characters
```

---

## PART 3: INTEGRATION WITH EXISTING WORKFLOW

### Weekly Newsletter Timeline (Updated)

**Monday–Tuesday: Blog Preparation**
1. Sitemap syncs to blog tracker (daily cron, already running)
2. Farheen checks blog_engine's amendment currency (blog engine validates this)
3. All posts → all_posts_combined.md updated

**Wednesday Evening: Topic Selection**
1. Claude queries blog tracker: "Top 3 newsletter-ready posts, not yet covered, geo=US"
2. Sujan picks 1 topic → Farheen confirms source in all_posts_combined.md

**Thursday: Concept Draft**
1. Claude reads full blog post from all_posts_combined.md (not fetching the URL)
2. Drafts concept per newsletter_prompt (character limits, voice rules)
3. Fact-check against blog_engine's source (blog already verified it)

**Friday: Research + Validation**
1. Farheen researches "What we're watching" using Trusted Sources list only
2. Claude validates all URLs resolve + contain stated facts
3. Pre-send validation checklist: every checkbox before publishing

**Friday Evening: Send**
1. Schedule at 15-min intervals (8:30am, 8:45am, 9:00am, 9:15am)

---

## PART 4: MISSING PIECES TO BUILD NOW

| Item | Owner | Why It Matters | By When |
|------|-------|---|---|
| **Blog Metadata YAML** | Farheen | Enables topic selection automation | Week 1 |
| **Blog Tracker Sheet** | Farheen | Tracks which posts are in which newsletters; syncs daily | Week 1 |
| **Trusted Sources Sheet** | Farheen | Ensures "What we're watching" uses primary sources | Week 1 |
| **Geo-Compliance Checklist** | Farheen | Prevents regulatory mixing (USD vs INR, India vs US rules) | Week 1 |
| **URL Validation Script** | Optional | Auto-checks if links resolve (nice-to-have) | Week 3 |
| **Content Calendar** | Farheen | Visual: blogs published → newsletters sent (nice-to-have) | Week 2 |

---

## PART 5: WITHOUT CLAUDE API

**Current state:** Manual prompts in Claude.ai  
**With these improvements:** Same workflow, but:
- Blog metadata enrichment removes guessing
- Trusted sources list removes bad news research
- Validation checklist removes manual re-checking
- Geo checklist prevents errors

**Future state (with Claude API):**
- Daily cron: auto-queries blog tracker, outputs topic options
- Weekly cron: pre-validates all URLs before newsletter drafting
- Scheduled task: Send newsletters on-time, perfectly formatted

---

## SUMMARY: What You Need Right Now

1. ✅ **You already have:** Marketing_newsletter_prompt.md (newsletter voice), blog_engine_prompt.md (source standards)
2. ❌ **You need to create:**
   - Blog metadata enrichment (YAML headers in all_posts_combined.md)
   - Blog tracker spreadsheet (sitemap → covered topics)
   - Trusted sources spreadsheet (Tier 1, 2, 3 news sources)
   - Geo-compliance checklist (USD/INR, India/US rules)
3. ✅ **Already in Sujan's workflow:** Daily sitemap sync, S-am's news updates, screenshot collection
4. ❌ **Critical gap:** Trusted sources list (currently ad-hoc; causes bad news picks)

Start with **Blog Metadata** this week. Everything else flows from it.
