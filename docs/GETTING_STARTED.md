# Forge Industrial Theme - Getting Started Guide

Welcome to the Forge Industrial theme! This guide will help you set up your store quickly and make the most of the theme's features.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Presets](#understanding-presets)
3. [Homepage Styles](#homepage-styles)
4. [Customization](#customization)
5. [Common Issues](#common-issues)

---

## Quick Start

### Step 1: Choose Your Preset

The theme comes with 12 professionally designed presets that set your colors, typography, and basic styling:

1. Open the **Theme Editor** (Customize)
2. Click the **gear icon** to open Theme Settings
3. Go to **Quick Start**
4. Select a **Color & Typography Preset**

**Available Presets:**
- 🔴 **The Welder** - Industrial red, perfect for welding/metalwork
- 🟠 **Work Zone** - Safety orange for construction/safety
- 🟡 **Site Ops** - Construction yellow for project management
- ⚫ **Midnight Shift** - Dark mode for modern tech
- 🔵 **Precision** - Corporate blue for professional services
- 🟢 **Tactical** - Military green for outdoor/tactical
- ⬛ **Monolith** - Minimal black for luxury/premium
- 🔷 **Zebra Skimmers** - Industrial B2B for manufacturing
- ⬜ **Modern Minimal** - Clean lifestyle aesthetic
- 🟣 **Bold Impact** - Athletic/dynamic style
- 🟤 **Warm Artisan** - Handmade/boutique feel
- 🔹 **Tech Forward** - Dark futuristic for electronics

### Step 2: Select a Homepage Style

After choosing your colors, select a homepage layout:

1. In **Quick Start**, find **Homepage Style**
2. Choose from:
   - 🏭 **Default Industrial** - Grid-focused industrial layout
   - 🏢 **Zebra Skimmers (B2B)** - Trust badges, testimonials, product showcase
   - ✨ **Modern Minimal** - Editorial, image-focused design
   - ⚡ **Bold Impact** - Dynamic, athletic style
   - 🎨 **Warm Artisan** - Storytelling, handmade aesthetic
   - 🌙 **Tech Forward** - Dark, futuristic design

> **Pro Tip:** Create a page using the "Choose Style" template to see all homepage styles in a visual gallery before deciding.

### Step 3: Upload Your Logo

1. Go to **Theme Settings** → **Logo**
2. Upload your logo image (PNG with transparent background recommended)
3. Adjust the logo width as needed

If you don't have a logo image:
- Set a **Logo text** (e.g., "FORGE")
- Add a **Logo suffix** for accent color (e.g., ".IND")

### Step 4: Save and Preview

Click **Save** in the theme editor and view your store to see the changes!

---

## Understanding Presets

### What Presets Include

Each preset automatically sets:
- Primary and secondary colors
- Text and background colors
- Header and button colors
- Heading and body fonts
- Font sizes and spacing
- Card and button styling

### Using Custom Colors

To create your own color scheme:

1. Select **"Custom"** as your preset
2. Go to **Theme Settings** → **Colors**
3. Set each color manually

---

## Homepage Styles

### How Homepage Styles Work

The homepage style setting controls which **sections and layout** appear on your homepage. Each style is optimized for different industries:

| Style | Best For | Key Features |
|-------|----------|--------------|
| Default Industrial | Manufacturing, welding, equipment | Grid cards, industrial hero |
| Zebra Skimmers (B2B) | B2B, manufacturing, industrial | Trust badges, testimonials, ROI stats |
| Modern Minimal | Fashion, lifestyle, luxury | Editorial layout, large imagery |
| Bold Impact | Sports, fitness, athletic | Dynamic hero, bold typography |
| Warm Artisan | Handmade, boutique, artisan | Storytelling sections, warm tones |
| Tech Forward | Electronics, SaaS, tech | Dark theme, animated elements |

### Previewing Styles

To see all styles before choosing:

1. Create a new Page in Shopify Admin
2. Set the page template to **"Choose Style"**
3. View the page to see all homepage styles in a gallery

---

## Customization

### Header Options

Go to **Theme Settings** → **Header** to customize:
- Header style (Unified, Mega Menu, Industrial, Corporate)
- Sticky header behavior
- Transparent header on homepage

### Product Cards

Go to **Theme Settings** → **Cards** to customize:
- Card style (Standard, Elevated, Outlined)
- Border radius
- Image aspect ratio
- Secondary image on hover

### Layout

Go to **Theme Settings** → **Layout** to customize:
- Maximum page width
- Section spacing
- Grid gaps

---

## Common Issues

### Preset Not Applying

**Problem:** Selected a preset but colors didn't change.

**Solution:** 
1. Make sure you click **Save** after selecting the preset
2. Hard refresh your browser (Ctrl/Cmd + Shift + R)
3. If using "Custom" preset, you need to set colors manually in the Colors section

### Homepage Not Changing

**Problem:** Changed the homepage style but layout stayed the same.

**Solution:**
1. The homepage style setting changes content in the **Landing Page Switcher** section
2. Make sure your homepage template includes this section
3. If you've heavily customized the homepage, you may need to rebuild it

### Can't Save Changes After Switching Preset

**Problem:** Shopify won't let you save after changing preset.

**Solution:**
1. Save your current changes first
2. Then switch the preset
3. Save again

This happens because Shopify tracks changes to both the preset selector and the colors it sets, creating a conflict.

### Need More Help?

- Visit our [documentation site](https://forge-theme.com/docs)
- Contact [support](https://forge-theme.com/support)

---

## File Structure

For developers, here's the relevant file structure:

```
├── config/
│   ├── settings_schema.json    # Theme settings definition
│   └── settings_data.json      # Preset color values
├── sections/
│   ├── landing-page-switcher.liquid    # Dynamic homepage switcher
│   ├── preset-gallery.liquid           # Style preview gallery
│   └── getting-started.liquid          # Onboarding section
├── snippets/
│   ├── landing-default-content.liquid      # Default homepage
│   ├── landing-zebra-skimmers-content.liquid
│   ├── landing-modern-minimal-content.liquid
│   ├── landing-bold-impact-content.liquid
│   ├── landing-warm-artisan-content.liquid
│   └── landing-tech-forward-content.liquid
├── templates/
│   ├── index.json                  # Main homepage template
│   ├── page.choose-style.json      # Style gallery page
│   └── page.getting-started.json   # Onboarding page
```

---

© 2024 Forge Industrial Theme by Dylan Burkey
