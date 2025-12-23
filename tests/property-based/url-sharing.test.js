import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 19: Shareable URL State Preservation

/**
 * Mock ProductComparison class for testing URL sharing functionality
 * Simulates the behavior of assets/product-comparison.js
 */
class MockProductComparison {
  constructor() {
    this.products = [];
    this.maxProducts = 4;
    this.mockWindow = {
      location: {
        href: 'https://example.com/products',
        search: '',
        pathname: '/products'
      }
    };
  }

  /**
   * Sets mock window location for testing
   * @param {string} url - Mock URL
   */
  setMockLocation(url) {
    const urlObj = new URL(url);
    this.mockWindow.location = {
      href: url,
      search: urlObj.search,
      pathname: urlObj.pathname,
      origin: urlObj.origin
    };
  }

  /**
   * Adds a product to the comparison
   * @param {Object} product - Product object
   * @returns {boolean} - Success status
   */
  addProduct(product) {
    if (this.products.length >= this.maxProducts) {
      return false;
    }
    
    const existingIndex = this.products.findIndex(p => p.id === product.id);
    if (existingIndex !== -1) {
      return false;
    }
    
    this.products.push(product);
    return true;
  }

  /**
   * Removes a product from comparison
   * @param {string} productId - Product ID to remove
   * @returns {boolean} - Success status
   */
  removeProduct(productId) {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    return this.products.length < initialLength;
  }

  /**
   * Clears all products
   */
  clear() {
    this.products = [];
  }

  /**
   * Gets all products
   * @returns {Array} - Products array
   */
  getProducts() {
    return [...this.products];
  }

  /**
   * Generates a shareable URL with comparison state
   * @param {Object} options - Additional options to encode in URL
   * @returns {string} - Shareable URL
   */
  generateShareableUrl(options = {}) {
    const productIds = this.products.map(p => p.id);
    const baseUrl = `${this.mockWindow.location.origin}${this.mockWindow.location.pathname}`;
    const url = new URL(baseUrl);
    
    // Clear existing comparison parameters
    url.searchParams.delete('compare');
    url.searchParams.delete('view');
    url.searchParams.delete('highlight');
    url.searchParams.delete('t');
    
    if (productIds.length > 0) {
      // Encode product IDs
      url.searchParams.set('compare', productIds.join(','));
      
      // Encode view options if provided
      if (options.view) {
        url.searchParams.set('view', options.view);
      }
      
      // Encode difference highlighting preference
      if (options.highlightDifferences !== undefined) {
        url.searchParams.set('highlight', options.highlightDifferences ? '1' : '0');
      }
      
      // Encode timestamp for cache busting
      if (options.includeTimestamp) {
        url.searchParams.set('t', Date.now().toString());
      }
    }
    
    return url.toString();
  }

  /**
   * Loads comparison from URL parameters
   * @param {string} url - URL to parse
   * @param {Array<Object>} availableProducts - Available products
   * @returns {Object} - Load result
   */
  loadFromUrl(url, availableProducts = []) {
    const urlObj = new URL(url);
    const urlParams = urlObj.searchParams;
    const compareParam = urlParams.get('compare');
    
    const result = {
      success: false,
      productsLoaded: 0,
      options: {}
    };
    
    if (compareParam) {
      const productIds = compareParam.split(',').filter(id => id.trim() !== '');
      const productsToCompare = availableProducts.filter(p => 
        productIds.includes(p.id)
      );
      
      if (productsToCompare.length > 0) {
        this.clear();
        productsToCompare.forEach(product => this.addProduct(product));
        result.success = true;
        result.productsLoaded = productsToCompare.length;
        
        // Load view options
        const viewParam = urlParams.get('view');
        if (viewParam) {
          result.options.view = viewParam;
        }
        
        // Load highlight preference
        const highlightParam = urlParams.get('highlight');
        if (highlightParam !== null) {
          result.options.highlightDifferences = highlightParam === '1';
        }
        
        // Load timestamp
        const timestampParam = urlParams.get('t');
        if (timestampParam) {
          result.options.timestamp = parseInt(timestampParam, 10);
        }
      }
    }
    
    return result;
  }

  /**
   * Exports comparison data
   * @returns {Object} - Comparison data
   */
  exportComparison() {
    return {
      products: this.products,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }
}

// Generators for property-based testing
const productIdArbitrary = fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}$/);

const productArbitrary = fc.record({
  id: productIdArbitrary,
  name: fc.string({ minLength: 1, maxLength: 100 }),
  specifications: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.record({
      value: fc.string({ minLength: 1, maxLength: 50 }),
      unit: fc.option(fc.string({ minLength: 1, maxLength: 10 }))
    }),
    { minKeys: 1, maxKeys: 5 }
  )
});

