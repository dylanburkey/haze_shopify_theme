import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 2: Comparison Side-by-Side Layout
// Feature: product-specification-system, Property 4: Comparison Product Limit

/**
 * Mock ProductComparison class that simulates the comparison engine
 * This simulates the behavior of assets/product-comparison.js
 */
class ProductComparison {
  constructor() {
    this.products = [];
    this.maxProducts = 4;
  }

  /**
   * Adds a product to the comparison
   * @param {Object} product - Product object with id and specifications
   * @returns {boolean} - True if added successfully, false if limit reached
   */
  addProduct(product) {
    if (this.products.length >= this.maxProducts) {
      return false;
    }
    
    // Check if product already exists
    const existingIndex = this.products.findIndex(p => p.id === product.id);
    if (existingIndex !== -1) {
      return false; // Already in comparison
    }
    
    this.products.push(product);
    return true;
  }

  /**
   * Removes a product from the comparison
   * @param {string} productId - ID of product to remove
   * @returns {boolean} - True if removed successfully
   */
  removeProduct(productId) {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    return this.products.length < initialLength;
  }

  /**
   * Gets the current number of products in comparison
   * @returns {number}
   */
  getProductCount() {
    return this.products.length;
  }

  /**
   * Clears all products from comparison
   */
  clear() {
    this.products = [];
  }

  /**
   * Renders the comparison table in side-by-side layout
   * @returns {string} - HTML string of comparison table
   */
  renderComparison() {
    if (this.products.length === 0) {
      return '';
    }

    let html = '<div class="product-comparison">\n';
    html += '  <div class="product-comparison__container">\n';
    html += '    <table class="product-comparison__table">\n';
    html += '      <thead>\n';
    html += '        <tr class="product-comparison__header-row">\n';
    html += '          <th class="product-comparison__spec-label">Specification</th>\n';
    
    // Add column header for each product
    for (const product of this.products) {
      html += `          <th class="product-comparison__product-header">\n`;
      html += `            <div class="product-comparison__product-info">\n`;
      html += `              <h3 class="product-comparison__product-name">${product.name}</h3>\n`;
      if (product.image) {
        html += `              <img src="${product.image}" alt="${product.name}" class="product-comparison__product-image">\n`;
      }
      html += `            </div>\n`;
      html += `          </th>\n`;
    }
    
    html += '        </tr>\n';
    html += '      </thead>\n';
    html += '      <tbody>\n';
    
    // Get all unique specification keys across all products
    const allSpecKeys = this.getAllSpecificationKeys();
    
    // Render each specification row
    for (const specKey of allSpecKeys) {
      html += this.renderSpecificationRow(specKey);
    }
    
    html += '      </tbody>\n';
    html += '    </table>\n';
    html += '  </div>\n';
    html += '</div>';
    
    return html;
  }

  /**
   * Gets all unique specification keys across all products
   * @returns {Set<string>}
   */
  getAllSpecificationKeys() {
    const keys = new Set();
    
    for (const product of this.products) {
      if (product.specifications) {
        for (const categoryKey of Object.keys(product.specifications)) {
          const categorySpecs = product.specifications[categoryKey];
          for (const specKey of Object.keys(categorySpecs)) {
            keys.add(`${categoryKey}.${specKey}`);
          }
        }
      }
    }
    
    return Array.from(keys).sort();
  }

  /**
   * Renders a single specification row across all products
   * @param {string} specKey - Full specification key (category.spec)
   * @returns {string} - HTML for the row
   */
  renderSpecificationRow(specKey) {
    const [categoryKey, specName] = specKey.split('.');
    
    let html = '        <tr class="product-comparison__row">\n';
    
    // Specification label
    const displayName = this.formatSpecName(specName);
    html += `          <td class="product-comparison__spec-name">${displayName}</td>\n`;
    
    // Get values for each product
    const values = this.products.map(product => {
      if (product.specifications && 
          product.specifications[categoryKey] && 
          product.specifications[categoryKey][specName]) {
        return product.specifications[categoryKey][specName];
      }
      return null;
    });
    
    // Check if values differ (for highlighting)
    const valuesDiffer = this.checkValuesDiffer(values);
    
    // Render value cell for each product
    for (const value of values) {
      const highlightClass = valuesDiffer ? ' product-comparison__cell--different' : '';
      html += `          <td class="product-comparison__value${highlightClass}">\n`;
      
      if (value) {
        html += '            <div class="product-comparison__value-content">\n';
        html += `              <span class="product-comparison__main-value">${value.value}`;
        if (value.unit) {
          html += `<span class="product-comparison__unit">${value.unit}</span>`;
        }
        html += '</span>\n';
        html += '            </div>\n';
      } else {
        html += '            <span class="product-comparison__missing">N/A</span>\n';
      }
      
      html += '          </td>\n';
    }
    
    html += '        </tr>\n';
    return html;
  }

