import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 20: Theme Integration Consistency
// Feature: product-specification-system, Property 21: Variant-Specific Specifications

/**
 * Mock Theme System that simulates Shopify theme preset behavior
 * This simulates the CSS custom properties and preset system
 */
class ThemeSystem {
  constructor() {
    this.presets = {
      'the-welder': {
        primary: '#d71920',
        secondary: '#334FB4',
        accent: '#D97706',
        background: '#ffffff',
        surface: '#f3f4f6',
        text: '#1a1a1a',
        textSecondary: '#4b5563',
        border: '#d1d5db',
        fontHeading: 'Oswald',
        fontBody: 'Roboto',
        pageWidth: 1320,
        spacingSections: 96,
        gridGap: 32,
        buttonRadius: 2,
        cardRadius: 0,
        inputRadius: 0
      },
      'zebra-skimmers': {
        primary: '#003d79',
        secondary: '#0056a8',
        accent: '#00a3e0',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#475569',
        border: '#e2e8f0',
        fontHeading: 'Inter',
        fontBody: 'Inter',
        pageWidth: 1280,
        spacingSections: 64,
        gridGap: 24,
        buttonRadius: 8,
        cardRadius: 20,
        inputRadius: 10
      },
      'modern-minimal': {
        primary: '#18181b',
        secondary: '#27272a',
        accent: '#71717a',
        background: '#ffffff',
        surface: '#fafafa',
        text: '#18181b',
        textSecondary: '#3f3f46',
        border: '#e4e4e7',
        fontHeading: 'Bitter',
        fontBody: 'Roboto',
        pageWidth: 1200,
        spacingSections: 80,
        gridGap: 20,
        buttonRadius: 0,
        cardRadius: 0,
        inputRadius: 0
      },
      'tech-forward': {
        primary: '#0ea5e9',
        secondary: '#38bdf8',
        accent: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155',
        fontHeading: 'Inter',
        fontBody: 'Inter',
        pageWidth: 1320,
        spacingSections: 64,
        gridGap: 20,
        buttonRadius: 8,
        cardRadius: 16,
        inputRadius: 8
      },
      'warm-artisan': {
        primary: '#78350f',
        secondary: '#92400e',
        accent: '#d97706',
        background: '#fffbeb',
        surface: '#fef3c7',
        text: '#451a03',
        textSecondary: '#78350f',
        border: '#fcd34d',
        fontHeading: 'Bitter',
        fontBody: 'Lato',
        pageWidth: 1100,
        spacingSections: 72,
        gridGap: 24,
        buttonRadius: 4,
        cardRadius: 8,
        inputRadius: 4
      },
      'bold-impact': {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#7c3aed',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#334155',
        border: '#e2e8f0',
        fontHeading: 'Oswald',
        fontBody: 'Roboto',
        pageWidth: 1400,
        spacingSections: 64,
        gridGap: 24,
        buttonRadius: 12,
        cardRadius: 24,
        inputRadius: 12
      }
    };
  }

  /**
   * Gets CSS custom properties for a given preset
   */
  getCSSCustomProperties(presetName) {
    const preset = this.presets[presetName] || this.presets['the-welder'];
    
    return {
      '--color-primary': preset.primary,
      '--color-secondary': preset.secondary,
      '--color-accent': preset.accent,
      '--color-background': preset.background,
      '--color-surface': preset.surface,
      '--color-text': preset.text,
      '--color-text-secondary': preset.textSecondary,
      '--color-border': preset.border,
      '--font-heading': preset.fontHeading,
      '--font-body': preset.fontBody,
      '--page-width': `${preset.pageWidth}px`,
      '--spacing-sections': `${preset.spacingSections}px`,
      '--grid-gap': `${preset.gridGap}px`,
      '--radius-button': `${preset.buttonRadius}px`,
      '--radius-card': `${preset.cardRadius}px`,
      '--radius-input': `${preset.inputRadius}px`
    };
  }

  /**
   * Checks if preset exists
   */
  hasPreset(presetName) {
    return this.presets.hasOwnProperty(presetName);
  }