const productsArrayArbitrary = fc.array(productArbitrary, { minLength: 1, maxLength: 4 });

const urlOptionsArbitrary = fc.record({
  view: fc.option(fc.constantFrom('comparison', 'list', 'grid')),
  highlightDifferences: fc.option(fc.boolean()),
  includeTimestamp: fc.option(fc.boolean())
});

const baseUrlArbitrary = fc.constantFrom(
  'https://example.com/products',
  'https://shop.example.com/compare',
  'https://test.com/catalog'
);

// Property Tests

test('Property 19: Shareable URL State Preservation - Generated URLs should preserve all comparison state', () => {
  fc.assert(
    fc.property(productsArrayArbitrary, urlOptionsArbitrary, baseUrlArbitrary, (products, options, baseUrl) => {
      const comparison = new MockProductComparison();
      comparison.setMockLocation(baseUrl);
      
      // Add products to comparison
      products.forEach(product => comparison.addProduct(product));
      
      // Generate shareable URL
      const shareableUrl = comparison.generateShareableUrl(options);
      
      // Parse the URL to verify state preservation
      const urlObj = new URL(shareableUrl);
      const params = urlObj.searchParams;
      
      // Should preserve product IDs
      const compareParam = params.get('compare');
      expect(compareParam).toBeTruthy();
      
      const urlProductIds = compareParam.split(',');
      const originalProductIds = products.map(p => p.id);
      
      expect(urlProductIds).toEqual(originalProductIds);
      
      // Should preserve view option if provided
      if (options.view) {
        expect(params.get('view')).toBe(options.view);
      }
      
      // Should preserve highlight option if provided
      if (options.highlightDifferences !== undefined && options.highlightDifferences !== null) {
        expect(params.get('highlight')).toBe(options.highlightDifferences ? '1' : '0');
      }
      
      // Should include timestamp if requested
      if (options.includeTimestamp) {
        expect(params.get('t')).toBeTruthy();
        expect(parseInt(params.get('t'), 10)).toBeGreaterThan(0);
      }
      
      return true;
    }),
    { numRuns: 100 }
  );
});

test('Property 19: Shareable URL State Preservation - Loading from URL should restore exact comparison state', () => {
  fc.assert(
    fc.property(productsArrayArbitrary, urlOptionsArbitrary, baseUrlArbitrary, (products, options, baseUrl) => {
      const originalComparison = new MockProductComparison();
      originalComparison.setMockLocation(baseUrl);
      
      // Add products to original comparison
      products.forEach(product => originalComparison.addProduct(product));
      
      // Generate shareable URL
      const shareableUrl = originalComparison.generateShareableUrl(options);
      
      // Create new comparison and load from URL
      const newComparison = new MockProductComparison();
      const loadResult = newComparison.loadFromUrl(shareableUrl, products);
      
      // Should successfully load
      expect(loadResult.success).toBe(true);
      expect(loadResult.productsLoaded).toBe(products.length);
      
      // Should restore exact same products
      const originalProducts = originalComparison.getProducts();
      const restoredProducts = newComparison.getProducts();
      
      expect(restoredProducts).toHaveLength(originalProducts.length);
      
      // Check that all product IDs match
      const originalIds = originalProducts.map(p => p.id).sort();
      const restoredIds = restoredProducts.map(p => p.id).sort();
      expect(restoredIds).toEqual(originalIds);
      
      // Should restore options
      if (options.view) {
        expect(loadResult.options.view).toBe(options.view);
      }
      
      if (options.highlightDifferences !== undefined && options.highlightDifferences !== null) {
        expect(loadResult.options.highlightDifferences).toBe(options.highlightDifferences);
      }
      
      return true;
    }),
    { numRuns: 100 }
  );
});

test('Property 19: Shareable URL State Preservation - Round-trip URL generation should be idempotent', () => {
  fc.assert(
    fc.property(productsArrayArbitrary, urlOptionsArbitrary, baseUrlArbitrary, (products, options, baseUrl) => {
      const comparison = new MockProductComparison();
      comparison.setMockLocation(baseUrl);
      
      // Add products
      products.forEach(product => comparison.addProduct(product));
      
      // Generate URL twice
      const url1 = comparison.generateShareableUrl(options);
      const url2 = comparison.generateShareableUrl(options);
      
      // URLs should be identical (excluding timestamp if included)
      if (!options.includeTimestamp) {
        expect(url1).toBe(url2);
      } else {
        // If timestamp is included, everything except timestamp should match
        const url1Obj = new URL(url1);
        const url2Obj = new URL(url2);
        
        url1Obj.searchParams.delete('t');
        url2Obj.searchParams.delete('t');
        
        expect(url1Obj.toString()).toBe(url2Obj.toString());
      }
      
      return true;
    }),
    { numRuns: 50 }
  );
});