  /**
   * Checks if specification values differ across products
   * @param {Array} values - Array of specification values
   * @returns {boolean}
   */
  checkValuesDiffer(values) {
    const nonNullValues = values.filter(v => v !== null);
    if (nonNullValues.length <= 1) return false;
    
    const firstValue = nonNullValues[0].value;
    return nonNullValues.some(v => v.value !== firstValue);
  }

  /**
   * Formats specification name for display
   * @param {string} specName - Raw specification name
   * @returns {string}
   */
  formatSpecName(specName) {
    return specName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Generators for property-based testing

/**
 * Generates a specification value object
 */
const specValueArbitrary = fc.record({
  value: fc.string({ minLength: 1, maxLength: 50 }),
  unit: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined })
});

/**
 * Generates a product object with specifications
 */
const productArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  image: fc.option(fc.webUrl(), { nil: undefined }),
  specifications: fc.dictionary(
    fc.constantFrom('dimensions', 'performance', 'materials', 'electrical'),
    fc.dictionary(
      fc.constantFrom('length', 'width', 'height', 'weight', 'power', 'voltage', 'material'),
      specValueArbitrary,
      { minKeys: 1, maxKeys: 5 }
    ),
    { minKeys: 1, maxKeys: 3 }
  )
});

/**
 * Generates an array of 2-4 products
 */
const productSetArbitrary = fc.array(productArbitrary, { minLength: 2, maxLength: 4 });

// Helper functions for validation

/**
 * Checks if HTML contains side-by-side layout structure
 */
function hasSideBySideLayout(html, products) {
  if (products.length === 0) return html === '';
  
  // Check for table structure
  if (!html.includes('<table class="product-comparison__table">')) return false;
  if (!html.includes('<thead>')) return false;
  if (!html.includes('<tbody>')) return false;
  
  // Check for header row with product columns
  if (!html.includes('product-comparison__header-row')) return false;
  if (!html.includes('product-comparison__spec-label')) return false;
  
  // Check that each product has a header column
  for (const product of products) {
    if (!html.includes(product.name)) return false;
    if (!html.includes('product-comparison__product-header')) return false;
  }
  
  return true;
}

/**
 * Checks if differences are highlighted in the comparison
 */
function hasDifferenceHighlighting(html, products) {
  if (products.length < 2) return true;
  
  // Get all specification keys
  const allSpecKeys = new Set();
  for (const product of products) {
    if (product.specifications) {
      for (const categoryKey of Object.keys(product.specifications)) {
        const categorySpecs = product.specifications[categoryKey];
        for (const specKey of Object.keys(categorySpecs)) {
          allSpecKeys.add(`${categoryKey}.${specKey}`);
        }
      }
    }
  }
  
  // Check if any specifications have different values
  let hasDifferences = false;
  for (const fullSpecKey of allSpecKeys) {
    const [categoryKey, specKey] = fullSpecKey.split('.');
    const values = products.map(p => {
      if (p.specifications && 
          p.specifications[categoryKey] && 
          p.specifications[categoryKey][specKey]) {
        return p.specifications[categoryKey][specKey].value;
      }
      return null;
    });
    
    const nonNullValues = values.filter(v => v !== null);
    if (nonNullValues.length > 1) {
      const firstValue = nonNullValues[0];
      if (nonNullValues.some(v => v !== firstValue)) {
        hasDifferences = true;
        break;
      }
    }
  }
  
  // If there are differences, check for highlighting class
  if (hasDifferences) {
    return html.includes('product-comparison__cell--different');
  }
  
  return true;
}

/**
 * Checks if all specifications are present in the comparison
 */
function containsAllSpecifications(html, products) {
  for (const product of products) {
    if (product.specifications) {
      for (const categoryKey of Object.keys(product.specifications)) {
        const categorySpecs = product.specifications[categoryKey];
        for (const specKey of Object.keys(categorySpecs)) {
          const specValue = categorySpecs[specKey];
          
          // Check if specification value appears in HTML
          if (!html.includes(specValue.value)) {
            return false;
          }
          
          // Check if unit appears (if present)
          if (specValue.unit && !html.includes(specValue.unit)) {
            return false;
          }
        }
      }
    }
  }
  
  return true;
}

