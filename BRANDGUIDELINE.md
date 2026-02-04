# StreamX Brand Guidelines

> **Version**: 1.0  
> **Date**: February 3, 2026  
> **Status**: Active

---

## 1. Brand Overview

### Brand Essence
StreamX is a **personal media streaming platform** that combines the premium feel of Spotify with the cinematic experience of Netflix—all self-hosted and privacy-first.

### Brand Personality
- **Premium**: Every interaction feels polished and intentional
- **Immersive**: Dark, cinematic aesthetic that lets content shine
- **Personal**: Your library, your way, no algorithms deciding for you
- **Modern**: Cutting-edge design without sacrificing usability

### Design Direction
**Aesthetic**: Dark Luxury meets Glass-Morphism
- Deep, rich blacks create a cinema-like atmosphere
- Glass effects add depth and sophistication
- Blue accents provide energy and wayfinding
- Subtle gradients and glows create a premium, high-tech feel

---

## 2. Logo & Wordmark

### Primary Logo
The StreamX logo combines a play icon with flowing motion, symbolizing seamless media streaming.

```
┌─────────────────────────────────────┐
│                                     │
│    ▶  StreamX                       │
│   ╱╲                                │
│  ╱  ╲  Gradient play icon           │
│ ╱────╲ in rounded container         │
│                                     │
└─────────────────────────────────────┘
```

### Logo Specifications
- **Icon**: Rounded square container with gradient play triangle
- **Container**: `border-radius: 12px` (rounded-xl)
- **Gradient**: Blue 500 → Blue 600 (`#3b82f6` → `#2563eb`)
- **Shadow**: `box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3)`

### Logo Usage
| Context | Version |
|---------|---------|
| App Header | Icon + Wordmark (horizontal) |
| Favicon | Icon only (simplified) |
| Loading States | Animated icon |
| Dark backgrounds | Full color with glow |
| Light backgrounds | Avoid—app is dark-mode only |

### Clear Space
Minimum clear space around logo: 1× the height of the icon

### Don'ts
- ❌ Don't change logo colors
- ❌ Don't add drop shadows not specified
- ❌ Don't stretch or distort
- ❌ Don't place on busy backgrounds without overlay
- ❌ Don't use on light backgrounds

---

## 3. Color System

### Primary Palette

#### Backgrounds (Light Theme)
| Name | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Background | `#faf7f5` | `--background` | Main app background (warm cream) |
| Background Alt | `#f5f5f4` | `--bg-alt` | Slightly muted surfaces |
| Surface | `#ffffff` | `--surface` | Cards, panels (pure white) |
| Surface Muted | `#f5f5f4` | `--surface-muted` | Hover states |
| Surface Elevated | `#fafaf9` | `--surface-elevated` | Modals, popovers |

#### Text
| Name | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Foreground | `#1a1a1a` | `--foreground` | Primary text (near black) |
| Foreground Muted | `rgba(0,0,0,0.7)` | `--foreground-muted` | Secondary text |
| Foreground Subtle | `rgba(0,0,0,0.5)` | `--foreground-subtle` | Tertiary/hint text |
| Foreground Disabled | `rgba(0,0,0,0.35)` | `--foreground-disabled` | Disabled states |

#### Accent Colors (Warm Orange)
| Name | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Accent | `#f97316` | `--accent` | Primary actions, links, focus |
| Accent Hover | `#ea580c` | `--accent-hover` | Hover state for accent |
| Accent Light | `#fdba74` | `--accent-light` | Lighter accent variant |
| Accent Glow | `rgba(249,115,22,0.25)` | `--accent-glow` | Soft glow effects |
| Accent Subtle | `rgba(249,115,22,0.1)` | `--accent-subtle` | Selected states, highlights |

#### Secondary Colors (Warm Gold)
| Name | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Secondary | `#fbbf24` | `--secondary` | Secondary accents, highlights |
| Secondary Hover | `#f59e0b` | `--secondary-hover` | Hover state for secondary |
| Secondary Glow | `rgba(251,191,36,0.2)` | `--secondary-glow` | Gold glow effects |

#### Border & Muted
| Name | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Border | `#e7e5e4` | `--border` | Subtle borders |
| Muted | `#78716c` | `--muted` | Muted text/elements |
| Stone-100 | `#f5f5f4` | - | Light backgrounds, pills |
| Stone-200 | `#e7e5e4` | - | Borders, dividers |

#### Semantic Colors
| Name | Value | Usage |
|------|-------|-------|
| Success | `#22c55e` | Completed actions, confirmations |
| Warning | `#fbbf24` | Warnings, caution states |
| Error | `#ef4444` | Errors, destructive actions |
| Info | `#f97316` | Informational messages |