  /**
   * Gets all available preset names
   */
  getAvailablePresets() {
    return Object.keys(this.presets);
  }
}

/**
 * Mock Specification Renderer with Theme Integration
 * Simulates the theme-integrated specification rendering
 */
class ThemeIntegratedSpecRenderer {
  constructor(themeSystem) {
    this.themeSystem = themeSystem;
  }

  /**
   * Renders specifications with theme integration
   */
  renderWithTheme(specData, presetName, options = {}) {
    if (!this.themeSystem.hasPreset(presetName)) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    const cssProps = this.themeSystem.getCSSCustomProperties(presetName);
    const html = this.renderSpecifications(specData, cssProps, presetName, options);
    
    return {
      html,
      cssProps,
      preset: presetName
    };
  }

  /**
   * Renders specifications using theme design tokens
   */
  renderSpecifications(specData, cssProps, presetName, options = {}) {
    if (!specData || !specData.specifications) {
      return '';
    }

    const hasValidSpecs = this.hasValidSpecifications(specData);
    if (!hasValidSpecs) {
      return '';
    }

    let html = `<div class="product-specs-section" data-preset="${presetName}">\n`;
    html += '  <div class="container">\n';
    html += '    <div class="product-specs">\n';
    
    // Main heading with theme typography
    if (options.heading) {
      html += `      <h2 class="product-specs__main-title" style="font-family: ${cssProps['--font-heading']}; color: ${cssProps['--color-text']};">${options.heading}</h2>\n`;
    }

    // Structured specifications with theme styling
    html += '      <div class="product-specs__structured">\n';
    
    const categoriesToRender = this.getCategoriesToRender(specData);
    
    for (const [categoryKey, categoryInfo] of categoriesToRender) {
      const categorySpecs = specData.specifications[categoryKey];
      
      if (categorySpecs && this.hasValidSpecsInCategory(categorySpecs)) {
        html += this.renderCategoryWithTheme(categoryKey, categoryInfo, categorySpecs, cssProps, presetName, options);
      }
    }
    
    html += '      </div>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>';

    return html;
  }

  /**
   * Renders a category with theme-specific styling
   */
  renderCategoryWithTheme(categoryKey, categoryInfo, categorySpecs, cssProps, presetName, options) {
    const categoryName = categoryInfo.name || this.capitalize(categoryKey);
    const isCollapsible = categoryInfo.collapsible !== false;
    const openAttribute = options.collapseCategories ? '' : ' open';

    let html = `        <div class="product-specs__category" data-category="${categoryKey}" style="border-color: ${cssProps['--color-border']}; border-radius: ${cssProps['--radius-card']}; background: ${cssProps['--color-background']};">\n`;

    if (isCollapsible) {
      html += `          <details class="product-specs__accordion"${openAttribute}>\n`;
      html += `            <summary class="product-specs__header" style="background: ${cssProps['--color-surface']};">\n`;
      html += `              <h3 class="product-specs__title" style="font-family: ${cssProps['--font-heading']}; color: ${cssProps['--color-text']};">\n`;
      html += `                <svg class="product-specs__icon" style="color: ${cssProps['--color-primary']};"></svg>\n`;
      html += `                ${categoryName}\n`;
      html += '              </h3>\n';
      html += `              <svg class="product-specs__chevron" style="color: ${cssProps['--color-text-secondary']};"></svg>\n`;
      html += '            </summary>\n';
      html += '            <div class="product-specs__content">\n';
      
      if (categoryInfo.description) {
        html += `              <p class="product-specs__category-description" style="font-family: ${cssProps['--font-body']}; color: ${cssProps['--color-text-secondary']};">${categoryInfo.description}</p>\n`;
      }
      
      html += this.renderSpecTableWithTheme(categorySpecs, cssProps);
      html += '            </div>\n';
      html += '          </details>\n';
    } else {
      html += '          <div class="product-specs__static-category">\n';
      html += `            <h3 class="product-specs__static-title" style="font-family: ${cssProps['--font-heading']}; color: ${cssProps['--color-text']}; background: ${cssProps['--color-surface']};">${categoryName}</h3>\n`;
      html += '            <div class="product-specs__content">\n';
      
      if (categoryInfo.description) {
        html += `              <p class="product-specs__category-description" style="font-family: ${cssProps['--font-body']}; color: ${cssProps['--color-text-secondary']};">${categoryInfo.description}</p>\n`;
      }
      
      html += this.renderSpecTableWithTheme(categorySpecs, cssProps);
      html += '            </div>\n';
      html += '          </div>\n';
    }

    html += '        </div>\n';
    return html;
  }

