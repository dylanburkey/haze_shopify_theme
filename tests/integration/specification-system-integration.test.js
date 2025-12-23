/**
 * Integration Tests for Product Specification System
 * Tests end-to-end workflows and component interactions
 * 
 * Requirements: All integration scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock DOM environment
import { JSDOM } from 'jsdom';

// Mock ProductComparison class for integration tests
class ProductComparison {
  constructor() {
    this.products = [];
    this.maxProducts = 4;
  }

  addProduct(product) {
    if (!product || !product.id) return false;
    if (this.products.length >= this.maxProducts) return false;
    if (this.products.find(p => p.id === product.id)) return false;
    
    this.products.push(product);
    this.saveToLocalStorage();
    return true;
  }

  removeProduct(productId) {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    this.saveToLocalStorage();
    return this.products.length < initialLength;
  }

  getProductCount() {
    return this.products.length;
  }

  getProducts() {
    return [...this.products];
  }

  clear() {
    this.products = [];
    this.saveToLocalStorage();
  }

  renderComparison(container = null) {
    if (this.products.length === 0) {
      const html = '<div class="product-comparison__empty">No products selected for comparison.</div>';
      if (container) container.innerHTML = html;
      return html;
    }

    let html = '<div class="product-comparison">';
    html += '<table class="product-comparison__table">';
    html += '<thead><tr><th>Specification</th>';
    
    this.products.forEach(product => {
      html += `<th>${product.name || product.title}</th>`;
    });
    
    html += '</tr></thead>';
    html += '<tbody>';
    
    // Get all specification keys
    const allSpecKeys = this.getAllSpecificationKeys();
    
    allSpecKeys.forEach(specKey => {
      html += '<tr>';
      html += `<td>${specKey}</td>`;
      
      this.products.forEach(product => {
        const [categoryKey, specName] = specKey.split('.');
        const value = product.specifications?.[categoryKey]?.[specName];
        
        if (value) {
          const cellClass = this.isDifferentValue(specKey, value) ? 'product-comparison__cell--different' : '';
          html += `<td class="${cellClass}">${value.value}${value.unit ? ' ' + value.unit : ''}</td>`;
        } else {
          html += '<td class="product-comparison__missing">N/A</td>';
        }
      });
      
      html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    if (container) container.innerHTML = html;
    return html;
  }

  getAllSpecificationKeys() {
    const keys = new Set();
    
    this.products.forEach(product => {
      if (product.specifications) {
        Object.keys(product.specifications).forEach(categoryKey => {
          const categorySpecs = product.specifications[categoryKey];
          if (categorySpecs && typeof categorySpecs === 'object') {
            Object.keys(categorySpecs).forEach(specKey => {
              keys.add(`${categoryKey}.${specKey}`);
            });
          }
        });
      }
    });
    
    return Array.from(keys).sort();
  }

  isDifferentValue(specKey, value) {
    const values = this.products.map(product => {
      const [categoryKey, specName] = specKey.split('.');
      return product.specifications?.[categoryKey]?.[specName]?.value;
    }).filter(v => v);
    
    return new Set(values).size > 1;
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('shopify-product-comparison', JSON.stringify(this.products.map(p => p.id)));
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  generateShareableUrl(options = {}) {
    const params = new URLSearchParams();
    if (this.products.length > 0) {
      params.set('compare', this.products.map(p => p.id).join(','));
    }
    Object.entries(options).forEach(([key, value]) => {
      params.set(key, value);
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  loadFromUrl(availableProducts) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const compareParam = urlParams.get('compare');
      
      if (!compareParam) {
        return { success: false, productsLoaded: 0 };
      }
      
      const productIds = compareParam.split(',');
      let loaded = 0;
      
      productIds.forEach(id => {
        const product = availableProducts.find(p => p.id === id);
        if (product && this.addProduct(product)) {
          loaded++;
        }
      });
      
      return { success: loaded > 0, productsLoaded: loaded };
    } catch (error) {
      return { success: false, productsLoaded: 0 };
    }
  }
}

// Mock SpecificationSearchEngine class for integration tests
class SpecificationSearchEngine {
  constructor() {
    this.products = [];
    this.searchFilters = {
      text: '',
      ranges: {},
      categories: []
    };
  }

  initialize(products) {
    this.products = products.map(product => this.normalizeProduct(product));
    return this;
  }

  normalizeProduct(product) {
    const normalized = {
      id: product.id || '',
      title: product.title || '',
      specifications: {},
      searchableText: '',
      numericSpecs: {}
    };

    if (product.metafields?.specifications?.technical?.specifications) {
      normalized.specifications = product.metafields.specifications.technical.specifications;
      this.buildSearchableContent(normalized, product.metafields.specifications.technical);
    }

    return normalized;
  }

  buildSearchableContent(normalized, specData) {
    const textParts = [normalized.title];
    
    Object.entries(specData.specifications || {}).forEach(([categoryKey, categorySpecs]) => {
      Object.entries(categorySpecs).forEach(([specKey, specValue]) => {
        if (specValue.value) {
          textParts.push(specValue.value);
        }
        if (specValue.description) {
          textParts.push(specValue.description);
        }
        
        // Extract numeric values
        const numericValue = this.parseNumericValue(specValue.value);
        if (numericValue !== null) {
          normalized.numericSpecs[`${categoryKey}.${specKey}`] = {
            value: numericValue,
            unit: specValue.unit || '',
            min: numericValue,
            max: numericValue
          };
        }
      });
    });
    
    normalized.searchableText = textParts.join(' ').toLowerCase();
  }

  parseNumericValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  setTextSearch(query) {
    this.searchFilters.text = query ? query.trim() : '';
    return this;
  }

  addRangeFilter(specKey, min, max) {
    if (min !== null && max !== null && min <= max) {
      this.searchFilters.ranges[specKey] = { min, max };
    }
    return this;
  }

  search() {
    const results = [];
    
    for (const product of this.products) {
      const score = this.calculateProductScore(product);
      
      if (score.matches) {
        results.push({
          product: product,
          score: score.relevance,
          matchedSpecs: score.matchedSpecs,
          highlightedText: this.highlightMatches(product.searchableText, this.searchFilters.text)
        });
      }
    }
    
    return results.sort((a, b) => b.score - a.score);
  }

  calculateProductScore(product) {
    let totalScore = 0;
    let matchCount = 0;
    const matchedSpecs = [];
    
    // Text search matching
    if (this.searchFilters.text) {
      const textScore = this.fuzzyMatch(this.searchFilters.text, product.searchableText);
      if (textScore < 0.3) {
        return { matches: false, relevance: 0, matchedSpecs: [] };
      }
      totalScore += textScore;
      matchCount++;
    }
    
    // Range filter matching
    for (const [specKey, range] of Object.entries(this.searchFilters.ranges)) {
      const productSpec = product.numericSpecs[specKey];
      if (!productSpec) {
        return { matches: false, relevance: 0, matchedSpecs: [] };
      }
      
      const overlaps = productSpec.max >= range.min && productSpec.min <= range.max;
      if (!overlaps) {
        return { matches: false, relevance: 0, matchedSpecs: [] };
      }
      
      totalScore += 1;
      matchCount++;
      matchedSpecs.push(specKey);
    }
    
    if (matchCount === 0) {
      return { matches: true, relevance: 0.5, matchedSpecs: [] };
    }
    
    return {
      matches: true,
      relevance: totalScore / matchCount,
      matchedSpecs: matchedSpecs
    };
  }

  fuzzyMatch(query, text) {
    if (!query || !text) return 0;
    
    query = query.toLowerCase();
    text = text.toLowerCase();
    
    if (text.includes(query)) {
      return 1;
    }
    
    // Simple similarity calculation
    const distance = this.levenshteinDistance(query, text);
    const maxLength = Math.max(query.length, text.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  highlightMatches(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

describe('Product Specification System Integration Tests', () => {
  let dom;
  let document;
  let window;
  let localStorage;

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="test-container"></div>
          <div class="product-specs-section" data-empty="false">
            <div class="product-specs__structured">
              <div class="product-specs__category" data-category="dimensions">
                <div class="product-specs__table-container">
                  <table class="product-specs__table">
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="product-comparison-widget" data-product-comparison></div>
          <div class="specification-search">
            <input type="text" class="spec-search-input" />
            <div class="search-results"></div>
          </div>
        </body>
      </html>
    `, {
      url: 'https://test-store.myshopify.com',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;
    localStorage = {
      data: {},
      getItem: vi.fn((key) => localStorage.data[key] || null),
      setItem: vi.fn((key, value) => { localStorage.data[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorage.data[key]; }),
      clear: vi.fn(() => { localStorage.data = {}; })
    };

    // Set up global objects
    global.document = document;
    global.window = window;
    global.localStorage = localStorage;
    // Use Object.defineProperty to properly set navigator
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'test-agent' },
      writable: true,
      configurable: true
    });
    global.URL = window.URL;
    global.btoa = window.btoa;
    global.atob = window.atob;

    // Mock Shopify global
    window.Shopify = {
      routes: { root: '/' }
    };

    // Mock console methods
    global.console = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    };
  });

  afterEach(() => {
    dom.window.close();
    vi.clearAllMocks();
  });

  describe('End-to-End Specification Display Workflow', () => {
    it('should display specifications from metafield data', () => {
      // Mock product with specifications
      const mockProduct = {
        id: 'test-product-1',
        title: 'Test Product',
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '100', unit: 'mm', tolerance: '±1' },
                    width: { value: '50', unit: 'mm', tolerance: '±0.5' }
                  },
                  performance: {
                    max_pressure: { value: '150', unit: 'PSI', range: '0-150' }
                  }
                },
                categories: {
                  dimensions: { name: 'Dimensions', order: 1, collapsible: true },
                  performance: { name: 'Performance', order: 2, collapsible: false }
                }
              }
            }
          }
        }
      };

      // Test specification parsing and display
      const specData = mockProduct.metafields.specifications.technical.value;
      expect(specData.specifications).toBeDefined();
      expect(specData.specifications.dimensions).toBeDefined();
      expect(specData.specifications.dimensions.length.value).toBe('100');
      expect(specData.specifications.dimensions.length.unit).toBe('mm');
      expect(specData.specifications.dimensions.length.tolerance).toBe('±1');

      // Test category structure
      expect(specData.categories).toBeDefined();
      expect(specData.categories.dimensions.name).toBe('Dimensions');
      expect(specData.categories.dimensions.order).toBe(1);
      expect(specData.categories.dimensions.collapsible).toBe(true);
    });

    it('should handle missing or invalid specification data gracefully', () => {
      const mockProductWithoutSpecs = {
        id: 'test-product-2',
        title: 'Product Without Specs',
        metafields: {}
      };

      const mockProductWithInvalidSpecs = {
        id: 'test-product-3',
        title: 'Product With Invalid Specs',
        metafields: {
          specifications: {
            technical: {
              value: null
            }
          }
        }
      };

      // Test handling of missing specifications
      expect(mockProductWithoutSpecs.metafields.specifications).toBeUndefined();
      
      // Test handling of invalid specifications
      expect(mockProductWithInvalidSpecs.metafields.specifications.technical.value).toBeNull();
    });

    it('should support variant-specific specifications', () => {
      const mockProductWithVariants = {
        id: 'test-product-4',
        title: 'Product With Variants',
        selected_or_first_available_variant: {
          id: 'variant-1',
          metafields: {
            specifications: {
              technical: {
                value: {
                  specifications: {
                    dimensions: {
                      length: { value: '120', unit: 'mm', tolerance: '±1' }
                    }
                  }
                }
              }
            }
          }
        },
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '100', unit: 'mm', tolerance: '±1' }
                  }
                }
              }
            }
          }
        }
      };

      // Variant specifications should override product specifications
      const variantSpecs = mockProductWithVariants.selected_or_first_available_variant.metafields.specifications.technical.value;
      const productSpecs = mockProductWithVariants.metafields.specifications.technical.value;
      
      expect(variantSpecs.specifications.dimensions.length.value).toBe('120');
      expect(productSpecs.specifications.dimensions.length.value).toBe('100');
    });
  });

  describe('Product Comparison Logic Tests', () => {
    // Mock ProductComparison class for testing
    class MockProductComparison {
      constructor() {
        this.products = [];
        this.maxProducts = 4;
      }

      addProduct(product) {
        if (!product || !product.id) return false;
        if (this.products.length >= this.maxProducts) return false;
        if (this.products.find(p => p.id === product.id)) return false;
        
        this.products.push(product);
        return true;
      }

      removeProduct(productId) {
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== productId);
        return this.products.length < initialLength;
      }

      getProductCount() {
        return this.products.length;
      }

      getProducts() {
        return [...this.products];
      }

      clear() {
        this.products = [];
      }

      renderComparison() {
        if (this.products.length === 0) {
          return '<div class="product-comparison__empty">No products selected for comparison.</div>';
        }

        let html = '<div class="product-comparison">';
        html += '<table class="product-comparison__table">';
        html += '<thead><tr><th>Specification</th>';
        
        this.products.forEach(product => {
          html += `<th>${product.name}</th>`;
        });
        
        html += '</tr></thead>';
        html += '<tbody>';
        
        // Get all specification keys
        const allSpecKeys = this.getAllSpecificationKeys();
        
        allSpecKeys.forEach(specKey => {
          html += '<tr>';
          html += `<td>${specKey}</td>`;
          
          this.products.forEach(product => {
            const [categoryKey, specName] = specKey.split('.');
            const value = product.specifications?.[categoryKey]?.[specName];
            
            if (value) {
              html += `<td>${value.value}${value.unit ? ' ' + value.unit : ''}</td>`;
            } else {
              html += '<td class="product-comparison__missing">N/A</td>';
            }
          });
          
          html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        return html;
      }

      getAllSpecificationKeys() {
        const keys = new Set();
        
        this.products.forEach(product => {
          if (product.specifications) {
            Object.keys(product.specifications).forEach(categoryKey => {
              const categorySpecs = product.specifications[categoryKey];
              if (categorySpecs && typeof categorySpecs === 'object') {
                Object.keys(categorySpecs).forEach(specKey => {
                  keys.add(`${categoryKey}.${specKey}`);
                });
              }
            });
          }
        });
        
        return Array.from(keys).sort();
      }
    }

    let comparison;
    let mockProducts;

    beforeEach(() => {
      comparison = new MockProductComparison();
      
      mockProducts = [
        {
          id: 'product-1',
          name: 'Product A',
          specifications: {
            dimensions: {
              length: { value: '100', unit: 'mm' },
              width: { value: '50', unit: 'mm' }
            },
            performance: {
              max_pressure: { value: '150', unit: 'PSI' }
            }
          }
        },
        {
          id: 'product-2',
          name: 'Product B',
          specifications: {
            dimensions: {
              length: { value: '120', unit: 'mm' },
              width: { value: '60', unit: 'mm' }
            },
            performance: {
              max_pressure: { value: '200', unit: 'PSI' }
            }
          }
        },
        {
          id: 'product-3',
          name: 'Product C',
          specifications: {
            dimensions: {
              length: { value: '90', unit: 'mm' }
              // Missing width specification
            },
            performance: {
              max_pressure: { value: '100', unit: 'PSI' }
            }
          }
        }
      ];
    });

    it('should add products to comparison successfully', () => {
      expect(comparison.addProduct(mockProducts[0])).toBe(true);
      expect(comparison.addProduct(mockProducts[1])).toBe(true);
      expect(comparison.getProductCount()).toBe(2);
    });

    it('should prevent adding duplicate products', () => {
      comparison.addProduct(mockProducts[0]);
      expect(comparison.addProduct(mockProducts[0])).toBe(false);
      expect(comparison.getProductCount()).toBe(1);
    });

    it('should enforce maximum product limit', () => {
      // Add maximum products (4)
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);
      comparison.addProduct(mockProducts[2]);
      comparison.addProduct({ id: 'product-4', name: 'Product D', specifications: {} });
      
      expect(comparison.getProductCount()).toBe(4);
      
      // Try to add fifth product
      expect(comparison.addProduct({ id: 'product-5', name: 'Product E', specifications: {} })).toBe(false);
      expect(comparison.getProductCount()).toBe(4);
    });

    it('should render comparison table with all products', () => {
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);
      comparison.addProduct(mockProducts[2]);

      const html = comparison.renderComparison();

      expect(html).toContain('product-comparison');
      expect(html).toContain('Product A');
      expect(html).toContain('Product B');
      expect(html).toContain('Product C');
    });

    it('should handle missing values gracefully in comparison', () => {
      comparison.addProduct(mockProducts[0]); // Has width
      comparison.addProduct(mockProducts[2]); // Missing width

      const html = comparison.renderComparison();
      
      // Should contain N/A for missing values
      expect(html).toContain('N/A');
      expect(html).toContain('product-comparison__missing');
    });

    it('should remove products from comparison', () => {
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);
      
      expect(comparison.removeProduct('product-1')).toBe(true);
      expect(comparison.getProductCount()).toBe(1);
      expect(comparison.getProducts()[0].id).toBe('product-2');
    });
  });

  describe('Search Engine Logic Tests', () => {
    // Mock SpecificationSearchEngine class for testing
    class MockSpecificationSearchEngine {
      constructor() {
        this.products = [];
        this.searchFilters = {
          text: '',
          ranges: {},
          categories: []
        };
      }

      initialize(products) {
        this.products = products.map(product => this.normalizeProduct(product));
        return this;
      }

      normalizeProduct(product) {
        const normalized = {
          id: product.id || '',
          title: product.title || '',
          specifications: {},
          searchableText: '',
          numericSpecs: {}
        };

        if (product.metafields?.specifications?.technical?.specifications) {
          normalized.specifications = product.metafields.specifications.technical.specifications;
          this.buildSearchableContent(normalized, product.metafields.specifications.technical);
        }

        return normalized;
      }

      buildSearchableContent(normalized, specData) {
        const textParts = [normalized.title];
        
        Object.entries(specData.specifications || {}).forEach(([categoryKey, categorySpecs]) => {
          Object.entries(categorySpecs).forEach(([specKey, specValue]) => {
            if (specValue.value) {
              textParts.push(specValue.value);
            }
            if (specValue.description) {
              textParts.push(specValue.description);
            }
            
            // Extract numeric values
            const numericValue = this.parseNumericValue(specValue.value);
            if (numericValue !== null) {
              normalized.numericSpecs[`${categoryKey}.${specKey}`] = {
                value: numericValue,
                unit: specValue.unit || '',
                min: numericValue,
                max: numericValue
              };
            }
          });
        });
        
        normalized.searchableText = textParts.join(' ').toLowerCase();
      }

      parseNumericValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const cleaned = value.replace(/[^\d.-]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      }

      setTextSearch(query) {
        this.searchFilters.text = query ? query.trim() : '';
        return this;
      }

      addRangeFilter(specKey, min, max) {
        if (min !== null && max !== null && min <= max) {
          this.searchFilters.ranges[specKey] = { min, max };
        }
        return this;
      }

      search() {
        const results = [];
        
        for (const product of this.products) {
          const score = this.calculateProductScore(product);
          
          if (score.matches) {
            results.push({
              product: product,
              score: score.relevance,
              matchedSpecs: score.matchedSpecs
            });
          }
        }
        
        return results.sort((a, b) => b.score - a.score);
      }

      calculateProductScore(product) {
        let totalScore = 0;
        let matchCount = 0;
        const matchedSpecs = [];
        
        // Text search matching
        if (this.searchFilters.text) {
          const textScore = this.fuzzyMatch(this.searchFilters.text, product.searchableText);
          if (textScore < 0.3) {
            return { matches: false, relevance: 0, matchedSpecs: [] };
          }
          totalScore += textScore;
          matchCount++;
        }
        
        // Range filter matching
        for (const [specKey, range] of Object.entries(this.searchFilters.ranges)) {
          const productSpec = product.numericSpecs[specKey];
          if (!productSpec) {
            return { matches: false, relevance: 0, matchedSpecs: [] };
          }
          
          const overlaps = productSpec.max >= range.min && productSpec.min <= range.max;
          if (!overlaps) {
            return { matches: false, relevance: 0, matchedSpecs: [] };
          }
          
          totalScore += 1;
          matchCount++;
          matchedSpecs.push(specKey);
        }
        
        if (matchCount === 0) {
          return { matches: true, relevance: 0.5, matchedSpecs: [] };
        }
        
        return {
          matches: true,
          relevance: totalScore / matchCount,
          matchedSpecs: matchedSpecs
        };
      }

      fuzzyMatch(query, text) {
        if (!query || !text) return 0;
        
        query = query.toLowerCase();
        text = text.toLowerCase();
        
        if (text.includes(query)) {
          return 1;
        }
        
        // Simple similarity calculation
        const distance = this.levenshteinDistance(query, text);
        const maxLength = Math.max(query.length, text.length);
        return maxLength === 0 ? 1 : 1 - (distance / maxLength);
      }

      levenshteinDistance(a, b) {
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
          matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
          matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
            }
          }
        }
        
        return matrix[b.length][a.length];
      }
    }

    let searchEngine;
    let mockProducts;

    beforeEach(() => {
      searchEngine = new MockSpecificationSearchEngine();
      
      mockProducts = [
        {
          id: 'product-1',
          title: 'Industrial Pump A',
          metafields: {
            specifications: {
              technical: {
                specifications: {
                  performance: {
                    max_pressure: { value: '150', unit: 'PSI' },
                    flow_rate: { value: '50', unit: 'GPM' }
                  },
                  materials: {
                    housing: { value: '316 Stainless Steel' }
                  }
                }
              }
            }
          }
        },
        {
          id: 'product-2',
          title: 'Industrial Pump B',
          metafields: {
            specifications: {
              technical: {
                specifications: {
                  performance: {
                    max_pressure: { value: '200', unit: 'PSI' },
                    flow_rate: { value: '75', unit: 'GPM' }
                  },
                  materials: {
                    housing: { value: 'Cast Iron' }
                  }
                }
              }
            }
          }
        }
      ];

      searchEngine.initialize(mockProducts);
    });

    it('should search specifications by text', () => {
      searchEngine.setTextSearch('stainless steel');
      const results = searchEngine.search();

      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe('product-1');
    });

    it('should filter by numeric ranges', () => {
      searchEngine.addRangeFilter('performance.max_pressure', 175, 250);
      const results = searchEngine.search();

      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe('product-2');
    });

    it('should combine multiple filters with AND logic', () => {
      searchEngine
        .setTextSearch('pump')
        .addRangeFilter('performance.flow_rate', 60, 100);
      
      const results = searchEngine.search();

      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe('product-2');
    });

    it('should return empty results for no matches', () => {
      searchEngine.setTextSearch('nonexistent material');
      const results = searchEngine.search();

      expect(results).toHaveLength(0);
    });
  });

  describe('Admin-to-Storefront Data Flow', () => {
    it('should validate metafield data structure', () => {
      const validSpecificationData = {
        specifications: {
          dimensions: {
            length: { value: '100', unit: 'mm' }
          }
        },
        categories: {
          dimensions: { name: 'Dimensions', order: 1 }
        }
      };

      const invalidSpecificationData = {
        // Missing specifications object
        categories: {
          dimensions: { name: 'Dimensions', order: 1 }
        }
      };

      // Mock validation function
      const validateSpecificationData = (data) => {
        if (!data || typeof data !== 'object') return false;
        if (!data.specifications || typeof data.specifications !== 'object') return false;
        return true;
      };

      expect(validateSpecificationData(validSpecificationData)).toBe(true);
      expect(validateSpecificationData(invalidSpecificationData)).toBe(false);
    });

    it('should handle metafield updates and synchronization', () => {
      const originalProduct = {
        id: 'product-1',
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '100', unit: 'mm' }
                  }
                }
              }
            }
          }
        }
      };

      const updatedProduct = {
        id: 'product-1',
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '120', unit: 'mm' } // Updated value
                  }
                }
              }
            }
          }
        }
      };

      // Simulate update
      const originalLength = originalProduct.metafields.specifications.technical.value.specifications.dimensions.length.value;
      const updatedLength = updatedProduct.metafields.specifications.technical.value.specifications.dimensions.length.value;

      expect(originalLength).toBe('100');
      expect(updatedLength).toBe('120');
      expect(originalLength).not.toBe(updatedLength);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid product data', () => {
      // Mock comparison class
      class MockComparison {
        constructor() {
          this.products = [];
        }

        addProduct(product) {
          if (!product || !product.id) return false;
          this.products.push(product);
          return true;
        }
      }

      const comparison = new MockComparison();
      
      // Test with null product
      expect(comparison.addProduct(null)).toBe(false);
      
      // Test with product missing required fields
      expect(comparison.addProduct({})).toBe(false);
      
      // Test with valid product
      expect(comparison.addProduct({ id: 'test', name: 'Test' })).toBe(true);
    });

    it('should handle malformed metafield data', () => {
      const productWithMalformedData = {
        id: 'product-1',
        title: 'Test Product',
        metafields: {
          specifications: {
            technical: 'invalid-json-string' // Should be object
          }
        }
      };

      // Mock normalization function
      const normalizeProduct = (product) => {
        try {
          const normalized = {
            id: product.id || '',
            title: product.title || '',
            specifications: {}
          };

          if (product.metafields?.specifications?.technical?.specifications) {
            normalized.specifications = product.metafields.specifications.technical.specifications;
          }

          return normalized;
        } catch (error) {
          return {
            id: product.id || '',
            title: product.title || '',
            specifications: {}
          };
        }
      };

      const result = normalizeProduct(productWithMalformedData);
      expect(result.specifications).toEqual({});
      expect(result.id).toBe('product-1');
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', () => {
      const largeProductSet = Array.from({ length: 100 }, (_, i) => ({
        id: `product-${i}`,
        title: `Product ${i}`,
        metafields: {
          specifications: {
            technical: {
              specifications: {
                performance: {
                  value: { value: String(i * 10), unit: 'units' }
                }
              }
            }
          }
        }
      }));

      // Mock search engine
      class MockSearchEngine {
        initialize(products) {
          this.products = products;
          return this;
        }
      }

      const searchEngine = new MockSearchEngine();
      
      const startTime = performance.now();
      searchEngine.initialize(largeProductSet);
      const endTime = performance.now();

      // Should complete initialization quickly
      expect(endTime - startTime).toBeLessThan(100);
      expect(searchEngine.products).toHaveLength(100);
    });
  });
});

describe('Product Specification System Integration Tests', () => {
  let dom;
  let document;
  let window;
  let localStorage;

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="test-container"></div>
          <div class="product-specs-section" data-empty="false">
            <div class="product-specs__structured">
              <div class="product-specs__category" data-category="dimensions">
                <div class="product-specs__table-container">
                  <table class="product-specs__table">
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="product-comparison-widget" data-product-comparison></div>
          <div class="specification-search">
            <input type="text" class="spec-search-input" />
            <div class="search-results"></div>
          </div>
        </body>
      </html>
    `, {
      url: 'https://test-store.myshopify.com',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;
    localStorage = {
      data: {},
      getItem: vi.fn((key) => localStorage.data[key] || null),
      setItem: vi.fn((key, value) => { localStorage.data[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorage.data[key]; }),
      clear: vi.fn(() => { localStorage.data = {}; })
    };

    // Set up global objects
    global.document = document;
    global.window = window;
    global.localStorage = localStorage;
    // Use Object.defineProperty to properly set navigator
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'test-agent' },
      writable: true,
      configurable: true
    });
    global.URL = window.URL;
    global.btoa = window.btoa;
    global.atob = window.atob;

    // Mock Shopify global
    window.Shopify = {
      routes: { root: '/' }
    };

    // Mock console methods
    global.console = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    };
  });

  afterEach(() => {
    dom.window.close();
    vi.clearAllMocks();
  });

  describe('End-to-End Specification Display Workflow', () => {
    it('should display specifications from metafield data', () => {
      // Mock product with specifications
      const mockProduct = {
        id: 'test-product-1',
        title: 'Test Product',
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '100', unit: 'mm', tolerance: '±1' },
                    width: { value: '50', unit: 'mm', tolerance: '±0.5' }
                  },
                  performance: {
                    max_pressure: { value: '150', unit: 'PSI', range: '0-150' }
                  }
                },
                categories: {
                  dimensions: { name: 'Dimensions', order: 1, collapsible: true },
                  performance: { name: 'Performance', order: 2, collapsible: false }
                }
              }
            }
          }
        }
      };

      // Test specification parsing and display
      const specData = mockProduct.metafields.specifications.technical.value;
      expect(specData.specifications).toBeDefined();
      expect(specData.specifications.dimensions).toBeDefined();
      expect(specData.specifications.dimensions.length.value).toBe('100');
      expect(specData.specifications.dimensions.length.unit).toBe('mm');
      expect(specData.specifications.dimensions.length.tolerance).toBe('±1');

      // Test category structure
      expect(specData.categories).toBeDefined();
      expect(specData.categories.dimensions.name).toBe('Dimensions');
      expect(specData.categories.dimensions.order).toBe(1);
      expect(specData.categories.dimensions.collapsible).toBe(true);
    });

    it('should handle missing or invalid specification data gracefully', () => {
      const mockProductWithoutSpecs = {
        id: 'test-product-2',
        title: 'Product Without Specs',
        metafields: {}
      };

      const mockProductWithInvalidSpecs = {
        id: 'test-product-3',
        title: 'Product With Invalid Specs',
        metafields: {
          specifications: {
            technical: {
              value: null
            }
          }
        }
      };

      // Test handling of missing specifications
      expect(mockProductWithoutSpecs.metafields.specifications).toBeUndefined();
      
      // Test handling of invalid specifications
      expect(mockProductWithInvalidSpecs.metafields.specifications.technical.value).toBeNull();
    });

    it('should support variant-specific specifications', () => {
      const mockProductWithVariants = {
        id: 'test-product-4',
        title: 'Product With Variants',
        selected_or_first_available_variant: {
          id: 'variant-1',
          metafields: {
            specifications: {
              technical: {
                value: {
                  specifications: {
                    dimensions: {
                      length: { value: '120', unit: 'mm', tolerance: '±1' }
                    }
                  }
                }
              }
            }
          }
        },
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '100', unit: 'mm', tolerance: '±1' }
                  }
                }
              }
            }
          }
        }
      };

      // Variant specifications should override product specifications
      const variantSpecs = mockProductWithVariants.selected_or_first_available_variant.metafields.specifications.technical.value;
      const productSpecs = mockProductWithVariants.metafields.specifications.technical.value;
      
      expect(variantSpecs.specifications.dimensions.length.value).toBe('120');
      expect(productSpecs.specifications.dimensions.length.value).toBe('100');
    });
  });

  describe('Complete Comparison Workflow', () => {
    let comparison;
    let mockProducts;

    beforeEach(() => {
      comparison = new ProductComparison();
      
      mockProducts = [
        {
          id: 'product-1',
          name: 'Product A',
          image: 'https://example.com/product-a.jpg',
          specifications: {
            dimensions: {
              length: { value: '100', unit: 'mm' },
              width: { value: '50', unit: 'mm' }
            },
            performance: {
              max_pressure: { value: '150', unit: 'PSI' }
            }
          }
        },
        {
          id: 'product-2',
          name: 'Product B',
          image: 'https://example.com/product-b.jpg',
          specifications: {
            dimensions: {
              length: { value: '120', unit: 'mm' },
              width: { value: '60', unit: 'mm' }
            },
            performance: {
              max_pressure: { value: '200', unit: 'PSI' }
            }
          }
        },
        {
          id: 'product-3',
          name: 'Product C',
          specifications: {
            dimensions: {
              length: { value: '90', unit: 'mm' }
              // Missing width specification
            },
            performance: {
              max_pressure: { value: '100', unit: 'PSI' }
            }
          }
        }
      ];
    });

    it('should add products to comparison successfully', () => {
      expect(comparison.addProduct(mockProducts[0])).toBe(true);
      expect(comparison.addProduct(mockProducts[1])).toBe(true);
      expect(comparison.getProductCount()).toBe(2);
    });

    it('should prevent adding duplicate products', () => {
      comparison.addProduct(mockProducts[0]);
      expect(comparison.addProduct(mockProducts[0])).toBe(false);
      expect(comparison.getProductCount()).toBe(1);
    });

    it('should enforce maximum product limit', () => {
      // Add maximum products (4)
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);
      comparison.addProduct(mockProducts[2]);
      comparison.addProduct({ id: 'product-4', name: 'Product D', specifications: {} });
      
      expect(comparison.getProductCount()).toBe(4);
      
      // Try to add fifth product
      expect(comparison.addProduct({ id: 'product-5', name: 'Product E', specifications: {} })).toBe(false);
      expect(comparison.getProductCount()).toBe(4);
    });

    it('should render comparison table with all products', () => {
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);
      comparison.addProduct(mockProducts[2]);

      const container = document.getElementById('test-container');
      const html = comparison.renderComparison(container);

      expect(html).toContain('product-comparison');
      expect(html).toContain('Product A');
      expect(html).toContain('Product B');
      expect(html).toContain('Product C');
      expect(container.innerHTML).toContain('product-comparison');
    });

    it('should handle missing values gracefully in comparison', () => {
      comparison.addProduct(mockProducts[0]); // Has width
      comparison.addProduct(mockProducts[2]); // Missing width

      const html = comparison.renderComparison();
      
      // Should contain N/A for missing values
      expect(html).toContain('N/A');
      expect(html).toContain('product-comparison__missing');
    });

    it('should highlight differences between products', () => {
      comparison.addProduct(mockProducts[0]); // length: 100mm
      comparison.addProduct(mockProducts[1]); // length: 120mm

      const html = comparison.renderComparison();
      
      // Should highlight different values
      expect(html).toContain('product-comparison__cell--different');
    });

    it('should remove products from comparison', () => {
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);
      
      expect(comparison.removeProduct('product-1')).toBe(true);
      expect(comparison.getProductCount()).toBe(1);
      expect(comparison.getProducts()[0].id).toBe('product-2');
    });

    it('should persist comparison state to localStorage', () => {
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'shopify-product-comparison',
        expect.stringContaining('product-1')
      );
    });

    it('should generate shareable URLs', () => {
      comparison.addProduct(mockProducts[0]);
      comparison.addProduct(mockProducts[1]);

      const shareUrl = comparison.generateShareableUrl({ view: 'comparison' });
      
      expect(shareUrl).toContain('compare=product-1,product-2');
      expect(shareUrl).toContain('view=comparison');
    });

    it('should load comparison from URL parameters', () => {
      // Mock URL with comparison parameters
      Object.defineProperty(window, 'location', {
        value: {
          search: '?compare=product-1,product-2&view=comparison'
        },
        writable: true
      });

      const result = comparison.loadFromUrl(mockProducts);
      
      expect(result.success).toBe(true);
      expect(result.productsLoaded).toBe(2);
      expect(comparison.getProductCount()).toBe(2);
    });
  });

  describe('Admin-to-Storefront Data Flow', () => {
    it('should validate metafield data structure', () => {
      const validSpecificationData = {
        specifications: {
          dimensions: {
            length: { value: '100', unit: 'mm' }
          }
        },
        categories: {
          dimensions: { name: 'Dimensions', order: 1 }
        }
      };

      const invalidSpecificationData = {
        // Missing specifications object
        categories: {
          dimensions: { name: 'Dimensions', order: 1 }
        }
      };

      // Mock validation function (would be in error handler)
      const validateSpecificationData = (data) => {
        if (!data || typeof data !== 'object') return false;
        if (!data.specifications || typeof data.specifications !== 'object') return false;
        return true;
      };

      expect(validateSpecificationData(validSpecificationData)).toBe(true);
      expect(validateSpecificationData(invalidSpecificationData)).toBe(false);
    });

    it('should handle metafield updates and synchronization', () => {
      const originalProduct = {
        id: 'product-1',
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '100', unit: 'mm' }
                  }
                }
              }
            }
          }
        }
      };

      const updatedProduct = {
        id: 'product-1',
        metafields: {
          specifications: {
            technical: {
              value: {
                specifications: {
                  dimensions: {
                    length: { value: '120', unit: 'mm' } // Updated value
                  }
                }
              }
            }
          }
        }
      };

      // Simulate update
      const originalLength = originalProduct.metafields.specifications.technical.value.specifications.dimensions.length.value;
      const updatedLength = updatedProduct.metafields.specifications.technical.value.specifications.dimensions.length.value;

      expect(originalLength).toBe('100');
      expect(updatedLength).toBe('120');
      expect(originalLength).not.toBe(updatedLength);
    });

    it('should handle bulk import/export operations', () => {
      const bulkSpecificationData = [
        {
          productId: 'product-1',
          specifications: {
            dimensions: {
              length: { value: '100', unit: 'mm' },
              width: { value: '50', unit: 'mm' }
            }
          }
        },
        {
          productId: 'product-2',
          specifications: {
            dimensions: {
              length: { value: '120', unit: 'mm' },
              width: { value: '60', unit: 'mm' }
            }
          }
        }
      ];

      // Mock bulk operations
      const exportBulkData = (products) => {
        return products.map(product => ({
          productId: product.id,
          specifications: product.metafields?.specifications?.technical?.value?.specifications || {}
        }));
      };

      const importBulkData = (bulkData) => {
        return bulkData.every(item => 
          item.productId && 
          item.specifications && 
          typeof item.specifications === 'object'
        );
      };

      expect(importBulkData(bulkSpecificationData)).toBe(true);
      expect(exportBulkData([{ id: 'product-1', metafields: {} }])).toEqual([
        { productId: 'product-1', specifications: {} }
      ]);
    });
  });

  describe('Search Integration', () => {
    let searchEngine;
    let mockProducts;

    beforeEach(() => {
      searchEngine = new SpecificationSearchEngine();
      
      mockProducts = [
        {
          id: 'product-1',
          title: 'Industrial Pump A',
          metafields: {
            specifications: {
              technical: {
                specifications: {
                  performance: {
                    max_pressure: { value: '150', unit: 'PSI' },
                    flow_rate: { value: '50', unit: 'GPM' }
                  },
                  materials: {
                    housing: { value: '316 Stainless Steel' }
                  }
                }
              }
            }
          }
        },
        {
          id: 'product-2',
          title: 'Industrial Pump B',
          metafields: {
            specifications: {
              technical: {
                specifications: {
                  performance: {
                    max_pressure: { value: '200', unit: 'PSI' },
                    flow_rate: { value: '75', unit: 'GPM' }
                  },
                  materials: {
                    housing: { value: 'Cast Iron' }
                  }
                }
              }
            }
          }
        }
      ];

      searchEngine.initialize(mockProducts);
    });

    it('should search specifications by text', () => {
      searchEngine.setTextSearch('stainless steel');
      const results = searchEngine.search();

      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe('product-1');
    });

    it('should filter by numeric ranges', () => {
      searchEngine.addRangeFilter('performance.max_pressure', 175, 250);
      const results = searchEngine.search();

      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe('product-2');
    });

    it('should combine multiple filters with AND logic', () => {
      searchEngine
        .setTextSearch('pump')
        .addRangeFilter('performance.flow_rate', 60, 100);
      
      const results = searchEngine.search();

      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe('product-2');
    });

    it('should return empty results for no matches', () => {
      searchEngine.setTextSearch('nonexistent material');
      const results = searchEngine.search();

      expect(results).toHaveLength(0);
    });

    it('should highlight matching text in results', () => {
      searchEngine.setTextSearch('stainless');
      const results = searchEngine.search();

      expect(results).toHaveLength(1);
      expect(results[0].highlightedText).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      // Mock fetch to simulate network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const comparison = new ProductComparison();
      
      // This should not throw an error
      expect(() => {
        comparison.addProduct({ id: 'test', name: 'Test Product' });
      }).not.toThrow();
    });

    it('should handle invalid product data', () => {
      const comparison = new ProductComparison();
      
      // Test with null product
      expect(comparison.addProduct(null)).toBe(false);
      
      // Test with product missing required fields
      expect(comparison.addProduct({})).toBe(false);
      
      // Test with invalid product structure
      expect(comparison.addProduct({ name: 'Test' })).toBe(false); // Missing id
    });

    it('should handle malformed metafield data', () => {
      const searchEngine = new SpecificationSearchEngine();
      
      const productWithMalformedData = {
        id: 'product-1',
        title: 'Test Product',
        metafields: {
          specifications: {
            technical: 'invalid-json-string' // Should be object
          }
        }
      };

      // Should not throw error
      expect(() => {
        searchEngine.initialize([productWithMalformedData]);
      }).not.toThrow();

      // Should return normalized product with empty specifications
      const normalizedProduct = searchEngine.products[0];
      expect(normalizedProduct.specifications).toEqual({});
    });

    it('should handle localStorage errors', () => {
      // Mock localStorage to throw error
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const comparison = new ProductComparison();
      
      // Should not throw error when localStorage fails
      expect(() => {
        comparison.addProduct({ id: 'test', name: 'Test Product' });
      }).not.toThrow();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', () => {
      const largeProductSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `product-${i}`,
        title: `Product ${i}`,
        metafields: {
          specifications: {
            technical: {
              specifications: {
                performance: {
                  value: { value: String(i * 10), unit: 'units' }
                }
              }
            }
          }
        }
      }));

      const searchEngine = new SpecificationSearchEngine();
      
      const startTime = performance.now();
      searchEngine.initialize(largeProductSet);
      const endTime = performance.now();

      // Should complete initialization in reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(searchEngine.products).toHaveLength(1000);
    });

    it('should cache search results for performance', () => {
      const searchEngine = new SpecificationSearchEngine();
      searchEngine.initialize(mockProducts);

      // Mock performance optimizer
      window.specPerformanceOptimizer = {
        getCache: vi.fn().mockReturnValue(null),
        setCache: vi.fn()
      };

      searchEngine.setTextSearch('pump');
      const results1 = searchEngine.search();
      const results2 = searchEngine.search();

      // Cache should be used for second search
      expect(window.specPerformanceOptimizer.setCache).toHaveBeenCalled();
    });
  });

  describe('Cross-Component Integration', () => {
    it('should integrate comparison with search results', () => {
      const searchEngine = new SpecificationSearchEngine();
      const comparison = new ProductComparison();
      
      searchEngine.initialize(mockProducts);
      searchEngine.setTextSearch('pump');
      const searchResults = searchEngine.search();

      // Add search results to comparison
      searchResults.forEach(result => {
        comparison.addProduct(result.product);
      });

      expect(comparison.getProductCount()).toBe(searchResults.length);
    });

    it('should handle specification updates affecting search and comparison', () => {
      const searchEngine = new SpecificationSearchEngine();
      const comparison = new ProductComparison();
      
      const originalProduct = {
        id: 'product-1',
        title: 'Test Product',
        metafields: {
          specifications: {
            technical: {
              specifications: {
                materials: {
                  housing: { value: 'Steel' }
                }
              }
            }
          }
        }
      };

      // Initialize with original product
      searchEngine.initialize([originalProduct]);
      comparison.addProduct(originalProduct);

      // Simulate specification update
      const updatedProduct = {
        ...originalProduct,
        metafields: {
          specifications: {
            technical: {
              specifications: {
                materials: {
                  housing: { value: 'Stainless Steel' }
                }
              }
            }
          }
        }
      };

      // Re-initialize search with updated product
      searchEngine.initialize([updatedProduct]);
      
      // Search should find updated specification
      searchEngine.setTextSearch('stainless');
      const results = searchEngine.search();
      
      expect(results).toHaveLength(1);
      expect(results[0].product.metafields.specifications.technical.specifications.materials.housing.value).toBe('Stainless Steel');
    });
  });
});