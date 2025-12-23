# Technology Stack

## Platform
- **Shopify Liquid** - Template engine and theme framework
- **Shopify Online Store 2.0** - Section groups, JSON templates, theme blocks
- **Modern CSS** - Custom properties, container queries, logical properties
- **Vanilla JavaScript** - No frameworks, progressive enhancement approach

## Build System
This is a **native Shopify theme** with no build process required. All assets are served directly by Shopify's CDN.

### Development Commands
```bash
# Install Shopify CLI (required)
npm install -g @shopify/cli @shopify/theme

# Authenticate with store
shopify auth login --store your-store.myshopify.com

# Start development server
shopify theme dev

# Run theme validation
shopify theme check

# Push to store (unpublished)
shopify theme push --unpublished

# Pull from store
shopify theme pull

# Package for distribution
shopify theme package
```

## Architecture Principles
- **Progressive Enhancement** - Core functionality works without JavaScript
- **Accessibility First** - WCAG 2.1 AA compliant
- **Performance Focused** - Minimal JavaScript, optimized CSS
- **No Utility Frameworks** - Clean, semantic CSS without Tailwind/Bootstrap
- **Container Queries** - Modern responsive design using `@container` rules

## Key Technologies
- **CSS Custom Properties** - Design token system for theming
- **CSS Container Queries** - Context-aware responsive components
- **Intersection Observer API** - Performance-optimized scroll interactions
- **Fetch API** - AJAX cart and search functionality
- **Web Components** - Custom elements for complex interactions
- **JSON-LD Structured Data** - SEO optimization
- **Progressive Web App** - Installable app experience

## File Structure Conventions
- `assets/` - Static CSS, JS, images, fonts
- `blocks/` - Reusable theme blocks (OS 2.0)
- `config/` - Global settings schema and data
- `sections/` - Modular page components
- `snippets/` - Reusable Liquid code fragments
- `templates/` - JSON templates defining page structures
- `layout/` - Layout templates (theme.liquid)

## Performance Targets
- **90+ PageSpeed Insights** score out of the box
- **UnCSS architecture** with non-blocking CSS loader
- **Minimal JavaScript** - Core functionality only
- **Optimized images** - Shopify's responsive image system