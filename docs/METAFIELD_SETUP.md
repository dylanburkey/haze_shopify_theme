# Product Specification System - Metafield Setup

## Overview

The Product Specification System uses Shopify's native metafield infrastructure to store structured technical specifications and file attachments. This document explains how to set up and use the metafield structure.

## Metafield Namespaces

### specifications.technical
Stores structured technical specification data with categories, values, units, and tolerances.

**Type:** JSON  
**Validation:** See `config/schemas/specification_schema.json`

### specifications.categories  
Stores category definitions for organizing specifications.

**Type:** JSON  
**Validation:** Category structure with name, order, and collapsible properties

### attachments.files
Stores structured file attachment data with categories and metadata.

**Type:** JSON  
**Validation:** See `config/schemas/attachment_schema.json`

### attachments.categories
Stores category definitions for organizing file attachments.

**Type:** JSON  
**Validation:** Category structure with name, icon, and order properties

## Setting Up Metafields

### Option 1: Shopify Admin (Manual)

1. Go to **Settings → Custom data → Products**
2. Click **Add definition**
3. Create each metafield using the definitions in `config/metafield_definitions.json`

### Option 2: Shopify CLI (Automated)

```bash
# Import metafield definitions
shopify app generate schema --type=metafield_definition --from=config/metafield_definitions.json
```

### Option 3: Admin API (Programmatic)

Use the metafield definitions in `config/metafield_definitions.json` with the Admin API to create metafields programmatically.

## Data Structure Examples

### Technical Specifications

See `config/examples/specification_example.json` for a complete example.

Key features:
- **Categories**: Group related specifications (dimensions, performance, materials, etc.)
- **Values with Units**: Store value and unit separately for proper formatting
- **Tolerances**: Support ±tolerance specifications for manufacturing
- **Ranges**: Support min/max ranges for operating parameters
- **Rich Descriptions**: HTML descriptions for detailed explanations

### File Attachments

See `config/examples/attachment_example.json` for a complete example.

Key features:
- **Categorized Files**: Group files by type (manuals, CAD, certificates, etc.)
- **Access Control**: Public, customer-only, or wholesale-only access
- **File Metadata**: Size, type, description for better organization
- **Featured Files**: Highlight important files
- **Display Order**: Control file ordering within categories

## Usage in Liquid Templates

### Accessing Specifications

```liquid
{%- assign specs = product.metafields.specifications.technical -%}
{%- if specs != blank -%}
  {%- assign spec_data = specs | parse_json -%}
  
  {%- for category_key in spec_data.categories -%}
    {%- assign category = spec_data.categories[category_key] -%}
    <h3>{{ category.name }}</h3>
    
    {%- for spec_key in spec_data.specifications[category_key] -%}
      {%- assign spec = spec_data.specifications[category_key][spec_key] -%}
      <tr>
        <td>{{ spec.display_name | default: spec_key | capitalize }}</td>
        <td>
          {{ spec.value }}
          {%- if spec.unit -%} {{ spec.unit }}{%- endif -%}
          {%- if spec.tolerance -%} {{ spec.tolerance }}{%- endif -%}
        </td>
      </tr>
    {%- endfor -%}
  {%- endfor -%}
{%- endif -%}
```

### Accessing Attachments

```liquid
{%- assign attachments = product.metafields.attachments.files -%}
{%- if attachments != blank -%}
  {%- assign attachment_data = attachments | parse_json -%}
  
  {%- for file in attachment_data.files -%}
    <a href="{{ file.url }}" target="_blank">
      {{ file.name }} ({{ file.size }})
    </a>
  {%- endfor -%}
{%- endif -%}
```

## Migration from Existing System

If you have existing specifications in the current `specs` namespace, you can migrate them to the new structured format:

1. Export existing metafield data
2. Transform to new JSON structure using the examples as templates
3. Import to new `specifications.technical` metafield
4. Update templates to use new structure
5. Remove old metafields once migration is complete

## Validation and Testing

- Use the JSON schemas in `config/schemas/` to validate data structure
- Test with the example data in `config/examples/`
- Verify data displays correctly in product templates
- Test responsive behavior on mobile devices

## Performance Considerations

- JSON metafields are parsed on each page load
- Cache parsed data in Liquid variables when possible
- Consider metafield size limits (64KB per metafield)
- Use multiple metafields if data exceeds limits

## Troubleshooting

### Common Issues

1. **JSON Parse Errors**: Validate JSON structure using online validators
2. **Missing Data**: Check metafield namespace and key spelling
3. **Display Issues**: Verify Liquid template syntax and variable assignments
4. **Performance**: Monitor page load times with large specification datasets

### Debug Mode

Add this to templates for debugging:

```liquid
<!-- Debug: Raw metafield data -->
{{ product.metafields.specifications.technical }}

<!-- Debug: Parsed data -->
{%- assign debug_specs = product.metafields.specifications.technical | parse_json -%}
{{ debug_specs | json }}
```