# StellarLight Magic — Design System
**Modern & Professional · Shopify Custom Theme**

---

## Font Pairing

| Role | Font | Weight | Use Case |
|---|---|---|---|
| Display / Heading | Cormorant Garamond | 300, 400, 500 | Hero, H1–H2, section titles |
| UI / Body | Inter | 400, 500 | Nav, body copy, buttons, labels |
| Accent / Mono | DM Mono | 400, 500 | SKU, price, badges, code |

### Google Fonts snippet (theme.liquid)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?
  family=Cormorant+Garamond:wght@300;400;500&
  family=Inter:wght@400;500&
  family=DM+Mono:wght@400;500&
  display=swap"
  rel="stylesheet">
```

---

## Typography Scale

| Token | Size | Weight | Letter-spacing | Use |
|---|---|---|---|---|
| H1 | 48px | 400 | 0.04em | Page hero, main headline |
| H2 | 32px | 400 | 0.02em | Section headings |
| H3 | 20px | 500 | 0em | Product names, card titles |
| Body | 16px | 400 | 0em | Product descriptions, nav |
| Caption | 12px | 500 | 0.08em | Badges, labels, tags (ALL CAPS) |
| Mono | 14px | 400 | 0.04em | SKU, prices, technical info |

---

## Color Palette — Light Mode

| Token | Hex | Use |
|---|---|---|
| Background | `#FAFAF8` | Page background (warm white) |
| Surface | `#F3F1EC` | Card bg, section bg |
| Border | `#E8E4D9` | Dividers, card borders |
| Gold — Primary Accent | `#C9A84C` | CTA buttons, prices, links |
| Gold Light | `#E8D5A0` | Hover states, badge backgrounds |
| Deep Navy | `#0D1B2A` | Header, primary buttons, footer |
| Mid Navy | `#1E3A5F` | Dark sections, image overlays |
| Sky Blue | `#4A9FD4` | Info states, secondary CTA |
| Text Primary | `#2D2D2D` | Body copy, headings |
| Text Secondary | `#6B6B65` | Subtext, muted labels |

---

## Color Palette — Dark Mode

| Token | Hex | Use |
|---|---|---|
| Background | `#0A1520` | Page background (deep space) |
| Surface | `#0D1B2A` | Card bg, nav surface |
| Border | `rgba(74,159,212,0.2)` | Subtle blue-tinted borders |
| Gold Bright | `#D4B464` | CTA buttons, prices, links |
| Gold Glow | `#F0E4B8` | Hover states, badge backgrounds |
| Sky Blue | `#4A9FD4` | Links, secondary CTA |
| Blue Surface | `#2A5A8A` | Selected states, hover bg |
| Muted Blue | `#8CB8D4` | Body copy, descriptions |
| Text Primary | `#F0EEE8` | Headings, primary text |

---

## Shopify theme settings.json — Recommended Mappings

```json
{
  "font_heading": "Cormorant Garamond",
  "font_body": "Inter",
  "color_accent": "#C9A84C",
  "color_button": "#0D1B2A",
  "color_button_label": "#C9A84C",
  "color_background_1": "#FAFAF8",
  "color_background_2": "#F3F1EC",
  "color_foreground": "#2D2D2D",
  "color_header_bg": "#0D1B2A",
  "color_header_text": "#F0EEE8"
}
```

---

## Layout Patterns

### 1. Full-Bleed Hero
- Navy/dark gradient background
- Cormorant Garamond H1, white text
- Gold accent line above headline (`border-top: 2px solid #C9A84C`)
- Single CTA button: navy bg + gold label
- Full-width image or video background

### 2. Product Grid
- 2-column (mobile) → 4-column (desktop)
- Card: white bg, 0.5px border, 8px radius
- Gold price text, small caps brand name
- Hover: subtle shadow lift + gold border

### 3. Split Feature Sections
- Image left / Copy right (alternate per section)
- Navy image overlay at 30% opacity
- Gold overline label above heading
- Secondary CTA (outline button)

### 4. Sticky Navigation
- Background: `#0D1B2A`
- Logo: Cormorant Garamond, gold color
- Nav links: Inter 14px, white at 70% opacity → 100% on hover
- Scroll-triggered: transparent on hero → solid on scroll

### 5. Product Detail Page (PDP)
- Image gallery left (60%), sticky purchase panel right (40%)
- Purchase panel: white card, gold price, navy CTA
- Tabs for Description / Specifications / Reviews below

### 6. Minimal Checkout
- Single-column on mobile, 2-column on desktop
- Form left, order summary right
- Progress bar in gold
- Clean input fields, no distractions

---

## Spacing System

| Token | Value | Use |
|---|---|---|
| xs | 4px | Icon gaps, tight inline |
| sm | 8px | Component internal padding |
| md | 12px | Input padding, list gaps |
| base | 16px | Default spacing unit |
| lg | 24px | Card padding |
| xl | 32px | Component separation |
| 2xl | 48px | Section internal padding |
| 3xl | 64px | Section padding (desktop) |
| 4xl | 80px | Hero section padding |

> **Rule:** Section padding = 64–80px vertical · Card padding = 24px · Grid gap = 16–24px

---

## Component Guidelines

### Buttons

```
Primary:   bg #0D1B2A  · text #C9A84C  · radius 4px  · 500 weight · 0.08em tracking
Secondary: bg #C9A84C  · text #0D1B2A  · radius 4px  · 500 weight
Outline:   bg transparent · border 1px #2D2D2D · radius 4px
```

### Badges / Tags

```
New Arrival:  bg #E8D5A0 · text #7A5C1A
In Stock:     bg #DCF0FF · text #1A5A8A
Sale:         bg #FFF0D8 · text #8A4A00
Best Seller:  bg #F0EEE8 · text #555555 · border 1px #ccc
```

### Product Card

```
Container:    bg white · border 0.5px #E8E4D9 · radius 8px · overflow hidden
Image area:   aspect-ratio 4/3 · bg #F3F1EC
Brand label:  DM Mono 10px · #C9A84C · ALL CAPS · tracking 0.1em
Product name: Inter 14px · weight 500 · #2D2D2D
Price:        DM Mono 15px · weight 500 · #C9A84C
CTA button:   full width · navy bg · gold text
```

---

## Design Principles

1. **Gold as the signature** — Use `#C9A84C` sparingly but consistently for all interactive and price elements.
2. **Navy as structure** — Header, footer, and primary buttons anchor the page with deep navy.
3. **Whitespace over decoration** — Let products breathe. Avoid pattern fills or busy backgrounds in content areas.
4. **Typography contrast** — Serif display font (Cormorant) paired with clean sans (Inter) creates a premium-but-modern feel.
5. **Dark mode = starfield aesthetic** — Deep space bg with gold glow; reinforces the "Stellar" brand name.

---

*StellarLight Magic Design System — v1.0*
