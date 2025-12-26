# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shopify Liquid theme called "Forge Industrial" built for Shopify Theme Store submission. This is a pure Liquid/CSS/JS theme with no build pipeline - no webpack, no bundlers, no transpilation.

**Key Value Proposition:** "Everything you need, no apps required" - includes loyalty engine, SEO structured data, mega menu, shoppable images, video gallery, and advanced FAQ to replace $150-400/month in third-party apps.

## Development Commands

```bash
shopify theme dev              # Start development server with hot reload
shopify theme check            # Run Theme Check linting (primary linter)
shopify theme push             # Push changes to connected store
shopify theme push --unpublished  # Push as new unpublished theme
shopify theme pull             # Pull theme from store
shopify theme package          # Package for Theme Store submission
```

**Requirements:** Shopify CLI v3.x, Node.js 18.x+

## Architecture

```
sections/       # Full-width page components with embedded CSS/JS (95 sections - see SECTIONS.md)
blocks/         # Reusable, nestable components (button, heading, richtext, text, spacer)
snippets/       # Liquid template fragments (css-variables, icons, structured-data, loyalty-*)
assets/         # Static CSS, JS, SVG - no bundling, loaded directly
config/         # settings_schema.json (theme settings UI), settings_data.json (current values)
locales/        # en.default.json (customer text), en.default.schema.json (settings labels)
templates/      # JSON templates defining page structure + preset variations
listings/       # Theme Store submission assets with preset demos
```

**Section Organization:** See [SECTIONS.md](SECTIONS.md) for complete categorization of all 95 sections grouped by functionality (Product, Collection, Landing Pages, Features, etc.)

## Coding Conventions

### Liquid
- Use whitespace-stripped tags: `{%- liquid ... -%}`
- Document with `{% doc %}...{% enddoc %}` including @param annotations
- Embed CSS in `{% stylesheet %}` blocks within sections/blocks
- All text uses localization: `{{ 'key.path' | t }}` or `t:sections.name.setting`

### CSS
- **Never use !important** - design system uses CSS custom properties for flexibility
- BEM naming: `.component__element--modifier`
- Container queries for responsive layouts (not media queries)
- All colors/fonts reference design tokens from preset system

### JavaScript
- Vanilla ES6+ only (no frameworks, no jQuery)
- Wrap in IIFE: `(function() { 'use strict'; })()`
- Utilities namespaced: `Utils.debounce()`, `Utils.fetchJSON()`, `Utils.trapFocus()`
- Shopify Section Rendering API for dynamic updates

## Preset System

11 color presets defining complete visual identities:
- **Industrial:** The Welder (red), Work Zone (orange), Site Ops (yellow), Midnight Shift (dark), Precision (blue), Tactical (green), Monolith (black)
- **Lifestyle:** Zebra Skimmers, Modern Minimal, Bold Impact, Warm Artisan, Tech Forward

Each preset configures: primary/accent/CTA colors, heading/body fonts, spacing values, border radius, and optional landing page layouts.

Design tokens defined in `snippets/css-variables.liquid`:
```
--color-primary, --color-accent, --color-cta
--font-heading-family, --font-body-family
--spacing-sections, --grid-gap, --button-radius, --card-radius
```

## Key Patterns

**Container Queries:** Cards reshape based on container width, not viewport - enables same component to work as featured banner (wide) or grid item (narrow).

**Non-blocking CSS:** Critical CSS inlined, rest loaded async via `snippets/css-loader.liquid`.

**PWA Support:** Service worker (`templates/sw.js.liquid`) and manifest (`templates/manifest.json.liquid`) for offline mode.

**Structured Data:** JSON-LD schemas in `snippets/structured-data.liquid` for SEO (Organization, Product, BreadcrumbList, FAQPage, VideoObject).

## i18n Requirements

All user-visible text must be in locale files. Settings schema uses `t:` prefix for translation keys. This is critical for Theme Store submission.

## Quality Checks

- `shopify theme check` catches Liquid errors, schema issues, accessibility problems
- Target WCAG 2.1 AA accessibility compliance
- Target 90+ PageSpeed Insights score
- Manual testing via dev store required (no unit test framework)
