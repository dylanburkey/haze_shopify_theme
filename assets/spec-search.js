/**
 * Specification Search Engine
 * Provides fuzzy text matching, range-based filtering, and multi-criteria search
 * for product specifications with AND logic combination
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

class SpecificationSearchEngine {
  constructor(options = {}) {
    this.options = {
      fuzzyThreshold: 0.6, // Minimum similarity score for fuzzy matching
      highlightClass: 'spec-search-highlight',
      ...options
    };
    
    this.products = [];
    this.searchFilters = {
      text: '',
      ranges: {},
      categories: []
    };
  }

  /**
   * Initialize the search engine with product data
   * @param {Array} products - Array of product objects with specifications
   */
  initialize(products) {
    try {
      if (!Array.isArray(products)) {
        console.error('Invalid products data: expected array');
        this.products = [];
        return this;
      }
      
      this.products = products
        .filter(product => product && product.id) // Filter out invalid products
        .map(product => this.normalizeProduct(product));
      
      return this;
    } catch (error) {
      console.error('Error initializing search engine:', error);
      this.products = [];
      return this;
    }
  }

  /**
   * Normalize product data for consistent searching
   * @param {Object} product - Raw product object
   * @returns {Object} Normalized product object
   */
  normalizeProduct(product) {
    try {
      // Check cache first
      const cacheKey = `normalized_product_${product.id}`;
      if (window.specPerformanceOptimizer) {
        const cached = window.specPerformanceOptimizer.getCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const normalized = {
        id: product.id || '',
        title: product.title || '',
        handle: product.handle || '',
        specifications: {},
        searchableText: '',
        numericSpecs: {}
      };

      // Parse specifications from metafields with error handling and caching
      if (product.metafields && product.metafields.specifications) {
        let specData;
        
        if (window.specPerformanceOptimizer) {
          specData = window.specPerformanceOptimizer.parseMetafieldWithCache(product, 'specifications');
        } else {
          specData = product.metafields.specifications.technical;
        }
        
        if (specData && specData.specifications) {
          normalized.specifications = specData.specifications;
          
          // Build searchable text and extract numeric values
          this.buildSearchableContent(normalized, specData);
        }
      }

      // Cache the normalized product
      if (window.specPerformanceOptimizer) {
        window.specPerformanceOptimizer.setCache(cacheKey, normalized);
      }

      return normalized;
    } catch (error) {
      console.error('Error normalizing product:', product.id, error);
      // Return minimal valid product structure
      return {
        id: product.id || '',
        title: product.title || '',
        handle: product.handle || '',
        specifications: {},
        searchableText: product.title || '',
        numericSpecs: {}
      };
    }
  }

  /**
   * Build searchable text content and extract numeric specifications
   * @param {Object} normalized - Normalized product object
   * @param {Object} specData - Specification data
   */
  buildSearchableContent(normalized, specData) {
    const textParts = [normalized.title];
    
    // Process each category of specifications
    Object.entries(specData.specifications).forEach(([categoryKey, categorySpecs]) => {
      Object.entries(categorySpecs).forEach(([specKey, specValue]) => {
        // Add display name and key to searchable text
        if (specValue.display_name) {
          textParts.push(specValue.display_name);
        }
        textParts.push(specKey);
        
        // Add value to searchable text
        if (specValue.value) {
          textParts.push(specValue.value);
        }
        
        // Add description to searchable text
        if (specValue.description) {
          textParts.push(specValue.description);
        }
        
        // Extract numeric values for range filtering
        this.extractNumericValue(normalized, categoryKey, specKey, specValue);
      });
    });
    
    normalized.searchableText = textParts.join(' ').toLowerCase();
  }

  /**
   * Extract numeric values from specifications for range filtering
   * @param {Object} normalized - Normalized product object
   * @param {string} categoryKey - Category key
   * @param {string} specKey - Specification key
   * @param {Object} specValue - Specification value object
   */
  extractNumericValue(normalized, categoryKey, specKey, specValue) {
    const fullKey = `${categoryKey}.${specKey}`;
    
    if (specValue.value) {
      const numericValue = this.parseNumericValue(specValue.value);
      if (numericValue !== null) {
        normalized.numericSpecs[fullKey] = {
          value: numericValue,
          unit: specValue.unit || '',
          min: specValue.min ? this.parseNumericValue(specValue.min) : numericValue,
          max: specValue.max ? this.parseNumericValue(specValue.max) : numericValue
        };
      }
    }
    
    // Handle range specifications (e.g., "10-50")
    if (specValue.range) {
      const rangeParts = specValue.range.split('-');
      if (rangeParts.length === 2) {
        const min = this.parseNumericValue(rangeParts[0]);
        const max = this.parseNumericValue(rangeParts[1]);
        if (min !== null && max !== null) {
          normalized.numericSpecs[fullKey] = {
            value: (min + max) / 2, // Use average as primary value
            unit: specValue.unit || '',
            min: min,
            max: max
          };
        }
      }
    }
    
    // Handle min/max specifications
    if (specValue.min !== undefined && specValue.max !== undefined) {
      const min = this.parseNumericValue(specValue.min);
      const max = this.parseNumericValue(specValue.max);
      if (min !== null && max !== null) {
        normalized.numericSpecs[fullKey] = {
          value: (min + max) / 2,
          unit: specValue.unit || '',
          min: min,
          max: max
        };
      }
    }
  }

  /**
   * Parse numeric value from string, handling various formats
   * @param {string|number} value - Value to parse
   * @returns {number|null} Parsed numeric value or null if not numeric
   */
  parseNumericValue(value) {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      // Remove common non-numeric characters but preserve decimal points and negative signs
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }

  /**
   * Perform fuzzy text matching using Levenshtein distance
   * @param {string} query - Search query
   * @param {string} text - Text to search in
   * @returns {number} Similarity score between 0 and 1
   */
  fuzzyMatch(query, text) {
    if (!query || !text) return 0;
    
    query = query.toLowerCase();
    text = text.toLowerCase();
    
    // Exact match gets highest score
    if (text.includes(query)) {
      return 1;
    }
    
    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(query, text);
    const maxLength = Math.max(query.length, text.length);
    
    // Convert distance to similarity score
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} Edit distance
   */
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
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  /**
   * Set text search query with debouncing
   * @param {string} query - Search query
   * @returns {SpecificationSearchEngine} Chainable instance
   */
  setTextSearch(query) {
    this.searchFilters.text = query ? query.trim() : '';
    
    // Debounce search execution for performance
    if (!this.debouncedSearch && window.specPerformanceOptimizer) {
      this.debouncedSearch = window.specPerformanceOptimizer.debounce(() => {
        this.executeSearch();
      }, 300);
    }
    
    return this;
  }

  /**
   * Add range filter for numeric specifications
   * @param {string} specKey - Specification key (e.g., 'dimensions.length')
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {SpecificationSearchEngine} Chainable instance
   */
  addRangeFilter(specKey, min, max) {
    if (min !== null && max !== null && min <= max) {
      this.searchFilters.ranges[specKey] = { min, max };
    }
    return this;
  }

  /**
   * Remove range filter
   * @param {string} specKey - Specification key to remove
   * @returns {SpecificationSearchEngine} Chainable instance
   */
  removeRangeFilter(specKey) {
    delete this.searchFilters.ranges[specKey];
    return this;
  }

  /**
   * Add category filter
   * @param {string} category - Category to filter by
   * @returns {SpecificationSearchEngine} Chainable instance
   */
  addCategoryFilter(category) {
    if (category && !this.searchFilters.categories.includes(category)) {
      this.searchFilters.categories.push(category);
    }
    return this;
  }

  /**
   * Remove category filter
   * @param {string} category - Category to remove
   * @returns {SpecificationSearchEngine} Chainable instance
   */
  removeCategoryFilter(category) {
    const index = this.searchFilters.categories.indexOf(category);
    if (index > -1) {
      this.searchFilters.categories.splice(index, 1);
    }
    return this;
  }

  /**
   * Clear all filters
   * @returns {SpecificationSearchEngine} Chainable instance
   */
  clearFilters() {
    this.searchFilters = {
      text: '',
      ranges: {},
      categories: []
    };
    return this;
  }

  /**
   * Execute search with current filters using AND logic
   * @returns {Array} Array of matching products with relevance scores
   */
  search() {
    try {
      // Check cache first
      const cacheKey = `search_${JSON.stringify(this.searchFilters)}`;
      if (window.specPerformanceOptimizer) {
        const cached = window.specPerformanceOptimizer.getCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const results = [];
      
      for (const product of this.products) {
        const score = this.calculateProductScore(product);
        
        if (score.matches) {
          results.push({
            product: product,
            score: score.relevance,
            matchedSpecs: score.matchedSpecs,
            highlightedText: this.highlightMatches(product, this.searchFilters.text)
          });
        }
      }
      
      // Sort by relevance score (highest first)
      const sortedResults = results.sort((a, b) => b.score - a.score);
      
      // Cache results
      if (window.specPerformanceOptimizer) {
        window.specPerformanceOptimizer.setCache(cacheKey, sortedResults, 2 * 60 * 1000); // 2 minutes
      }
      
      return sortedResults;
    } catch (error) {
      console.error('Error executing search:', error);
      // Return empty results on error
      return [];
    }
  }

  /**
   * Execute search (for debounced calls)
   */
  executeSearch() {
    const results = this.search();
    
    // Dispatch search results event
    document.dispatchEvent(new CustomEvent('specificationSearchResults', {
      detail: { results, filters: this.searchFilters }
    }));
  }

  /**
   * Calculate relevance score for a product against current filters
   * @param {Object} product - Normalized product object
   * @returns {Object} Score object with matches boolean and relevance score
   */
  calculateProductScore(product) {
    let totalScore = 0;
    let matchCount = 0;
    const matchedSpecs = [];
    
    // Text search matching (if query provided)
    if (this.searchFilters.text) {
      const textScore = this.fuzzyMatch(this.searchFilters.text, product.searchableText);
      if (textScore < this.options.fuzzyThreshold) {
        return { matches: false, relevance: 0, matchedSpecs: [] };
      }
      totalScore += textScore;
      matchCount++;
      
      // Find specific specification matches for highlighting
      this.findSpecificationMatches(product, this.searchFilters.text, matchedSpecs);
    }
    
    // Range filter matching (AND logic - all must pass)
    for (const [specKey, range] of Object.entries(this.searchFilters.ranges)) {
      const productSpec = product.numericSpecs[specKey];
      if (!productSpec) {
        return { matches: false, relevance: 0, matchedSpecs: [] };
      }
      
      // Check if product's range overlaps with filter range
      const overlaps = productSpec.max >= range.min && productSpec.min <= range.max;
      if (!overlaps) {
        return { matches: false, relevance: 0, matchedSpecs: [] };
      }
      
      // Calculate overlap score
      const overlapScore = this.calculateOverlapScore(productSpec, range);
      totalScore += overlapScore;
      matchCount++;
      matchedSpecs.push(specKey);
    }
    
    // Category filter matching (AND logic - product must have all categories)
    for (const category of this.searchFilters.categories) {
      if (!product.specifications[category]) {
        return { matches: false, relevance: 0, matchedSpecs: [] };
      }
      matchCount++;
      matchedSpecs.push(category);
    }
    
    // If no filters applied, return all products with base score
    if (matchCount === 0) {
      return { matches: true, relevance: 0.5, matchedSpecs: [] };
    }
    
    return {
      matches: true,
      relevance: totalScore / matchCount,
      matchedSpecs: matchedSpecs
    };
  }

  /**
   * Find specific specification matches for text highlighting
   * @param {Object} product - Product object
   * @param {string} query - Search query
   * @param {Array} matchedSpecs - Array to populate with matched specifications
   */
  findSpecificationMatches(product, query, matchedSpecs) {
    Object.entries(product.specifications).forEach(([categoryKey, categorySpecs]) => {
      Object.entries(categorySpecs).forEach(([specKey, specValue]) => {
        const specText = [
          specValue.display_name || specKey,
          specValue.value || '',
          specValue.description || ''
        ].join(' ').toLowerCase();
        
        if (this.fuzzyMatch(query, specText) >= this.options.fuzzyThreshold) {
          matchedSpecs.push(`${categoryKey}.${specKey}`);
        }
      });
    });
  }

  /**
   * Calculate overlap score between product specification and filter range
   * @param {Object} productSpec - Product specification with min/max values
   * @param {Object} filterRange - Filter range with min/max values
   * @returns {number} Overlap score between 0 and 1
   */
  calculateOverlapScore(productSpec, filterRange) {
    const overlapMin = Math.max(productSpec.min, filterRange.min);
    const overlapMax = Math.min(productSpec.max, filterRange.max);
    const overlapSize = Math.max(0, overlapMax - overlapMin);
    
    const productRange = productSpec.max - productSpec.min;
    const filterSize = filterRange.max - filterRange.min;
    
    if (productRange === 0 && filterSize === 0) {
      return 1; // Both are single values and they overlap
    }
    
    const maxRange = Math.max(productRange, filterSize);
    return maxRange > 0 ? overlapSize / maxRange : 0;
  }

  /**
   * Highlight matching text in product specifications
   * @param {Object} product - Product object
   * @param {string} query - Search query
   * @returns {Object} Object with highlighted specification text
   */
  highlightMatches(product, query) {
    if (!query) return {};
    
    const highlighted = {};
    const queryLower = query.toLowerCase();
    
    Object.entries(product.specifications).forEach(([categoryKey, categorySpecs]) => {
      Object.entries(categorySpecs).forEach(([specKey, specValue]) => {
        const fullKey = `${categoryKey}.${specKey}`;
        const textToHighlight = [
          specValue.display_name || specKey,
          specValue.value || '',
          specValue.description || ''
        ];
        
        textToHighlight.forEach((text, index) => {
          if (text && text.toLowerCase().includes(queryLower)) {
            const highlightedText = this.addHighlightTags(text, query);
            if (!highlighted[fullKey]) highlighted[fullKey] = {};
            
            const fieldNames = ['display_name', 'value', 'description'];
            highlighted[fullKey][fieldNames[index]] = highlightedText;
          }
        });
      });
    });
    
    return highlighted;
  }

  /**
   * Add highlight tags around matching text
   * @param {string} text - Text to highlight
   * @param {string} query - Query to highlight
   * @returns {string} Text with highlight tags
   */
  addHighlightTags(text, query) {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, `<mark class="${this.options.highlightClass}">$1</mark>`);
  }

  /**
   * Escape special regex characters
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get available specification keys for range filtering
   * @returns {Array} Array of specification keys with numeric values
   */
  getNumericSpecificationKeys() {
    const keys = new Set();
    
    this.products.forEach(product => {
      Object.keys(product.numericSpecs).forEach(key => {
        keys.add(key);
      });
    });
    
    return Array.from(keys).sort();
  }

  /**
   * Get available categories for filtering
   * @returns {Array} Array of category keys
   */
  getAvailableCategories() {
    const categories = new Set();
    
    this.products.forEach(product => {
      Object.keys(product.specifications).forEach(category => {
        categories.add(category);
      });
    });
    
    return Array.from(categories).sort();
  }

  /**
   * Get range of values for a specific numeric specification
   * @param {string} specKey - Specification key
   * @returns {Object|null} Object with min and max values, or null if not found
   */
  getSpecificationRange(specKey) {
    let min = Infinity;
    let max = -Infinity;
    let unit = '';
    let found = false;
    
    this.products.forEach(product => {
      const spec = product.numericSpecs[specKey];
      if (spec) {
        min = Math.min(min, spec.min);
        max = Math.max(max, spec.max);
        unit = spec.unit;
        found = true;
      }
    });
    
    return found ? { min, max, unit } : null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpecificationSearchEngine;
} else if (typeof window !== 'undefined') {
  window.SpecificationSearchEngine = SpecificationSearchEngine;
}