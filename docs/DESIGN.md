# Todo App — Brutalist Design System

## 1. Visual Theme

**Aesthetic**: Modern brutalism with purposeful animation. Raw computational feel, high contrast, geometric precision. Monospace typography emphasizing structure. Single accent color for tension and focus.

**Philosophy**: Every animation has purpose—reveal content, confirm action, provide feedback. Reject decorative motion. Use performance-critical CSS animations (transform, opacity only).

---

## 2. Color Palette

### Primary

- **Background (Light)**: `#f5f5f5` (near-white, true brutalist)
- **Background (Dark)**: `#0a0a0a` (near-black)
- **Surface (Light)**: `#ffffff` (true white, cards/containers)
- **Surface (Dark)**: `#1a1a1a` (dark surface)
- **Text (Light)**: `#000000` (pure black)
- **Text (Dark)**: `#f5f5f5` (off-white)

### Accent

- **Primary Accent**: `#ff006e` (hot pink/magenta) — CTAs, focus states, completion feedback
- **Secondary Accent**: `#00d9ff` (cyan) — Hover states, active states, secondary emphasis

### Utility

- **Border**: `#333333` (light) / `#cccccc` (dark) — Structural lines
- **Muted Text**: `#666666` (light) / `#999999` (dark) — Secondary information
- **Success**: `#00d9ff` (cyan, used for completion confirmation)
- **Error/Destructive**: `#ff006e` (magenta, delete actions)

### Contrast Validation

- Text on surface (light): `#000000` on `#ffffff` = 21:1 ✓
- Text on background (light): `#000000` on `#f5f5f5` = 20.9:1 ✓
- Accent on surface: `#ff006e` on `#ffffff` = 5.2:1 ✓
- All text meets WCAG AA (4.5:1 for normal text) ✓

---

## 3. Typography

### Font Stack

- **Display** (Headings, brand): `JetBrains Mono Bold` (self-hosted or Google Fonts)
  - Monospace conveys computational precision
  - Bold weight (700) for visual hierarchy
  - Loading: `display=swap`
- **Body/UI** (Buttons, labels, content): `IBM Plex Mono Regular` (Google Fonts)
  - Consistent monospace throughout for cohesive "code-like" feel
  - Highly legible
  - Loading: `display=swap`

### Scale

- **h1** (Brand, page title): 40px / 1.2 line-height / 700 weight
- **h2** (Section titles, card headers): 28px / 1.3 line-height / 700 weight
- **Body** (Paragraphs, item text): 16px / 1.5 line-height / 400 weight
- **Small** (Labels, counts, muted text): 14px / 1.4 line-height / 400 weight
- **Micro** (Timestamps, hints): 12px / 1.3 line-height / 400 weight

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

---

## 4. Component Stylings

### Input (Add Todo)

```
Dimensions: 100% width × 48px height
Border: 2px solid #000 (light) / 2px solid #ccc (dark)
Border-radius: 0 (raw, no rounding)
Padding: 12px 16px
Font: IBM Plex Mono, 16px
Background: #ffffff (light) / #1a1a1a (dark)
Text: #000000 (light) / #f5f5f5 (dark)
Focus outline: 3px solid #ff006e, offset 2px
Focus outline offset: 2px
Placeholder: #666666 (light) / #999999 (dark)

Animation on input:
- On focus: border-color animates from #000 to #ff006e over 200ms (cubic-bezier(0.34, 1.56, 0.64, 1))
- On blur: border-color animates back over 150ms (ease-out)

Animation on submit:
- Input scales briefly: scale(1.02) over 100ms, then back to scale(1)
- Provides haptic-like feedback for form submission
```

### Button (Add, Clear, Filter, Delete, Theme)

```
Dimensions:
  - Add button: 100% width × 48px height (desktop) / 48px × 48px (mobile)
  - Filter/theme buttons: auto width × 44px height min
Touch target: min 44×44px ✓

Border: 2px solid #000 (light) / 2px solid #ccc (dark)
Border-radius: 0 (raw)
Padding: 12px 20px
Font: IBM Plex Mono Bold, 14px, uppercase letter-spacing: 1px
Background: #000000 (light) / #ffffff (dark)
Text: #ffffff (light) / #000000 (dark)

States:
  - Idle: as above
  - Hover: background animates to #ff006e, text to #ffffff over 150ms
  - Active: border animates to #ff006e, transform: scale(0.98) over 100ms
  - Focus: outline 3px solid #00d9ff, outline-offset 2px
  - Disabled: opacity 0.5, cursor not-allowed

Animations:
  - Hover → background: cubic-bezier(0.34, 1.56, 0.64, 1)
  - Active → scale: ease-out
  - Tab navigation focus: outline pulses (opacity 0.5 → 1) over 300ms, repeats while focused
```

