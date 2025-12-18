# Preset Showcase System

## Overview

The Preset Showcase System allows potential customers to preview different theme presets without accessing the Shopify theme editor. Each preset demonstrates a complete, cohesive design including:

- Custom header with mega menu
- Hero section with preset-specific styling
- Product grids and featured products
- Testimonials and trust badges
- Newsletter CTAs
- Preset-specific footer

## Architecture

### Key Components

```
layout/
  └── theme.showcase.liquid    # Custom layout without global header/footer

templates/
  ├── page.preset-showcase.json        # Overview page (uses standard layout)
  ├── page.showcase-bold-impact.json   # Full demo page
  ├── page.showcase-modern-minimal.json
  ├── page.showcase-tech-forward.json
  ├── page.showcase-warm-artisan.json
  └── page.showcase-zebra-skimmers.json

snippets/
  └── preset-showcase-widget.liquid    # Floating navigation widget
```

### How It Works

1. **Custom Layout**: `theme.showcase.liquid` excludes the global header/footer groups
2. **Self-Contained Templates**: Each showcase page template includes its own header and footer sections
3. **Floating Widget**: Appears on all showcase pages for easy navigation between presets

## Setup Instructions

### Step 1: Create Pages in Shopify Admin

Go to **Online Store > Pages** and create these pages:

| Page Handle | Title | Template |
|-------------|-------|----------|
| `preset-showcase` | Theme Presets | page.preset-showcase |
| `showcase-bold-impact` | Bold Impact Demo | page.showcase-bold-impact |
| `showcase-modern-minimal` | Modern Minimal Demo | page.showcase-modern-minimal |
| `showcase-tech-forward` | Tech Forward Demo | page.showcase-tech-forward |
| `showcase-warm-artisan` | Warm Artisan Demo | page.showcase-warm-artisan |
| `showcase-zebra-skimmers` | Zebra Skimmers Demo | page.showcase-zebra-skimmers |

### Step 2: Set Template for Each Page

For each page:
1. Open the page in Shopify Admin
2. Scroll down to "Theme template"
3. Select the matching template from the dropdown

### Step 3: Add Navigation Link

Add a link to `/pages/preset-showcase` in your main menu or footer for customers to find.

## Customizing Presets

### Modifying a Showcase Page

Each showcase template (e.g., `page.showcase-bold-impact.json`) contains:

```json
{
  "layout": "theme.showcase",  // Uses the showcase layout
  "name": "Showcase - Bold Impact",
  "sections": {
    "header": {
      "type": "mega-menu-header",  // Self-contained header
      "settings": { ... }
    },
    "hero": { ... },
    "featured_collection": { ... },
    // ... more sections ...
    "footer": {
      "type": "preset-footer",  // Self-contained footer
      "settings": { ... }
    }
  }
}
```

### Adding a New Preset

1. Create a new template file: `templates/page.showcase-[preset-name].json`
2. Copy the structure from an existing showcase template
3. Update all `preset_style` settings to your new preset name
4. Add an entry to `snippets/preset-showcase-widget.liquid`
5. Create a new page in Shopify Admin with this template

## The Floating Widget

The preset showcase widget (`snippets/preset-showcase-widget.liquid`) provides:

- Quick navigation between preset demos
- Visual indicators showing current preset
- Link back to the overview page

It automatically appears on any page using the `theme.showcase` layout or pages with "showcase" in the URL path.

## Preset Sections

The showcase system uses these preset-aware sections:

| Section | Purpose |
|---------|---------|
| `mega-menu-header` | Full-featured header with mega menus |
| `preset-hero` | Hero with preset-specific styling |
| `preset-product-grid` | Product grid with preset card styles |
| `preset-featured-product` | Featured product with preset layout |
| `preset-trust-badges` | Stats/trust indicators |
| `preset-testimonials` | Customer testimonials |
| `preset-newsletter-cta` | Newsletter signup |
| `preset-footer` | Footer with preset styling |

Each section accepts a `preset_style` setting that controls its appearance.

## URLs for Sharing

Share these URLs directly with potential customers:

- Overview: `/pages/preset-showcase`
- Bold Impact: `/pages/showcase-bold-impact`
- Modern Minimal: `/pages/showcase-modern-minimal`
- Tech Forward: `/pages/showcase-tech-forward`
- Warm Artisan: `/pages/showcase-warm-artisan`
- Zebra Skimmers: `/pages/showcase-zebra-skimmers`

## Troubleshooting

### Widget not appearing
- Ensure the page uses `theme.showcase` layout or has "showcase" in the URL
- Check that `preset-showcase-widget.liquid` is in snippets folder

### Header/footer from main theme showing
- Verify the template uses `"layout": "theme.showcase"`
- Check that `theme.showcase.liquid` exists in layout folder

### Styles not applying
- Ensure `preset-css-variables` snippet is rendering
- Check that preset CSS files exist in assets folder
