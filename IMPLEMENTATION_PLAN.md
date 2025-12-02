# Industry 4.0 Theme - Premium Features Implementation Plan

## Theme Value Proposition

**"Everything you need, no apps required."**

This theme eliminates the need for expensive third-party apps by including:
- **Loyalty Engine** - Native tier-based rewards system ($50-200/mo app replacement)
- **Advanced SEO** - JSON-LD structured data for rich snippets ($20-50/mo app replacement)
- **Mega Menu** - Multi-column navigation with featured content (already implemented)
- **Dynamic Grid Builder** - CSS container queries with layout presets
- **Metafield Layouts** - Save and reuse custom grid configurations
- **PWA Support** - Offline mode, install prompts, app-like experience
- **Advanced FAQ** - Search, categories, sidebar mode (already implemented)
- **Shoppable Images** - Product hotspots with tooltips (already implemented - FULL FEATURE)
- **Video Gallery** - YouTube/Vimeo/MP4 with filtering (already implemented)

**Estimated app cost savings: $150-400/month**

---

## The "Middle Ground" Strategy

### The Problem with Raw Tools
Most page builders give merchants raw tools (set width to 33%, adjust padding, etc.). This creates:
- Decision fatigue
- Broken layouts
- Need for design skills

### The Solution: Intelligent Patterns
We shift from "Raw Tools" to **Guardrails + Intelligence**:
- **Layout Presets** at section level (not per-block widths)
- **Container Queries** make blocks self-aware
- **Curated flexibility** - click "Switch Layout" → looks professional instantly

### Two Grid Systems, Two Use Cases

| System | Use Case | User Action |
|--------|----------|-------------|
| **Smart Grid** | Feature sections, content grids | Select preset → blocks auto-adapt |
| **Builder Grid** | Custom pages, landing pages | Compose with 12-col blocks |

Smart Grid = "I want a Bento layout" (preset-driven)
Builder Grid = "I want full control" (power-user)

---

## Why This Theme Sells

### 1. Merchant Confidence ("It Just Works")
- Select "Highlight Left" → it works. No pixel calculations.
- Container Queries handle the complexity automatically.
- Curated flexibility solves the "Paradox of Choice."

### 2. Design Integrity (Automatic Polish)
- Cards in wide slots → look like "Featured Banners"
- Cards in narrow slots → look like "Grid Items"
- Same component, context-aware presentation.

### 3. The "Lincoln" Industrial DNA
- `border_radius: 0px` → Sharp, industrial, rugged
- `border_radius: 8px` → Softer, modern, approachable
- `color_surface` → High-contrast "white card on gray" aesthetic
- Theme presets: Welder, Site Ops, Midnight Shift, Precision, Tactical, Monolith

### 4. Performance as Marketing
- UnCSS architecture (non-blocking CSS loader)
- **Target: 90+ PageSpeed Insights out of the box**
- This is a major selling point in theme listings.

### 5. The Container Query Advantage
```css
/* The Magic: Cards reshape based on available space */
@container (min-width: 500px) {
  .industrial-card { 
    flex-direction: row;  /* Horizontal in large spaces */
  }
}
@container (max-width: 499px) {
  .industrial-card { 
    flex-direction: column;  /* Vertical in small spaces */
  }
}
```
This is what separates this theme from competitors still using media queries.

---

## Implementation Phases

### Phase 1: SEO System (Priority: Critical)

#### 1.1 JSON-LD Structured Data Snippets

Create a modular structured data system in `/snippets/`:

**Files to create:**
- `structured-data.liquid` - Main orchestrator that includes appropriate schemas
- `schema-organization.liquid` - Organization/LocalBusiness schema
- `schema-website.liquid` - WebSite schema with SearchAction
- `schema-product.liquid` - Product schema with offers, reviews, availability
- `schema-breadcrumb.liquid` - BreadcrumbList for navigation
- `schema-collection.liquid` - CollectionPage/ItemList schema
- `schema-article.liquid` - Article/BlogPosting schema
- `schema-faq.liquid` - FAQPage schema (integrate with existing FAQ section)
- `schema-video.liquid` - VideoObject schema (integrate with video gallery)

**Schema coverage:**
```
Homepage       → Organization, WebSite, SearchAction
Product page   → Product, BreadcrumbList, (Reviews if available)
Collection     → CollectionPage, ItemList, BreadcrumbList
Blog/Article   → Article, BreadcrumbList
FAQ section    → FAQPage
Video section  → VideoObject
All pages      → BreadcrumbList
```

#### 1.2 SEO Settings Panel

Add to `config/settings_schema.json`:
- Organization name, logo, contact info
- Social profiles for sameAs
- Local business details (optional)
- Default meta robots settings
- Enable/disable specific schema types

#### 1.3 Enhanced Meta Tags

Update `snippets/meta-tags.liquid`:
- Robots meta directives (index/noindex per template)
- Article publish/modified dates
- Author meta
- hreflang support (for international stores)
- Improved Open Graph images

#### 1.4 Breadcrumb Navigation Component

Create `snippets/breadcrumbs.liquid`:
- Visual breadcrumb navigation
- Integrated BreadcrumbList schema
- Configurable separator
- Home icon option
- Mobile-responsive (collapsible)

---

### Phase 2: Smart Grid Section (Priority: Critical)

**"The Money Maker"** - This single section replaces 5-6 standard sections and multiple apps.

#### 2.1 Core Concept

The Smart Grid uses CSS Container Queries (`container-type: inline-size`) to let content reshape itself based on available space - not viewport width. This means the same card can be horizontal in a large slot and vertical in a small slot, automatically.

**Key differentiator from standard grids:**
- Content adapts to its container, not the screen
- One section replaces: Featured Collection, Image with Text, Collage, Multicolumn, etc.
- No app needed for complex layouts

#### 2.2 Smart Grid Section

Create `sections/smart-grid.liquid` + `assets/section-smart-grid.css`:

**Layout Patterns:**
```
cols-2          → Two equal columns
cols-3          → Three equal columns  
cols-4          → Four equal columns
highlight-left  → Large left card + 2 stacked right (Bento)
highlight-right → 2 stacked left + Large right card
magazine        → 2/3 + 1/3 split
mosaic          → Pinterest-style masonry
asymmetric      → Alternating 2:1 / 1:2 rows
```

**Container Query Magic:**
```css
.grid-item-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Card reshapes based on container width */
@container card (min-width: 400px) {
  .industrial-card {
    flex-direction: row;  /* Horizontal layout */
  }
}

@container card (max-width: 399px) {
  .industrial-card {
    flex-direction: column;  /* Vertical layout */
  }
}
```

#### 2.3 Block Types

**Feature Card** (primary):
- Image
- Heading
- Rich text
- Button/Link
- Badge (optional)

**Additional block types:**
- `product-card` - Product picker with quick add
- `collection-card` - Collection with product count
- `video-card` - Video embed with poster
- `testimonial-card` - Quote + author + rating
- `stats-card` - Large number + label + icon
- `icon-card` - Icon + heading + description
- `custom-html` - Raw HTML/Liquid

