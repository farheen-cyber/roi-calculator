# Zero-Scroll Hybrid Layout Specification

## Overview
Responsive ROI calculator optimized for primary contexts (desktop 1440px+, mobile <1024px). Uses 1200px breakpoint for responsive transition.

## Desktop Layout (>1199px)
- **Grid:** 60% left (form) | 40% right (results)
- **Main Container:** `height: calc(100vh - 128px)` (accounts for navbar)
- **Left Column (.col-l):**
  - `max-height: 640px` form height
  - `overflow-y: auto` for form sections only
  - Padding: `0 8vw`
  - Full-width countries layout in form
- **Right Column (.col-r):**
  - `height: auto` (NOT 100vh)
  - `max-height: calc(100vh - 128px)`
  - `position: relative` (not sticky)
  - Results panel displays ~550px of content
  - Scrollable within its bounds on 1280–1366px

## Mobile/Tablet Layout (<1199px)
- **Grid:** Single column, full-width
- **Main Container:** `height: auto`
- **Left Column (.col-l):**
  - Single-column form layout
  - Normal document flow
  - Padding: `48px 24px`
  - Max-height: none (removed constraints)
- **Right Column (.col-r):**
  - **Position:** `fixed` (sticky footer)
  - **Bottom:** `0`
  - **Height:** `auto` with `max-height: 140px`
  - Shows key metrics only (annual spend, ROI)
  - Sticky footer stays visible while scrolling form

## Breakpoint: 1200px
Media query: `@media (max-width: 1199px)`

### Transition Behavior
- **At 1200px:** Switches from 2-column to single column
- **Below 1200px:** Sticky footer appears
- **Form scrolls over sticky footer:** `padding-bottom: 140px` on main

## Testing Checklist
- ✅ Desktop 1440px: Perfect, zero scroll
- ✅ Desktop 1280–1366px: Acceptable, results may scroll
- ✅ Tablet/Mobile <1024px: Single column, sticky footer
- ✅ Breakpoint transition at 1200px works correctly
- ✅ No height: 100vh constraints on mobile
- ✅ Form height controlled (~640px max on desktop)

## Key CSS Properties
```css
/* Desktop only */
.main { height: calc(100vh - 128px); }
#overview-state { max-height: 640px; }
.col-r { height: auto; max-height: calc(100vh - 128px); }

/* Mobile only */
@media (max-width: 1199px) {
  .main { height: auto; padding-bottom: 140px; }
  .col-r { position: fixed; bottom: 0; max-height: 140px; }
}
```

## No-Do List
- ❌ Do NOT use `height: 100vh` on .main or .col-r
- ❌ Do NOT compress results on mobile
- ❌ Do NOT add accordion to desktop form
- ❌ Do NOT use sticky positioning on desktop results panel
