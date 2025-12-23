# Design Document

## Overview

The Demo Store Setup System is a comprehensive solution for creating a fully functional showcase environment for the Forge Industrial Shopify theme. This system encompasses both the marketing-focused preset showcase section and the complete demo store infrastructure including product catalogs with technical specifications, metafield data population, preset configurations, and feature demonstration pages.

The system is designed to provide a complete, ready-to-use demo store that showcases all theme capabilities and drives theme sales conversion. It includes automated data population tools, comprehensive preset configurations, interactive feature demonstrations, and performance-optimized implementations that achieve 90+ PageSpeed Insights scores.

The core components include: a product catalog creation system with 50+ industrial/B2B products, a metafield data population system with admin interface, complete preset configuration for all 12 industry presets, feature demonstration pages, an interactive cost calculator, and the marketing preset showcase section for conversion optimization.

## Architecture

### System Architecture

```
demo-store-setup/
├── Product Catalog System
│   ├── Product data generation and import
│   ├── Category structure and organization
│   ├── Pricing and inventory management
│   └── Image and media asset management
├── Metafield Data System
│   ├── Specification data population
│   ├── Product attachment management
│   ├── Bulk operations interface
│   └── Data validation and quality control
├── Preset Configuration System
│   ├── 12 industry preset configurations
│   ├── Template page setup and linking
│   ├── Header/footer combinations
│   └── Preset-specific content population
├── Feature Demonstration System
│   ├── Cost savings calculator setup
│   ├── Product comparison demonstrations
│   ├── Specification search functionality
│   ├── Loyalty program examples
│   └── FAQ system demonstrations
├── Marketing Showcase Section
│   ├── sections/marketing-preset-showcase.liquid
│   ├── Responsive tile layout system
│   ├── Editable marketing content
│   └── Template page navigation
└── Admin Interface System
    ├── Bulk metafield operations
    ├── CSV import/export tools
    ├── Data validation utilities
    └── Synchronization management
```

### Component Integration

The system integrates multiple existing theme components:
- **Product Specification System** → Enhanced with demo data
- **Cost Calculator** → Populated with realistic scenarios
- **Preset System** → All 12 presets fully configured
- **Marketing Section** → New conversion-optimized showcase
- **Admin Tools** → Enhanced bulk operations interface

### Data Flow Architecture

1. **Product Data Import** → CSV/JSON import → Shopify product creation
2. **Metafield Population** → Admin interface → Specification data → Product pages
3. **Preset Configuration** → Template setup → Content population → Navigation linking
4. **Feature Demonstration** → Page creation → Data integration → Interactive examples
5. **Marketing Showcase** → Section configuration → Preset linking → Conversion optimization

## Components and Interfaces

### Product Catalog Creation System

**Responsibilities**:
- Generate 50+ industrial/B2B products across multiple categories
- Create realistic product data with pricing, variants, and inventory
- Organize products into logical category structures
- Manage product images and media assets

**Key Components**:
- **Product Data Generator**: Creates realistic industrial product data
- **Category Manager**: Organizes products into manufacturing, equipment, tools, safety
- **Asset Manager**: Handles product images, videos, and documentation
- **Import System**: Bulk product creation via CSV/JSON import

### Metafield Data Population System

**File**: Enhanced admin interface and bulk operations

**Responsibilities**:
- Populate specification metafields for all demo products
- Manage product attachments (manuals, CAD files, safety sheets)
- Provide data validation and quality control
- Enable bulk operations for efficient data management

**Key Features**:
- **Specification Templates**: Pre-configured templates for common product types
- **Bulk Import/Export**: CSV-based data management
- **Validation Engine**: Ensures data quality and completeness
- **Attachment Manager**: File upload and organization system

### Preset Configuration System

**Responsibilities**:
- Configure all 12 industry presets with appropriate content
- Set up preset-specific homepage and template variations
- Configure header/footer combinations for each preset
- Link presets to demonstration content