#### 2.4 Section Settings

```json
{
  "type": "select",
  "id": "layout",
  "label": "Layout Pattern",
  "options": [
    { "value": "cols-2", "label": "2 Columns" },
    { "value": "cols-3", "label": "3 Columns" },
    { "value": "cols-4", "label": "4 Columns" },
    { "value": "highlight-left", "label": "Highlight Left (Bento)" },
    { "value": "highlight-right", "label": "Highlight Right (Bento)" },
    { "value": "magazine", "label": "Magazine (2/3 + 1/3)" },
    { "value": "mosaic", "label": "Mosaic" },
    { "value": "asymmetric", "label": "Asymmetric" }
  ],
  "default": "cols-3"
}
```

#### 2.5 Per-Block Overrides

Allow blocks to override default sizing:
```json
{
  "type": "select",
  "id": "size",
  "label": "Card Size",
  "options": [
    { "value": "auto", "label": "Auto (use layout)" },
    { "value": "span-2", "label": "Span 2 columns" },
    { "value": "span-3", "label": "Span 3 columns" },
    { "value": "tall", "label": "Span 2 rows" }
  ],
  "default": "auto"
}
```

#### 2.6 Complete CSS Architecture (`assets/section-smart-grid.css`)

```css
/* ==========================================================================
   SMART GRID - Container Query Layout System
   ========================================================================== */

.smart-grid {
  display: grid;
  gap: var(--grid-gap, 24px);
  padding: var(--py) 0;
}

/* --------------------------------------------------------------------------
   Layout Patterns (Section-Level Presets)
   -------------------------------------------------------------------------- */

.layout--cols-2 { grid-template-columns: repeat(2, 1fr); }
.layout--cols-3 { grid-template-columns: repeat(3, 1fr); }
.layout--cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Bento: Large left, stacked right */
.layout--highlight-left { 
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 1fr);
}
.layout--highlight-left .grid-item-wrapper:first-child {
  grid-row: span 2;
}

/* Bento: Stacked left, large right */
.layout--highlight-right { 
  grid-template-columns: 1fr 2fr;
  grid-template-rows: repeat(2, 1fr);
}
.layout--highlight-right .grid-item-wrapper:last-child {
  grid-row: span 2;
}

/* Magazine: 2/3 + 1/3 split */
.layout--magazine { grid-template-columns: 2fr 1fr; }

/* Zig-zag: Alternating 2:1 / 1:2 */
.layout--zigzag { grid-template-columns: repeat(3, 1fr); }
.layout--zigzag .grid-item-wrapper:nth-child(3n+1) { grid-column: span 2; }
.layout--zigzag .grid-item-wrapper:nth-child(3n+3) { grid-column: span 2; }

/* Mobile: All layouts collapse to single column */
@media (max-width: 768px) {
  .smart-grid { grid-template-columns: 1fr; }
  .smart-grid .grid-item-wrapper { grid-column: span 1; grid-row: span 1; }
}

/* --------------------------------------------------------------------------
   Container Query Intelligence
   -------------------------------------------------------------------------- */

.grid-item-wrapper { 
  container-type: inline-size;
  container-name: card;
  height: 100%; 
}

/* --------------------------------------------------------------------------
   Industrial Card Component
   -------------------------------------------------------------------------- */

.industrial-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius, 0);
  height: 100%;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.industrial-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.card-img { 
  width: 100%; 
  height: 250px; 
  object-fit: cover;
  flex-shrink: 0;
}

.card-content { 
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content h3 {
  margin: 0 0 12px;
  font-size: 1.25rem;
}

.card-content .rte {
  flex: 1;
  color: var(--color-text-secondary);
}

.card-content .btn {
  margin-top: auto;
  align-self: flex-start;
}

/* --------------------------------------------------------------------------
   THE MAGIC: Container Query Card Reshaping
   -------------------------------------------------------------------------- */

/* When card has 500px+ space, go horizontal */
@container card (min-width: 500px) {
  .industrial-card { 
    flex-direction: row; 
    align-items: stretch; 
  }
  .card-img { 
    width: 50%; 
    height: auto;
    min-height: 280px;
  }
  .card-content { 
    width: 50%; 
    padding: 40px;
    justify-content: center;
  }
  .card-content h3 {
    font-size: 1.5rem;
  }
}

/* Large featured cards get even more breathing room */
@container card (min-width: 700px) {
  .card-content {
    padding: 60px;
  }
  .card-content h3 {
    font-size: 2rem;
  }
}
```

This CSS is the core intellectual property of the theme. Cards automatically:
- Stack vertically in narrow spaces (< 500px)
- Go horizontal in medium spaces (500-700px)
- Expand with larger typography in wide spaces (700px+)

#### 2.7 Relationship to Existing container-grid.liquid

- **Keep both** - `container-grid.liquid` is more customizable for advanced users
- **Smart Grid** is the simplified, opinionated version for merchants
- Smart Grid uses same underlying CSS container query system
- Consider deprecating `container-grid` after Smart Grid is proven

---

### Phase 2B: Builder Grid Section (Priority: Critical)

**Replaces:** PageFly, Shogun, GemPages ($29-99/mo)

The Builder Grid is a composable row-based page builder. Add multiple instances to build complete landing pages.

#### 2B.1 Core Concept

Uses a 12-column grid system where blocks specify their width (25%, 33%, 50%, etc.) converted to grid spans:
```liquid
{%- case block.settings.width -%}
  {%- when '25' -%} assign span = 3
  {%- when '33' -%} assign span = 4
  {%- when '50' -%} assign span = 6
  {%- when '100' -%} assign span = 12
{%- endcase -%}
```

**Key Feature:** 3 blocks at 33% width = 3 columns. Automatic.

#### 2B.2 Section Settings

**Layout & Spacing:**
- Container max-width (800-1800px)
- Grid gap desktop/mobile
- Vertical alignment (top/middle/bottom)
- Padding top/bottom
- Margin top/bottom

**Colors & Borders:**
- Background color
- Text color
- Border color
- Border top/bottom width

#### 2B.3 Block Types

| Block | Purpose | Key Settings |
|-------|---------|--------------|
| Heading | Titles | Tag (H1-H4), size, color, width, align |
| Paragraph | Rich text | Size, width, align |
| Image | Media | Image picker, width, card style |
| Button | CTAs | Label, link, style (solid/outline), width |
| Video | Autoplay loops | Video URL (MP4) |
| Spacer | Vertical space | Height (px) |
| HTML | Custom code | Raw HTML/Liquid |

#### 2B.4 Per-Block Controls

Every block has:
- `width` - 25%, 33%, 50%, 66%, 75%, 100%
- `align` - left, center, right
- `new_line` - Forces break to new row
- `vertical_align` - Per-block override

#### 2B.5 Files to Create

- `sections/builder-grid.liquid` - The section
- `assets/builder-grid.css` - Grid and block styles

#### 2B.6 CSS Architecture