#### Gradients
| Name | Value | Usage |
|------|-------|-------|
| Accent Gradient | `linear-gradient(to right, #f97316, #ea580c)` | Primary buttons, active states |
| Warm Gradient | `linear-gradient(to right, #fb923c, #f97316)` | Highlights, progress bars |
| Mesh Background | `radial-gradient(at 0% 0%, rgba(249,115,22,0.08), transparent 50%), radial-gradient(at 100% 0%, rgba(251,191,36,0.06), transparent 50%)` | Subtle page backgrounds |
| Text Gradient | `linear-gradient(to bottom right, #1a1a1a, rgba(0,0,0,0.6))` | Hero headings |
| Sunset Accent | `linear-gradient(to br, #f97316, #fbbf24)` | Profile rings, special elements |

### Dark Opacity Scale
For glass effects and subtle layering on light backgrounds:

```css
--dark-2: rgba(0, 0, 0, 0.02);
--dark-5: rgba(0, 0, 0, 0.05);
--dark-8: rgba(0, 0, 0, 0.08);
--dark-10: rgba(0, 0, 0, 0.1);
--dark-15: rgba(0, 0, 0, 0.15);
--dark-20: rgba(0, 0, 0, 0.2);
```
--white-3: rgba(255, 255, 255, 0.03);
--white-5: rgba(255, 255, 255, 0.05);
--white-8: rgba(255, 255, 255, 0.08);
--white-10: rgba(255, 255, 255, 0.1);
--white-15: rgba(255, 255, 255, 0.15);
--white-20: rgba(255, 255, 255, 0.2);
```

---

## 4. Typography

### Font Stack

#### Primary Font: Geist
- **Usage**: All UI text, headings, body copy
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Fallback**: `'Inter', system-ui, -apple-system, sans-serif`

```css
font-family: 'Geist', 'Inter', system-ui, -apple-system, sans-serif;
```

#### Monospace Font: Geist Mono
- **Usage**: Durations, timestamps, technical info
- **Fallback**: `'JetBrains Mono', 'Fira Code', monospace`

```css
font-family: 'Geist Mono', 'JetBrains Mono', monospace;
```

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Display | `clamp(2.5rem, 6vw, 5rem)` | 800 | 1.0 | `-0.02em` | Hero headings |
| H1 | `3rem (48px)` | 800 | 1.1 | `-0.02em` | Page titles ("Library") |
| H2 | `1.5rem (24px)` | 700 | 1.2 | `-0.01em` | Section headings |
| H3 | `1.25rem (20px)` | 600 | 1.3 | `0` | Card titles |
| Body | `1rem (16px)` | 400 | 1.6 | `0` | Paragraphs |
| Body Small | `0.875rem (14px)` | 400 | 1.5 | `0` | Secondary text |
| Caption | `0.75rem (12px)` | 500 | 1.4 | `0.02em` | Labels, timestamps |
| Overline | `0.625rem (10px)` | 700 | 1.2 | `0.1em` | Badges, uppercase labels |

### Typography Styles

#### Gradient Text (Hero Headings)
```css
.gradient-text {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-image: linear-gradient(to bottom right, white, white, rgba(255, 255, 255, 0.5));
}
```

#### Truncation
```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## 5. Spacing System

Based on a 4px grid with Tailwind conventions:

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | `0` | None |
| `space-1` | `0.25rem (4px)` | Tight internal spacing |
| `space-2` | `0.5rem (8px)` | Icon gaps, compact elements |
| `space-3` | `0.75rem (12px)` | Small component padding |
| `space-4` | `1rem (16px)` | Standard padding |
| `space-5` | `1.25rem (20px)` | Medium spacing |
| `space-6` | `1.5rem (24px)` | Section padding |
| `space-8` | `2rem (32px)` | Large section gaps |
| `space-10` | `2.5rem (40px)` | Header heights |
| `space-12` | `3rem (48px)` | Major section breaks |
| `space-16` | `4rem (64px)` | Page margins |
| `space-20` | `5rem (80px)` | Hero sections |

### Layout Guidelines
- **Sidebar width**: `16rem (256px)`
- **Header height**: `5rem (80px)`
- **Player height**: Auto (responsive)
- **Card gap**: `1.5rem (24px)`
- **Page padding**: `2rem (32px)`

---

