---
name: brand-guidelines
description: Create a complete, practical brand guidelines document for a company/product (voice, logo usage rules, color palette, typography, UI components, imagery, accessibility, and do/don't examples). Use when users ask for "brand guidelines", "brand book", "style guide", "visual identity", "design system basics", or when they need a standardized set of brand rules + design tokens to keep marketing and UI consistent.
---

# Brand Guidelines Creator

Create clear, usable brand guidelines that a team can follow without guessing.

Default output: a single Markdown brand guide the user can paste into Notion/Confluence/GDocs.

## Workflow

### 1) Gather inputs (ask only what's missing)

If the user didn't provide these, ask 5–8 short questions (not a giant questionnaire):

- **Brand basics**: company/product name, what it does, target audience
- **Positioning**: 3 adjectives (e.g., "bold, friendly, premium"), 1 sentence mission
- **Personality & voice**: "sound like" + "never sound like"
- **Practical constraints**: existing logo? existing colors? preferred fonts? web vs print?
- **Channels**: website/app, social, print, presentations

If the user says "make it up", propose 2 distinct directions and ask them to pick one.

### 2) Define the brand system

Produce decisions, not vibes. Every section should include:

- **Rules** (what to do)
- **Rationale** (one line)
- **Examples** (do/don't)

Keep the system small enough to implement: 1 primary color, 1 secondary, 1 accent, and a neutral scale is usually enough.

### 3) Validate for real-world use

- Ensure text contrast is accessible (aim for WCAG AA where practical).
- Provide web-safe fallbacks for fonts.
- Avoid "hero-only" palettes that fail in UI states (hover, disabled, error, success).

### 4) Deliver in a copy/paste format

Deliverables (choose based on what the user wants):

- **One-pager**: brand essence + colors + type + quick do/don't
- **Full guidelines** (recommended): See [references/template.md](references/template.md)
- **Design tokens** (optional): CSS variables and/or JSON tokens

## Style Choices Heuristics

- If the brand is **premium**: reduce palette saturation, increase whitespace, use a high-contrast neutral base.
- If the brand is **playful**: allow brighter accents, rounded radii, higher motion.
- If the brand is **technical**: prioritize clarity, restrained color, readable type scale, strong focus states.

## If the User Provides Existing Assets

- **Existing colors**: keep them, but normalize into roles (primary/secondary/neutral/semantic) and flag any contrast issues.
- **Existing logo**: write strict usage rules (clear space, min size, backgrounds, don'ts).
- **Existing fonts**: verify availability/licensing constraints and provide fallbacks.