```css
.builder-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gap-desktop);
}

.builder-block {
  grid-column: span var(--span, 12);
}

.builder-block--break {
  grid-column: 1 / -1;  /* Force new line */
}

@media (max-width: 768px) {
  .builder-block {
    grid-column: span 12;  /* Full width on mobile */
  }
}
```

#### 2B.7 JSON Templates (Blank Canvas Approach)

Instead of rigid templates, we provide JSON templates as starting points. Merchants add Builder Grid sections to compose pages.

**Philosophy:** Templates are containers, not constraints.

**Standard Page Template** (`templates/page.json`):
```json
{
  "sections": {
    "main": {
      "type": "main-page",
      "settings": {
        "padding_top": 0,
        "padding_bottom": 0
      }
    },
    "grid_1": {
      "type": "builder-grid",
      "blocks": {
        "head": {
          "type": "heading",
          "settings": {
            "text": "Page Title",
            "tag": "h1",
            "align": "center",
            "width": "100"
          }
        }
      },
      "block_order": ["head"],
      "settings": {
        "padding_top": 60,
        "padding_bottom": 60
      }
    }
  },
  "order": ["main", "grid_1"]
}
```

**Template Strategy:**
- `page.json` - Blank canvas with one Builder Grid
- `page.about.json` - Pre-composed About Us layout
- `page.contact.json` - Contact form + map layout
- `page.landing.json` - Marketing landing page structure
- `page.faq.json` - FAQ section pre-configured

Each template is a starting point. Merchant clicks "Add Section" → "Builder Grid" to extend.

**Product Page Template** (`templates/product.json`):

Critical for industrial/technical products. Buy box at top, rich content below.

```json
{
  "sections": {
    "main": {
      "type": "main-product",
      "settings": { "padding_bottom": 40 }
    },
    "features_row": {
      "type": "builder-grid",
      "blocks": {
        "h1": { "type": "heading", "settings": { "text": "Key Features", "width": "100", "align": "center" } },
        "img1": { "type": "image", "settings": { "width": "33", "card_style": true, "new_line": true } },
        "img2": { "type": "image", "settings": { "width": "33", "card_style": true } },
        "img3": { "type": "image", "settings": { "width": "33", "card_style": true } }
      },
      "block_order": ["h1", "img1", "img2", "img3"],
      "settings": { "bg_color": "#f4f4f4", "padding_top": 80, "padding_bottom": 80 }
    },
    "specs_row": {
      "type": "builder-grid",
      "blocks": {
        "h2": { "type": "heading", "settings": { "text": "Tech Specs", "width": "50" } },
        "desc": { "type": "text", "settings": { "content": "<p>Detailed specification data goes here.</p>", "width": "50" } }
      },
      "block_order": ["h2", "desc"],
      "settings": { "border_top": 1, "padding_top": 60 }
    }
  },
  "order": ["main", "features_row", "specs_row"]
}
```

**Why this matters for industrial products:**
- Tech specs tables
- Feature grids with icons
- Video demonstrations
- Comparison charts
- Download links (manuals, CAD files)
- Safety/compliance badges

All composable with Builder Grid sections below the standard buy box.

---

### Phase 3: Metafield Layout System (Priority: High)

#### 3.1 Layout Configuration Storage

**Metafield namespace:** `theme.layouts`

**Structure:**
```json
{
  "layout_id": "unique-id",
  "name": "My Custom Layout",
  "grid_settings": {
    "columns_desktop": 4,
    "columns_tablet": 2,
    "columns_mobile": 1,
    "gap": 24,
    "layout_pattern": "freeform"
  },
  "items": [
    {
      "type": "card",
      "col_span": 2,
      "row_span": 1,
      "settings": { ... }
    }
  ]
}
```

#### 3.2 Layout Management UI

Create `sections/layout-manager.liquid` (admin-only utility):
- Save current section configuration
- Load saved layouts
- Preview layouts
- Delete layouts
- Export/import JSON

**Note:** This requires JavaScript to read/write metafields via Storefront API or Admin API proxy.

#### 3.3 Layout Application

**Usage in sections:**
```liquid
{%- if section.settings.use_saved_layout -%}
  {%- assign layout = shop.metafields.theme.layouts[section.settings.layout_id] -%}
  {%- if layout -%}
    {% render 'grid-from-metafield', layout: layout %}
  {%- endif -%}
{%- endif -%}
```

---

### Phase 4: PWA Support (Priority: High)

**Technical Challenge:** Shopify serves assets from CDN (cdn.shopify.com), but Service Workers must live on root domain (yourstore.com/sw.js) to control the site.

**Solution:** "Installable Web App" architecture using dynamic Blob URL manifest.

**The Strategy:**
- **Dynamic Manifest:** Generate manifest.json on the fly using Liquid and JavaScript Blobs (bypassing static file limit)
- **iOS Support:** Full suite of Apple Touch Icons and meta tags
- **Install Trigger:** Custom "Lincoln Style" install button that appears only when browser supports installation

#### 4.1 PWA Settings

Add to `config/settings_schema.json`:
```json
{
  "name": "Progressive Web App",
  "settings": [
    { "type": "checkbox", "id": "pwa_enabled", "label": "Enable PWA", "default": true },
    { "type": "text", "id": "pwa_name", "label": "App name" },
    { "type": "image_picker", "id": "pwa_icon", "label": "App icon (512x512 recommended)" },
    { "type": "color", "id": "pwa_theme_color", "label": "Theme color" },
    { "type": "color", "id": "pwa_bg_color", "label": "Background color", "default": "#000000" }
  ]
}
```

#### 4.2 PWA Brain (`snippets/pwa-head.liquid`)

This snippet does three critical things:
1. Generates the manifest.json using Liquid variables
2. Converts that JSON into a specialized "Blob URL" so the browser accepts it as a file
3. Injects all necessary meta tags for iOS (which ignores the manifest)

```liquid
{%- comment -%}
  PWA CORE ENGINE
  Generates a dynamic manifest.json via Blob URL to bypass Shopify CDN restrictions.
{%- endcomment -%}

{%- liquid
  assign app_name = settings.pwa_name | default: shop.name
  assign app_short_name = settings.pwa_name | default: shop.name | truncate: 12
  assign theme_color = settings.pwa_theme_color | default: settings.brand_red
  assign bg_color = settings.pwa_bg_color | default: '#000000'
  
  if settings.pwa_icon
    assign icon_192 = settings.pwa_icon | image_url: width: 192, height: 192
    assign icon_512 = settings.pwa_icon | image_url: width: 512, height: 512
  else
    assign icon_192 = 'pwa-icon.png' | asset_url
    assign icon_512 = 'pwa-icon.png' | asset_url
  endif
-%}

<!-- iOS / Apple Support -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{{ app_name }}">
<link rel="apple-touch-icon" href="{{ icon_192 }}">

<!-- Theme Color -->
<meta name="theme-color" content="{{ theme_color }}">

<!-- Dynamic Manifest Generator -->
<script id="pwa-manifest-data" type="application/json">
{
  "name": "{{ app_name }}",
  "short_name": "{{ app_short_name }}",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "background_color": "{{ bg_color }}",
  "theme_color": "{{ theme_color }}",
  "orientation": "portrait",
  "icons": [
    {
      "src": "{{ icon_192 }}",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "{{ icon_512 }}",
      "type": "image/png",
      "sizes": "512x512"
    }
  ]
}
</script>

<script>
  (function() {
    try {
      var manifestData = document.getElementById('pwa-manifest-data').textContent;
      var blob = new Blob([manifestData], {type: 'application/json'});
      var manifestURL = URL.createObjectURL(blob);
      var link = document.createElement('link');
      link.rel = 'manifest';
      link.href = manifestURL;
      document.head.appendChild(link);
    } catch (e) {
      console.warn('PWA Manifest generation failed', e);
    }
  })();
</script>
```