## 6. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `0.375rem (6px)` | Small buttons, badges |
| `radius-md` | `0.5rem (8px)` | Inputs, small cards |
| `radius-lg` | `0.75rem (12px)` | Buttons, tags |
| `radius-xl` | `1rem (16px)` | Cards, containers |
| `radius-2xl` | `1.5rem (24px)` | Modals, large cards |
| `radius-3xl` | `2rem (32px)` | Player, hero elements |
| `radius-full` | `9999px` | Circular buttons, avatars |

---

## 7. Shadows & Elevation

### Elevation System

| Level | Shadow | Usage |
|-------|--------|-------|
| Level 0 | None | Flat elements |
| Level 1 | `0 2px 8px rgba(0,0,0,0.3)` | Subtle lift |
| Level 2 | `0 4px 16px rgba(0,0,0,0.4)` | Cards, dropdowns |
| Level 3 | `0 8px 32px rgba(0,0,0,0.5)` | Modals, popovers |
| Level 4 | `0 20px 60px rgba(0,0,0,0.6)` | Hero elements |

### Glow Effects

| Name | Shadow | Usage |
|------|--------|-------|
| Accent Glow | `0 0 20px rgba(59,130,246,0.4)` | Primary buttons |
| Accent Glow Large | `0 0 40px rgba(59,130,246,0.3)` | Active player |
| Red Glow | `0 0 12px rgba(239,68,68,0.5)` | Notification dot |
| Purple Glow | `0 0 20px rgba(147,51,234,0.3)` | User avatars |

---

## 8. Glass-Morphism Effects

### Glass Card
```css
.glass {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}
```

### Glass Hover Card
```css
.card-hover {
  background-color: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: scale(1.02);
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}
```

### Player Glass
```css
.player-glass {
  background: linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
}
```

---

## 9. Motion & Animation

### Timing Functions

| Name | Value | Usage |
|------|-------|-------|
| Default | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounces |
| Smooth | `cubic-bezier(0.4, 0, 0.2, 1)` | Fades, slides |
| Sharp | `cubic-bezier(0.4, 0, 0.6, 1)` | Quick snaps |

### Duration Scale

| Name | Value | Usage |
|------|-------|-------|
| Fast | `100ms` | Micro-interactions |
| Normal | `200ms` | Button states |
| Slow | `300ms` | Card hovers |
| Slower | `500ms` | Page transitions |
| Slowest | `700ms` | Entrance animations |

### Animation Patterns

#### Staggered Entrance
```css
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }
/* ... */

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Scale on Hover
```css
.scale-hover {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-hover:hover {
  transform: scale(1.05);
}

.scale-hover:active {
  transform: scale(0.95);
}
```

#### Play Button Glow Pulse
```css
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
}

.play-button-active {
  animation: glowPulse 2s ease-in-out infinite;
}
```

---

## 10. Iconography

### Icon Library
**Primary**: Lucide React (`lucide-react`)

### Icon Sizes

| Size | Pixels | Usage |
|------|--------|-------|
| xs | `14px` | Inline text icons |
| sm | `16px` | Compact UI elements |
| md | `20px` | Standard UI (buttons, nav) |
| lg | `24px` | Prominent actions |
| xl | `32px` | Empty states, features |
| 2xl | `48px` | Hero elements |

### Icon Style Guidelines
- **Stroke width**: 2px (default)
- **Color**: Inherit from parent or use `text-gray-400` for secondary
- **Hover**: Transition to `text-white` or `text-accent`
- **Fill**: Use `fill-current` for solid icons (play, pause)

### Common Icons

| Action | Icon | Component |
|--------|------|-----------|
| Play | ▶ | `<Play />` |
| Pause | ⏸ | `<Pause />` |
| Skip Forward | ⏭ | `<SkipForward />` |
| Skip Back | ⏮ | `<SkipBack />` |
| Shuffle | 🔀 | `<Shuffle />` |
| Repeat | 🔁 | `<Repeat />` |
| Volume | 🔊 | `<Volume2 />` |
| Heart | ♥ | `<Heart />` |
| Add | + | `<Plus />` |
| More | ⋮ | `<MoreVertical />` |
| Search | 🔍 | `<Search />` |
| Home | 🏠 | `<Home />` |
| Library | 📚 | `<Library />` |
| Music | 🎵 | `<PlayCircle />` |
| Video | 🎬 | `<Film />` |

---

## 11. Component Patterns

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  transition: all 200ms;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  transition: all 200ms;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-color: rgba(255, 255, 255, 0.1);
}
```

#### Icon Button
```css
.btn-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  transition: all 200ms;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.1);
}
```

### Cards

