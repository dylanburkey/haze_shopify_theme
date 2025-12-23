---
inclusion: always
---

# Project Structure & Organization

## File Naming Conventions

### Section Groups Architecture
- `header-group.json` / `footer-group.json` - Section group containers
- `header--*.liquid` - Header variants (header, corporate-header, mega-menu-header, header-industrial)
- `footer--*.liquid` - Footer variants (footer, preset-footer, footer-industrial)
- `announcement-bar.liquid` - Header group component

### Section Naming Patterns
- `main-*.liquid` - Core template sections (main-product, main-collection, main-page)
- `preset-*.liquid` - Preset system components
- `landing-*.liquid` - Landing page variants for each preset
- `hero-*.liquid` - Hero section variants

### Asset Organization
- `base.css` - Core reset and typography
- `global.js` - Core JavaScript utilities
- `section-*.css` - Section-specific styles
- `preset-*.css` - Preset-specific styling
- `component-*.css` - Reusable component styles
- `landing-*.css` - Landing page specific styles

## Directory Structure

```
shopify-base/
├── assets/                    # Static assets (CSS, JS, images)
│   ├── base.css              # Core styles and reset
│   ├── global.js             # Core JavaScript
│   ├── section-*.css         # Section-specific styles
│   ├── preset-*.css          # Preset styling
│   └── landing-pages/        # Static landing page assets
├── blocks/                   # Theme blocks (OS 2.0)
│   ├── button.liquid
│   ├── heading.liquid
│   ├── image.liquid
│   └── text.liquid
├── config/                   # Theme configuration
│   ├── settings_schema.json  # Theme settings definition
│   └── settings_data.json    # Default values and presets
├── docs/                     # Documentation
│   ├── GETTING_STARTED.md
│   └── PRESET-STYLE-GUIDE.md
├── layout/                   # Layout templates
│   └── theme.liquid          # Main layout
├── listings/                 # Theme Store assets (required)
│   └── [industry-presets]/   # Preset-specific listings
├── locales/                  # Translation files
│   ├── en.default.json       # Default translations
│   └── en.default.schema.json # Settings translations
├── sections/                 # Page sections
│   ├── header-group.json     # Header section group
│   ├── footer-group.json     # Footer section group
│   ├── header--*.liquid      # Header variants
│   ├── footer--*.liquid      # Footer variants
│   ├── main-*.liquid         # Template sections
│   ├── preset-*.liquid       # Preset components
│   └── landing-*.liquid      # Landing page sections
├── snippets/                 # Reusable code fragments
│   ├── css-variables.liquid  # Dynamic CSS variables
│   ├── preset-*.liquid       # Preset content snippets
│   ├── schema-*.liquid       # Structured data
│   └── icon*.liquid          # Icon components
└── templates/                # JSON templates
    ├── index*.json           # Homepage variants
    ├── page*.json            # Page templates
    ├── product.json          # Product template
    └── customers/            # Customer account templates
```

## Code Organization Principles

### Liquid Template Structure (Required Order)
1. **Comments** - Document section purpose and features
2. **Liquid Logic** - Variable assignments and calculations
3. **Inline Styles** - Section-specific CSS variables using `<style>` tags
4. **Markup** - Semantic HTML structure with proper accessibility
5. **Schema** - Section settings and blocks configuration

### CSS Architecture (Layer Order)
1. **Reset & Base** - Normalize and typography foundations
2. **Custom Properties** - Design tokens and CSS variables
3. **Layout** - Grid systems and container queries
4. **Components** - Reusable UI elements
5. **Utilities** - Minimal helper classes only when needed

### JavaScript Patterns (Required Approach)
- **IIFE Modules** - Self-contained functionality wrapped in closures
- **Progressive Enhancement** - Core functionality works without JavaScript
- **Event Delegation** - Use document-level event listeners for performance
- **Debounced Functions** - Smooth interactions with throttling

## Preset System Organization

### 6 Industry Presets (Final Lineup)
- **Bold Impact** - Modern/Tech segment (mega-menu-header + preset-footer)
- **Modern Minimal** - Luxury/Lifestyle segment (header + footer)
- **Tech Forward** - Gaming/Developer segment (mega-menu-header + preset-footer)
- **Warm Artisan** - Food/Craft segment (corporate-header + footer)
- **Zebra Skimmers** - B2B/Industrial segment (header-industrial + footer-industrial)
- **The Welder** - Trades/Fabrication segment (header-industrial + footer-industrial)
- **Precision** - Corporate/Technical segment (header + footer)

### Preset File Structure (Required Pattern)
```
assets/landing-[preset-name].css       # Preset-specific landing page styles
snippets/landing-[preset-name]-content.liquid  # Preset content snippets
templates/index.[preset-name].json     # Homepage template variant
sections/landing-[preset-name].liquid  # Landing page section
```

### Header/Footer Combinations
- **header** + **footer** - Standard corporate layout
- **corporate-header** + **footer** - Professional with enhanced navigation
- **mega-menu-header** + **preset-footer** - Feature-rich modern layout
- **header-industrial** + **footer-industrial** - B2B industrial styling

## Development Workflow

### File Creation Rules
- **New sections**: Always include schema with proper settings and blocks
- **New assets**: Follow naming convention (section-*, preset-*, component-*)
- **New templates**: Use JSON format with proper section references
- **New snippets**: Include documentation comments explaining purpose

### Code Quality Standards
- **Accessibility**: WCAG 2.1 AA compliance required
- **Performance**: 90+ PageSpeed Insights score target
- **Validation**: Run `shopify theme check` before commits
- **Browser Support**: Modern browsers with progressive enhancement

### Theme Store Requirements
- Complete main sections for all templates
- Comprehensive preset configurations
- Demo store with sample content
- All accessibility standards met
- Performance benchmarks achieved