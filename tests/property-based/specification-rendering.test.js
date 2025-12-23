import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 1: Specification Rendering Completeness

/**
 * Mock HTML renderer that simulates the Liquid template rendering
 * This simulates the behavior of sections/product-specs.liquid and snippets/product-specs-table.liquid
 */
class SpecificationRenderer {
  constructor() {
    this.rendered = '';
  }

  /**
   * Renders specification data into HTML structure
   * Simulates the Liquid template logic from product-specs.liquid
   */
  renderSpecifications(specData, options = {}) {
    if (!specData || !specData.specifications) {
      return '';
    }

    const { 
      heading = 'Technical Specifications',
      collapseCategories = false,
      useMetafields = true 
    } = options;

    // Check if we have any valid specifications to display
    const hasValidSpecs = this.hasValidSpecifications(specData);
    if (!hasValidSpecs) {
      return '';
    }

    let html = '<div class="product-specs-section">\n';
    html += '  <div class="container">\n';
    html += '    <div class="product-specs">\n';
    
    // Main heading
    if (heading) {
      html += `      <h2 class="product-specs__main-title">${heading}</h2>\n`;
    }

    // Structured metafield specifications
    if (useMetafields && specData.specifications) {
      html += '      <div class="product-specs__structured">\n';
      
      // Get categories to render (either defined categories or inferred from specifications)
      const categoriesToRender = this.getCategoriesToRender(specData);
      
      for (const [categoryKey, categoryInfo] of categoriesToRender) {
        const categorySpecs = specData.specifications[categoryKey];
        
        if (categorySpecs && this.hasValidSpecsInCategory(categorySpecs)) {
          html += this.renderCategory(categoryKey, categoryInfo, categorySpecs, collapseCategories);
        }
      }
      
      html += '      </div>\n';
    }

    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>';

    return html;
  }