#### 4.3 PWA Install Banner Section

Create `sections/pwa-install-banner.liquid`:
- Fixed bottom banner (slides up when installable)
- Listens for `beforeinstallprompt` event
- Custom branded install button
- Dismiss button with localStorage memory
- Auto-hides if already in standalone mode
- Accessible (aria-hidden management)

#### 4.4 Limitations (No Service Worker)

Without a root-domain service worker, we cannot provide:
- Offline page caching
- Background sync
- Push notifications

**What we CAN provide:**
- Add to Home Screen functionality
- Standalone app experience (no browser chrome)
- App icon on device
- Splash screen on launch
- Theme-colored status bar

---

### Phase 5: Loyalty Engine (Priority: High)

#### 5.1 Core Loyalty Snippet

Create `snippets/loyalty-engine.liquid`:
- Tier-based system calculated from `customer.total_spent`
- Visual progress bar toward next tier
- Discount code display with copy button
- Configurable tier thresholds and rewards

**Default Tier Structure:**
```
Tier 1: Apprentice      ($0-499)      → No discount
Tier 2: Fabricator      ($500-1499)   → 5% off (LOYALTY_FAB_5)
Tier 3: Master Welder   ($1500+)      → 10% off (LOYALTY_MASTER_10)
```

#### 5.2 Loyalty Settings

Add to `config/settings_schema.json`:
```json
{
  "name": "Loyalty Program",
  "settings": [
    { "type": "checkbox", "id": "loyalty_enabled", "label": "Enable loyalty program", "default": true },
    
    { "type": "header", "content": "Tier 1 (Entry)" },
    { "type": "text", "id": "loyalty_tier1_name", "label": "Tier name", "default": "Apprentice" },
    { "type": "color", "id": "loyalty_tier1_color", "label": "Tier color", "default": "#999999" },
    
    { "type": "header", "content": "Tier 2" },
    { "type": "text", "id": "loyalty_tier2_name", "label": "Tier name", "default": "Fabricator" },
    { "type": "range", "id": "loyalty_tier2_threshold", "label": "Spend threshold", "min": 100, "max": 2000, "step": 50, "default": 500, "unit": "$" },
    { "type": "color", "id": "loyalty_tier2_color", "label": "Tier color", "default": "#ffb400" },
    { "type": "text", "id": "loyalty_tier2_code", "label": "Discount code", "default": "LOYALTY_FAB_5" },
    { "type": "text", "id": "loyalty_tier2_perk", "label": "Perk description", "default": "5% off every order" },
    
    { "type": "header", "content": "Tier 3 (Top)" },
    { "type": "text", "id": "loyalty_tier3_name", "label": "Tier name", "default": "Master Welder" },
    { "type": "range", "id": "loyalty_tier3_threshold", "label": "Spend threshold", "min": 500, "max": 5000, "step": 100, "default": 1500, "unit": "$" },
    { "type": "color", "id": "loyalty_tier3_color", "label": "Tier color", "default": "#d71920" },
    { "type": "text", "id": "loyalty_tier3_code", "label": "Discount code", "default": "LOYALTY_MASTER_10" },
    { "type": "text", "id": "loyalty_tier3_perk", "label": "Perk description", "default": "10% off every order" }
  ]
}
```

#### 5.3 Loyalty Display Components

**Files to create:**
- `snippets/loyalty-engine.liquid` - Core calculation and card display
- `snippets/loyalty-badge.liquid` - Small badge for header/account
- `snippets/loyalty-progress.liquid` - Standalone progress bar
- `sections/loyalty-program.liquid` - Full-page loyalty explanation

**Integration points:**
- Account dashboard (main loyalty card)
- Header (tier badge next to account icon)
- Cart drawer (show current tier discount reminder)
- Order confirmation (points/spend update)

#### 5.4 Loyalty Enhancements (Future)

- Birthday rewards (via customer metafield)
- Referral tracking
- Points multiplier events
- Exclusive product access per tier
- Early access to sales

---

### Phase 6: Variant Pill Swatches (Priority: High)

**Replaces:** Variant Options Swatch apps (~$7/mo)

Industrial buyers need to see options like "120V vs 240V" or "Red vs Black" as clickable buttons, not ugly dropdowns.

#### 6.1 Implementation Approach

In `sections/main-product.liquid`, detect option type and render appropriately:
- **Color options** → Circular swatches with background colors
- **Other options** (Size, Voltage, etc.) → Pill buttons

#### 6.2 Pill Swatch Markup

```liquid
<fieldset class="variant-picker">
  <legend>{{ option.name }}</legend>
  <div class="variant-options">
    {% for value in option.values %}
      <input type="radio" 
             id="{{ section.id }}-{{ option.position }}-{{ forloop.index0 }}"
             name="{{ option.name }}"
             value="{{ value | escape }}"
             class="visually-hidden"
             {% if option.selected_value == value %}checked{% endif %}>
      
      {% if option.name contains 'Color' %}
        {%- assign color_handle = value | handleize -%}
        <label for="{{ section.id }}-{{ option.position }}-{{ forloop.index0 }}" 
               class="variant-swatch"
               style="background-color: var(--color-{{ color_handle }}, {{ value }});"
               title="{{ value }}">
          <span class="visually-hidden">{{ value }}</span>
        </label>
      {% else %}
        <label for="{{ section.id }}-{{ option.position }}-{{ forloop.index0 }}" 
               class="variant-pill">
          {{ value }}
        </label>
      {% endif %}
    {% endfor %}
  </div>
</fieldset>
```

#### 6.3 CSS Architecture

```css
.variant-picker {
  border: none;
  padding: 0;
  margin: 0 0 var(--space-4);
}

.variant-picker legend {
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.variant-options { 
  display: flex; 
  gap: 10px; 
  flex-wrap: wrap; 
}

/* Pill Buttons (Size, Voltage, etc.) */
.variant-pill {
  border: 1px solid var(--color-border);
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  background: var(--color-background);
  border-radius: var(--radius-button);
  transition: all 0.15s ease;
}

.variant-pill:hover {
  border-color: var(--color-text);
}

input:checked + .variant-pill {
  background: var(--color-text);
  color: var(--color-background);
  border-color: var(--color-text);
}

/* Color Swatches */
.variant-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all 0.15s ease;
}

.variant-swatch:hover {
  transform: scale(1.1);
}

input:checked + .variant-swatch {
  border-color: var(--color-text);
  box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-text);
}

/* Sold out / unavailable state */
input:disabled + .variant-pill,
input:disabled + .variant-swatch {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: line-through;
}
```