**Preset Configurations**:
- **Bold Impact**: Modern/Tech segment (mega-menu + preset-footer)
- **Modern Minimal**: Luxury/Lifestyle segment (header + footer)
- **Tech Forward**: Gaming/Developer segment (mega-menu + preset-footer)
- **Warm Artisan**: Food/Craft segment (corporate-header + footer)
- **Zebra Skimmers**: B2B/Industrial segment (industrial headers/footers)
- **Forge Industrial**: Manufacturing segment (industrial headers/footers)
- **Plus 6 additional industry-specific presets**

### Feature Demonstration System

**Responsibilities**:
- Create dedicated pages for each major theme feature
- Populate interactive tools with realistic data
- Demonstrate integration between different systems
- Provide clear examples of feature capabilities

**Demonstration Pages**:
- **Cost Calculator Demo**: ROI calculations with real product data
- **Product Comparison**: Side-by-side feature comparisons
- **Specification Search**: Advanced search with populated data
- **Loyalty Program**: Tier-based rewards demonstration
- **FAQ System**: Searchable FAQ with categories

### Marketing Preset Showcase Section

**File**: `sections/marketing-preset-showcase.liquid`

**Responsibilities**:
- Render section header with configurable title/subtitle
- Generate responsive grid layout for preset tiles
- Process block settings for individual presets
- Apply dynamic styling based on section settings

**Key Features**:
- Responsive CSS Grid (1-4 columns based on screen size)
- Configurable section padding and background colors
- Support for up to 12 preset blocks
- Integration with existing CSS variable system

### Preset Tile Component

**Structure**: Rendered within the main section loop

**Elements**:
- **Visual Preview Area**: Mockup representation of preset design
- **Content Area**: Title, industry, description, use cases
- **Action Area**: Template link button and optional secondary actions
- **Badge System**: Optional "Popular", "Best Seller", or custom badges

**Styling Approach**:
- Card-based design with hover effects
- Preset-specific color schemes for visual differentiation
- Consistent typography hierarchy
- Mobile-optimized touch targets

### Admin Interface System

**Responsibilities**:
- Provide intuitive interface for data management
- Enable bulk operations for efficiency
- Offer data validation and quality control
- Support CSV import/export workflows

**Key Components**:
- **Bulk Operations Dashboard**: Manage multiple products simultaneously
- **Data Validation Tools**: Ensure specification data quality
- **Import/Export Interface**: CSV-based data workflows
- **Synchronization Manager**: Keep data updated across systems

## Data Models

### Product Catalog Data Structure

```json
{
  "products": [
    {
      "title": "Industrial Oil Skimmer Model ZS-1000",
      "handle": "industrial-oil-skimmer-zs-1000",
      "product_type": "Industrial Equipment",
      "vendor": "Zebra Skimmers",
      "tags": ["industrial", "oil-removal", "coolant-management"],
      "variants": [
        {
          "title": "Standard Configuration",
          "price": "2499.00",
          "sku": "ZS-1000-STD",
          "inventory_quantity": 15
        }
      ],
      "metafields": {
        "specifications": {
          "flow_rate": "10 GPM",
          "power_consumption": "0.5 HP",
          "dimensions": "24\" x 18\" x 36\"",
          "weight": "85 lbs"
        },
        "attachments": [
          {
            "title": "Installation Manual",
            "file_type": "PDF",
            "file_url": "/files/zs-1000-manual.pdf"
          }
        ]
      }
    }
  ]
}
```

### Metafield Schema Definitions

```json
{
  "product_specifications": {
    "namespace": "custom",
    "key": "specifications",
    "type": "json",
    "description": "Technical product specifications"
  },
  "product_attachments": {
    "namespace": "custom", 
    "key": "attachments",
    "type": "list.file_reference",
    "description": "Product documentation and files"
  },
  "cost_calculator_data": {
    "namespace": "custom",
    "key": "calculator_data", 
    "type": "json",
    "description": "Cost savings calculator parameters"
  }
}
```

### Preset Configuration Data

```liquid
{%- assign preset_configs = 'bold-impact,modern-minimal,tech-forward,warm-artisan,zebra-skimmers,forge-industrial,precision,tactical,site-ops,midnight-shift,industry-4,work-zone' | split: ',' -%}

{%- assign preset_industry_mapping = 'bold-impact:Athletic & Performance,modern-minimal:Luxury & Lifestyle,tech-forward:Gaming & Electronics,warm-artisan:Food & Craft,zebra-skimmers:Industrial B2B,forge-industrial:Manufacturing,precision:Corporate & Technical,tactical:Security & Defense,site-ops:Construction & Infrastructure,midnight-shift:24/7 Operations,industry-4:Smart Manufacturing,work-zone:Safety & Compliance' | split: ',' -%}
```

