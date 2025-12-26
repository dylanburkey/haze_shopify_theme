# Sections Organization Guide

This theme contains **95 sections** organized by functionality. Use this guide to quickly find the section you need.

## Table of Contents
- [Core Template Sections](#core-template-sections)
- [Product Sections](#product-sections)
- [Collection Sections](#collection-sections)
- [Header Sections](#header-sections)
- [Footer Sections](#footer-sections)
- [Hero Sections](#hero-sections)
- [Landing Page Sections](#landing-page-sections)
- [Preset Showcase Sections](#preset-showcase-sections)
- [Feature/Marketing Sections](#featuremarketing-sections)
- [Content & Layout Sections](#content--layout-sections)
- [Specialized Components](#specialized-components)
- [Demo & Tour Sections](#demo--tour-sections)
- [Utility Sections](#utility-sections)

---

## Core Template Sections
**Purpose:** Required sections for Shopify's core templates (product, collection, cart, etc.)

| Section | Template | Description |
|---------|----------|-------------|
| `main-404.liquid` | 404 | Error page main content |
| `main-account.liquid` | account | Customer account dashboard |
| `main-addresses.liquid` | addresses | Customer address management |
| `main-article.liquid` | article | Blog post display |
| `main-blog.liquid` | blog | Blog listing page |
| `main-cart.liquid` | cart | Shopping cart page |
| `main-collection.liquid` | collection | Collection page (standard) |
| `main-list-collections.liquid` | list-collections | All collections listing |
| `main-login.liquid` | login | Customer login page |
| `main-order.liquid` | order | Order confirmation |
| `main-page.liquid` | page | Basic page content |
| `main-product.liquid` | product | Product page (standard) |
| `main-register.liquid` | register | Customer registration |
| `main-search.liquid` | search | Search results page |
| `main-video-page.liquid` | page | Video showcase page |

**Total: 15 sections**

---

## Product Sections
**Purpose:** Enhanced product display and functionality

| Section | Description |
|---------|-------------|
| `product-main-enhanced.liquid` | Enhanced product page with trust badges, specs, attachments |
| `product-main.liquid` | Standard product display |
| `product-industrial.liquid` | Industrial-themed product page variant |
| `product-specs.liquid` | Technical specifications display |
| `product-attachments.liquid` | Document/file downloads (manuals, CAD, certificates) |
| `product-comparison.liquid` | Side-by-side product comparison |
| `preset-featured-product.liquid` | Featured product showcase for presets |

**Total: 7 sections**

---

## Collection Sections
**Purpose:** Product collection displays and filtering

| Section | Description |
|---------|-------------|
| `collection-main.liquid` | Standard collection grid |
| `collection-grid.liquid` | Alternative collection layout |
| `collection-header.liquid` | Collection banner/hero |
| `collection-industrial.liquid` | Industrial-themed collection page |
| `collection-page-industrial.liquid` | Full industrial collection page |
| `featured-collection.liquid` | Homepage featured collection display |

**Total: 6 sections**

---

## Header Sections
**Purpose:** Site navigation and top bar

| Section | Description |
|---------|-------------|
| `header--classic.liquid` | Traditional header layout |
| `header--corporate.liquid` | Professional B2B header |
| `header--industrial.liquid` | Heavy-duty industrial header |
| `header--mega.liquid` | Mega menu with rich content |
| `header--unified.liquid` | Modern unified header |
| `announcement-bar.liquid` | Top promotional bar |
| `ticker-strip.liquid` | Scrolling ticker announcements |

**Header group:** `header-group.json`

**Total: 8 sections**

---

## Footer Sections
**Purpose:** Site footer with links, newsletter, contact

| Section | Description |
|---------|-------------|
| `footer--standard.liquid` | Standard footer layout |
| `footer--industrial.liquid` | Industrial-themed footer |
| `footer--preset.liquid` | Preset-specific footer variant |

**Footer group:** `footer-group.json`

**Total: 4 sections**

---

## Hero Sections
**Purpose:** Large featured banners and calls-to-action

| Section | Description |
|---------|-------------|
| `hero.liquid` | Standard hero banner |
| `hero-industrial.liquid` | Industrial-styled hero |
| `hero-slider.liquid` | Multi-slide hero carousel |
| `preset-hero.liquid` | Preset showcase hero |
| `theme-tour-hero.liquid` | Theme tour hero section |

**Total: 5 sections**

---

## Landing Page Sections
**Purpose:** Full landing page layouts for different presets

| Section | Preset | Description |
|---------|--------|-------------|
| `landing-the-welder.liquid` | The Welder | Red industrial theme |
| `landing-bold-impact.liquid` | Bold Impact | High-energy athletic |
| `landing-tech-forward.liquid` | Tech Forward | Dark futuristic tech |
| `landing-zebra-skimmers.liquid` | Zebra Skimmers | B2B industrial |
| `landing-modern-minimal.liquid` | Modern Minimal | Clean luxury |
| `landing-warm-artisan.liquid` | Warm Artisan | Handcrafted food/craft |
| `landing-forge-industrial.liquid` | Forge Industrial | Heavy machinery |
| `landing-precision.liquid` | Precision | Blue professional |
| `landing-page-switcher.liquid` | Utility | Landing page selector |

**Total: 9 sections**

---

## Preset Showcase Sections
**Purpose:** Display preset themes and features

| Section | Description |
|---------|-------------|
| `preset-preview.liquid` | Preset visual preview |
| `preset-gallery.liquid` | Image gallery for presets |
| `preset-newsletter-cta.liquid` | Newsletter signup for presets |
| `preset-product-categories.liquid` | Product category showcase |
| `preset-product-grid.liquid` | Product grid display |
| `preset-testimonials.liquid` | Customer testimonials |
| `preset-trust-badges.liquid` | Trust indicators |
| `marketing-preset-showcase.liquid` | Marketing-focused preset display |

**Total: 8 sections**

---

## Feature/Marketing Sections
**Purpose:** Feature highlights and value propositions

| Section | Description |
|---------|-------------|
| `feature-showcase.liquid` | Individual feature display |
| `feature-cost-savings.liquid` | ROI calculator showing app replacement savings |
| `feature-comparison-table.liquid` | FORGE vs Apps comparison |
| `cost-savings-calculator.liquid` | Interactive savings calculator |
| `marketing-preset-showcase.liquid` | Preset marketing tiles |

**Total: 5 sections**

---

## Content & Layout Sections
**Purpose:** Flexible content containers and grids

| Section | Description |
|---------|-------------|
| `smart-grid.liquid` | Intelligent responsive grid |
| `builder-grid.liquid` | Drag-and-drop grid builder |
| `container-grid.liquid` | Container-based grid layout |
| `page-content.liquid` | Basic page content wrapper |
| `page-main.liquid` | Main page container |
| `side-menu.liquid` | Documentation side navigation with CSS anchor positioning |

**Total: 6 sections**

---

## Specialized Components
**Purpose:** Unique functionality sections

### Search & AI
| Section | Description |
|---------|-------------|
| `search-autorag.liquid` | AI-powered search with AutoRAG |
| `search-rag.liquid` | RAG-based search |
| `specification-search.liquid` | Product specification search |
| `ai-search.liquid` | AI-enhanced search interface |

### Media & Images
| Section | Description |
|---------|-------------|
| `video-gallery.liquid` | Video showcase with YouTube integration |
| `shoppable-image.liquid` | Tagged product images |
| `shoppable-image-enhanced.liquid` | Advanced shoppable images |

### Customer Engagement
| Section | Description |
|---------|-------------|
| `loyalty-program-demo.liquid` | Points/rewards program |
| `social-sharing.liquid` | Social media share buttons |
| `pwa-install-banner.liquid` | Progressive Web App install prompt |

### Other
| Section | Description |
|---------|-------------|
| `cart-drawer-industrial.liquid` | Slide-out cart drawer |
| `styleguide.liquid` | Design system reference |

**Total: 12 sections**

---

## Demo & Tour Sections
**Purpose:** Showcase theme capabilities

| Section | Description |
|---------|-------------|
| `theme-tour-headers.liquid` | Header variants showcase |
| `theme-tour-footers.liquid` | Footer variants showcase |
| `theme-tour-hero.liquid` | Hero section showcase |
| `theme-tour-instructions.liquid` | Theme tour guide |
| `header-footer-showcase.liquid` | Combined header/footer demo |
| `faq-demo.liquid` | FAQ demonstration |
| `loyalty-program-demo.liquid` | Loyalty program demo |
| `getting-started.liquid` | Theme setup guide |

**Total: 8 sections**

---

## Utility Sections
**Purpose:** Standalone pages and utilities

| Section | Description |
|---------|-------------|
| `404.liquid` | Custom 404 error page |
| `404-main.liquid` | 404 main content |
| `offline-page.liquid` | PWA offline page |
| `faq.liquid` | FAQ/accordion section |

**Total: 4 sections**

---

## Section Count Summary

| Category | Count |
|----------|-------|
| Core Template Sections | 15 |
| Product Sections | 7 |
| Collection Sections | 6 |
| Header Sections | 8 |
| Footer Sections | 4 |
| Hero Sections | 5 |
| Landing Page Sections | 9 |
| Preset Showcase Sections | 8 |
| Feature/Marketing Sections | 5 |
| Content & Layout Sections | 6 |
| Specialized Components | 12 |
| Demo & Tour Sections | 8 |
| Utility Sections | 4 |
| **TOTAL** | **97** |

*(Note: header-group.json and footer-group.json are counted separately)*

---

## Naming Convention Guidelines

### Current Patterns
- `main-*` = Core Shopify template sections
- `product-*` = Product-related functionality
- `collection-*` = Collection displays
- `header--*` = Header variants (note double dash)
- `footer--*` = Footer variants (note double dash)
- `landing-*` = Full landing page layouts
- `preset-*` = Preset showcase components
- `feature-*` = Feature highlights
- `theme-tour-*` = Demo/showcase sections

### Recommended for New Sections
When creating new sections, use these prefixes:

- `main-` for core template sections
- `product-` for product functionality
- `collection-` for collection functionality
- `feature-` for feature showcases
- `landing-` for full landing page layouts
- `preset-` for preset-specific components
- `demo-` for demonstration sections
- `util-` for utility sections

---

## Quick Reference: Common Tasks

### Need to edit the product page?
→ `product-main-enhanced.liquid` or `product-main.liquid`

### Need to change the header?
→ `header--mega.liquid` (or other header-- variants)

### Need to edit a landing page?
→ `landing-*.liquid` (e.g., `landing-the-welder.liquid`)

### Need to modify cost savings display?
→ `feature-cost-savings.liquid` or `cost-savings-calculator.liquid`

### Need to update documentation navigation?
→ `side-menu.liquid`

### Need to edit the footer?
→ `footer--standard.liquid` (or other footer-- variants)

### Need to change the hero banner?
→ `hero.liquid` or preset-specific `landing-*.liquid`

---

## Architecture Notes

1. **No subdirectories allowed** - Shopify requires all sections in `sections/` root
2. **Sections vs Snippets** - Sections have `{% schema %}`, snippets don't
3. **Dynamic sections** - Most sections can be added/removed in theme editor
4. **Static sections** - `main-*` sections are tied to specific templates
5. **Section groups** - `header-group.json` and `footer-group.json` manage header/footer sections

---

## Maintenance Tips

1. **Before creating a new section**, check this list to see if similar functionality exists
2. **Use descriptive prefixes** to keep sections organized alphabetically
3. **Document new sections** by updating this file
4. **Consider consolidation** if sections have overlapping functionality
5. **Archive unused sections** to `/archive/` directory if needed