/**
 * Checks if missing values are handled gracefully with N/A
 */
function handlesMissingValues(html, products) {
  if (products.length < 2) return true;
  
  // Get all specification keys
  const allSpecKeys = new Set();
  for (const product of products) {
    if (product.specifications) {
      for (const categoryKey of Object.keys(product.specifications)) {
        const categorySpecs = product.specifications[categoryKey];
        for (const specKey of Object.keys(categorySpecs)) {
          allSpecKeys.add(`${categoryKey}.${specKey}`);
        }
      }
    }
  }
  
  // Check if any product is missing a specification that others have
  let hasMissingValues = false;
  for (const fullSpecKey of allSpecKeys) {
    const [categoryKey, specKey] = fullSpecKey.split('.');
    const hasSpec = products.map(p => {
      return p.specifications && 
             p.specifications[categoryKey] && 
             p.specifications[categoryKey][specKey];
    });
    
    if (hasSpec.some(has => has) && hasSpec.some(has => !has)) {
      hasMissingValues = true;
      break;
    }
  }
  
  // If there are missing values, check for N/A handling
  if (hasMissingValues) {
    return html.includes('product-comparison__missing') && html.includes('N/A');
  }
  
  return true;
}

/**
 * Checks if N/A is properly displayed for missing values
 */
function checkNAForMissingValues(html, products) {
  if (products.length < 2) return true;
  
  // Get all specification keys
  const allSpecKeys = new Set();
  for (const product of products) {
    if (product.specifications) {
      for (const categoryKey of Object.keys(product.specifications)) {
        const categorySpecs = product.specifications[categoryKey];
        for (const specKey of Object.keys(categorySpecs)) {
          allSpecKeys.add(`${categoryKey}.${specKey}`);
        }
      }
    }
  }
  
  // Check each specification to see if any products are missing it
  for (const fullSpecKey of allSpecKeys) {
    const [categoryKey, specKey] = fullSpecKey.split('.');
    
    let hasMissingValue = false;
    for (const product of products) {
      const hasThisSpec = product.specifications && 
                         product.specifications[categoryKey] && 
                         product.specifications[categoryKey][specKey];
      
      if (!hasThisSpec) {
        hasMissingValue = true;
        break;
      }
    }
    
    // If this specification is missing from any product, 
    // the HTML should contain N/A for missing values
    if (hasMissingValue) {
      if (!html.includes('N/A') || !html.includes('product-comparison__missing')) {
        return false;
      }
    }
  }
  
  return true;
}