#### 6.4 Color Mapping

Option 1: CSS Variables (recommended)
```css
:root {
  --color-red: #d71920;
  --color-black: #000000;
  --color-blue: #007ac9;
  /* etc. */
}
```

Option 2: Metafield-based color mapping per product

#### 6.5 JavaScript for Variant Selection

Update hidden variant ID input when pills are clicked:
```javascript
document.querySelectorAll('.variant-options input').forEach(input => {
  input.addEventListener('change', () => {
    updateVariantId();
    updatePrice();
    updateAvailability();
  });
});
```

---

### Phase 7: Sticky Add to Cart Bar (Priority: High)

**Why:** Long technical product pages (specs, manuals, videos) mean the "Buy" button gets lost. A sticky bar improves mobile conversion significantly.

**App Replacement:** Sticky Cart apps (~$5/mo)

#### 7.1 Implementation Approach

Uses IntersectionObserver for performance:
- Place `.main-atc-anchor` element below main Add to Cart button
- When anchor scrolls off-screen (upward), slide in sticky bar
- When anchor comes back into view, hide sticky bar

#### 6.2 Sticky Bar Component

Create `snippets/sticky-add-to-cart.liquid`:
- Product image thumbnail
- Product title (truncated)
- Selected variant display
- Price (with compare-at if on sale)
- Quantity selector (optional)
- Add to Cart button
- Syncs with main product form

**Behavior:**
```javascript
const observer = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting && entries[0].boundingClientRect.top < 0) {
    stickyBar.classList.add('visible');
  } else {
    stickyBar.classList.remove('visible');
  }
}, { threshold: 0 });
```

#### 6.3 Files to Create

- `snippets/sticky-add-to-cart.liquid` - Bar markup and styles
- `assets/sticky-atc.js` - IntersectionObserver logic

#### 6.4 Integration

Update `sections/main-product.liquid`:
- Add `.main-atc-anchor` div after Add to Cart button
- Include sticky bar snippet at end of section
- Pass product/variant data to snippet

#### 6.5 Settings

Add to product section schema:
```json
{ "type": "checkbox", "id": "show_sticky_atc", "label": "Show sticky add to cart", "default": true },
{ "type": "checkbox", "id": "sticky_show_image", "label": "Show product image in sticky bar", "default": true },
{ "type": "checkbox", "id": "sticky_show_quantity", "label": "Show quantity selector", "default": false }
```

---

### Phase 8: AutoRAG AI Search (Priority: High)

**Enterprise-Lite Feature:** Integrates with Cloudflare AutoRAG for semantic/AI-powered product search.

**App Replacement:** Algolia, Searchanise, Boost AI Search (~$50-300/mo)

**The Strategy:**
- **Setting:** Simple text field in Theme Editor for the Cloudflare Worker URL
- **Fallback:** If URL is empty, falls back to standard Shopify `routes.search_url`
- **UI:** "Industrial Command Line" style search modal

#### 8.1 AutoRAG Settings

Add to `config/settings_schema.json`:
```json
{
  "name": "AI Search (AutoRAG)",
  "settings": [
    { "type": "checkbox", "id": "autorag_enabled", "label": "Enable AI Search", "default": false },
    { "type": "text", "id": "autorag_worker_url", "label": "Cloudflare Worker URL", "info": "The endpoint for your RAG Vector DB. Leave empty for standard Shopify search." },
    { "type": "text", "id": "autorag_placeholder", "label": "Placeholder text", "default": "Describe what you need..." }
  ]
}
```

#### 8.2 AutoRAG Section (`sections/search-autorag.liquid`)

```liquid
{{ 'section-autorag.css' | asset_url | stylesheet_tag }}

<div class="autorag-container" data-worker-url="{{ section.settings.worker_url }}">
  <div class="autorag-input-wrapper">
    <input type="text" 
           id="AutoRagInput" 
           class="autorag-input" 
           placeholder="{{ section.settings.placeholder }}" 
           aria-label="Ask our AI...">
    <div id="AutoRagLoader" class="loader hidden"></div>
    <button class="btn btn--icon">
      <!-- Search Icon SVG -->
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </button>
  </div>

  <div id="AutoRagResults" class="autorag-results">
    <!-- Results injected here via JS -->
    <div class="autorag-empty-state">
      <p>Ask a question like <em>"Which welder is best for aluminum?"</em></p>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('AutoRagInput');
    const resultsContainer = document.getElementById('AutoRagResults');
    const loader = document.getElementById('AutoRagLoader');
    const workerUrl = document.querySelector('.autorag-container').dataset.workerUrl;

    // Debounce function
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    const performSearch = async (query) => {
      if (!query) {
        resultsContainer.innerHTML = '';
        return;
      }
      
      if (!workerUrl) {
        console.warn('AutoRAG: No Worker URL provided. Falling back to native.');
        window.location.href = `/search?q=${query}`;
        return;
      }

      loader.classList.remove('hidden');
      
      try {
        // Expecting JSON: { results: [ { title, url, price, image, score } ] }
        const res = await fetch(`${workerUrl}?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        renderResults(data.results);
      } catch (err) {
        console.error('AutoRAG Error:', err);
        resultsContainer.innerHTML = `<div class="error">Connection failed. <a href="/search?q=${query}">Try standard search</a></div>`;
      } finally {
        loader.classList.add('hidden');
      }
    };

    const renderResults = (items) => {
      if (!items || items.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No AI matches found.</div>';
        return;
      }

      resultsContainer.innerHTML = items.map(item => `
        <a href="${item.url}" class="rag-item">
          <div class="rag-img">
            <img src="${item.image}" alt="${item.title}" loading="lazy" width="80">
          </div>
          <div class="rag-info">
            <h4>${item.title}</h4>
            <div class="rag-meta">
              <span class="rag-price">${item.price}</span>
              <span class="rag-score">Relevance: ${Math.round(item.score * 100)}%</span>
            </div>
            <p class="rag-snippet">${item.snippet || ''}</p>
          </div>
        </a>
      `).join('');
    };

    input.addEventListener('input', debounce((e) => performSearch(e.target.value), 500));
  });
</script>

{% schema %}
{
  "name": "AutoRAG Search",
  "settings": [
    { "type": "text", "id": "worker_url", "label": "Cloudflare Worker URL", "info": "The endpoint for your RAG Vector DB." },
    { "type": "text", "id": "placeholder", "label": "Placeholder Text", "default": "Describe what you need..." }
  ],
  "presets": [{ "name": "AutoRAG Search" }]
}
{% endschema %}
```

#### 8.3 AutoRAG CSS (`assets/section-autorag.css`)

```css
.autorag-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.autorag-input-wrapper {
  position: relative;
  display: flex;
  border-bottom: 2px solid var(--color-text);
}

.autorag-input {
  width: 100%;
  border: none;
  font-size: 1.2rem;
  padding: 15px;
  outline: none;
  background: transparent;
  font-family: inherit;
}