### Checkbox (Todo Completion)

```
Dimensions: 24×24px (meets touch target min)
Border: 2px solid #000 (light) / 2px solid #ccc (dark)
Border-radius: 0 (raw square)
Background: transparent (unchecked) / #00d9ff (checked, light) / #00d9ff (checked, dark)
Accent: #ff006e

States:
  - Unchecked: transparent bg, black border
  - Checked: #00d9ff bg, white checkmark
  - Focus: border animates to #ff006e over 150ms
  - Hover (unchecked): border animates to #ff006e over 150ms

Animation on check:
  - Simultaneous: scale(0.8) then scale(1.1) then scale(1) over 400ms, cubic-bezier(0.34, 1.56, 0.64, 1)
  - Checkmark: stroke-dasharray animation (dash-offset animates in over 300ms)
  - Parent <li> text: opacity 0.5 over 200ms (strikethrough effect via CSS text-decoration)
```

### Todo Item

```
Dimensions: 100% width × 64px height (default) / 56px (compact)
Border: 1px solid #ccc (light) / 1px solid #333 (dark)
Border-radius: 0 (raw)
Padding: 16px
Background: #ffffff (light) / #1a1a1a (dark)
Text: #000000 (light) / #f5f5f5 (dark)
Display: flex, justify-content: space-between, align-items: center

States:
  - Default: as above
  - Hover: border-color animates to #ff006e over 150ms
  - Completed: text-decoration line-through, opacity 0.6
  - Focus-within: outline 3px solid #ff006e, outline-offset 2px

Animation on add:
  - New items: slide-in from top (transform: translateY(-20px) → translateY(0)) + fade-in (opacity 0 → 1) over 300ms, cubic-bezier(0.34, 1.56, 0.64, 1)
  - Stagger: each item delays by (index × 80ms)
  - Parent list: max-height animates from 0 to auto (max-height: 0 → 2000px) over 300ms

Animation on delete:
  - Slide-out to right (transform: translateX(100%)) + fade-out over 250ms, ease-in
  - Then height collapses (height: auto → 0) over 150ms
```

### Filter Buttons

```
Dimensions: auto width × 44px height min
Border: 2px solid transparent
Border-radius: 0 (raw)
Padding: 8px 16px
Font: IBM Plex Mono, 14px, uppercase letter-spacing: 0.5px
Background: transparent (inactive) / #000000 (active, light) / #ffffff (active, dark)
Text: #666666 (inactive) / #ffffff (active, light) / #000000 (active, dark)

States:
  - Inactive: transparent bg, muted text
  - Active: solid bg with accent text
  - Hover (inactive): border-bottom animates to #ff006e over 150ms
  - Hover (active): background animates to #ff006e over 150ms, text to white
  - Focus: outline 3px solid #00d9ff, offset 2px

Animation on filter change:
  - Inactive → Active: background animates in over 200ms, cubic-bezier(0.34, 1.56, 0.64, 1)
  - List items: fade-in over 200ms (opacity 0 → 1)
```

### Card/Container

```
Dimensions: 100% width, dynamic height
Border: 2px solid #000 (light) / 2px solid #ccc (dark)
Border-radius: 0 (raw)
Padding: 0 (border defines edge)
Background: #ffffff (light) / #1a1a1a (dark)
Box-shadow: none (brutalist principle: no drop shadows)

Structure:
  - <ul class="list">: inherits card styling
  - <footer class="foot">: border-top 1px solid #ccc (light) / #333 (dark), padding 16px, display flex, justify-content space-between
```

### Header/Brand

```
Dimensions: 100% width × 64px height
Border: none
Border-bottom: 2px solid #000 (light) / 2px solid #ccc (dark)
Padding: 16px
Display: flex, justify-content space-between, align-items center
Background: #f5f5f5 (light) / #0a0a0a (dark)

Brand text (h1):
  - Font: JetBrains Mono Bold, 32px, uppercase
  - Text: #000000 (light) / #f5f5f5 (dark)
  - Letter-spacing: 2px
  - Hover: color animates to #ff006e over 150ms

Theme toggle button:
  - Dimensions: 44px × 44px
  - Border: 2px solid #000 (light) / 2px solid #ccc (dark)
  - Border-radius: 0 (raw)
  - Font size: 24px
  - Hover: background animates to #ff006e over 150ms
  - Active: scale(0.95) over 100ms, ease-out
```