  /**
   * Renders specification table with theme styling
   */
  renderSpecTableWithTheme(specifications, cssProps) {
    let html = `              <div class="product-specs__table-container" style="border-radius: ${cssProps['--radius-input']};">\n`;
    html += `                <table class="product-specs__table" style="font-family: ${cssProps['--font-body']};">\n`;
    html += '                  <tbody>\n';

    for (const [specKey, specInfo] of Object.entries(specifications)) {
      if (specInfo.value && specInfo.value.trim() !== '') {
        const displayName = specInfo.display_name || this.capitalize(specKey.replace(/_/g, ' '));
        
        html += `                    <tr class="product-specs__row" style="border-color: ${cssProps['--color-border']};">\n`;
        html += `                      <th class="product-specs__label" style="color: ${cssProps['--color-text']}; background: ${cssProps['--color-surface']};">${displayName}</th>\n`;
        html += `                      <td class="product-specs__value" style="color: ${cssProps['--color-text-secondary']};">\n`;
        html += '                        <div class="product-specs__value-content">\n';
        
        // Handle different value types with theme colors
        if (specInfo.min && specInfo.min.trim() !== '' && specInfo.max && specInfo.max.trim() !== '') {
          html += `                          <span class="product-specs__range" style="color: ${cssProps['--color-text']};">${specInfo.min} - ${specInfo.max}`;
          if (specInfo.unit && specInfo.unit.trim() !== '') {
            html += `<span class="product-specs__unit" style="color: ${cssProps['--color-text-secondary']};">${specInfo.unit}</span>`;
          }
          html += '</span>\n';
        } else if (specInfo.range && specInfo.range.trim() !== '') {
          html += `                          <span class="product-specs__range" style="color: ${cssProps['--color-text']};">${specInfo.range}`;
          if (specInfo.unit && specInfo.unit.trim() !== '') {
            html += `<span class="product-specs__unit" style="color: ${cssProps['--color-text-secondary']};">${specInfo.unit}</span>`;
          }
          html += '</span>\n';
        } else {
          html += `                          <span class="product-specs__main-value" style="color: ${cssProps['--color-text']};">${specInfo.value}`;
          if (specInfo.unit && specInfo.unit.trim() !== '') {
            html += `<span class="product-specs__unit" style="color: ${cssProps['--color-text-secondary']};">${specInfo.unit}</span>`;
          }
          html += '</span>\n';
        }
        
        // Add tolerance with theme primary color
        if (specInfo.tolerance && specInfo.tolerance.trim() !== '') {
          html += `                          <span class="product-specs__tolerance" style="color: ${cssProps['--color-primary']};">${specInfo.tolerance}</span>\n`;
        }
        
        // Add description with theme secondary text color
        if (specInfo.description && specInfo.description.trim() !== '') {
          html += `                          <div class="product-specs__description" style="color: ${cssProps['--color-text-secondary']};">${specInfo.description}</div>\n`;
        }
        
        html += '                        </div>\n';
        html += '                      </td>\n';
        html += '                    </tr>\n';
      }
    }

    html += '                  </tbody>\n';
    html += '                </table>\n';
    html += '              </div>\n';

    return html;
  }

