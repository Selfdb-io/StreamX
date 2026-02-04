# Aesthetic Implementation Examples

Code patterns for different design directions.

## Brutalist / Raw

```css
:root {
  --color-bg: #000;
  --color-text: #fff;
  --color-accent: #ff0000;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

h1 {
  font-size: clamp(3rem, 15vw, 12rem);
  font-weight: 900;
  line-height: 0.85;
  mix-blend-mode: difference;
}

.brutal-border {
  border: 4px solid var(--color-text);
  box-shadow: 8px 8px 0 var(--color-accent);
}

.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
}

.glitch-text::before {
  color: cyan;
  clip-path: inset(0 0 50% 0);
  transform: translate(-2px, 2px);
}

.glitch-text::after {
  color: magenta;
  clip-path: inset(50% 0 0 0);
  transform: translate(2px, -2px);
}
```

---

## Luxury / Refined

```css
:root {
  --color-bg: #faf9f7;
  --color-text: #1a1a1a;
  --color-accent: #c9a961;
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Lato', 'Helvetica Neue', sans-serif;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.125rem;
  line-height: 1.8;
  letter-spacing: 0.02em;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 300;
  letter-spacing: 0.05em;
}

h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
}

.luxury-button {
  background: transparent;
  border: 1px solid var(--color-text);
  padding: 1rem 3rem;
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.luxury-button:hover {
  background: var(--color-text);
  color: var(--color-bg);
}

.fade-in {
  animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to { opacity: 1; transform: translateY(0); }
  from { opacity: 0; transform: translateY(20px); }
}
```

---

## Playful / Toy-like

```css
:root {
  --color-bg: #fff5f5;
  --color-primary: #ff6b6b;
  --color-secondary: #4ecdc4;
  --color-accent: #ffe66d;
  --color-text: #2d3436;
  --radius: 24px;
}

body {
  background: var(--color-bg);
  font-family: 'Nunito', 'Arial Rounded MT', sans-serif;
}

h1, h2 {
  font-family: 'Fredoka One', 'Comic Sans MS', cursive;
  color: var(--color-primary);
}

.playful-card {
  background: white;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: 
    0 4px 0 var(--color-secondary),
    0 8px 20px rgba(0,0,0,0.1);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.playful-card:hover {
  transform: translateY(-4px) rotate(1deg);
}

.bounce-button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 100px;
  padding: 1rem 2rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bounce-button:hover {
  transform: scale(1.1);
}

.bounce-button:active {
  transform: scale(0.95);
}

.wiggle {
  animation: wiggle 0.5s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
```

---

## Editorial / Magazine

```css
:root {
  --color-bg: #fffef9;
  --color-text: #1a1a1a;
  --color-accent: #e63946;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Source Sans 3', 'Helvetica Neue', sans-serif;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.125rem;
  line-height: 1.7;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.dropcap::first-letter {
  font-family: var(--font-display);
  font-size: 5rem;
  float: left;
  line-height: 0.8;
  padding-right: 0.5rem;
  color: var(--color-accent);
}

.editorial-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
}

.feature-image {
  grid-column: 1 / 8;
}

.feature-text {
  grid-column: 8 / 13;
  align-self: center;
}

.pull-quote {
  font-family: var(--font-display);
  font-size: 2rem;
  font-style: italic;
  border-left: 4px solid var(--color-accent);
  padding-left: 2rem;
  margin: 3rem 0;
}
```

---

## Retro-Futuristic

```css
:root {
  --color-bg: #0a0a0f;
  --color-text: #e0e0e0;
  --color-primary: #00ffff;
  --color-secondary: #ff00ff;
  --color-accent: #ffff00;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'Orbitron', 'Courier New', monospace;
}

h1 {
  font-size: clamp(2rem, 8vw, 6rem);
  text-transform: uppercase;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(0, 255, 255, 0.5);
}

.neon-border {
  border: 2px solid var(--color-primary);
  box-shadow: 
    0 0 10px var(--color-primary),
    0 0 20px var(--color-primary),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}

.grid-bg {
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

---

## Noise & Texture Utilities

```css
/* Grain overlay */
.grain::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.05;
  pointer-events: none;
  z-index: 9999;
}

/* Gradient mesh background */
.mesh-gradient {
  background: 
    radial-gradient(at 40% 20%, hsla(28, 100%, 74%, 0.5) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.3) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(355, 85%, 63%, 0.4) 0px, transparent 50%),
    radial-gradient(at 80% 50%, hsla(340, 100%, 76%, 0.3) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsla(22, 100%, 77%, 0.5) 0px, transparent 50%);
}

/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

---

## Staggered Animation Pattern

```css
.stagger-container > * {
  opacity: 0;
  animation: staggerIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.stagger-container > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-container > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-container > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-container > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-container > *:nth-child(5) { animation-delay: 0.5s; }

@keyframes staggerIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