### Feature Demonstration Data

```json
{
  "cost_calculator_scenarios": [
    {
      "scenario_name": "Oil Skimmer ROI",
      "product_cost": 2499,
      "annual_savings": 8400,
      "payback_months": 3.6,
      "five_year_roi": "1680%"
    },
    {
      "scenario_name": "Coolant Management System",
      "product_cost": 15000,
      "annual_savings": 45000,
      "payback_months": 4.0,
      "five_year_roi": "1500%"
    }
  ],
  "comparison_products": [
    {
      "name": "Oil Skimmer Comparison",
      "products": ["zs-1000", "zs-2000", "zs-industrial"],
      "comparison_fields": ["flow_rate", "power_consumption", "price", "warranty"]
    }
  ]
}
```

### Marketing Section Schema

```json
{
  "name": "Marketing Preset Showcase",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "Choose Your Perfect Design"
    },
    {
      "type": "textarea", 
      "id": "subtitle",
      "label": "Section Subtitle"
    },
    {
      "type": "select",
      "id": "layout_style",
      "label": "Layout Style",
      "options": [
        {"value": "grid", "label": "Grid"},
        {"value": "masonry", "label": "Masonry"}
      ]
    },
    {
      "type": "checkbox",
      "id": "show_value_indicators",
      "label": "Show Value Indicators"
    },
    {
      "type": "range",
      "id": "padding_top",
      "min": 0,
      "max": 120,
      "default": 80
    },
    {
      "type": "range", 
      "id": "padding_bottom",
      "min": 0,
      "max": 120,
      "default": 80
    },
    {
      "type": "color",
      "id": "background_color",
      "default": "#ffffff"
    }
  ]
}
```

### Admin Interface Data Models