#### Media Card
- **Aspect ratio**: 1:1 (square) for covers
- **Border radius**: `1rem` outer, `0.75rem` inner image
- **Padding**: `1rem`
- **Hover**: Scale 1.02, glow shadow, border highlight

#### Playlist/Collection Card
- **Layout**: Horizontal with cover art left, text right
- **Cover size**: `4rem × 4rem`
- **Border radius**: `0.75rem`

### Input Fields

```css
.input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 0.75rem 1.25rem;
  color: white;
  font-size: 0.875rem;
  transition: all 200ms;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
```

### Progress Bars

```css
.progress-track {
  height: 0.375rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}
```

---

## 12. Layout Patterns

### App Shell
```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar (256px)  │  Header (80px height)                    │
│                  ├──────────────────────────────────────────│
│ • Logo           │  Main Content Area                       │
│ • Navigation     │  (scrollable)                            │
│ • Collections    │                                          │
│ • Add Media      │  • Discovery Carousels                   │
│                  │  • Media Grid                            │
│                  │                                          │
├──────────────────┴──────────────────────────────────────────│
│ Player Bar (fixed bottom, glass effect)                     │
└─────────────────────────────────────────────────────────────┘
```

### Grid System
- **Media Grid**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- **Gap**: `1.5rem (24px)`
- **Responsive breakpoints**: Tailwind defaults (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

### Carousel Pattern
- Horizontal scroll with hidden scrollbar
- Left/right navigation arrows on hover
- Peek next item slightly

---

## 13. Accessibility Guidelines

### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- Interactive elements: Clear focus states

### Focus States
```css
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #050505, 0 0 0 4px #3b82f6;
}
```

### Keyboard Navigation
- All interactive elements focusable via Tab
- Logical focus order (left-to-right, top-to-bottom)
- Skip links for main content
- Arrow key navigation in menus/grids

### Screen Readers
- Meaningful `aria-label` on icon-only buttons
- `aria-current` for active navigation
- `aria-live` regions for dynamic content (now playing, notifications)
- Proper heading hierarchy (h1 → h2 → h3)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Responsive Design

### Breakpoints

| Name | Min Width | Typical Devices |
|------|-----------|-----------------|
| Mobile | 0 | Phones |
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Mobile Adaptations
- **Sidebar**: Hidden, accessible via hamburger menu
- **Player**: Compact mode, tap to expand
- **Grid**: 2 columns
- **Search**: Full-width
- **Video player**: Full-screen by default

---

## 15. Voice & Tone

### Writing Style
- **Concise**: Short, scannable labels
- **Action-oriented**: "Add to Queue" not "Queue Addition"
- **Friendly but not casual**: Professional without being cold
- **Clear**: Avoid jargon; "Shuffle" not "Randomize playback order"

### UI Copy Examples

| Context | ✅ Do | ❌ Don't |
|---------|-------|---------|
| Empty library | "Add your first track" | "No media items found in database" |
| Upload success | "Added to library" | "File upload completed successfully" |
| Error | "Couldn't play this file" | "Error code 500: Media playback failure" |
| Delete confirm | "Delete this track?" | "Are you sure you want to permanently remove this item?" |

### Button Labels
- **Primary actions**: Verb + noun ("Create Playlist", "Add Media")
- **Secondary actions**: Verb only ("Cancel", "Skip")
- **Toggle states**: Active state ("Shuffle On" → icon highlighted)

---

## 16. Assets & Resources

### Required Fonts
```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- OR use Vercel's Geist package -->
<!-- npm install geist -->
```

### Icon Package
```bash
npm install lucide-react
# or
bun add lucide-react
```

### Animation Library
```bash
npm install framer-motion
# or
bun add framer-motion
```

---

## 17. Implementation Checklist

### CSS Variables Setup
```css
:root {
  /* Backgrounds */
  --background: #050505;
  --bg-alt: #0a0a0a;
  --surface: #121212;
  --surface-muted: #1a1a1a;
  --surface-elevated: #2a2a2a;

  /* Text */
  --foreground: #ffffff;
  --foreground-muted: rgba(255, 255, 255, 0.7);
  --foreground-subtle: rgba(255, 255, 255, 0.5);
  --foreground-disabled: rgba(255, 255, 255, 0.3);

  /* Accent */
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --accent-glow: rgba(59, 130, 246, 0.4);
  --accent-subtle: rgba(59, 130, 246, 0.15);

  /* Semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radii */
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.4);
}
```

---

*This brand guideline ensures consistency across all StreamX interfaces. When in doubt, prioritize user experience, accessibility, and the premium, immersive feel that defines the StreamX brand.*