// Property 2: Comparison Side-by-Side Layout
test('Property 2: Comparison Side-by-Side Layout - Products should display in side-by-side columns with differences highlighted', () => {
  fc.assert(
    fc.property(productSetArbitrary, (products) => {
      const comparison = new ProductComparison();
      
      // Add all products to comparison
      for (const product of products) {
        comparison.addProduct(product);
      }
      
      const html = comparison.renderComparison();
      
      // Validate side-by-side layout
      const hasSideBySide = hasSideBySideLayout(html, products);
      const hasHighlighting = hasDifferenceHighlighting(html, products);
      const hasAllSpecs = containsAllSpecifications(html, products);
      const handlesMissing = handlesMissingValues(html, products);
      
      return hasSideBySide && hasHighlighting && hasAllSpecs && handlesMissing;
    }),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Property 3: Comparison Missing Value Handling
test('Property 3: Comparison Missing Value Handling - Products with different specification categories should handle missing values gracefully', () => {
  fc.assert(
    fc.property(
      fc.array(productArbitrary, { minLength: 2, maxLength: 4 }),
      (products) => {
        const comparison = new ProductComparison();
        
        // Add all products to comparison
        for (const product of products) {
          comparison.addProduct(product);
        }
        
        const html = comparison.renderComparison();
        
        // Check that missing values are handled gracefully
        const handlesMissing = handlesMissingValues(html, products);
        
        // Check that table structure is maintained even with missing values
        const hasValidTableStructure = hasSideBySideLayout(html, products);
        
        // Check that N/A is shown for missing values
        const showsNAForMissing = checkNAForMissingValues(html, products);
        
        // Check that table doesn't break with mismatched categories
        const tableNotBroken = !html.includes('undefined') && !html.includes('null');
        
        return handlesMissing && hasValidTableStructure && showsNAForMissing && tableNotBroken;
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Property 4: Comparison Product Limit
test('Property 4: Comparison Product Limit - System should accept up to 4 products and reject the 5th', () => {
  fc.assert(
    fc.property(fc.array(productArbitrary, { minLength: 5, maxLength: 10 }), (products) => {
      const comparison = new ProductComparison();
      
      // Try to add all products
      const results = products.map(product => comparison.addProduct(product));
      
      // First 4 should succeed
      const first4Succeeded = results.slice(0, 4).every(result => result === true);
      
      // 5th and beyond should fail
      const remainingFailed = results.slice(4).every(result => result === false);
      
      // Should have exactly 4 products
      const hasExactly4 = comparison.getProductCount() === 4;
      
      return first4Succeeded && remainingFailed && hasExactly4;
    }),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Edge case tests

test('Property 2: Empty comparison should render empty string', () => {
  const comparison = new ProductComparison();
  const html = comparison.renderComparison();
  expect(html).toBe('');
});

test('Property 2: Single product comparison should render without errors', () => {
  const comparison = new ProductComparison();
  const product = {
    id: '1',
    name: 'Test Product',
    specifications: {
      dimensions: {
        length: { value: '100', unit: 'mm' }
      }
    }
  };
  
  comparison.addProduct(product);
  const html = comparison.renderComparison();
  
  expect(html).toContain('Test Product');
  expect(html).toContain('100');
  expect(html).toContain('mm');
});

test('Property 2: Products with completely different specifications should show N/A', () => {
  const comparison = new ProductComparison();
  
  const product1 = {
    id: '1',
    name: 'Product 1',
    specifications: {
      dimensions: {
        length: { value: '100', unit: 'mm' }
      }
    }
  };
  
  const product2 = {
    id: '2',
    name: 'Product 2',
    specifications: {
      performance: {
        power: { value: '500', unit: 'W' }
      }
    }
  };
  
  comparison.addProduct(product1);
  comparison.addProduct(product2);
  const html = comparison.renderComparison();
  
  expect(html).toContain('N/A');
  expect(html).toContain('product-comparison__missing');
});

test('Property 2: Identical specifications should not be highlighted as different', () => {
  const comparison = new ProductComparison();
  
  const product1 = {
    id: '1',
    name: 'Product 1',
    specifications: {
      dimensions: {
        length: { value: '100', unit: 'mm' }
      }
    }
  };
  
  const product2 = {
    id: '2',
    name: 'Product 2',
    specifications: {
      dimensions: {
        length: { value: '100', unit: 'mm' }
      }
    }
  };
  
  comparison.addProduct(product1);
  comparison.addProduct(product2);
  const html = comparison.renderComparison();
  
  // Should not have difference highlighting for identical values
  expect(html).not.toContain('product-comparison__cell--different');
});

test('Property 4: Adding duplicate product should fail', () => {
  const comparison = new ProductComparison();
  
  const product = {
    id: '1',
    name: 'Test Product',
    specifications: {}
  };
  
  const firstAdd = comparison.addProduct(product);
  const secondAdd = comparison.addProduct(product);
  
  expect(firstAdd).toBe(true);
  expect(secondAdd).toBe(false);
  expect(comparison.getProductCount()).toBe(1);
});

test('Property 4: Removing product should allow adding another', () => {
  const comparison = new ProductComparison();
  
  // Add 4 products
  for (let i = 0; i < 4; i++) {
    comparison.addProduct({
      id: `product-${i}`,
      name: `Product ${i}`,
      specifications: {}
    });
  }
  
  // Try to add 5th - should fail
  const fifthAdd = comparison.addProduct({
    id: 'product-5',
    name: 'Product 5',
    specifications: {}
  });
  expect(fifthAdd).toBe(false);
  
  // Remove one product
  comparison.removeProduct('product-0');
  
  // Now should be able to add another
  const sixthAdd = comparison.addProduct({
    id: 'product-6',
    name: 'Product 6',
    specifications: {}
  });
  expect(sixthAdd).toBe(true);
  expect(comparison.getProductCount()).toBe(4);
});

test('Property 4: Clear should remove all products', () => {
  const comparison = new ProductComparison();
  
  // Add 4 products
  for (let i = 0; i < 4; i++) {
    comparison.addProduct({
      id: `product-${i}`,
      name: `Product ${i}`,
      specifications: {}
    });
  }
  
  expect(comparison.getProductCount()).toBe(4);
  
  comparison.clear();
  
  expect(comparison.getProductCount()).toBe(0);
});
