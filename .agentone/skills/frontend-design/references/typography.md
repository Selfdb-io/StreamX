# Typography Reference

Distinctive font pairings organized by aesthetic direction.

## Luxury / Refined

| Heading | Body | Vibe |
|---------|------|------|
| Cormorant Garamond | Lato | Elegant, timeless |
| Playfair Display | Source Sans 3 | Editorial luxury |
| Didot / Bodoni | Karla | High fashion |
| Cinzel | Raleway | Classic authority |
| Tenor Sans | Crimson Pro | Understated elegance |

## Modern / Technical

| Heading | Body | Vibe |
|---------|------|------|
| Space Grotesk | DM Sans | Tech-forward |
| Syne | Work Sans | Bold modern |
| Archivo Black | IBM Plex Sans | Industrial precision |
| Unbounded | Outfit | Geometric futurism |
| JetBrains Mono | Atkinson Hyperlegible | Developer-focused |

## Editorial / Magazine

| Heading | Body | Vibe |
|---------|------|------|
| Fraunces | Libre Franklin | Literary warmth |
| Newsreader | Chivo | Classic editorial |
| Lora | Nunito Sans | Approachable editorial |
| DM Serif Display | Public Sans | Contemporary magazine |
| Libre Baskerville | Open Sans | Traditional journalism |

## Playful / Friendly

| Heading | Body | Vibe |
|---------|------|------|
| Fredoka One | Nunito | Rounded, childlike |
| Baloo 2 | Quicksand | Soft, approachable |
| Lilita One | Poppins | Fun, energetic |
| Pacifico | Lato | Casual script |
| Righteous | Rubik | Retro playful |

## Brutalist / Raw

| Heading | Body | Vibe |
|---------|------|------|
| Monument Extended | Neue Montreal | Statement typography |
| Bebas Neue | Barlow | Condensed power |
| Oswald | Source Code Pro | Industrial strength |
| Anton | Roboto Mono | Bold utilitarian |
| Black Ops One | Share Tech Mono | Military tech |

## Art Deco / Geometric

| Heading | Body | Vibe |
|---------|------|------|
| Poiret One | Josefin Sans | 1920s elegance |
| Abril Fatface | Montserrat | Theatrical display |
| Yeseva One | Open Sans | Ornate contrast |
| Italiana | Lato | Art deco minimal |
| Marcellus | Questrial | Classical geometric |

## Organic / Natural

| Heading | Body | Vibe |
|---------|------|------|
| Cormorant | Proza Libre | Organic sophistication |
| Eczar | Cabin | Earthy warmth |
| Vollkorn | Fira Sans | Woodsy editorial |
| Merriweather | Muli | Natural readability |
| Spectral | Overpass | Botanical elegance |

---

## Type Scale Recommendations

### Compact (Information-dense UI)

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 2rem;      /* 32px */
```

### Expressive (Marketing, Editorial)

```css
--text-sm: 0.875rem;   /* 14px */
--text-base: 1.125rem; /* 18px */
--text-lg: 1.5rem;     /* 24px */
--text-xl: 2rem;       /* 32px */
--text-2xl: 3rem;      /* 48px */
--text-3xl: 4rem;      /* 64px */
--text-4xl: 6rem;      /* 96px */
```

---

## Font Loading Best Practices

```html
<!-- Preconnect to Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load with display=swap for performance -->
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=Libre+Franklin:wght@400;500&display=swap" rel="stylesheet">
```

```css
/* Fallback stack */
font-family: 'Fraunces', 'Georgia', 'Times New Roman', serif;
font-family: 'Libre Franklin', 'Helvetica Neue', 'Arial', sans-serif;
```
