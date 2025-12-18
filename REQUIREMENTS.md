# Forge Industrial Theme — Requirements & Task Tracker

> **Theme Name:** Forge Industrial  
> **Target Price Point:** $320 (Shopify Theme Store)  
> **Target Market:** Manufacturers, Distributors, Industrial B2B Brands  
> **Repository:** `/Users/dylanburkey/dev/projects/haze_shopify_theme/`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Completed Tasks](#completed-tasks)
4. [Open Tasks](#open-tasks)
5. [Section Groups System](#section-groups-system)
6. [Header Variants](#header-variants)
7. [Footer Variants](#footer-variants)
8. [Preset System](#preset-system)
9. [Testing Checklist](#testing-checklist)

---

## Project Overview

Forge Industrial is a premium Shopify theme designed specifically for manufacturing, industrial, and B2B e-commerce businesses. The theme prioritizes:

- **Technical specification display** for complex products
- **Product comparison functionality** for informed purchasing decisions
- **Trust indicators** (warranties, certifications, "Made in USA" messaging)
- **Clear presentation of complex product data** via metafields/metaobjects
- **Professional, conversion-optimized experience** for B2B buyers

### Primary Use Case

Zebra Skimmers (oil skimmers and coolant automation systems) serves as the primary development reference, informing industrial focus and feature requirements.

---

## Architecture Decisions

### Section Groups for Global Chrome

The theme uses Shopify Online Store 2.0 **Section Groups** to enable:

- Swappable headers/footers from the theme editor
- No per-template header/footer configuration required
- WordPress-style "pick a layout, then customize" merchant experience
- LEGO-brick style section swapping

### File Structure Convention

```
sections/
├── header-group.json          # Section group container
├── header--classic.liquid     # Header variant
├── header--corporate.liquid   # Header variant
├── header--industrial.liquid  # Header variant
├── header--mega.liquid        # Header variant
├── header--unified.liquid     # Header variant (default)
├── footer-group.json          # Section group container
├── footer--industrial.liquid  # Footer variant
├── footer--preset.liquid      # Footer variant
├── footer--standard.liquid    # Footer variant (default)
└── announcement-bar.liquid    # Header group component
```

### Naming Convention

- `header--*` and `footer--*` prefixes for global chrome only
- Human-readable schema names: "Header — Classic", "Header — Mega menu"
- Consistent block naming across variants for predictable UX

---

## Completed Tasks

### ✅ Section Group Architecture

- [x] Created `sections/header-group.json` with correct Shopify OS 2.0 format
- [x] Created `sections/footer-group.json` with correct Shopify OS 2.0 format
- [x] Updated `layout/theme.liquid` to use `{% sections 'header-group' %}` and `{% sections 'footer-group' %}`
- [x] Verified section group JSON uses `"type": "header"` and `"type": "footer"` (per Shopify docs)

### ✅ Header Sections

- [x] `header--unified.liquid` — Default header with search bar options
- [x] `header--classic.liquid` — Traditional navigation layout
- [x] `header--corporate.liquid` — Enterprise-focused design
- [x] `header--industrial.liquid` — Heavy industrial aesthetic
- [x] `header--mega.liquid` — Mega menu with featured cards
- [x] All headers include `"enabled_on": { "groups": ["header"] }` in schema
- [x] All headers have proper presets defined

### ✅ Footer Sections

- [x] `footer--standard.liquid` — Default footer with newsletter
- [x] `footer--industrial.liquid` — Industrial-themed footer
- [x] `footer--preset.liquid` — Preset-specific footer
- [x] All footers include `"enabled_on": { "groups": ["footer"] }` in schema
- [x] All footers have proper presets defined

### ✅ Announcement Bar

- [x] `announcement-bar.liquid` created with header group support
- [x] Includes `"enabled_on": { "groups": ["header"] }`
- [x] Multiple announcement blocks supported (max 5)

### ✅ Core Templates

- [x] Homepage templates (multiple preset variants)
- [x] Collection templates
- [x] Product templates
- [x] Cart template
- [x] Search template
- [x] Blog/Article templates
- [x] Customer account templates

### ✅ Industrial-Specific Sections

- [x] `hero-industrial.liquid`
- [x] `collection-industrial.liquid`
- [x] `product-industrial.liquid`
- [x] `cart-drawer-industrial.liquid`

---

## Open Tasks

### 🔲 HIGH PRIORITY — Section Group Verification

- [ ] **Test header-group in Shopify theme editor**
  - Upload theme to development store
  - Verify "Header" appears in sidebar
  - Confirm sections can be added/removed/reordered
  - Test swapping between header variants

- [ ] **Test footer-group in Shopify theme editor**
  - Verify "Footer" appears in sidebar
  - Confirm sections can be added/removed/reordered
  - Test swapping between footer variants

- [ ] **Verify translation keys exist**
  - Check if `t:sections.announcement_bar.name` exists in `locales/en.default.schema.json`
  - If missing, either add translation or replace with hardcoded string

### 🔲 HIGH PRIORITY — UX Polish

- [ ] **Add "mutually exclusive" guard rails**
  - Implement editor-only warning if multiple headers exist in group
  - Consider max_section_count if Shopify supports it

- [ ] **Consistent settings organization**
  - Standardize setting blocks across all headers: Layout, Navigation, Search, Buttons
  - Move shared settings to `settings_schema.json` (logo, sticky header, color scheme)

### 🔲 MEDIUM PRIORITY — Theme Tour / Onboarding

- [ ] **Theme Tour page template improvements**
  - `page.theme-tour.liquid` exists but needs enhancement
  - Add iframe previews or visual cards for preset selection
  - Connect to preset showcase system

- [ ] **Getting Started section**
  - `getting-started.liquid` exists
  - Connect to header/footer swap instructions
  - Add preset preview functionality

### 🔲 MEDIUM PRIORITY — Preset System

- [ ] **Verify all 12 presets work correctly**
  - The Welder (industrial red)
  - Tech Forward (dark cyan)
  - Bold Impact
  - Warm Artisan
  - Modern Minimal
  - Zebra Skimmers (primary use case)
  - Additional industry presets

- [ ] **Each preset should configure:**
  - Appropriate header variant
  - Appropriate footer variant
  - Color scheme
  - Typography selections

### 🔲 LOWER PRIORITY — Additional Features

- [ ] **Product comparison functionality**
  - Add compare drawer/modal
  - Specification comparison table
  - Side-by-side product view

- [ ] **Technical specifications display**
  - Metafield integration for specs
  - Spec table component
  - Downloadable spec sheets (PDF)

- [ ] **Trust badges section**
  - Warranty badges
  - Certification logos
  - "Made in USA" messaging
  - ISO/quality certifications

---

## Section Groups System

### How Section Groups Work

Section groups are JSON files that define a container for multiple sections. They enable:

1. **Global placement** — Rendered via `{% sections 'group-name' %}` in layout
2. **Merchant editing** — Appears in theme editor sidebar
3. **Section swapping** — Add/remove/reorder sections within the group
4. **Up to 25 sections** per group, each with up to 50 blocks

### Current Configuration

**header-group.json:**
```json
{
  "type": "header",
  "name": "Header",
  "sections": {
    "announcement-bar": {
      "type": "announcement-bar",
      "settings": {
        "background_color": "#121212",
        "text_color": "#ffffff"
      }
    },
    "header": {
      "type": "header--unified",
      "settings": {
        "show_search": true,
        "show_account": true,
        "show_cart": true
      }
    }
  },
  "order": ["announcement-bar", "header"]
}
```

**footer-group.json:**
```json
{
  "type": "footer",
  "name": "Footer",
  "sections": {
    "footer": {
      "type": "footer--standard",
      "settings": {
        "show_newsletter": true,
        "newsletter_heading": "Stay Connected",
        "newsletter_text": "Get updates on new products and industry news.",
        "newsletter_placeholder": "Enter your email",
        "newsletter_button": "Subscribe",
        "show_payment_icons": true
      }
    }
  },
  "order": ["footer"]
}
```

### Section Requirements for Groups

Each section that can appear in a group MUST include:

```json
{
  "enabled_on": {
    "groups": ["header"]  // or ["footer"]
  },
  "presets": [
    {
      "name": "Section Name"
    }
  ]
}
```

---

## Header Variants

| Variant | File | Description | Status |
|---------|------|-------------|--------|
| Unified | `header--unified.liquid` | Default, flexible search options | ✅ Complete |
| Classic | `header--classic.liquid` | Traditional navigation | ✅ Complete |
| Corporate | `header--corporate.liquid` | Enterprise B2B focus | ✅ Complete |
| Industrial | `header--industrial.liquid` | Heavy industrial aesthetic | ✅ Complete |
| Mega | `header--mega.liquid` | Mega menu with featured cards | ✅ Complete |

### Shared Header Settings (move to settings_schema.json)

- Logo / Logo width
- Sticky header enabled
- Announcement bar toggle
- Header color scheme
- Navigation typography

### Variant-Specific Settings

- **Classic:** Alignment, CTA button visibility
- **Mega:** Featured collections, promo tiles, mega menu behavior
- **Corporate:** Contact info display, B2B messaging
- **Industrial:** Industry certifications display

---

## Footer Variants

| Variant | File | Description | Status |
|---------|------|-------------|--------|
| Standard | `footer--standard.liquid` | Default with newsletter | ✅ Complete |
| Industrial | `footer--industrial.liquid` | Industrial brand styling | ✅ Complete |
| Preset | `footer--preset.liquid` | Preset-specific configuration | ✅ Complete |

---

## Preset System

The theme includes 12 professionally designed presets targeting specific industries:

| Preset | Industry Focus | Header | Footer |
|--------|---------------|--------|--------|
| The Welder | Welding/Fabrication | Industrial | Industrial |
| Tech Forward | Electronics/Tech | Corporate | Standard |
| Bold Impact | Heavy Machinery | Industrial | Industrial |
| Warm Artisan | Craft/Artisan | Classic | Standard |
| Modern Minimal | B2B General | Unified | Standard |
| Zebra Skimmers | Oil Skimmers | Industrial | Industrial |
| (6 more TBD) | Various | TBD | TBD |

---

## Testing Checklist

### Before Theme Store Submission

- [ ] All section groups appear correctly in theme editor
- [ ] Header swapping works between all 5 variants
- [ ] Footer swapping works between all 3 variants
- [ ] All 12 presets apply correctly
- [ ] Preset switching shows immediate visual feedback
- [ ] All pages render correctly on mobile/tablet/desktop
- [ ] Lighthouse performance score > 90
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] All translation keys resolve correctly
- [ ] No console errors in browser dev tools
- [ ] Theme check passes with no critical errors

### Theme Editor Verification Steps

1. Go to Online Store → Themes → Customize
2. In left sidebar, verify "Header" group appears
3. Click "Header" to expand section list
4. Click section name to access settings
5. Look for "Change" or "Replace section" option
6. Test swapping to different header variant
7. Repeat for "Footer" group

---

## Development Commands

```bash
# Validate theme before upload
shopify theme check

# Push theme to development store (without publishing)
shopify theme push --unpublished

# Pull latest theme changes
shopify theme pull

# Start local development server
shopify theme dev
```

---

## References

- [Shopify Section Groups Documentation](https://shopify.dev/docs/storefronts/themes/architecture/section-groups)
- [Shopify Theme Store Requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)
- [Dawn Theme (Reference)](https://github.com/Shopify/dawn)

---

*Last Updated: December 18, 2025*