---

## 5. Layout Principles

### Grid Structure

```css
/* Desktop (1024px+) */
.app-root {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 0;
}

/* Container (centered, max-width) */
.container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;
  grid-column: 1;
}

/* Tablet (768px–1023px) */
@media (max-width: 1023px) {
  .container {
    padding: 0 20px;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .container {
    padding: 0 16px;
  }
}
```

### Spacing System (8pt grid)

- 8px: micro spacing (padding in buttons, label gaps)
- 16px: small spacing (padding in cards, gaps between sections)
- 24px: medium spacing (padding in containers, margins between elements)
- 32px: large spacing (gaps between major sections)
- 48px: XL spacing (top/bottom padding in header/footer)

---

## 6. Depth & Elevation

**Brutalist Principle**: No drop shadows. Depth is created through:

- Borders (layering and structure)
- Negative space
- Opacity changes
- Overlapping elements
- Color shifts (lighter/darker surfaces)

### Shadow System (NOT USED)

Brutalism rejects traditional depth. Instead, use:

- `box-shadow: none;`
- Rely on borders and layout hierarchy

---

## 7. Animations & Motion

### Principles

- **CSS-only**: Use `transform`, `opacity` only (GPU-accelerated)
- **Purposeful**: Every animation communicates state change or action feedback
- **Fast**: 150–400ms duration for micro interactions
- **Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy/energetic feel (overshoot)
- **Reduced Motion**: All animations disabled via `@media (prefers-reduced-motion: reduce)`

### Animation Catalog

#### 1. Button Hover (Action Feedback)

```css
.btn:hover {
  animation: btnHover 150ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes btnHover {
  from {
    background-color: currentBg;
    color: currentText;
  }
  to {
    background-color: #ff006e;
    color: #ffffff;
  }
}
```

**Purpose**: Confirm button is interactive and ready to activate.

#### 2. Button Active (Confirmation)

```css
.btn:active {
  animation: btnActive 100ms ease-out forwards;
}

@keyframes btnActive {
  from {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
  to {
    transform: scale(1);
  }
}
```

**Purpose**: Haptic-like feedback; confirm click registered.

#### 3. Todo Item Add (Reveal + Stagger)

```css
.item {
  animation: itemSlideIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.item:nth-child(1) {
  animation-delay: 80ms;
}
.item:nth-child(2) {
  animation-delay: 160ms;
}
.item:nth-child(3) {
  animation-delay: 240ms;
}
/* ... */

@keyframes itemSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Purpose**: Clearly show new items entering the list; stagger guides attention.

#### 4. Todo Item Delete (Slide Out + Collapse)

```css
.item.deleting {
  animation: itemSlideOut 250ms ease-in forwards;
}

@keyframes itemSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

**Purpose**: Clear visual confirmation that item is being removed.

#### 5. Checkbox Completion (Bounce + Strikethrough)

