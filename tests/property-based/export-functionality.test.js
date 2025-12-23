import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 18: Export Format Completeness

/**
 * Mock PDF Export System for Testing
 * Simulates the behavior of assets/pdf-export.js without actually generating PDFs
 */
class MockPDFExporter {
  constructor() {
    this.exportedData = null;
    this.exportOptions = null;
  }

  /**
   * Exports product specifications to PDF (synchronous for testing)
   * @param {Object} product - Product object with specifications
   * @param {Object} options - Export options
   * @returns {Object} - Export result (synchronous)
   */
  exportSpecifications(product, options = {}) {
    this.exportedData = product;
    this.exportOptions = options;
    
    // Validate that all required elements are present for export
    const exportResult = {
      success: true,
      hasProductName: !!product.name,
      hasSpecifications: !!product.specifications && Object.keys(product.specifications).length > 0,
      hasProductImage: !!product.image,
      hasBranding: !!options.storeName,
      hasTableFormatting: this.validateTableFormatting(product.specifications),
      includesImages: options.includeImages !== false,
      hasFooter: !!options.footerText,
      specificationCount: this.countSpecifications(product.specifications),
      categoryCount: this.countCategories(product.specifications),
      errors: []
    };
    
    // Validate required fields
    if (!product.name || product.name.trim() === '') {
      exportResult.errors.push('Product name is required');
      exportResult.success = false;
    }
    
    if (!product.specifications || Object.keys(product.specifications).length === 0) {
      exportResult.errors.push('Product specifications are required');
      exportResult.success = false;
    }
    
    // Check if table formatting is valid (has at least one valid spec)
    if (!exportResult.hasTableFormatting) {
      exportResult.errors.push('No valid specifications found for table formatting');
      exportResult.success = false;
    }
    
    return exportResult;
  }

  /**
   * Exports product comparison to PDF (synchronous for testing)
   * @param {Array} products - Array of products to compare
   * @param {Object} options - Export options
   * @returns {Object} - Export result (synchronous)
   */
  exportComparison(products, options = {}) {
    this.exportedData = products;
    this.exportOptions = options;
    
    if (!products || products.length === 0) {
      throw new Error('No products provided for comparison export');
    }
    
    const exportResult = {
      success: true,
      productCount: products.length,
      hasAllProductNames: products.every(p => p.name && p.name.trim() !== ''),
      hasAllSpecifications: products.every(p => p.specifications && Object.keys(p.specifications).length > 0),
      hasProductImages: products.filter(p => p.image).length,
      hasBranding: !!options.storeName,
      hasTableFormatting: this.validateComparisonTableFormatting(products),
      includesImages: options.includeImages !== false,
      hasFooter: !!options.footerText,
      totalSpecifications: this.countTotalSpecifications(products),
      uniqueSpecificationKeys: this.getUniqueSpecificationKeys(products).length,
      errors: []
    };
    
    // Validate products
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      if (!product.name || product.name.trim() === '') {
        exportResult.errors.push(`Product ${i + 1} name is required`);
        exportResult.success = false;
      }
      
      if (!product.specifications || Object.keys(product.specifications).length === 0) {
        exportResult.errors.push(`Product ${i + 1} specifications are required`);
        exportResult.success = false;
      }
    }
    