.autorag-input::placeholder {
  color: var(--color-text-secondary);
}

.autorag-results {
  margin-top: 20px;
}

.autorag-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.autorag-empty-state em {
  color: var(--color-text);
  font-style: normal;
  background: var(--color-surface);
  padding: 4px 8px;
  border-radius: 4px;
}

.rag-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s, border-left 0.2s;
}

.rag-item:hover {
  background: var(--color-surface);
  border-left: 4px solid var(--color-primary);
  padding-left: 11px;
}

.rag-img img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius);
}

.rag-info {
  flex: 1;
}

.rag-info h4 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.rag-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.rag-price {
  font-weight: 600;
  color: var(--color-primary);
}

.rag-score {
  font-size: 0.75rem;
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--color-text-secondary);
}

.rag-snippet {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.no-results,
.error {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.error a {
  color: var(--color-primary);
}

/* Loader Spinner */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
}

.loader.hidden {
  display: none;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}
```

#### 8.4 Cloudflare Worker Setup (Reference)

The theme expects a Cloudflare Worker endpoint that:
1. Accepts `?q=` query parameter
2. Queries AutoRAG/Vectorize for semantic matches
3. Returns JSON: `{ results: [{ title, url, price, image, score, snippet }] }`

Example Worker structure (not part of theme, but for documentation):
```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    // Query AutoRAG
    const results = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: query });
    // ... vectorize search logic
    
    return Response.json({ results });
  }
}
```

---

### Phase 9: Product Attachments / Documentation (Priority: High)

**Use Case:** Industrial products require downloadable documentation - spec sheets, user manuals, safety data sheets (SDS), CAD files, warranty documents, etc.

**App Replacement:** Product attachments apps (~$10-30/mo)

#### 9.1 Metafield Definitions

Create metafield definitions in Shopify Admin → Settings → Custom data → Products:

| Namespace | Key | Type | Description |
|-----------|-----|------|-------------|
| `attachments` | `spec_sheet` | `file_reference` | Technical specification PDF |
| `attachments` | `user_manual` | `file_reference` | User/operator manual |
| `attachments` | `safety_data` | `file_reference` | Safety Data Sheet (SDS/MSDS) |
| `attachments` | `cad_file` | `file_reference` | CAD/3D model file |
| `attachments` | `warranty` | `file_reference` | Warranty documentation |
| `attachments` | `custom_docs` | `list.file_reference` | Additional documents (list) |

**Note:** `file_reference` type allows PDF, images, and other file uploads directly in the product admin.

#### 9.2 Metafield Definition JSON (for import)

```json
{
  "metafields": [
    {
      "namespace": "attachments",
      "key": "spec_sheet",
      "name": "Spec Sheet",
      "description": "Technical specification document (PDF)",
      "type": "file_reference",
      "owner_type": "PRODUCT"
    },
    {
      "namespace": "attachments",
      "key": "user_manual",
      "name": "User Manual",
      "description": "Product user or operator manual (PDF)",
      "type": "file_reference",
      "owner_type": "PRODUCT"
    },
    {
      "namespace": "attachments",
      "key": "safety_data",
      "name": "Safety Data Sheet",
      "description": "SDS/MSDS safety documentation (PDF)",
      "type": "file_reference",
      "owner_type": "PRODUCT"
    },
    {
      "namespace": "attachments",
      "key": "cad_file",
      "name": "CAD File",
      "description": "CAD drawing or 3D model file",
      "type": "file_reference",
      "owner_type": "PRODUCT"
    },
    {
      "namespace": "attachments",
      "key": "warranty",
      "name": "Warranty Document",
      "description": "Warranty terms and conditions (PDF)",
      "type": "file_reference",
      "owner_type": "PRODUCT"
    },
    {
      "namespace": "attachments",
      "key": "custom_docs",
      "name": "Additional Documents",
      "description": "Any other product documentation",
      "type": "list.file_reference",
      "owner_type": "PRODUCT"
    }
  ]
}
```

#### 9.3 Product Attachments Snippet (`snippets/product-attachments.liquid`)

```liquid
{%- comment -%}
  Product Attachments Display
  Usage: {% render 'product-attachments', product: product %}
{%- endcomment -%}

{%- liquid
  assign has_attachments = false
  if product.metafields.attachments.spec_sheet or product.metafields.attachments.user_manual or product.metafields.attachments.safety_data or product.metafields.attachments.cad_file or product.metafields.attachments.warranty or product.metafields.attachments.custom_docs
    assign has_attachments = true
  endif
-%}

{%- if has_attachments -%}
  <div class="product-attachments">
    <h3 class="attachments-heading">
      <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      {{ 'products.attachments.heading' | t | default: 'Product Documentation' }}
    </h3>
    
    <ul class="attachments-list">
      {%- if product.metafields.attachments.spec_sheet -%}
        <li class="attachment-item">
          <a href="{{ product.metafields.attachments.spec_sheet | file_url }}" 
             target="_blank" 
             rel="noopener"
             class="attachment-link"
             download>
            <span class="attachment-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </span>
            <span class="attachment-name">{{ 'products.attachments.spec_sheet' | t | default: 'Specification Sheet' }}</span>
            <span class="attachment-type">PDF</span>
          </a>
        </li>
      {%- endif -%}
      
      {%- if product.metafields.attachments.user_manual -%}
        <li class="attachment-item">
          <a href="{{ product.metafields.attachments.user_manual | file_url }}" 
             target="_blank" 
             rel="noopener"
             class="attachment-link"
             download>
            <span class="attachment-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </span>
            <span class="attachment-name">{{ 'products.attachments.user_manual' | t | default: 'User Manual' }}</span>
            <span class="attachment-type">PDF</span>
          </a>
        </li>
      {%- endif -%}
      
      {%- if product.metafields.attachments.safety_data -%}
        <li class="attachment-item attachment-item--safety">
          <a href="{{ product.metafields.attachments.safety_data | file_url }}" 
             target="_blank" 
             rel="noopener"
             class="attachment-link"
             download>
            <span class="attachment-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </span>
            <span class="attachment-name">{{ 'products.attachments.safety_data' | t | default: 'Safety Data Sheet (SDS)' }}</span>
            <span class="attachment-type">PDF</span>
          </a>
        </li>
      {%- endif -%}
      
      {%- if product.metafields.attachments.cad_file -%}
        <li class="attachment-item">
          <a href="{{ product.metafields.attachments.cad_file | file_url }}" 
             target="_blank" 
             rel="noopener"
             class="attachment-link"
             download>
            <span class="attachment-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </span>
            <span class="attachment-name">{{ 'products.attachments.cad_file' | t | default: 'CAD / 3D Model' }}</span>
            <span class="attachment-type">DWG/STEP</span>
          </a>
        </li>
      {%- endif -%}
      
      {%- if product.metafields.attachments.warranty -%}
        <li class="attachment-item">
          <a href="{{ product.metafields.attachments.warranty | file_url }}" 
             target="_blank" 
             rel="noopener"
             class="attachment-link"
             download>
            <span class="attachment-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </span>
            <span class="attachment-name">{{ 'products.attachments.warranty' | t | default: 'Warranty Information' }}</span>
            <span class="attachment-type">PDF</span>
          </a>
        </li>
      {%- endif -%}
      
      {%- if product.metafields.attachments.custom_docs -%}
        {%- for doc in product.metafields.attachments.custom_docs.value -%}
          <li class="attachment-item">
            <a href="{{ doc | file_url }}" 
               target="_blank" 
               rel="noopener"
               class="attachment-link"
               download>
              <span class="attachment-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </span>
              <span class="attachment-name">{{ doc.alt | default: 'Document' }}</span>
              <span class="attachment-type">{{ doc.media_type | split: '/' | last | upcase }}</span>
            </a>
          </li>
        {%- endfor -%}
      {%- endif -%}
    </ul>
  </div>
{%- endif -%}
```

#### 9.4 Product Attachments CSS

Add to `assets/component-product-attachments.css`:

```css
.product-attachments {
  margin: var(--space-6) 0;
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.attachments-heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-4);
  font-size: 1rem;
  font-weight: 600;
}