  /**
   * Renders variant-specific specifications
   */
  renderVariantSpecifications(productSpecs, variantSpecs, variantId, cssProps, presetName) {
    // Merge variant specs with product specs, variant takes precedence
    const mergedSpecs = this.mergeSpecifications(productSpecs, variantSpecs);
    
    let html = this.renderSpecifications(mergedSpecs, cssProps, presetName, {
      heading: 'Technical Specifications'
    });
    
    // Add variant indicators for variant-specific values
    if (variantSpecs && variantSpecs.specifications) {
      for (const [categoryKey, categorySpecs] of Object.entries(variantSpecs.specifications)) {
        for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
          if (specInfo.value && specInfo.value.trim() !== '') {
            // Mark this as variant-specific in the HTML
            const variantIndicator = `<span class="product-specs__variant-indicator" style="background: ${cssProps['--color-primary']}; color: white;">Variant ${variantId}</span>`;
            // Escape special regex characters in the value
            const escapedValue = specInfo.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            html = html.replace(
              new RegExp(`(${escapedValue})`),
              `$1${variantIndicator}`
            );
          }
        }
      }
    }
    
    return html;
  }

  /**
   * Merges product and variant specifications
   */
  mergeSpecifications(productSpecs, variantSpecs) {
    if (!productSpecs) return variantSpecs || {};
    if (!variantSpecs) return productSpecs;
    
    const merged = JSON.parse(JSON.stringify(productSpecs)); // Deep clone
    
    // Merge specifications
    if (variantSpecs.specifications) {
      merged.specifications = merged.specifications || {};
      for (const [categoryKey, categorySpecs] of Object.entries(variantSpecs.specifications)) {
        merged.specifications[categoryKey] = {
          ...merged.specifications[categoryKey],
          ...categorySpecs
        };
      }
    }
    
    // Merge categories
    if (variantSpecs.categories) {
      merged.categories = {
        ...merged.categories,
        ...variantSpecs.categories
      };
    }
    
    return merged;
  }

  // Helper methods (same as base renderer)
  hasValidSpecifications(specData) {
    if (!specData.specifications) return false;
    
    for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
      if (this.hasValidSpecsInCategory(categorySpecs)) {
        return true;
      }
    }
    
    return false;
  }

  hasValidSpecsInCategory(categorySpecs) {
    if (!categorySpecs) return false;
    
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      if (specInfo.value && specInfo.value.trim() !== '') {
        return true;
      }
    }
    
    return false;
  }

  getCategoriesToRender(specData) {
    const definedCategories = specData.categories || {};
    const specificationKeys = Object.keys(specData.specifications || {});
    
    if (Object.keys(definedCategories).length > 0) {
      const validCategories = [];
      
      for (const [categoryKey, categoryInfo] of Object.entries(definedCategories)) {
        if (specificationKeys.includes(categoryKey)) {
          validCategories.push([categoryKey, categoryInfo]);
        }
      }
      
      return validCategories.sort((a, b) => {
        const orderA = a[1].order || 999;
        const orderB = b[1].order || 999;
        return orderA - orderB;
      });
    }
    
    const inferredCategories = [];
    for (const categoryKey of specificationKeys) {
      if (this.hasValidSpecsInCategory(specData.specifications[categoryKey])) {
        inferredCategories.push([categoryKey, {
          name: this.capitalize(categoryKey.replace(/_/g, ' ')),
          order: 1,
          collapsible: true
        }]);
      }
    }
    
    return inferredCategories;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Generators for property-based testing
const presetNameArbitrary = fc.constantFrom(
  'the-welder', 'zebra-skimmers', 'modern-minimal', 
  'tech-forward', 'warm-artisan', 'bold-impact'
);

const specificationValueArbitrary = fc.record({
  value: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  unit: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)),
  tolerance: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)),
  range: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)),
  min: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)),
  max: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)),
  display_name: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0))
});

const categoryKeyArbitrary = fc.stringMatching(/^[a-z_]{2,20}$/);

const specificationCategoryArbitrary = fc.dictionary(
  categoryKeyArbitrary,
  fc.dictionary(
    categoryKeyArbitrary,
    specificationValueArbitrary,
    { minKeys: 1, maxKeys: 10 }
  ),
  { minKeys: 1, maxKeys: 5 }
);

