# Sections Directory

This directory contains **95 sections** organized by naming convention.

## Quick Find by Prefix

```bash
# Product sections
ls -1 product-*

# Collection sections
ls -1 collection-*

# Header variants
ls -1 header--*

# Footer variants
ls -1 footer--*

# Landing pages (preset-specific full pages)
ls -1 landing-*

# Preset components (showcase elements)
ls -1 preset-*

# Feature highlights
ls -1 feature-*

# Core template sections
ls -1 main-*

# Theme tour/demo
ls -1 theme-tour-*
```

## Full Categorization

See [../SECTIONS.md](../SECTIONS.md) for complete organization guide with descriptions.

## Most Commonly Edited

- **Product page:** `product-main-enhanced.liquid`
- **Header:** `header--mega.liquid` (or other `header--*`)
- **Footer:** `footer--standard.liquid` (or other `footer--*`)
- **Hero banner:** `hero.liquid`
- **Landing pages:** `landing-*.liquid` (e.g., `landing-the-welder.liquid`)
- **Featured collection:** `featured-collection.liquid`

## Creating New Sections

Use these naming prefixes for consistency:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `main-` | Core Shopify template sections | `main-product.liquid` |
| `product-` | Product functionality | `product-specs.liquid` |
| `collection-` | Collection displays | `collection-grid.liquid` |
| `header--` | Header variants (note double dash) | `header--mega.liquid` |
| `footer--` | Footer variants (note double dash) | `footer--standard.liquid` |
| `landing-` | Full landing page layouts | `landing-the-welder.liquid` |
| `preset-` | Preset showcase components | `preset-gallery.liquid` |
| `feature-` | Feature highlights | `feature-showcase.liquid` |
| `demo-` | Demo/showcase sections | `demo-faq.liquid` |

**Important:** All sections must be in this root directory - Shopify doesn't support subdirectories.
