# Week 1: Build Foundation for Automated Newsletter System

**Goal:** Create the three metadata layers that will enable automated topic selection, source validation, and error prevention.

---

## Task 1: Enrich all_posts_combined.md with Metadata Headers

**Time:** 2 hours  
**Owner:** You (Farheen)

### What to do:
Add YAML metadata header to EVERY blog post in all_posts_combined.md:

```yaml
---
Title: [blog title]
URL: [verified blog slug]
PublishedDate: [YYYY-MM-DD]
Geo: [Global | US-only | India-only | Both]
Topic: [cap-table | fundraising | compliance | esop | valuation | equity-basics | tax | other]
Suitability: [newsletter-ready | not-suitable]
Content_type: [explainer | case-study | commercial | product-announcement | compliance]
Last_checked: [date you verified this works]
---

[Full blog post text...]
```

### Definitions:
- **Geo:** 
  - Global = applies equally to US & India (e.g., "What is cap table")
  - US-only = USD, Delaware C-Corp, IRS rules (e.g., "409A valuations")
  - India-only = INR, Companies Act, SEBI/RBI (e.g., "Angel tax exemptions")
  - Both = separate content for each geo, but same topic
  
- **Suitability:**
  - newsletter-ready = new enough, fact-checked, clear regulatory source
  - not-suitable = outdated regulatory rules, or too niche

- **Topic:** Use consistently (create a fixed list of ~8-10 topics)

### Example:
```yaml
---
Title: How to Value Your Startup for a Series A
URL: /blog/startup-valuation-series-a
PublishedDate: 2025-03-15
Geo: Global
Topic: valuation
Suitability: newsletter-ready
Content_type: explainer
Last_checked: 2025-05-26
---

# How to Value Your Startup for a Series A...
```

### How to find all posts:
- Open all_posts_combined.md
- Search for "# " (markdown header) to find post boundaries
- Add metadata YAML block BEFORE the first heading of each post

**Deliverable:** all_posts_combined.md with YAML headers on all 23 posts

---

## Task 2: Create Blog Tracker Spreadsheet

**Time:** 1.5 hours  
**Owner:** You (Farheen)

### What to do:
Create a Google Sheet with these columns:

| Title | URL | Published | In_Newsletter | Newsletter_Week | Geo | Topic | Suitability |
|-------|-----|-----------|---|---|---|---|---|
| How to Value Your Startup for a Series A | /blog/startup-valuation-series-a | 2025-03-15 | No | — | Global | valuation | newsletter-ready |
| Understanding 409A Valuations | /blog/409a-valuations | 2025-03-08 | Yes | Week of May 12 | US-only | valuation | newsletter-ready |

### Setup:
- Add all 23 blog posts from all_posts_combined.md
- Mark existing posts that have already been newsletter topics with "Yes" in In_Newsletter
- Leave others blank

### Automation:
- Every time Sujan publishes a new blog post, add a row to this sheet
- Use this sheet when Claude suggests topics (filter by Geo + In_Newsletter=No)

**Deliverable:** Blog Tracker Sheet (shared with Sujan & Claude)

---

## Task 3: Create Trusted Sources Spreadsheet

**Time:** 1 hour  
**Owner:** You (Farheen)

### What to do:
Create a Google Sheet with these columns:

| Source Name | URL | Tier | Category | Type | Last Verified |
|---|---|---|---|---|---|
| SEC | https://sec.gov | Tier 1 | Regulatory | Government | 2025-05-26 |
| SEBI | https://sebi.gov.in | Tier 1 | Regulatory | Government | 2025-05-26 |
| RBI | https://rbi.org.in | Tier 1 | Regulatory | Government | 2025-05-26 |
| MCA (Ministry of Corporate Affairs) | https://mca.gov.in | Tier 1 | Regulatory | Government | 2025-05-26 |
| a16z | https://a16z.com/blog | Tier 1 | VC/Accelerator | Official | 2025-05-26 |
| Y Combinator | https://www.ycombinator.com/blog | Tier 1 | VC/Accelerator | Official | 2025-05-26 |
| TechCrunch | https://techcrunch.com | Tier 2 | Business News | Journalism | 2025-05-26 |
| Bloomberg | https://bloomberg.com | Tier 2 | Business News | Journalism | 2025-05-26 |
| Reuters | https://reuters.com | Tier 2 | Business News | Journalism | 2025-05-26 |
| Economic Times | https://economictimes.indiatimes.com | Tier 2 | Business News (India) | Journalism | 2025-05-26 |