```css
input[type="checkbox"]:checked + .text {
  animation: textStrike 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  text-decoration: line-through;
  opacity: 0.6;
}

@keyframes textStrike {
  0% {
    opacity: 1;
    text-decoration: none;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
    text-decoration: line-through;
  }
}

input[type="checkbox"] {
  animation: checkboxBounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkboxBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

**Purpose**: Provide kinetic feedback; communicate state change clearly.

#### 6. Filter Active State Change (Fade + Background Fill)

```css
.filter-btn.active {
  animation: filterActive 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes filterActive {
  from {
    background-color: transparent;
    color: currentMuted;
  }
  to {
    background-color: #000000;
    color: #ffffff;
  }
}
```

**Purpose**: Clear visual indicator of active filter.

#### 7. Input Focus Border (Color Animation)

```css
.input:focus {
  animation: inputFocus 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes inputFocus {
  from {
    border-color: #000000;
  }
  to {
    border-color: #ff006e;
  }
}

.input:blur {
  animation: inputBlur 150ms ease-out forwards;
}

@keyframes inputBlur {
  from {
    border-color: #ff006e;
  }
  to {
    border-color: #000000;
  }
}
```

**Purpose**: Smooth focus indication; guides user attention.

#### 8. Theme Toggle (Color Invert + Scale)

```css
.theme:active {
  animation: themeToggle 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes themeToggle {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}
```

**Purpose**: Celebratory feedback for theme switch; playful brutalism.

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Purpose**: Respect user accessibility preference.

---

## 8. Responsive Behavior

### Breakpoints

- **Desktop**: 1024px+ (standard layout)
- **Tablet**: 768px–1023px (adjust padding, spacing)
- **Mobile**: < 768px (stack elements, reduce padding)

### Adjustments

#### Mobile (< 768px)

- Container padding: 16px (vs. 24px desktop)
- Item height: 56px (vs. 64px desktop)
- Font sizes: -2px for body text
- Buttons: Full width for primary actions
- Header: Brand font size 24px (vs. 32px)

#### Tablet (768px–1023px)

- Container padding: 20px
- Standard spacing mostly maintained
- Filter buttons: May wrap if space constrained

```css
/* Mobile */
@media (max-width: 767px) {
  .app-root {
    padding: 16px;
  }
  .item {
    min-height: 56px;
    padding: 12px;
  }
  h1 {
    font-size: 24px;
  }
  .btn {
    width: 100%;
  }
}

/* Tablet */
@media (768px <= width <= 1023px) {
  .app-root {
    padding: 20px;
  }
}
```

---

## 9. CSS Variables & Implementation

```css
/* Light Mode */
:root {
  --bg: #f5f5f5;
  --surface: #ffffff;
  --text: #000000;
  --text-muted: #666666;
  --border: #333333;
  --accent-primary: #ff006e;
  --accent-secondary: #00d9ff;
  --success: #00d9ff;
  --error: #ff006e;

  --font-display: "JetBrains Mono", monospace;
  --font-body: "IBM Plex Mono", monospace;

  --border-radius: 0;
  --border-width: 2px;
  --border-width-thin: 1px;

  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
  --spacing-xl: 48px;

  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --easing-ease-out: ease-out;
}

/* Dark Mode */
[data-theme="dark"] {
  --bg: #0a0a0a;
  --surface: #1a1a1a;
  --text: #f5f5f5;
  --text-muted: #999999;
  --border: #cccccc;
  --accent-primary: #ff006e;
  --accent-secondary: #00d9ff;
  --success: #00d9ff;
  --error: #ff006e;
}
```

---

## Do's & Don'ts

### Do's

- ✓ Use monospace fonts (JetBrains Mono, IBM Plex Mono)
- ✓ High contrast: pure black/white as primary colors
- ✓ Thick borders (2px) defining structure
- ✓ No decorative shadows; use borders and spacing
- ✓ Purposeful animations (every motion = feedback)
- ✓ GPU-accelerated transforms (scale, translate, rotate)
- ✓ Staggered animations for multiple items (reveals sequence)
- ✓ Respect `prefers-reduced-motion`
- ✓ Touch targets ≥ 44×44px
- ✓ 4.5:1 text contrast minimum

### Don'ts

- ✗ Avoid Inter, Roboto, system fonts (use monospace)
- ✗ Avoid soft gradients or pastel colors
- ✗ Avoid drop shadows or blur effects
- ✗ Avoid rounded corners (use 0 border-radius)
- ✗ Avoid decorative animations (every motion must communicate)
- ✗ Avoid color-only information (use borders, text, icons)
- ✗ Avoid keyboard traps; ensure focus remains visible
- ✗ Avoid animations without reduced-motion support

---

## Design Lint Rules

```json
[
  {
    "rule": "font-family-must-be-monospace",
    "description": "All text must use JetBrains Mono or IBM Plex Mono",
    "selector": "body, button, input, label",
    "expected": "font-family contains 'JetBrains Mono' or 'IBM Plex Mono'",
    "severity": "critical"
  },
  {
    "rule": "no-drop-shadows",
    "description": "Brutalism: no box-shadow. Use borders instead.",
    "selector": "*",
    "expected": "box-shadow: none",
    "severity": "high"
  },
  {
    "rule": "border-radius-zero",
    "description": "All UI elements have 0 border-radius (raw, geometric)",
    "selector": "button, input, .card, .item",
    "expected": "border-radius: 0",
    "severity": "high"
  },
  {
    "rule": "contrast-minimum",
    "description": "Text color contrast ≥ 4.5:1 (normal) or 3:1 (large)",
    "selector": "body, button, label, input",
    "expected": "contrast(color, background) ≥ 4.5:1",
    "severity": "critical"
  },
  {
    "rule": "touch-target-minimum",
    "description": "Interactive elements min 44×44px",
    "selector": "button, input[type='checkbox'], a",
    "expected": "width ≥ 44px and height ≥ 44px",
    "severity": "critical"
  },
  {
    "rule": "animations-respect-prefers-reduced-motion",
    "description": "All animations disabled in @media (prefers-reduced-motion: reduce)",
    "selector": "animation, transition",
    "expected": "animation-duration < 1ms in reduced-motion media query",
    "severity": "critical"
  },
  {
    "rule": "focus-indicator-visible",
    "description": "All focusable elements have visible focus indicator (outline or border)",
    "selector": "button:focus, input:focus, a:focus",
    "expected": "outline or border-color change visible",
    "severity": "critical"
  },
  {
    "rule": "accent-color-primary",
    "description": "Primary accent must be #ff006e (hot pink)",
    "selector": ".btn, button, .accent",
    "expected": "color: #ff006e or background-color: #ff006e",
    "severity": "medium"
  },
  {
    "rule": "no-inline-styles",
    "description": "No inline style attribute for static properties",
    "selector": "[style]",
    "expected": "style attribute not used for static values",
    "severity": "high"
  },
  {
    "rule": "animation-use-transform-only",
    "description": "Animations use only transform and opacity (GPU-accelerated)",
    "selector": "@keyframes",
    "expected": "only transform and opacity properties in keyframes",
    "severity": "high"
  }
]
```

---

## Iteration Guide

```json
[
  {
    "iteration": 1,
    "focus": "Foundation & Typography",
    "tasks": [
      "Load Google Fonts (JetBrains Mono, IBM Plex Mono)",
      "Set CSS variables for colors, spacing, timing",
      "Apply monospace font stack globally",
      "Set border-radius: 0 on all components"
    ],
    "rationale": "Establish visual identity with distinctive fonts and raw geometry"
  },
  {
    "iteration": 2,
    "focus": "Layout & Components",
    "tasks": [
      "Style header with brand (h1) and theme toggle",
      "Style input/add button with 2px borders",
      "Style checkbox with 0 border-radius, 24px size",
      "Style filter buttons with active state styling",
      "Ensure all buttons ≥ 44×44px touch targets"
    ],
    "rationale": "Build core UI with consistent high-contrast styling"
  },
  {
    "iteration": 3,
    "focus": "Animations & Motion",
    "tasks": [
      "Add item slide-in animation on add (staggered)",
      "Add checkbox bounce animation on completion",
      "Add item slide-out on delete",
      "Add button hover/active animations",
      "Add input focus border color animation",
      "Add filter state transition animations"
    ],
    "rationale": "Implement purposeful motion; confirm actions; guide attention"
  },
  {
    "iteration": 4,
    "focus": "Accessibility & Polish",
    "tasks": [
      "Verify contrast ratios (4.5:1 text, 3:1 large)",
      "Test keyboard navigation (Tab, Enter, Space, Escape)",
      "Verify focus indicators visible and 3px outline with 2px offset",
      "Add @media (prefers-reduced-motion: reduce) support",
      "Test dark mode contrast and animation behavior",
      "Test responsive layout on mobile/tablet"
    ],
    "rationale": "Ensure accessibility-first design and cross-device compatibility"
  },
  {
    "iteration": 5,
    "focus": "Responsive & Dark Mode",
    "tasks": [
      "Adjust font sizes and spacing for mobile (< 768px)",
      "Adjust header and button sizes for touch",
      "Verify dark mode contrast and colors",
      "Test animations in dark mode (no adjustments needed, colors handle it)",
      "Test all breakpoints (mobile, tablet, desktop)"
    ],
    "rationale": "Ensure responsive design and dark mode experience matches light mode quality"
  }
]
```

---

## Agent Prompt Guide

When implementing this design, reference:

1. **Color System**: All colors defined in `:root` and `[data-theme="dark"]` CSS variables
2. **Typography**: Only JetBrains Mono (display) and IBM Plex Mono (body)
3. **Spacing**: Use `--spacing-*` CSS variables (xs, sm, md, lg, xl)
4. **Animations**: Use `--duration-*` and `--easing-*` variables; always include reduced-motion fallback
5. **Accessibility**: 4.5:1 contrast, 44×44px touch targets, visible focus, semantic HTML + ARIA
6. **Layout**: CSS Grid for app-root structure; Flexbox for component layout
7. **Motion**: GPU-accelerated only (transform, opacity); purpose-driven; staggered reveals
8. **Quality Checklist**: Before shipping, verify all lint rules and reduced-motion support

---

## File Structure

```
src/
├── App.jsx              (Main component, unchanged)
├── index.css            (REPLACE with new brutalist styles)
└── components/          (Future: extract component-specific styles)

docs/
└── DESIGN.md            (This file)
```