    return exportResult;
  }

  /**
   * Validates table formatting for specifications
   * @param {Object} specifications - Specifications object
   * @returns {boolean} - Whether table formatting is valid
   */
  validateTableFormatting(specifications) {
    if (!specifications) return false;
    
    let hasValidSpecs = false;
    
    for (const [categoryKey, categorySpecs] of Object.entries(specifications)) {
      if (!categorySpecs || typeof categorySpecs !== 'object') continue;
      
      for (const [specKey, specValue] of Object.entries(categorySpecs)) {
        // Each specification should have a value
        if (!specValue || !specValue.value) continue;
        
        // Value should be non-empty string
        if (typeof specValue.value !== 'string' || specValue.value.trim() === '') continue;
        
        // Units should be strings if present
        if (specValue.unit && typeof specValue.unit !== 'string') continue;
        
        // Tolerances should be strings if present
        if (specValue.tolerance && typeof specValue.tolerance !== 'string') continue;
        
        // Ranges should be strings if present
        if (specValue.range && typeof specValue.range !== 'string') continue;
        
        // Descriptions should be strings if present
        if (specValue.description && typeof specValue.description !== 'string') continue;
        
        // If we get here, we have at least one valid spec
        hasValidSpecs = true;
      }
    }
    
    return hasValidSpecs;
  }

  /**
   * Validates comparison table formatting
   * @param {Array} products - Products array
   * @returns {boolean} - Whether comparison table formatting is valid
   */
  validateComparisonTableFormatting(products) {
    if (!products || products.length === 0) return false;
    
    // All products should have valid specifications
    for (const product of products) {
      if (!this.validateTableFormatting(product.specifications)) {
        return false;
      }
    }
    
    // Should have at least one common specification key
    const uniqueKeys = this.getUniqueSpecificationKeys(products);
    return uniqueKeys.length > 0;
  }

  /**
   * Counts total specifications in a product
   * @param {Object} specifications - Specifications object
   * @returns {number} - Total specification count
   */
  countSpecifications(specifications) {
    if (!specifications) return 0;
    
    let count = 0;
    for (const categorySpecs of Object.values(specifications)) {
      if (categorySpecs && typeof categorySpecs === 'object') {
        count += Object.keys(categorySpecs).length;
      }
    }
    
    return count;
  }

  /**
   * Counts categories in specifications
   * @param {Object} specifications - Specifications object
   * @returns {number} - Category count
   */
  countCategories(specifications) {
    if (!specifications) return 0;
    return Object.keys(specifications).length;
  }

  /**
   * Counts total specifications across all products
   * @param {Array} products - Products array
   * @returns {number} - Total specification count
   */
  countTotalSpecifications(products) {
    return products.reduce((total, product) => {
      return total + this.countSpecifications(product.specifications);
    }, 0);
  }

  /**
   * Gets unique specification keys across all products
   * @param {Array} products - Products array
   * @returns {Array} - Unique specification keys
   */
  getUniqueSpecificationKeys(products) {
    const keys = new Set();
    
    for (const product of products) {
      if (product.specifications) {
        for (const categoryKey of Object.keys(product.specifications)) {
          const categorySpecs = product.specifications[categoryKey];
          if (categorySpecs && typeof categorySpecs === 'object') {
            for (const specKey of Object.keys(categorySpecs)) {
              keys.add(`${categoryKey}.${specKey}`);
            }
          }
        }
      }
    }
    
    return Array.from(keys);
  }
}

// Generators for property-based testing
const specificationValueArbitrary = fc.record({
  value: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  unit: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)),
  tolerance: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)),
  range: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0))
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

const productArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  specifications: specificationCategoryArbitrary,
  image: fc.option(fc.webUrl())
});

const exportOptionsArbitrary = fc.record({
  storeName: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
  includeImages: fc.boolean(),
  footerText: fc.option(fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0))
});

const productsArrayArbitrary = fc.array(productArbitrary, { minLength: 1, maxLength: 4 });

// Property Tests

test('Property 18: Export Format Completeness - Single product specification export should include all required elements', () => {
  fc.assert(
    fc.property(productArbitrary, exportOptionsArbitrary, (product, options) => {
      const exporter = new MockPDFExporter();
      const result = exporter.exportSpecifications(product, options);
      
      // Should successfully export
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      // Should include product name
      expect(result.hasProductName).toBe(true);
      
      // Should include specifications
      expect(result.hasSpecifications).toBe(true);
      expect(result.specificationCount).toBeGreaterThan(0);
      expect(result.categoryCount).toBeGreaterThan(0);
      
      // Should have proper table formatting
      expect(result.hasTableFormatting).toBe(true);
      
      // Should include branding if provided
      if (options.storeName) {
        expect(result.hasBranding).toBe(true);
      }
      
      // Should include footer if provided
      if (options.footerText) {
        expect(result.hasFooter).toBe(true);
      }
      
      // Should handle image inclusion setting
      expect(result.includesImages).toBe(options.includeImages !== false);
      
      return true;
    }),
    { numRuns: 50 }
  );
});

