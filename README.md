# Base Theme

A modern, accessible, and performant Shopify theme built from scratch for the Shopify Theme Store.

## Requirements

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) v3.x or later
- Node.js 18.x or later
- A Shopify Partner account and development store

## Getting Started

### 1. Install Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
```

### 2. Authenticate with your store

```bash
shopify auth login --store your-store.myshopify.com
```

### 3. Start development server

```bash
cd shopify-base
shopify theme dev
```

This will upload the theme as a development theme and open a preview in your browser.

### 4. Push to your store

```bash
# Push as unpublished theme
shopify theme push --unpublished

# Or push to an existing theme
shopify theme push
```

## Theme Architecture

```
shopify-base/
├── assets/           # Static CSS, JS, images, fonts
├── blocks/           # Reusable, nestable components (Theme blocks)
├── config/           # Global settings schema and data
├── layout/           # Layout templates (theme.liquid)
├── listings/         # Theme Store listing assets (required for submission)
├── locales/          # Translation files
├── sections/         # Modular full-width page components
├── snippets/         # Reusable Liquid code fragments
└── templates/        # JSON templates defining page structures
```

## Design Principles

- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility First**: WCAG 2.1 AA compliant
- **Performance Focused**: Minimal JavaScript, optimized CSS
- **Modern CSS**: Custom properties, container queries, logical properties
- **No Utility Frameworks**: Clean, semantic CSS without Tailwind/Bootstrap

## Key Features

- Comprehensive design token system via CSS custom properties
- Fluid typography with proper scaling
- Responsive layouts using modern CSS Grid
- Full i18n support with translation keys
- Accessible components with proper ARIA attributes
- Dark mode ready architecture

## Development Commands

```bash
# Start development server
shopify theme dev

# Run Theme Check linting
shopify theme check

# Push changes to store
shopify theme push

# Pull theme from store
shopify theme pull

# Package theme for upload
shopify theme package
```

## Theme Store Submission

This theme is built to comply with Shopify Theme Store requirements:

1. Built from original code (not derived from Dawn/Horizon)
2. Full i18n support with sentence case formatting
3. WCAG 2.1 accessibility compliance
4. Proper settings schema with translations
5. Required `/listings` directory for Theme Store assets

### Before Submission

1. Complete all main sections for every template
2. Create at least 2-3 preset configurations for different industries
3. Build comprehensive documentation
4. Set up a demo store with sample content
5. Run `shopify theme check` and fix all issues

## Customization

### Adding New Sections

1. Create a new `.liquid` file in `/sections`
2. Include `{% schema %}` with settings
3. Add translations to locale files
4. Reference in templates or section groups

### Adding Global Settings

1. Add to `/config/settings_schema.json`
2. Add translations to `/locales/en.default.schema.json`
3. Reference in CSS via `settings.your_setting`

### Creating Blocks

1. Create a new `.liquid` file in `/blocks`
2. Include `{% doc %}` and `{% schema %}` tags
3. Reference in sections using `{% content_for 'blocks' %}`

## License

Copyright © 2024. All rights reserved.