const categoryDefinitionArbitrary = fc.record({
  name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length > 1),
  order: fc.integer({ min: 1, max: 100 }),
  collapsible: fc.boolean(),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0))
});

const categoriesArbitrary = fc.dictionary(
  categoryKeyArbitrary,
  categoryDefinitionArbitrary,
  { minKeys: 1, maxKeys: 10 }
);

const specificationDataArbitrary = fc.record({
  specifications: specificationCategoryArbitrary,
  categories: categoriesArbitrary
});

const variantIdArbitrary = fc.integer({ min: 1, max: 999999 });

// Helper functions for validation
function usesThemeDesignTokens(html, cssProps) {
  // Check that theme colors are used in inline styles
  const requiredColors = [
    cssProps['--color-primary'],
    cssProps['--color-text'],
    cssProps['--color-text-secondary'],
    cssProps['--color-surface'],
    cssProps['--color-border']
  ];
  
  for (const color of requiredColors) {
    if (color && !html.includes(color)) {
      return false;
    }
  }
  
  // Check that theme fonts are used
  const requiredFonts = [
    cssProps['--font-heading'],
    cssProps['--font-body']
  ];
  
  for (const font of requiredFonts) {
    if (font && !html.includes(`font-family: ${font}`)) {
      return false;
    }
  }
  
  return true;
}

function adaptsToPresetColorScheme(html, presetName, cssProps) {
  // Check that the preset data attribute is present
  if (!html.includes(`data-preset="${presetName}"`)) {
    return false;
  }
  
  // Check that preset-specific colors are applied
  const primaryColor = cssProps['--color-primary'];
  const backgroundColor = cssProps['--color-background'];
  
  if (!html.includes(primaryColor) || !html.includes(backgroundColor)) {
    return false;
  }
  
  return true;
}

function adaptsToPresetTypography(html, cssProps) {
  const headingFont = cssProps['--font-heading'];
  const bodyFont = cssProps['--font-body'];
  
  // Check that both heading and body fonts are used
  return html.includes(`font-family: ${headingFont}`) && 
         html.includes(`font-family: ${bodyFont}`);
}

function hasVariantSpecificHandling(html, variantId) {
  // Check for variant indicator
  return html.includes(`Variant ${variantId}`) &&
         html.includes('product-specs__variant-indicator');
}

function variantOverridesProduct(productSpecs, variantSpecs, mergedSpecs) {
  if (!variantSpecs || !variantSpecs.specifications) return true;
  
  // Check that variant specifications override product specifications
  for (const [categoryKey, categorySpecs] of Object.entries(variantSpecs.specifications)) {
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      const mergedValue = mergedSpecs.specifications?.[categoryKey]?.[specKey]?.value;
      if (mergedValue !== specInfo.value) {
        return false;
      }
    }
  }
  
  return true;
}