test('Property 19: Shareable URL State Preservation - URLs should handle empty comparison state', () => {
  fc.assert(
    fc.property(baseUrlArbitrary, (baseUrl) => {
      const comparison = new MockProductComparison();
      comparison.setMockLocation(baseUrl);
      
      // Generate URL with no products
      const shareableUrl = comparison.generateShareableUrl();
      
      // Should return clean URL without comparison parameters
      const urlObj = new URL(shareableUrl);
      expect(urlObj.searchParams.get('compare')).toBeNull();
      expect(urlObj.searchParams.get('view')).toBeNull();
      expect(urlObj.searchParams.get('highlight')).toBeNull();
      
      // Should preserve base URL
      expect(urlObj.origin + urlObj.pathname).toBe(baseUrl);
      
      return true;
    }),
    { numRuns: 50 }
  );
});

test('Property 19: Shareable URL State Preservation - Should handle malformed URLs gracefully', () => {
  const comparison = new MockProductComparison();
  
  const malformedUrls = [
    'https://example.com/products?compare=',
    'https://example.com/products?compare=,,,',
    'https://example.com/products?compare=invalid-id',
    'https://example.com/products?view=invalid-view',
    'https://example.com/products?highlight=invalid'
  ];
  
  const availableProducts = [
    { id: 'product1', name: 'Product 1' },
    { id: 'product2', name: 'Product 2' }
  ];
  
  malformedUrls.forEach(url => {
    const result = comparison.loadFromUrl(url, availableProducts);
    
    // Should handle gracefully without throwing
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.productsLoaded).toBe('number');
    expect(typeof result.options).toBe('object');
  });
});

test('Property 19: Shareable URL State Preservation - Should preserve product order in URLs', () => {
  fc.assert(
    fc.property(productsArrayArbitrary, baseUrlArbitrary, (products, baseUrl) => {
      const comparison = new MockProductComparison();
      comparison.setMockLocation(baseUrl);
      
      // Add products in specific order
      products.forEach(product => comparison.addProduct(product));
      
      // Generate URL
      const shareableUrl = comparison.generateShareableUrl();
      
      // Load from URL
      const newComparison = new MockProductComparison();
      const loadResult = newComparison.loadFromUrl(shareableUrl, products);
      
      if (loadResult.success) {
        const originalOrder = comparison.getProducts().map(p => p.id);
        const restoredOrder = newComparison.getProducts().map(p => p.id);
        
        // Order should be preserved
        expect(restoredOrder).toEqual(originalOrder);
      }
      
      return true;
    }),
    { numRuns: 50 }
  );
});

// Edge case tests
test('Property 19: Shareable URL State Preservation - Should handle maximum product limit', () => {
  const comparison = new MockProductComparison();
  comparison.setMockLocation('https://example.com/products');
  
  const products = Array.from({ length: 6 }, (_, i) => ({
    id: `product${i + 1}`,
    name: `Product ${i + 1}`,
    specifications: { weight: { value: `${i + 1}kg` } }
  }));
  
  // Try to add more than max products
  products.forEach(product => comparison.addProduct(product));
  
  // Should only have max products
  expect(comparison.getProducts()).toHaveLength(4);
  
  // URL should only contain max products
  const shareableUrl = comparison.generateShareableUrl();
  const urlObj = new URL(shareableUrl);
  const compareParam = urlObj.searchParams.get('compare');
  
  if (compareParam) {
    const urlProductIds = compareParam.split(',');
    expect(urlProductIds).toHaveLength(4);
  }
});

test('Property 19: Shareable URL State Preservation - Should handle duplicate product IDs', () => {
  const comparison = new MockProductComparison();
  comparison.setMockLocation('https://example.com/products');
  
  const product = { id: 'product1', name: 'Product 1', specifications: {} };
  
  // Try to add same product twice
  const result1 = comparison.addProduct(product);
  const result2 = comparison.addProduct(product);
  
  expect(result1).toBe(true);
  expect(result2).toBe(false);
  expect(comparison.getProducts()).toHaveLength(1);
  
  // URL should only contain product once
  const shareableUrl = comparison.generateShareableUrl();
  const urlObj = new URL(shareableUrl);
  const compareParam = urlObj.searchParams.get('compare');
  
  expect(compareParam).toBe('product1');
});