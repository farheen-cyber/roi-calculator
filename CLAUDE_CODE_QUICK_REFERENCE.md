# Claude Code Quick Reference

## Zero-Scroll Hybrid Layout

### When to Use
- Responsive adjustments to form/results layout
- Breakpoint testing (1200px transition)
- Height constraint updates
- Navbar space accounting (128px)

### Quick Snippets

#### Desktop CSS (>1199px)
```css
.main {
  height: calc(100vh - 128px);
  grid-template-columns: 60fr 40fr;
}

#overview-state {
  max-height: 640px;
}

.col-r {
  height: auto;
  max-height: calc(100vh - 128px);
}
```

#### Mobile CSS (<1199px)
```css
@media (max-width: 1199px) {
  .main {
    height: auto;
    padding-bottom: 140px;
  }

  .col-r {
    position: fixed;
    bottom: 0;
    max-height: 140px;
  }
}
```

### Common Tasks

#### Adjust Form Height
Change `max-height: 640px` on `#overview-state` and `#input-state`

#### Adjust Sticky Footer Height
Change `max-height: 140px` and `padding-bottom: 140px` together on mobile

#### Adjust Navbar Height
Update `calc(100vh - 128px)` if navbar changes (currently 128px = 48px announcement + 80px navbar)

#### Test Responsive
1. Desktop 1440px: `F12` → Resize to 1440x900
2. Tablet 1280px: Resize to 1280x800
3. Breakpoint 1199px: Resize to 1199x900
4. Mobile 375px: Preset mobile (375x812)

### Debugging

#### Layout breaks at breakpoint
- Check media query is `@media (max-width: 1199px)`
- Verify `.col-r` is `position: fixed` on mobile

#### Scrolling when shouldn't be
- Desktop: Ensure `.col-r` has `height: auto` (not `100vh`)
- Mobile: Ensure `.main` has `padding-bottom: 140px`

#### Content overlaps sticky footer
- Check mobile `.col-r` height and `.main` padding-bottom match (both 140px)
- Verify `.col-r` `z-index: 1000` is set

### File References
- HTML: `index.html`
- CSS: `styles.css` (lines 39–132 for main layout)
- Navbar: Fixed at top, 128px total height
- Breakpoint: 1200px (max-width: 1199px)