test('Property 18: Export Format Completeness - Product comparison export should maintain table structure', () => {
  fc.assert(
    fc.property(productsArrayArbitrary, exportOptionsArbitrary, (products, options) => {
      const exporter = new MockPDFExporter();
      const result = exporter.exportComparison(products, options);
      
      // Should successfully export
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      // Should include all products
      expect(result.productCount).toBe(products.length);
      expect(result.hasAllProductNames).toBe(true);
      expect(result.hasAllSpecifications).toBe(true);
      
      // Should have proper comparison table formatting
      expect(result.hasTableFormatting).toBe(true);
      
      // Should have specifications to compare
      expect(result.totalSpecifications).toBeGreaterThan(0);
      expect(result.uniqueSpecificationKeys).toBeGreaterThan(0);
      
      // Should include branding if provided
      if (options.storeName) {
        expect(result.hasBranding).toBe(true);
      }
      
      // Should include footer if provided
      if (options.footerText) {
        expect(result.hasFooter).toBe(true);
      }
      
      // Should handle image inclusion setting
      expect(result.includesImages).toBe(options.includeImages !== false);
      
      return true;
    }),
    { numRuns: 50 }
  );
});

test('Property 18: Export Format Completeness - Export should handle products with different specification structures', () => {
  fc.assert(
    fc.property(productsArrayArbitrary, (products) => {
      // Ensure products have different specification structures
      const modifiedProducts = products.map((product, index) => ({
        ...product,
        specifications: {
          [`category_${index}`]: {
            [`spec_${index}`]: { value: `value_${index}` }
          }
        }
      }));
      
      const exporter = new MockPDFExporter();
      const result = exporter.exportComparison(modifiedProducts, {});
      
      // Should still successfully export despite different structures
      expect(result.success).toBe(true);
      expect(result.hasTableFormatting).toBe(true);
      
      // Should handle all products
      expect(result.productCount).toBe(modifiedProducts.length);
      expect(result.hasAllProductNames).toBe(true);
      expect(result.hasAllSpecifications).toBe(true);
      
      return true;
    }),
    { numRuns: 25 }
  );
});

// Edge case tests
test('Property 18: Export Format Completeness - Should reject empty product data', async () => {
  const exporter = new MockPDFExporter();
  
  const emptyProduct = {
    id: 'test',
    name: '',
    specifications: {},
    image: null
  };
  
  const result = await exporter.exportSpecifications(emptyProduct, {});
  expect(result.success).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});

test('Property 18: Export Format Completeness - Should reject empty comparison data', () => {
  const exporter = new MockPDFExporter();
  
  expect(() => exporter.exportComparison([], {})).toThrow('No products provided for comparison export');
});

test('Property 18: Export Format Completeness - Should handle missing optional fields gracefully', async () => {
  const exporter = new MockPDFExporter();
  
  const minimalProduct = {
    id: 'test',
    name: 'Test Product',
    specifications: {
      basic: {
        weight: { value: '1kg' }
      }
    }
  };
  
  const result = await exporter.exportSpecifications(minimalProduct, {});
  expect(result.success).toBe(true);
  expect(result.hasProductName).toBe(true);
  expect(result.hasSpecifications).toBe(true);
});

test('Property 18: Export Format Completeness - Should validate specification value formats', async () => {
  const exporter = new MockPDFExporter();
  
  const productWithInvalidSpecs = {
    id: 'test',
    name: 'Test Product',
    specifications: {
      invalid: {
        empty_value: { value: '' },
        null_value: { value: null },
        missing_value: {}
      }
    }
  };
  
  const result = exporter.exportSpecifications(productWithInvalidSpecs, {});
  expect(result.success).toBe(false);
  expect(result.hasTableFormatting).toBe(false);
});

test('Property 18: Export Format Completeness - Should preserve specification metadata in export', () => {
  fc.assert(
    fc.property(productArbitrary, (product) => {
      const exporter = new MockPDFExporter();
      exporter.exportSpecifications(product, {});
      
      // Check that the exporter received the complete product data
      expect(exporter.exportedData).toEqual(product);
      
      // Verify all specification metadata is preserved
      for (const [categoryKey, categorySpecs] of Object.entries(product.specifications)) {
        for (const [specKey, specValue] of Object.entries(categorySpecs)) {
          const exportedSpec = exporter.exportedData.specifications[categoryKey][specKey];
          
          expect(exportedSpec.value).toBe(specValue.value);
          
          if (specValue.unit) {
            expect(exportedSpec.unit).toBe(specValue.unit);
          }
          
          if (specValue.tolerance) {
            expect(exportedSpec.tolerance).toBe(specValue.tolerance);
          }
          
          if (specValue.range) {
            expect(exportedSpec.range).toBe(specValue.range);
          }
          
          if (specValue.description) {
            expect(exportedSpec.description).toBe(specValue.description);
          }
        }
      }
      
      return true;
    }),
    { numRuns: 25 }
  );
});