```json
{
  "bulk_operations": {
    "import_format": "CSV",
    "supported_fields": [
      "product_title",
      "product_handle", 
      "specifications_json",
      "attachments_list",
      "calculator_data"
    ],
    "validation_rules": {
      "required_fields": ["product_title", "product_handle"],
      "data_types": {
        "specifications_json": "valid_json",
        "attachments_list": "file_references"
      }
    }
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, I've identified the testable acceptance criteria and will now convert them into universally quantified properties. After reviewing all properties for redundancy, I've consolidated overlapping properties to ensure each provides unique validation value.

### Property Reflection

After analyzing all testable criteria, I identified several areas of redundancy:
- Multiple responsive breakpoint properties can be combined into comprehensive responsive behavior properties
- Content display properties can be consolidated to avoid testing the same rendering logic multiple times
- Admin interface properties can be grouped by functional area
- Performance and SEO properties can be combined where they test similar technical implementations

### Core Properties

**Property 1: Product Catalog Completeness**
*For any* demo store setup, the product catalog should contain at least 50 industrial/B2B products distributed across manufacturing, industrial equipment, tools, and safety product categories, with each product having complete technical specifications, realistic pricing, inventory levels, and multiple images
**Validates: Requirements 1.1, 1.2, 1.4, 1.5**

**Property 2: Metafield Data Population Completeness**
*For any* product in the demo store, specification metafields should be populated and displayed in organized tables, with relevant products having appropriate attachments (manuals, CAD files, safety sheets)
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 3: Metafield Validation System**
*For any* metafield data input, the validation system should reject invalid data and accept valid data according to the defined schema rules
**Validates: Requirements 2.4**

**Property 4: Bulk Operations Functionality**
*For any* bulk import/export operation, the admin interface should correctly process CSV data and maintain data integrity throughout the operation
**Validates: Requirements 2.5, 16.2**

**Property 5: Complete Preset Configuration**
*For any* of the 12 industry presets, the preset should be fully configured with appropriate content, distinct visual themes, preset-specific homepage templates, correct header/footer combinations, and unique product/collection page layouts
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

**Property 6: Specification Search Functionality**
*For any* search query in the specification search system, the results should be relevant to the query and demonstrate the search functionality with populated data
**Validates: Requirements 4.3**

**Property 7: Cost Calculator Accuracy and Integration**
*For any* cost calculator scenario with realistic industrial product data, the ROI and payback period calculations should be mathematically accurate, and the calculator should integrate properly with product pages and export correctly to PDF format
**Validates: Requirements 5.1, 5.2, 5.4, 5.5**

**Property 8: Cost Calculator Scenario Diversity**
*For any* cost calculator implementation, multiple product scenarios should be included covering equipment, consumables, and services
**Validates: Requirements 5.3**

**Property 9: Marketing Section Responsive Grid Layout**
*For any* viewport width, the Marketing_Section should display the appropriate number of tiles per row: 1 tile on mobile (<768px), 2 tiles on tablet (768px-1024px), and 3-4 tiles on desktop (>1024px), using CSS Grid for layout management
**Validates: Requirements 6.1, 6.2, 6.3, 12.1, 12.2, 12.3, 12.4**

**Property 10: Marketing Section Tile Capacity and Content**
*For any* configuration with up to 12 preset tiles, all tiles should render correctly and display required content elements: preset name, industry focus, visual preview, and "View Template" button
**Validates: Requirements 6.4, 6.5, 9.1**

**Property 11: Marketing Section Content Persistence**
*For any* editable content in the Marketing_Section (titles, descriptions, industry fields, badge text, use cases, template URLs), changes should be saved and persist correctly through Shopify's section settings
**Validates: Requirements 7.5**

**Property 12: Use Case Display Logic**
*For any* preset tile with use case data, up to 5 use cases should be displayed with bullet points or checkmarks, and empty use case fields should not render in the output
**Validates: Requirements 8.1, 8.2, 8.4, 8.5**

**Property 13: Template Navigation Configuration**
*For any* preset tile with a configured template URL, the "View Template" button should have the correct href attribute, support configurable URLs per preset, and open in the same window (no target="_blank")
**Validates: Requirements 9.2, 9.3, 9.5**

**Property 14: Visual Preview Customization**
*For any* preset tile, the visual preview area should display custom background colors when configured, show preset-specific color schemes, and include mockup elements representing the preset's design style
**Validates: Requirements 10.1, 10.2, 10.3, 10.5**

**Property 15: Marketing Enhancement Features**
*For any* preset tile, badges should appear when badge text is provided and not appear when empty, industry-specific value propositions should be displayed, custom badge text should render correctly, and hover effects should be applied via CSS
**Validates: Requirements 11.1, 11.2, 11.4, 11.5**

**Property 16: Marketing Section Accessibility and Performance**
*For any* screen size, the Marketing_Section should maintain readable text (minimum 14px) and clickable buttons (minimum 44px touch targets), while using efficient CSS without external dependencies, CSS transitions for hover effects, and minimal DOM elements
**Validates: Requirements 12.5, 14.1, 14.2, 14.5**

**Property 17: Marketing Section Configuration System**
*For any* Marketing_Section configuration, section titles, subtitles, padding adjustments, background colors, and value indicator toggles should be applied correctly to the rendered section, with default preset tiles included in the schema
**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

**Property 18: System Integration Consistency**
*For any* Marketing_Section implementation, it should follow existing Shopify schema patterns, use consistent CSS variable naming, integrate with existing preset template pages, follow established file naming conventions, and be compatible with existing theme customization options
**Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**

**Property 19: Admin Interface Functionality**
*For any* admin interface operation, validation tools should ensure data quality, templates should be available for common specification formats, and synchronization tools should keep data updated correctly
**Validates: Requirements 16.3, 16.4, 16.5**

**Property 20: Performance and SEO Standards**
*For any* major page in the demo store, PageSpeed Insights scores should be 90+, complete structured data markup should be present for all products, meta tags should be properly optimized, images should be optimized with lazy loading, and PWA functionality should be present and functional
**Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5**

**Property 21: JavaScript-Free Core Functionality**
*For any* core Marketing_Section functionality, it should work correctly without JavaScript dependencies, using only CSS for layout and interactions
**Validates: Requirements 14.3, 14.4**

## Error Handling

### Product Catalog Data Handling

**Missing Product Data**: When products lack required specifications or images, the system should display placeholder content and log warnings for data completion.

**Invalid Metafield Data**: When metafield data doesn't match the expected schema, the validation system should reject the data and provide clear error messages indicating the specific validation failures.

**Bulk Import Errors**: When CSV import operations encounter invalid data, the system should process valid rows and provide detailed error reports for invalid entries, allowing partial imports to succeed.

### Preset Configuration Handling

**Missing Preset Assets**: When preset configurations reference missing template pages or assets, the system should fall back to default configurations and log warnings for missing resources.

**Invalid Preset Data**: When preset configurations contain invalid settings, the system should use default values and continue functioning while alerting administrators to configuration issues.

### Marketing Section Error Handling

**Invalid Template URLs**: When a preset tile lacks a template page URL, the "View Template" button should be disabled or hidden to prevent broken navigation.

**Invalid Color Values**: When custom preview colors are invalid or missing, the section should fall back to default preset-specific color schemes.

**Empty Content Fields**: The section should gracefully handle empty or missing content fields by hiding those elements rather than displaying empty containers.

### Admin Interface Error Handling

**File Upload Failures**: When attachment uploads fail, the system should provide clear error messages and allow users to retry uploads without losing other form data.

**Validation Failures**: When metafield validation fails, the system should highlight specific fields with errors and provide actionable guidance for correction.

**Synchronization Errors**: When data synchronization fails, the system should maintain data integrity and provide rollback capabilities to prevent data corruption.

### Performance and SEO Error Handling

**PageSpeed Optimization Failures**: When performance optimizations fail to achieve target scores, the system should provide diagnostic information and suggestions for improvement.

**Structured Data Validation**: When structured data markup is invalid, the system should log validation errors and provide guidance for correction while maintaining basic functionality.

**PWA Installation Issues**: When PWA features fail to install or function correctly, the system should gracefully degrade to standard web functionality without breaking the user experience.

## Testing Strategy

### Dual Testing Approach

The comprehensive demo store setup system will be validated using both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** will verify:
- Specific examples of product configurations and preset setups
- Edge cases like empty fields, invalid URLs, and missing data
- Integration points between different system components
- Shopify schema validation and admin interface functionality
- Specific feature demonstration pages and calculator scenarios

**Property-Based Tests** will verify:
- Universal properties across all product and preset configurations
- Responsive behavior across viewport ranges for the marketing section
- Content rendering logic with randomized inputs across all systems
- Data validation and bulk operations with various input combinations
- Performance and SEO standards across different page configurations

### Property-Based Testing Configuration

Using **Vitest** with **fast-check** for property-based testing:
- Minimum **100 iterations** per property test
- Each property test tagged with: **Feature: marketing-preset-showcase, Property {number}: {property_text}**
- Tests will generate random product configurations, preset combinations, viewport sizes, and content variations
- Validation will use DOM testing utilities and performance measurement tools to verify rendered output

### Testing Implementation Strategy

**Product Catalog Testing**: Generate random product data with varying completeness to test catalog creation, metafield population, and specification display across different product types.

**Preset Configuration Testing**: Test all 12 preset combinations with randomized content to verify distinct visual themes, proper header/footer combinations, and template integration.

**Marketing Section Testing**: Use viewport simulation to test responsive grid layout behavior, generate random preset configurations with varying content completeness to test conditional rendering logic.

**Admin Interface Testing**: Test bulk operations with various CSV formats and data quality scenarios to verify import/export functionality and validation systems.

**Performance Testing**: Automated PageSpeed Insights testing across major pages to verify 90+ scores, structured data validation, and PWA functionality testing.

**Integration Testing**: Validate that all system components work together correctly, including cost calculator integration with product pages, specification search with populated data, and preset switching functionality.

**Error Handling Testing**: Generate invalid data scenarios to test error handling, validation systems, and graceful degradation across all system components.

The testing strategy ensures that the comprehensive demo store setup maintains high quality, performance, and reliability while providing the flexibility needed for effective theme marketing and demonstration of all system capabilities.

<function_calls>
<invoke name="prework">
<parameter name="featureName">marketing-preset-showcase