  /**
   * Checks if the specification data has any valid specifications to display
   */
  hasValidSpecifications(specData) {
    if (!specData.specifications) return false;
    
    for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
      if (this.hasValidSpecsInCategory(categorySpecs)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Checks if a category has any valid specifications (non-empty, non-whitespace values)
   */
  hasValidSpecsInCategory(categorySpecs) {
    if (!categorySpecs) return false;
    
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      if (specInfo.value && specInfo.value.trim() !== '') {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Gets the categories to render, either from defined categories or inferred from specifications
   */
  getCategoriesToRender(specData) {
    const definedCategories = specData.categories || {};
    const specificationKeys = Object.keys(specData.specifications || {});
    
    // If we have defined categories, use only those that have corresponding specifications
    if (Object.keys(definedCategories).length > 0) {
      const validCategories = [];
      
      for (const [categoryKey, categoryInfo] of Object.entries(definedCategories)) {
        if (specificationKeys.includes(categoryKey)) {
          validCategories.push([categoryKey, categoryInfo]);
        }
      }
      
      // Sort by order
      return validCategories.sort((a, b) => {
        const orderA = a[1].order || 999;
        const orderB = b[1].order || 999;
        return orderA - orderB;
      });
    }
    
    // If no defined categories, create default categories from specification keys
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

  /**
   * Sorts categories by their order property
   */
  sortCategoriesByOrder(categories) {
    return Object.entries(categories).sort((a, b) => {
      const orderA = a[1].order || 999;
      const orderB = b[1].order || 999;
      return orderA - orderB;
    });
  }

  /**
   * Renders a single category with its specifications
   */
  renderCategory(categoryKey, categoryInfo, categorySpecs, collapseCategories) {
    const categoryName = categoryInfo.name || this.capitalize(categoryKey);
    const isCollapsible = categoryInfo.collapsible !== false;
    const openAttribute = collapseCategories ? '' : ' open';

    let html = '        <div class="product-specs__category">\n';

    if (isCollapsible) {
      html += `          <details class="product-specs__accordion"${openAttribute}>\n`;
      html += '            <summary class="product-specs__header">\n';
      html += `              <h3 class="product-specs__title">${categoryName}</h3>\n`;
      html += '              <svg class="product-specs__chevron"></svg>\n';
      html += '            </summary>\n';
      html += '            <div class="product-specs__content">\n';
      
      if (categoryInfo.description) {
        html += `              <p class="product-specs__category-description">${categoryInfo.description}</p>\n`;
      }
      
      html += this.renderSpecTable(categorySpecs);
      html += '            </div>\n';
      html += '          </details>\n';
    } else {
      html += '          <div class="product-specs__static-category">\n';
      html += `            <h3 class="product-specs__static-title">${categoryName}</h3>\n`;
      html += '            <div class="product-specs__content">\n';
      
      if (categoryInfo.description) {
        html += `              <p class="product-specs__category-description">${categoryInfo.description}</p>\n`;
      }
      
      html += this.renderSpecTable(categorySpecs);
      html += '            </div>\n';
      html += '          </div>\n';
    }

    html += '        </div>\n';
    return html;
  }

  /**
   * Renders the specification table for a category
   * Simulates snippets/product-specs-table.liquid
   */
  renderSpecTable(specifications) {
    let html = '              <div class="product-specs__table-container">\n';
    html += '                <table class="product-specs__table">\n';
    html += '                  <tbody>\n';

    for (const [specKey, specInfo] of Object.entries(specifications)) {
      // Only render specifications with non-empty, non-whitespace values
      if (specInfo.value && specInfo.value.trim() !== '') {
        const displayName = specInfo.display_name || this.capitalize(specKey.replace(/_/g, ' '));
        
        html += '                    <tr class="product-specs__row">\n';
        html += `                      <th class="product-specs__label">${displayName}</th>\n`;
        html += '                      <td class="product-specs__value">\n';
        html += '                        <div class="product-specs__value-content">\n';
        
        // Handle range values
        if (specInfo.min && specInfo.min.trim() !== '' && specInfo.max && specInfo.max.trim() !== '') {
          html += `                          <span class="product-specs__range">${specInfo.min} - ${specInfo.max}`;
          if (specInfo.unit && specInfo.unit.trim() !== '') {
            html += `<span class="product-specs__unit">${specInfo.unit}</span>`;
          }
          html += '</span>\n';
        } else if (specInfo.range && specInfo.range.trim() !== '') {
          html += `                          <span class="product-specs__range">${specInfo.range}`;
          if (specInfo.unit && specInfo.unit.trim() !== '') {
            html += `<span class="product-specs__unit">${specInfo.unit}</span>`;
          }
          html += '</span>\n';
        } else {
          // Regular value
          html += `                          <span class="product-specs__main-value">${specInfo.value}`;
          if (specInfo.unit && specInfo.unit.trim() !== '') {
            html += `<span class="product-specs__unit">${specInfo.unit}</span>`;
          }
          html += '</span>\n';
        }
        
        // Add tolerance if present and not whitespace
        if (specInfo.tolerance && specInfo.tolerance.trim() !== '') {
          html += `                          <span class="product-specs__tolerance">${specInfo.tolerance}</span>\n`;
        }
        
        // Add description if present and not whitespace
        if (specInfo.description && specInfo.description.trim() !== '') {
          html += `                          <div class="product-specs__description">${specInfo.description}</div>\n`;
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
   * Capitalizes the first letter of a string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Generators for property-based testing
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

// Helper functions for validation
function containsAllCategories(html, specData) {
  if (!specData.categories && !specData.specifications) return true;
  
  // Get the categories that should actually be rendered
  const renderer = new SpecificationRenderer();
  const categoriesToRender = renderer.getCategoriesToRender(specData);
  
  // If no categories should be rendered, that's valid
  if (categoriesToRender.length === 0) {
    return true;
  }
  
  for (const [categoryKey, categoryInfo] of categoriesToRender) {
    // Check if category has valid specifications
    const categorySpecs = specData.specifications[categoryKey];
    if (!categorySpecs || !renderer.hasValidSpecsInCategory(categorySpecs)) continue;
    
    const categoryName = categoryInfo.name || categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    
    // Skip categories with empty or whitespace-only names
    if (!categoryName || categoryName.trim() === '') continue;
    
    // Check if category name appears in HTML within proper context (not just whitespace)
    const categoryNamePattern = new RegExp(`<h3[^>]*>${categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h3>`, 'i');
    if (!categoryNamePattern.test(html)) {
      return false;
    }
    
    // Check if category structure is present
    if (categoryInfo.collapsible !== false) {
      if (!html.includes('product-specs__accordion')) {
        return false;
      }
    } else {
      if (!html.includes('product-specs__static-category')) {
        return false;
      }
    }
  }
  
  return true;
}

function containsAllSpecifications(html, specData) {
  if (!specData.specifications) return true;
  
  for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      if (!specInfo.value || specInfo.value.trim() === '') continue;
      
      const displayName = specInfo.display_name || specKey.replace(/_/g, ' ').charAt(0).toUpperCase() + specKey.replace(/_/g, ' ').slice(1);
      
      // Check if specification name appears in HTML
      if (!html.includes(displayName)) {
        return false;
      }
      
      // Check if specification value appears in HTML
      if (!html.includes(specInfo.value)) {
        return false;
      }
    }
  }
  
  return true;
}

function containsAllUnits(html, specData) {
  if (!specData.specifications) return true;
  
  for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      if (!specInfo.value || specInfo.value.trim() === '' || !specInfo.unit || specInfo.unit.trim() === '') continue;
      
      // Check if unit appears in HTML with proper markup
      if (!html.includes(`product-specs__unit">${specInfo.unit}</span>`)) {
        return false;
      }
    }
  }
  
  return true;
}

function containsAllTolerances(html, specData) {
  if (!specData.specifications) return true;
  
  for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      if (!specInfo.value || specInfo.value.trim() === '' || !specInfo.tolerance || specInfo.tolerance.trim() === '') continue;
      
      // Check if tolerance appears in HTML with proper markup
      if (!html.includes(`product-specs__tolerance">${specInfo.tolerance}</span>`)) {
        return false;
      }
    }
  }
  
  return true;
}

function containsAllRanges(html, specData) {
  if (!specData.specifications) return true;
  
  for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      if (!specInfo.value || specInfo.value.trim() === '') continue;
      
      // Check min/max ranges
      if (specInfo.min && specInfo.min.trim() !== '' && specInfo.max && specInfo.max.trim() !== '') {
        const rangeText = `${specInfo.min} - ${specInfo.max}`;
        if (!html.includes(rangeText)) {
          return false;
        }
      }
      
      // Check range property
      if (specInfo.range && specInfo.range.trim() !== '') {
        if (!html.includes(specInfo.range)) {
          return false;
        }
      }
    }
  }
  
  return true;
}

function containsAllDescriptions(html, specData) {
  if (!specData.specifications) return true;
  
  for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
    for (const [specKey, specInfo] of Object.entries(categorySpecs)) {
      if (!specInfo.value || specInfo.value.trim() === '' || !specInfo.description || specInfo.description.trim() === '') continue;
      
      // Check if description appears in HTML with proper markup
      if (!html.includes(`product-specs__description">${specInfo.description}</div>`)) {
        return false;
      }
    }
  }
  
  return true;
}

function hasProperTableStructure(html) {
  // Check for required table elements
  return html.includes('<table class="product-specs__table">') &&
         html.includes('<tbody>') &&
         html.includes('product-specs__row') &&
         html.includes('product-specs__label') &&
         html.includes('product-specs__value');
}

function hasCategoryDescriptions(html, specData) {
  if (!specData.categories && !specData.specifications) return true;
  
  // Get the categories that should actually be rendered
  const renderer = new SpecificationRenderer();
  const categoriesToRender = renderer.getCategoriesToRender(specData);
  
  for (const [categoryKey, categoryInfo] of categoriesToRender) {
    if (!categoryInfo.description || categoryInfo.description.trim() === '') continue;
    
    // Check if category has valid specifications (only then should description appear)
    const categorySpecs = specData.specifications[categoryKey];
    if (!categorySpecs || !renderer.hasValidSpecsInCategory(categorySpecs)) continue;
    
    // Check if category description appears in HTML
    if (!html.includes(`product-specs__category-description">${categoryInfo.description}</p>`)) {
      return false;
    }
  }
  
  return true;
}

// Main property test
test('Property 1: Specification Rendering Completeness - All specification elements should be rendered correctly', () => {
  fc.assert(
    fc.property(specificationDataArbitrary, (specData) => {
      const renderer = new SpecificationRenderer();
      const html = renderer.renderSpecifications(specData);
      
      // If there are no valid specifications, HTML should be empty
      if (!renderer.hasValidSpecifications(specData)) {
        return html === '';
      }
      
      // Check if there are any categories to render
      const categoriesToRender = renderer.getCategoriesToRender(specData);
      if (categoriesToRender.length === 0) {
        // If no categories can be rendered, HTML should be empty
        return html === '';
      }
      
      // If we get here, we should have non-empty HTML with rendered categories
      if (html === '') {
        return false; // Should not be empty if we have categories to render
      }
      
      // Validate that all required elements are present
      const hasAllCategories = containsAllCategories(html, specData);
      const hasAllSpecs = containsAllSpecifications(html, specData);
      const hasAllUnits = containsAllUnits(html, specData);
      const hasAllTolerances = containsAllTolerances(html, specData);
      const hasAllRanges = containsAllRanges(html, specData);
      const hasAllDescriptions = containsAllDescriptions(html, specData);
      const hasTableStructure = hasProperTableStructure(html);
      const hasCatDescriptions = hasCategoryDescriptions(html, specData);
      
      return hasAllCategories && 
             hasAllSpecs && 
             hasAllUnits && 
             hasAllTolerances && 
             hasAllRanges && 
             hasAllDescriptions && 
             hasTableStructure && 
             hasCatDescriptions;
    }),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Edge case tests
test('Property 1: Specification Rendering Completeness - Empty specification data should render gracefully', () => {
  const renderer = new SpecificationRenderer();
  
  const emptyData = {
    specifications: {},
    categories: {}
  };
  
  const html = renderer.renderSpecifications(emptyData);
  expect(html).toBe('');
});

test('Property 1: Specification Rendering Completeness - Missing categories should use default names', () => {
  const renderer = new SpecificationRenderer();
  
  const dataWithoutCategories = {
    specifications: {
      dimensions: {
        length: { value: "100", unit: "mm" }
      }
    }
  };
  
  const html = renderer.renderSpecifications(dataWithoutCategories);
  expect(html).toContain('Dimensions'); // Should capitalize the category key
});

test('Property 1: Specification Rendering Completeness - Specifications without values should be skipped', () => {
  const renderer = new SpecificationRenderer();
  
  const dataWithEmptySpecs = {
    specifications: {
      dimensions: {
        length: { value: "100", unit: "mm" },
        width: { unit: "mm" }, // No value
        height: { value: "", unit: "mm" } // Empty value
      }
    },
    categories: {
      dimensions: { name: "Dimensions", order: 1, collapsible: true }
    }
  };
  
  const html = renderer.renderSpecifications(dataWithEmptySpecs);
  expect(html).toContain('Length');
  expect(html).not.toContain('Width');
  expect(html).not.toContain('Height');
});

test('Property 1: Specification Rendering Completeness - Categories should be sorted by order', () => {  const renderer = new SpecificationRenderer();
  
  const dataWithOrdering = {
    specifications: {
      category_c: { spec1: { value: "C" } },
      category_a: { spec2: { value: "A" } },
      category_b: { spec3: { value: "B" } }
    },
    categories: {
      category_c: { name: "Category C", order: 3, collapsible: true },
      category_a: { name: "Category A", order: 1, collapsible: true },
      category_b: { name: "Category B", order: 2, collapsible: true }
    }
  };
  
  const html = renderer.renderSpecifications(dataWithOrdering);
  
  // Check that categories appear in the correct order
  const categoryAIndex = html.indexOf('Category A');
  const categoryBIndex = html.indexOf('Category B');
  const categoryCIndex = html.indexOf('Category C');
  
  expect(categoryAIndex).toBeLessThan(categoryBIndex);
  expect(categoryBIndex).toBeLessThan(categoryCIndex);
});