### Rules:
- **Tier 1:** Use first. Regulatory bodies, official company blogs, government sources
- **Tier 2:** Verify with Tier 1. Established business journalism
- **Tier 3 (avoid):** SEO blogs, financial aggregators, "Top 10 lists," anonymous opinion

### When to use:
When Claude researches "What we're watching," query this list only. Do NOT search random websites.

**Deliverable:** Trusted Sources Sheet (reference in Claude prompt)

---

## Task 4: Create Geo-Compliance Checklist

**Time:** 30 min  
**Owner:** You (Farheen)

Add this to your Beehiiv workflow (screenshot it, print it, bookmark it):

### Pre-Send Checklist (Copy-Paste into Beehiiv Notes)

```
[ ] CURRENCY CHECK
    [ ] US/ROW Edition: All $ in USD. No ₹ symbols.
    [ ] India Edition: All amounts in ₹ (INR). USD in parentheses only.
    [ ] No mixing USD and INR in same edition

[ ] REGULATORY REFERENCES (US/ROW Edition)
    [ ] All references to US law: IRS, SEC, 409A, GAAP, Delaware rules
    [ ] No Indian regulatory refs (Companies Act, SEBI, RBI, Income Tax Act)
    [ ] All numbers verified against latest IRS/SEC documentation

[ ] REGULATORY REFERENCES (India Edition)
    [ ] All references to Indian law: Companies Act 2013, SEBI, RBI, Income Tax
    [ ] No US-only references (409A, SEC, Delaware)
    [ ] All threshold numbers verified against latest RBI/SEBI circulars
    [ ] Amendment currency checked (e.g., "Companies Act as amended by [Year]")

[ ] VOCABULARY
    [ ] US Edition: "vesting," "preferred stock," "SAFE," "cliff"
    [ ] India Edition: "ESOP," "sweat equity," "FEMA," "perquisite," "Angel Tax"
    [ ] No cross-contamination (India terms in US edition)

[ ] ALL LINKS VERIFIED
    [ ] Clicked every URL in "This week's highlights"
    [ ] Every link resolves (no 404s)
    [ ] Every link contains the fact being cited
    [ ] No homepages; specific content pages only
    [ ] Blog links exist in all_posts_combined.md

[ ] EDITORIAL VOICE
    [ ] No "In today's fast-paced..." / "Most founders don't realize..."
    [ ] No hype words without numbers ("exciting," "powerful," "revolutionary")
    [ ] Tone: calm authority, not content marketing
```

**Deliverable:** Printed or bookmarked checklist to use before EVERY send

---

## Task 5: Send Setup Checklist to Sujan

**Time:** 15 min  
**Owner:** You (Farheen)

Send Sujan a message with:
1. Link to Blog Tracker Sheet (ask him to update when he publishes new posts)
2. Link to Trusted Sources Sheet (for when he/you research news)
3. The enriched all_posts_combined.md (with YAML headers)
4. Request: Share his Claude project link so you can duplicate it

---

## End-of-Week Goal

By Friday:
- ✅ all_posts_combined.md enriched with metadata (23 posts)
- ✅ Blog Tracker Sheet created and shared
- ✅ Trusted Sources Sheet created and shared
- ✅ Geo-Compliance Checklist bookmarked
- ✅ Sujan has new sheets and knows how to use them

**Result:** Next newsletter cycle, you can:
1. Query blog tracker for topic options (automated)
2. Validate sources against trusted list (no bad news)
3. Check geo compliance before sending (no USD/INR mixing)
4. Confirm all URLs work (no broken links)

---

## Questions While You Build?

- **Blog metadata:** Ask Sujan which posts he considers "evergreen" (newsletter-ready) vs dated
- **Blog tracker:** Ask Sujan for a list of posts used in previous newsletters
- **Trusted sources:** Ask Sujan which sites he typically uses for "What we're watching" research
- **Checklist:** Ask Sujan which errors he's caught in past (geo mixing, broken links, bad sources)

All of these are data you'll add to the spreadsheets.
