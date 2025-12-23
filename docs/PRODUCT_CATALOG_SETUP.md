# Product Catalog Setup Guide

This guide explains how to set up the complete product catalog for the Forge Industrial theme demo store, including 50+ industrial/B2B products with technical specifications and attachments.

## Overview

The product catalog system generates:
- **55 industrial/B2B products** across 4 main categories
- **Complete technical specifications** with metafield data
- **Product attachments** (manuals, CAD files, certificates)
- **Product images** (SVG placeholders with category styling)
- **Collection structure** for organizing products
- **CSV import file** for Shopify

## Generated Files

### Core Data Files
- `config/generated/products-import.csv` - Shopify product import file
- `config/generated/metafield-data.json` - Technical specifications and attachments
- `config/generated/catalog-summary.json` - Generation summary and statistics

### Asset Files
- `config/generated/images/` - Product image assets (SVG format)
- `config/generated/images/image-manifest.json` - Image reference file
- `config/generated/collections-structure.json` - Collection definitions

## Product Categories

### Manufacturing Equipment (17 products)
- **Base Products**: Oil Skimmer ZS-1000, Coolant Management System CMS-2000
- **Additional Products**: CNC machines, lathes, mills, grinders, plasma cutters, etc.
- **Price Range**: $2,499 - $15,000
- **Features**: Complete technical specifications, CAD files, operation manuals

### Industrial Equipment (11 products)
- **Base Products**: Heavy Duty Conveyor Belt System
- **Additional Products**: Air compressors, generators, forklifts, cranes, etc.
- **Price Range**: $8,000 - $18,000
- **Features**: Heavy-duty specifications, installation manuals, compliance certificates

### Professional Tools (16 products)
- **Base Products**: Professional Welding Station WS-300
- **Additional Products**: Power tools, hand tools, precision instruments
- **Price Range**: $150 - $3,200
- **Features**: Professional specifications, operation guides, safety documentation

### Safety Equipment (11 products)
- **Base Products**: Industrial Safety Cabinet SC-45
- **Additional Products**: PPE, safety storage, emergency equipment
- **Price Range**: $25 - $1,200
- **Features**: OSHA compliance, safety data sheets, certification documents

## Setup Instructions

### 1. Generate Product Data

Run the product catalog generator:

```bash
node config/product-catalog-generator.js
```

This creates all the core data files in `config/generated/`.

### 2. Generate Product Assets

Run the image asset manager:

```bash
node config/product-image-manager.js
```

This creates product images and collection structure files.

### 3. Import Products to Shopify

1. **Upload the CSV file**:
   - Go to Shopify Admin → Products → Import
   - Upload `config/generated/products-import.csv`
   - Map the columns and import

2. **Create Collections**:
   - Use the collection definitions in `collections-structure.json`
   - Create each collection manually or via API
   - Assign products to appropriate collections

### 4. Upload Product Images

1. **Upload SVG images**:
   - Upload images from `config/generated/images/` to Shopify Files
   - Assign primary images to products
   - Use thumbnails for collection pages

2. **Alternative**: Replace with real product photos for production use

### 5. Populate Metafield Data

Use the enhanced admin interface (Task 2.1) to bulk import specification data:

1. **Access Admin Interface**: `/admin/metafields` (when implemented)
2. **Import Specifications**: Use `metafield-data.json` for bulk import
3. **Validate Data**: Run validation tools to ensure data quality

## Product Specifications Structure

Each product includes structured technical specifications:

```json
{
  "specifications": {
    "dimensions": {
      "length": { "value": "24", "unit": "in", "tolerance": "±0.5" },
      "width": { "value": "18", "unit": "in", "tolerance": "±0.5" },
      "height": { "value": "36", "unit": "in", "tolerance": "±1" },
      "weight": { "value": "85", "unit": "lbs" }
    },
    "performance": {
      "flow_rate": { "value": "10", "unit": "GPM", "range": "5-15" },
      "efficiency": { "value": "95", "unit": "%", "description": "Oil removal efficiency" }
    },
    "electrical": {
      "voltage": { "value": "120", "unit": "VAC" },
      "power": { "value": "0.5", "unit": "HP" }
    }
  }
}
```

## Product Attachments Structure

Each product includes relevant documentation:

```json
{
  "files": [
    {
      "name": "Installation Manual",
      "url": "/files/product-manual.pdf",
      "type": "pdf",
      "category": "manuals",
      "description": "Complete installation guide",
      "featured": true
    },
    {
      "name": "3D CAD Model",
      "url": "/files/product-model.step",
      "type": "step", 
      "category": "cad",
      "access_level": "customer"
    }
  ]
}
```

## Customization Options

### Adding More Products

1. **Edit the generator**: Modify `config/product-catalog-generator.js`
2. **Add to categories**: Extend existing categories or create new ones
3. **Regenerate**: Run the generator script again

### Custom Specifications

1. **Modify spec structure**: Update specification templates in the generator
2. **Add new categories**: Define new specification categories
3. **Update validation**: Ensure metafield validation supports new fields

### Real Product Images

1. **Replace SVG placeholders**: Upload real product photography
2. **Maintain naming convention**: Use the same file naming pattern
3. **Update manifest**: Modify `image-manifest.json` with new image references

## Integration with Theme Features

### Product Comparison
- Products automatically support comparison functionality
- Specifications are structured for easy comparison
- Comparison widget uses metafield data

### Cost Calculator
- Products include cost data for ROI calculations
- Calculator scenarios use realistic product pricing
- Integration with product pages for instant calculations

### Search & Filtering
- Products are tagged for advanced search
- Specifications support filtered search
- Category structure enables faceted navigation

### SEO Optimization
- Products include optimized titles and descriptions
- Structured data markup for rich snippets
- Category-specific SEO optimization

## Maintenance

### Regular Updates
- **Pricing**: Update product pricing based on market conditions
- **Specifications**: Keep technical data current
- **Attachments**: Update documentation and certifications

### Quality Assurance
- **Data Validation**: Run validation tools regularly
- **Link Checking**: Verify attachment URLs are working
- **Image Optimization**: Ensure images load quickly

### Performance Monitoring
- **Page Speed**: Monitor product page load times
- **Search Performance**: Track search and filter usage
- **Conversion Rates**: Monitor product page conversion rates

## Troubleshooting

### Common Issues

**CSV Import Errors**:
- Check column mapping in Shopify import
- Verify data formatting (quotes, commas)
- Ensure SKUs are unique

**Metafield Issues**:
- Validate JSON structure
- Check metafield definitions match schema
- Verify namespace and key naming

**Image Problems**:
- Ensure SVG files are valid
- Check file permissions and accessibility
- Verify image URLs in product data

### Support Resources

- **Shopify Documentation**: Product import and metafield guides
- **Theme Documentation**: Integration with existing theme features
- **Generator Scripts**: Modify scripts for custom requirements

## Next Steps

After completing the product catalog setup:

1. **Implement Task 2**: Metafield data population system
2. **Configure Task 3**: Complete preset system setup
3. **Build Task 4**: Feature demonstration system
4. **Test Integration**: Verify all systems work together

This product catalog provides the foundation for demonstrating all theme capabilities with realistic industrial/B2B product data.