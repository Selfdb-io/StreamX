# Brand Guidelines Template

Use this structure when generating full brand guidelines.

---

# {Brand Name} — Brand Guidelines

## 1. Brand Essence

- **Mission**: …
- **Audience**: …
- **Positioning**: …
- **Personality (3–5 traits)**: …

## 2. Voice & Tone

### Voice principles

- **Do**: …
- **Don't**: …

### Example copy

- **Website headline**: …
- **Product description**: …
- **Support message**: …

## 3. Logo

If no logo exists, include placeholder guidance and propose next steps (wordmark vs symbol).

### Logo usage rules

- **Clear space**: define as "X" (e.g., height of the logomark)
- **Minimum size**: px for web and mm for print
- **Backgrounds**: allowed + forbidden

### Don'ts

- Don't stretch, skew, add shadows, recolor, or place on low-contrast backgrounds

## 4. Color

Provide HEX for UI + print-friendly notes if asked.

### Palette

- **Primary**: `#......` (usage: CTAs, key highlights)
- **Secondary**: `#......` (usage: secondary CTAs, links)
- **Accent**: `#......` (usage: sparingly for emphasis)

### Neutrals

- `#......` (text)
- `#......` (background)
- `#......` (borders)

### Semantic colors (UI)

- **Success**: `#......`
- **Warning**: `#......`
- **Error**: `#......`
- **Info**: `#......`

### Accessibility

- State which pairings are safe for body text (AA) and which are for large text only.

## 5. Typography

### Font pairings

- **Headings**: {Font} (fallbacks: …)
- **Body**: {Font} (fallbacks: …)
- **Monospace** (optional): {Font} (fallbacks: …)

### Type scale (web)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | … | … | … |
| H2 | … | … | … |
| H3 | … | … | … |
| Body | … | … | … |
| Small | … | … | … |

## 6. Layout & Spacing

- **Grid**: 12-column, max width …px
- **Spacing scale**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- **Border radius**: …
- **Shadow philosophy**: …

## 7. UI Components

Define states for each: default / hover / active / disabled / focus.

### Buttons

- **Primary**: …
- **Secondary**: …
- **Ghost**: …

### Inputs

- Default, focus, error, disabled states

### Links

- Default, hover, visited states

### Cards

- Structure, padding, shadow

### Alerts

- Success, warning, error, info variants

## 8. Imagery & Illustration

- **Photo style**: lighting, subject, composition guidelines
- **Illustration style**: line weight, shapes, detail level
- **Icon style**: stroke width, corner radius, sizing

## 9. Motion (optional)

- **Easing**: …
- **Duration**: micro (100-200ms), standard (200-400ms), complex (400-600ms)
- **When to animate**: page transitions, feedback, loading states

## 10. Do / Don't Gallery

| ✅ Do | ❌ Don't |
|-------|---------|
| Use primary color for main CTAs | Use primary color for everything |
| Maintain clear space around logo | Crowd the logo with other elements |
| Use semantic colors for status | Use red for non-error states |
| Keep type hierarchy consistent | Mix more than 3 font sizes per page |
| … | … |

## 11. Design Tokens

### CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #......;
  --color-secondary: #......;
  --color-accent: #......;
  --color-bg: #......;
  --color-text: #......;
  --color-border: #......;
  
  /* Semantic */
  --color-success: #......;
  --color-warning: #......;
  --color-error: #......;
  --color-info: #......;
  
  /* Typography */
  --font-heading: "...", sans-serif;
  --font-body: "...", sans-serif;
  --font-mono: "...", monospace;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

### JSON Tokens (optional)

```json
{
  "color": {
    "primary": { "value": "#......" },
    "secondary": { "value": "#......" }
  },
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" }
  }
}
```