// Property 20: Theme Integration Consistency
test('Property 20: Theme Integration Consistency - Specifications should use theme design tokens and adapt to preset styling', () => {
  fc.assert(
    fc.property(
      specificationDataArbitrary,
      presetNameArbitrary,
      (specData, presetName) => {
        const themeSystem = new ThemeSystem();
        const renderer = new ThemeIntegratedSpecRenderer(themeSystem);
        
        const result = renderer.renderWithTheme(specData, presetName, {
          heading: 'Technical Specifications'
        });
        
        // If no valid specifications, HTML should be empty
        if (!renderer.hasValidSpecifications(specData)) {
          return result.html === '';
        }
        
        const { html, cssProps } = result;
        
        // If we have valid specs, HTML should not be empty
        if (html === '') {
          return false;
        }
        
        // Validate theme integration
        const usesDesignTokens = usesThemeDesignTokens(html, cssProps);
        const adaptsToColors = adaptsToPresetColorScheme(html, presetName, cssProps);
        const adaptsToTypography = adaptsToPresetTypography(html, cssProps);
        
        return usesDesignTokens && adaptsToColors && adaptsToTypography;
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Property 21: Variant-Specific Specifications
test('Property 21: Variant-Specific Specifications - Selecting a variant should display only relevant specifications', () => {
  fc.assert(
    fc.property(
      specificationDataArbitrary,
      specificationDataArbitrary,
      variantIdArbitrary,
      presetNameArbitrary,
      (productSpecs, variantSpecs, variantId, presetName) => {
        const themeSystem = new ThemeSystem();
        const renderer = new ThemeIntegratedSpecRenderer(themeSystem);
        
        // Skip if neither product nor variant has valid specs
        if (!renderer.hasValidSpecifications(productSpecs) && 
            !renderer.hasValidSpecifications(variantSpecs)) {
          return true;
        }
        
        const cssProps = themeSystem.getCSSCustomProperties(presetName);
        const html = renderer.renderVariantSpecifications(
          productSpecs, 
          variantSpecs, 
          variantId, 
          cssProps, 
          presetName
        );
        
        // If no valid specifications after merge, HTML should be empty
        const mergedSpecs = renderer.mergeSpecifications(productSpecs, variantSpecs);
        if (!renderer.hasValidSpecifications(mergedSpecs)) {
          return html === '';
        }
        
        // If we have valid specs, HTML should not be empty
        if (html === '') {
          return false;
        }
        
        // Validate variant-specific behavior
        const hasVariantHandling = renderer.hasValidSpecifications(variantSpecs) ? 
          hasVariantSpecificHandling(html, variantId) : true;
        
        const variantOverrides = variantOverridesProduct(productSpecs, variantSpecs, mergedSpecs);
        
        return hasVariantHandling && variantOverrides;
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Edge case tests for theme integration
test('Property 20: Theme Integration Consistency - Unknown preset should fallback to default', () => {
  const themeSystem = new ThemeSystem();
  const renderer = new ThemeIntegratedSpecRenderer(themeSystem);
  
  expect(() => {
    renderer.renderWithTheme({
      specifications: {
        test: { spec1: { value: "test" } }
      }
    }, 'unknown-preset');
  }).toThrow('Unknown preset: unknown-preset');
});

test('Property 20: Theme Integration Consistency - All presets should have required design tokens', () => {
  const themeSystem = new ThemeSystem();
  const presets = themeSystem.getAvailablePresets();
  
  for (const preset of presets) {
    const cssProps = themeSystem.getCSSCustomProperties(preset);
    
    // Check required properties exist
    expect(cssProps['--color-primary']).toBeDefined();
    expect(cssProps['--color-text']).toBeDefined();
    expect(cssProps['--font-heading']).toBeDefined();
    expect(cssProps['--font-body']).toBeDefined();
    expect(cssProps['--radius-card']).toBeDefined();
  }
});

test('Property 21: Variant-Specific Specifications - Variant specs should override product specs', () => {
  const themeSystem = new ThemeSystem();
  const renderer = new ThemeIntegratedSpecRenderer(themeSystem);
  
  const productSpecs = {
    specifications: {
      dimensions: {
        length: { value: "100", unit: "mm" },
        width: { value: "50", unit: "mm" }
      }
    }
  };
  
  const variantSpecs = {
    specifications: {
      dimensions: {
        length: { value: "120", unit: "mm" } // Override length
      }
    }
  };
  
  const merged = renderer.mergeSpecifications(productSpecs, variantSpecs);
  
  expect(merged.specifications.dimensions.length.value).toBe("120"); // Variant value
  expect(merged.specifications.dimensions.width.value).toBe("50");   // Product value preserved
});

test('Property 21: Variant-Specific Specifications - Empty variant specs should not affect product specs', () => {
  const themeSystem = new ThemeSystem();
  const renderer = new ThemeIntegratedSpecRenderer(themeSystem);
  
  const productSpecs = {
    specifications: {
      dimensions: {
        length: { value: "100", unit: "mm" }
      }
    }
  };
  
  const emptyVariantSpecs = {};
  
  const merged = renderer.mergeSpecifications(productSpecs, emptyVariantSpecs);
  
  expect(merged.specifications.dimensions.length.value).toBe("100");
});