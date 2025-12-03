# Shopify Theme Design System

A comprehensive design system with 5 distinct presets, each optimized for different business types and visual styles.

---

## Table of Contents

1. [Presets Overview](#presets-overview)
2. [Color Systems](#color-systems)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Usage Guidelines](#usage-guidelines)

---

## Presets Overview

### 1. Zebra Skimmers (Industrial B2B)
**Best for:** Manufacturing, industrial suppliers, B2B equipment, technical products

| Attribute | Value |
|-----------|-------|
| Primary Color | Navy Blue (#003d79) |
| Accent Color | Cyan (#00a3e0) |
| CTA Color | Orange (#ff6b00) |
| Font Heading | Inter Extra-Bold |
| Font Body | Inter Regular |
| Style | Professional, trustworthy, technical |

**Key Design Elements:**
- Gradient hero backgrounds with animated grid
- Floating info cards with glassmorphism
- Strong emphasis on trust signals (warranty, certifications)
- Stats and ROI-focused messaging
- Technical product showcases

---

### 2. Modern Minimal
**Best for:** Lifestyle brands, curated products, home goods, fashion

| Attribute | Value |
|-----------|-------|
| Primary Color | Zinc (#18181b) |
| Accent Color | Gray (#71717a) |
| CTA Color | Black (#18181b) |
| Font Heading | Playfair Display Bold |
| Font Body | Source Sans Pro |
| Style | Elegant, understated, sophisticated |

**Key Design Elements:**
- Clean white space
- Editorial photography focus
- No rounded corners (sharp, geometric)
- Subtle hover states
- Minimal ornamentation

---

### 3. Bold Impact
**Best for:** Athletic brands, sports equipment, high-energy products

| Attribute | Value |
|-----------|-------|
| Primary Color | Slate (#0f172a) |
| Accent Color | Purple (#7c3aed) |
| CTA Color | Red (#dc2626) |
| Font Heading | Montserrat Black |
| Font Body | Open Sans |
| Style | Dynamic, energetic, confident |

**Key Design Elements:**
- Video hero backgrounds
- Large, dramatic typography
- High contrast colors
- Aggressive hover animations
- Social proof and athlete endorsements

---

### 4. Warm Artisan
**Best for:** Handmade goods, artisan products, food & beverage, craft items

| Attribute | Value |
|-----------|-------|
| Primary Color | Amber (#78350f) |
| Accent Color | Orange (#b45309) |
| CTA Color | Burnt Orange (#c2410c) |
| Font Heading | Cormorant Garamond Semi-Bold |
| Font Body | Lato |
| Style | Warm, authentic, storytelling |

**Key Design Elements:**
- Warm, earthy color palette
- Soft shadows and subtle borders
- Focus on maker stories
- Handcrafted aesthetic
- Process/journey visualization

---

### 5. Tech Forward
**Best for:** Consumer electronics, SaaS products, tech gadgets, apps

| Attribute | Value |
|-----------|-------|
| Primary Color | Sky Blue (#0ea5e9) |
| Accent Color | Cyan (#06b6d4) |
| CTA Color | Emerald (#10b981) |
| Font Heading | Space Grotesk Bold |
| Font Body | Inter |
| Style | Futuristic, dark mode, cutting-edge |

**Key Design Elements:**
- Dark backgrounds
- Glowing accent colors
- Animated grid/particle effects
- 3D product visualization
- Feature comparison tables
- Gradient CTAs

---

## Color Systems

### Color Token Structure

Each preset defines the following color tokens:

```css
/* Primary Brand Colors */
--color-primary         /* Main brand color */
--color-primary-light   /* Lighter variant */
--color-primary-dark    /* Darker variant */

/* Accent Colors */
--color-accent          /* Secondary brand color */
--color-highlight       /* Eye-catching highlight */

/* CTA Colors */
--color-cta             /* Call-to-action buttons */
--color-cta-hover       /* CTA hover state */

/* Semantic Colors */
--color-success         /* Success states, checkmarks */
--color-warning         /* Warning states */
--color-error           /* Error states */
--color-star            /* Star ratings */

/* Background Colors */
--color-background           /* Page background */
--color-background-secondary /* Alternating sections */
--color-background-tertiary  /* Cards, inputs */

/* Text Colors */
--color-text            /* Primary body text */
--color-text-secondary  /* Secondary text */
--color-text-muted      /* Muted/disabled text */
--color-text-light      /* Text on dark backgrounds */

/* Border Colors */
--color-border          /* Default borders */
--color-border-light    /* Subtle borders */
```

### Color Usage Guidelines

| Element | Token |
|---------|-------|
| Page headers | `--color-primary` |
| Section headings | `--color-primary` |
| Body text | `--color-text` |
| Links | `--color-accent` |
| Primary buttons | `--color-cta` |
| Secondary buttons | `--color-primary` |
| Success messages | `--color-success` |
| Star ratings | `--color-star` |
| Badges (sale) | `--color-error` |
| Badges (new) | `--color-accent` |
| Highlight text | `--color-highlight` |

---

## Typography

### Type Scale

Based on a configurable ratio (default: Major Third - 1.250):

| Token | Calculation | ~Size at 16px base |
|-------|-------------|-------------------|
| `--font-size-xs` | base ÷ ratio² | 10px |
| `--font-size-sm` | base ÷ ratio | 13px |
| `--font-size-md` | base | 16px |
| `--font-size-lg` | base × ratio | 20px |
| `--font-size-xl` | base × ratio² | 25px |
| `--font-size-2xl` | base × ratio³ | 31px |
| `--font-size-3xl` | base × ratio⁴ | 39px |
| `--font-size-4xl` | base × ratio⁵ | 49px |

### Heading Styles

```css
h1 {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  font-style: var(--font-heading-style);
  line-height: var(--font-heading-line-height);
  letter-spacing: var(--font-heading-letter-spacing);
  font-size: clamp(2rem, 5vw, var(--font-size-4xl));
}
```

### Body Styles

```css
body {
  font-family: var(--font-body);
  font-weight: var(--font-body-weight);
  line-height: var(--font-body-line-height);
  font-size: var(--font-size-md);
}
```

### Preset Typography Summary

| Preset | Heading Font | Body Font | Scale |
|--------|-------------|-----------|-------|
| Zebra Skimmers | Inter 800 | Inter 400 | 1.250 |
| Modern Minimal | Playfair Display 700 | Source Sans Pro 400 | 1.200 |
| Bold Impact | Montserrat 800 | Open Sans 400 | 1.333 |
| Warm Artisan | Cormorant Garamond 600 | Lato 400 | 1.200 |
| Tech Forward | Space Grotesk 700 | Inter 400 | 1.250 |

---

## Spacing & Layout

### Spacing Scale

```css
--space-1:   4px
--space-2:   8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
```

### Container Settings

| Setting | Mobile | Desktop |
|---------|--------|---------|
| Max Width | 1280px | 1280px |
| Padding | 24px | 32px |

### Section Spacing

| Preset | Mobile | Desktop |
|--------|--------|---------|
| Zebra Skimmers | 64px | 96px |
| Modern Minimal | 80px | 120px |
| Bold Impact | 64px | 100px |
| Warm Artisan | 72px | 112px |
| Tech Forward | 64px | 96px |

### Grid System

| Setting | Mobile | Desktop |
|---------|--------|---------|
| Columns | 1-2 | 3-4 |
| Gap | 24px | 32px |

---

## Components

### Buttons

**Tokens:**
```css
--button-border-radius
--button-padding-y
--button-padding-x
--button-text-transform
```

**Preset Button Styles:**

| Preset | Border Radius | Text Transform |
|--------|--------------|----------------|
| Zebra Skimmers | 8px | none |
| Modern Minimal | 0px | uppercase |
| Bold Impact | 12px | none |
| Warm Artisan | 4px | none |
| Tech Forward | 8px | none |

### Cards

**Tokens:**
```css
--card-border-radius
--card-padding
--card-shadow
```

**Preset Card Styles:**

| Preset | Border Radius | Shadow | Border |
|--------|--------------|--------|--------|
| Zebra Skimmers | 20px | Medium | Yes |
| Modern Minimal | 0px | None | Yes |
| Bold Impact | 24px | Large | No |
| Warm Artisan | 8px | Small | Yes |
| Tech Forward | 16px | Large | Yes |

### Form Inputs

**Tokens:**
```css
--input-border-radius
--input-border-width
```

### Badges

**Tokens:**
```css
--badge-border-radius  /* 100px for pills, lower for rounded rect */
```

---

## Animations

### Transition Timing

| Speed | Duration |
|-------|----------|
| Fast | 150ms |
| Base | 250ms |
| Slow | 350ms |

**Easing Options:**
- `ease` - Standard easing
- `ease-in-out` - Smooth acceleration/deceleration
- `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design easing

### Hover Effects

| Effect | Token | Description |
|--------|-------|-------------|
| Card Lift | `--hover-lift` | Cards translate upward on hover |
| Image Zoom | `--image-zoom-scale` | Images scale up within container |

**Preset Animation Settings:**

| Preset | Lift | Zoom Scale | BG Animations |
|--------|------|------------|---------------|
| Zebra Skimmers | 6px | 1.05 | Yes |
| Modern Minimal | 0px | 1.03 | No |
| Bold Impact | 8px | 1.08 | Yes |
| Warm Artisan | 4px | 1.04 | No |
| Tech Forward | 6px | 1.06 | Yes |

### Background Animations

Available in Zebra Skimmers, Bold Impact, and Tech Forward:

- **Grid Animation:** Subtle moving grid pattern
- **Particle Animation:** Floating particles
- **Glow Effects:** Ambient lighting effects

### Accessibility

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-duration: 0.01ms;
    --hover-lift: 0;
    --image-zoom-scale: 1;
  }
}
```

---

## Usage Guidelines

### Selecting a Preset

1. **Zebra Skimmers** - Choose for B2B, industrial, manufacturing, or technical products where trust and ROI are key selling points.

2. **Modern Minimal** - Choose for lifestyle brands, curated collections, or luxury products where less is more.

3. **Bold Impact** - Choose for athletic, sports, or high-energy brands targeting younger demographics.

4. **Warm Artisan** - Choose for handmade, artisan, food & beverage, or products with a story to tell.

5. **Tech Forward** - Choose for consumer electronics, tech gadgets, SaaS, or futuristic products.

### Customizing Presets

Presets provide a starting point. Common customizations include:

1. **Colors:** Adjust primary and CTA colors to match brand guidelines
2. **Typography:** Swap fonts while maintaining weights and scale
3. **Spacing:** Adjust section padding for content density
4. **Animations:** Enable/disable based on brand personality

### Best Practices

1. **Maintain Contrast:** Ensure text colors have sufficient contrast against backgrounds (WCAG AA minimum)

2. **Consistent Spacing:** Use the spacing scale rather than arbitrary values

3. **Responsive Testing:** Test all customizations across mobile, tablet, and desktop

4. **Performance:** Disable background animations if page speed is critical

5. **Accessibility:** Always test with reduced motion enabled

---

## File Structure

```
theme/
├── config/
│   ├── settings_schema.json    # Theme settings with presets
│   └── settings_data.json      # Preset configurations
├── templates/
│   ├── index.zebra-skimmers.json
│   ├── index.modern-minimal.json
│   ├── index.bold-impact.json
│   ├── index.warm-artisan.json
│   └── index.tech-forward.json
├── sections/
│   ├── hero.liquid
│   ├── trust-badges.liquid
│   ├── product-categories.liquid
│   ├── featured-product.liquid
│   ├── product-grid.liquid
│   ├── testimonials.liquid
│   ├── newsletter-cta.liquid
│   └── footer.liquid
├── snippets/
│   ├── css-variables.liquid    # Design tokens from settings
│   ├── icon.liquid
│   └── icon-social.liquid
└── assets/
    ├── hero.css
    ├── hero.js
    ├── trust-badges.css
    ├── product-categories.css
    ├── featured-product.css
    ├── product-grid.css
    ├── product-grid.js
    ├── testimonials.css
    ├── newsletter-cta.css
    ├── newsletter-cta.js
    └── footer.css
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial release with 5 presets |

---

*This design system is built for Shopify Online Store 2.0 themes.*