.attachments-heading .icon {
  flex-shrink: 0;
}

.attachments-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.attachment-item {
  margin: 0;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}

.attachment-link:hover {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.attachment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-surface);
  border-radius: var(--radius);
  flex-shrink: 0;
}

.attachment-link:hover .attachment-icon {
  background: var(--color-primary);
  color: var(--color-background);
}

.attachment-name {
  flex: 1;
  font-weight: 500;
}

.attachment-type {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  background: var(--color-surface);
  border-radius: 4px;
  color: var(--color-text-secondary);
}

/* Safety documents get special treatment */
.attachment-item--safety .attachment-link {
  border-left: 3px solid var(--color-warning, #f59e0b);
}

.attachment-item--safety .attachment-icon {
  color: var(--color-warning, #f59e0b);
}

/* Responsive: Stack on mobile */
@media (max-width: 480px) {
  .attachment-link {
    flex-wrap: wrap;
  }
  
  .attachment-type {
    margin-left: auto;
  }
}
```

#### 9.5 Standalone Attachments Section (`sections/product-attachments.liquid`)

For use on product pages or as a standalone section:

```liquid
{%- comment -%}
  Product Attachments Section
  Can be added to product pages via theme customizer
{%- endcomment -%}

{{ 'component-product-attachments.css' | asset_url | stylesheet_tag }}

{%- if product -%}
  <div class="section-attachments page-width">
    {% render 'product-attachments', product: product %}
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Product Attachments",
  "class": "section-product-attachments",
  "settings": [
    {
      "type": "paragraph",
      "content": "Displays product documentation from metafields. Add files in the product admin under 'Attachments' metafields."
    },
    {
      "type": "select",
      "id": "style",
      "label": "Display style",
      "options": [
        { "value": "card", "label": "Card (default)" },
        { "value": "list", "label": "Simple list" },
        { "value": "grid", "label": "Grid" }
      ],
      "default": "card"
    }
  ],
  "templates": ["product"]
}
{% endschema %}
```

#### 9.6 Locale Translations

Add to `locales/en.default.schema.json`:

```json
{
  "products": {
    "attachments": {
      "heading": "Product Documentation",
      "spec_sheet": "Specification Sheet",
      "user_manual": "User Manual",
      "safety_data": "Safety Data Sheet (SDS)",
      "cad_file": "CAD / 3D Model",
      "warranty": "Warranty Information",
      "download": "Download"
    }
  }
}
```

#### 9.7 Integration with Product Page

In `sections/main-product.liquid`, add block type for attachments:

```liquid
{%- when 'attachments' -%}
  {% render 'product-attachments', product: product %}
```

Add to section schema blocks:
```json
{
  "type": "attachments",
  "name": "Product Attachments",
  "limit": 1,
  "settings": [
    {
      "type": "paragraph",
      "content": "Displays documentation files from product metafields."
    }
  ]
}
```

#### 9.8 Collection-Level Documentation (Optional)

For documentation that applies to all products in a collection, add collection metafields:

| Namespace | Key | Type | Description |
|-----------|-----|------|-------------|
| `attachments` | `collection_docs` | `list.file_reference` | Collection-wide documentation |

#### 9.9 Files to Create

- `snippets/product-attachments.liquid` - Core attachment display
- `assets/component-product-attachments.css` - Attachment styles
- `sections/product-attachments.liquid` - Standalone section
- Update `sections/main-product.liquid` - Add attachments block
- Update `locales/en.default.schema.json` - Add translations

---

### Phase 10: Additional Enhancements (Priority: Medium)

#### 10.1 Performance Optimizations

**CSS Loader Snippet** (`snippets/css-loader.liquid`):
Non-blocking CSS loading pattern for section-specific styles:
```liquid
{%- comment -%}
  Usage: {% render 'css-loader', css: 'section-smart-grid.css' %}
{%- endcomment -%}

<link rel="stylesheet" href="{{ css | asset_url }}" media="print" onload="this.media='all'">
<noscript>{{ css | asset_url | stylesheet_tag }}</noscript>
```

**Additional optimizations:**
- Resource hints (preconnect, prefetch, preload)
- Image lazy loading with blur-up
- Intersection Observer for animations

#### 7.2 Accessibility Audit

- ARIA landmarks review
- Focus management improvements
- Skip link enhancements
- Color contrast verification
- Screen reader testing

#### 7.3 Analytics Integration

- Google Analytics 4 events
- Facebook Pixel support
- Custom event tracking
- Core Web Vitals monitoring

---

## File Structure (New Files)

```
/snippets/
├── structured-data.liquid          # Main schema orchestrator
├── schema-organization.liquid      # Organization schema
├── schema-website.liquid           # WebSite schema
├── schema-product.liquid           # Product schema
├── schema-breadcrumb.liquid        # BreadcrumbList schema
├── schema-collection.liquid        # Collection schema
├── schema-article.liquid           # Article schema
├── schema-faq.liquid               # FAQPage schema
├── schema-video.liquid             # VideoObject schema
├── breadcrumbs.liquid              # Visual breadcrumb nav
├── grid-presets.liquid             # Grid layout presets
├── pwa-manifest.liquid             # Web app manifest
├── pwa-install-prompt.liquid       # Install banner
├── loyalty-engine.liquid           # Core loyalty calculation + card
├── loyalty-badge.liquid            # Small tier badge
├── loyalty-progress.liquid         # Standalone progress bar
├── pwa-head.liquid                 # PWA manifest + iOS meta tags
├── sticky-add-to-cart.liquid       # Sticky ATC bar for product pages
├── product-attachments.liquid      # Product documentation display
└── css-loader.liquid               # Non-blocking CSS loader

/assets/
├── sticky-atc.js                   # IntersectionObserver for sticky bar
├── section-smart-grid.css          # Smart Grid container query styles
├── builder-grid.css                # Builder Grid 12-column styles
├── section-autorag.css             # AutoRAG AI Search styles
└── component-product-attachments.css # Product attachments styles

/sections/
├── smart-grid.liquid               # "The Money Maker" - container query grid
├── builder-grid.liquid             # Page builder (row-based, 12-col)
├── layout-manager.liquid           # Layout save/load UI
├── loyalty-program.liquid          # Full loyalty program explainer page
├── pwa-install-banner.liquid       # PWA install prompt banner
├── search-autorag.liquid           # AutoRAG AI-powered search
└── product-attachments.liquid      # Product documentation section
```

---

## Settings Schema Additions

### SEO Settings Group
```json
{
  "name": "SEO & Structured Data",
  "settings": [
    { "type": "header", "content": "Organization" },
    { "type": "text", "id": "seo_org_name", "label": "Organization name" },
    { "type": "image_picker", "id": "seo_org_logo", "label": "Organization logo" },
    { "type": "text", "id": "seo_org_phone", "label": "Phone number" },
    { "type": "text", "id": "seo_org_email", "label": "Email" },
    
    { "type": "header", "content": "Local Business (optional)" },
    { "type": "checkbox", "id": "seo_local_business", "label": "Enable local business schema" },
    { "type": "text", "id": "seo_address_street", "label": "Street address" },
    { "type": "text", "id": "seo_address_city", "label": "City" },
    { "type": "text", "id": "seo_address_region", "label": "State/Region" },
    { "type": "text", "id": "seo_address_postal", "label": "Postal code" },
    { "type": "text", "id": "seo_address_country", "label": "Country" },
    
    { "type": "header", "content": "Schema Options" },
    { "type": "checkbox", "id": "seo_enable_product_schema", "label": "Product schema", "default": true },
    { "type": "checkbox", "id": "seo_enable_breadcrumb_schema", "label": "Breadcrumb schema", "default": true },
    { "type": "checkbox", "id": "seo_enable_faq_schema", "label": "FAQ schema", "default": true }
  ]
}
```

### PWA Settings Group
```json
{
  "name": "Progressive Web App",
  "settings": [
    { "type": "checkbox", "id": "pwa_enabled", "label": "Enable PWA features", "default": true },
    { "type": "text", "id": "pwa_short_name", "label": "App short name", "default": "Shop" },
    { "type": "text", "id": "pwa_name", "label": "App full name" },
    { "type": "image_picker", "id": "pwa_icon_192", "label": "App icon (192x192)" },
    { "type": "image_picker", "id": "pwa_icon_512", "label": "App icon (512x512)" },
    { "type": "select", "id": "pwa_display", "label": "Display mode", "options": [
      { "value": "standalone", "label": "Standalone" },
      { "value": "fullscreen", "label": "Fullscreen" },
      { "value": "minimal-ui", "label": "Minimal UI" }
    ], "default": "standalone" },
    { "type": "checkbox", "id": "pwa_install_prompt", "label": "Show install prompt", "default": true },
    { "type": "checkbox", "id": "pwa_offline_page", "label": "Enable offline page", "default": true }
  ]
}
```

---

## Implementation Order

1. **SEO Structured Data** (2-3 days)
   - Create all schema snippets
   - Add SEO settings
   - Integrate with existing sections
   - Update meta-tags snippet

2. **Breadcrumbs** (0.5 day)
   - Create breadcrumb snippet
   - Add to templates
   - Integrate with breadcrumb schema

3. **Dynamic Grid Enhancements** (2-3 days)
   - Upgrade container-grid section
   - Add new layout patterns
   - Create grid presets
   - Add new block types

4. **PWA Support** (1 day)
   - Create pwa-head.liquid snippet (Blob URL manifest)
   - Add iOS meta tags
   - Create pwa-install-banner.liquid section
   - Add PWA settings to schema
   - Integrate into theme.liquid

5. **Metafield Layout System** (2-3 days)
   - Design metafield structure
   - Create layout manager section
   - Build save/load JavaScript
   - Integrate with grid section

6. **Loyalty Engine** (1-2 days)
   - Create loyalty snippets (engine, badge, progress)
   - Add loyalty settings to schema
   - Build loyalty program section
   - Integrate with account dashboard
   - Add header tier badge

7. **Sticky Add to Cart** (0.5 day)
   - Create sticky-add-to-cart.liquid snippet
   - Create sticky-atc.js with IntersectionObserver
   - Integrate with main-product.liquid
   - Add settings to product section schema

8. **AutoRAG AI Search** (1 day)
   - Create search-autorag.liquid section
   - Create section-autorag.css styles
   - Add AutoRAG settings to schema
   - Document Cloudflare Worker setup

9. **Product Attachments** (1 day)
   - Create metafield definitions (spec sheet, manual, SDS, CAD, warranty)
   - Create product-attachments.liquid snippet
   - Create component-product-attachments.css
   - Create standalone section for product pages
   - Add attachments block to main-product.liquid
   - Add locale translations

10. **Testing & Polish** (1-2 days)
   - Schema validation (Google Rich Results Test)
   - PWA audit (Lighthouse)
   - Cross-browser testing
   - Performance optimization

---

## Success Metrics

- Lighthouse PWA score: 100
- Lighthouse SEO score: 100
- Valid structured data (no errors in Google Search Console)
- Offline functionality working
- Layout save/load working via metafields
- All grid presets rendering correctly

---

## Questions to Clarify

1. **Metafield storage approach:** Should layouts be stored as shop metafields (global) or page metafields (per-page)?

2. ~~**PWA scope:**~~ RESOLVED - Using Blob URL manifest approach (no service worker due to Shopify CDN limitations)

3. **Layout manager access:** Should the layout save/load UI be visible only to logged-in admin users, or available to all?

4. **Schema depth:** Should product schema include aggregate ratings even if no reviews exist (using placeholder structure)?

5. **Loyalty tier count:** The current design has 3 tiers. Would you like support for 4-5 tiers, or is 3 sufficient?

6. **Loyalty discount codes:** Should the theme auto-generate unique codes, or will merchants manually create them in Shopify admin?

---

## App Replacement Value Summary

| Feature | Replaces Apps Like | Typical Monthly Cost |
|---------|-------------------|---------------------|
| **Builder Grid** | PageFly, Shogun, GemPages | $29-99/mo |
| **AutoRAG AI Search** | Algolia, Searchanise, Boost AI Search | $50-300/mo |
| **Product Attachments** | Product attachments apps, File Upload | $10-30/mo |
| Loyalty Engine | Smile.io, LoyaltyLion, Yotpo Loyalty | $50-200/mo |
| SEO/Structured Data | JSON-LD for SEO, Smart SEO | $20-50/mo |
| Mega Menu | Mega Menu Pro, Buddha Mega Menu | $10-20/mo |
| FAQ System | HelpCenter, FAQ Page | $5-15/mo |
| Shoppable Images | Lookbook, Shoppable Instagram | $15-30/mo |
| Video Gallery | Video Gallery, YouTube Gallery | $10-20/mo |
| PWA | Ampify, PWA & Mobile App | $30-100/mo |
| Sticky Add to Cart | Sticky Cart, Quick Buy Bar | $5-10/mo |

**Total potential savings: $234-874/month ($2,808-10,488/year)**
