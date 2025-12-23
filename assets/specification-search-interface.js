/**
 * Specification Search Interface
 * Connects the SpecificationSearchEngine with the UI components
 * Handles search result highlighting and empty states
 * 
 * Requirements: 6.4, 6.5
 */

class SpecificationSearchInterface {
  constructor(data) {
    this.data = data;
    this.searchEngine = new SpecificationSearchEngine(data.settings);
    this.currentResults = [];
    this.debounceTimer = null;
    
    // DOM elements
    this.elements = {};
    
    // State
    this.isInitialized = false;
  }

  /**
   * Initialize the search interface
   */
  initialize() {
    if (this.isInitialized) return;
    
    this.cacheElements();
    this.setupSearchEngine();
    this.bindEvents();
    this.populateFilters();
    this.showInitialState();
    
    this.isInitialized = true;
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      searchInput: document.getElementById('spec-search-input'),
      clearBtn: document.querySelector('.specification-search__clear-btn'),
      categoryFilter: document.getElementById('spec-category-filter'),
      rangeFilter: document.getElementById('spec-range-filter'),
      rangeInputs: document.querySelector('.specification-search__range-inputs'),
      rangeMin: document.getElementById('spec-range-min'),
      rangeMax: document.getElementById('spec-range-max'),
      rangeUnit: document.querySelector('.specification-search__range-unit'),
      clearFilters: document.querySelector('.specification-search__clear-filters'),
      sortSelect: document.getElementById('spec-sort'),
      loading: document.querySelector('.specification-search__loading'),
      empty: document.querySelector('.specification-search__empty'),
      resultsList: document.querySelector('.specification-search__results-list'),
      resultsCount: document.querySelector('.specification-search__count'),
      productsContainer: document.querySelector('.specification-search__products')
    };
  }

  /**
   * Setup the search engine with product data
   */
  setupSearchEngine() {
    this.searchEngine.initialize(this.data.products);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Search input
    this.elements.searchInput.addEventListener('input', (e) => {
      this.debounceSearch(() => this.handleSearchInput(e.target.value));
    });

    // Clear search button
    this.elements.clearBtn.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.handleSearchInput('');
    });

    // Category filter
    this.elements.categoryFilter.addEventListener('change', (e) => {
      this.handleCategoryFilter(e.target.value);
    });

    // Range filter
    this.elements.rangeFilter.addEventListener('change', (e) => {
      this.handleRangeFilterSelect(e.target.value);
    });

    // Range inputs
    this.elements.rangeMin.addEventListener('input', () => {
      this.debounceSearch(() => this.handleRangeInputs());
    });

    this.elements.rangeMax.addEventListener('input', () => {
      this.debounceSearch(() => this.handleRangeInputs());
    });

    // Clear filters
    this.elements.clearFilters.addEventListener('click', () => {
      this.clearAllFilters();
    });

    // Sort
    this.elements.sortSelect.addEventListener('change', (e) => {
      this.handleSort(e.target.value);
    });
  }

  /**
   * Populate filter dropdowns with available options
   */
  populateFilters() {
    // Populate category filter
    const categories = this.searchEngine.getAvailableCategories();
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = this.formatCategoryName(category);
      this.elements.categoryFilter.appendChild(option);
    });

    // Populate range filter
    const numericSpecs = this.searchEngine.getNumericSpecificationKeys();
    numericSpecs.forEach(specKey => {
      const option = document.createElement('option');
      option.value = specKey;
      option.textContent = this.formatSpecificationName(specKey);
      this.elements.rangeFilter.appendChild(option);
    });
  }

  /**
   * Show initial state (all products or empty state)
   */
  showInitialState() {
    this.performSearch();
  }

  /**
   * Debounce search to avoid excessive API calls
   */
  debounceSearch(callback) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(callback, 300);
  }

  /**
   * Handle search input changes
   */
  handleSearchInput(query) {
    this.searchEngine.setTextSearch(query);
    this.performSearch();
  }

  /**
   * Handle category filter changes
   */
  handleCategoryFilter(category) {
    this.searchEngine.clearFilters();
    
    // Re-apply text search if present
    const searchQuery = this.elements.searchInput.value;
    if (searchQuery) {
      this.searchEngine.setTextSearch(searchQuery);
    }
    
    // Apply category filter
    if (category) {
      this.searchEngine.addCategoryFilter(category);
    }
    
    // Re-apply range filter if present
    const rangeSpec = this.elements.rangeFilter.value;
    if (rangeSpec && this.elements.rangeMin.value && this.elements.rangeMax.value) {
      const min = parseFloat(this.elements.rangeMin.value);
      const max = parseFloat(this.elements.rangeMax.value);
      this.searchEngine.addRangeFilter(rangeSpec, min, max);
    }
    
    this.performSearch();
  }

  /**
   * Handle range filter dropdown selection
   */
  handleRangeFilterSelect(specKey) {
    if (specKey) {
      const range = this.searchEngine.getSpecificationRange(specKey);
      if (range) {
        this.elements.rangeInputs.style.display = 'flex';
        this.elements.rangeMin.placeholder = `Min (${range.min})`;
        this.elements.rangeMax.placeholder = `Max (${range.max})`;
        this.elements.rangeUnit.textContent = range.unit || '';
        
        // Clear previous values
        this.elements.rangeMin.value = '';
        this.elements.rangeMax.value = '';
      }
    } else {
      this.elements.rangeInputs.style.display = 'none';
      this.searchEngine.removeRangeFilter(this.getCurrentRangeSpec());
      this.performSearch();
    }
  }

  /**
   * Handle range input changes
   */
  handleRangeInputs() {
    const specKey = this.elements.rangeFilter.value;
    const min = this.elements.rangeMin.value;
    const max = this.elements.rangeMax.value;
    
    if (specKey && min && max) {
      const minVal = parseFloat(min);
      const maxVal = parseFloat(max);
      
      if (!isNaN(minVal) && !isNaN(maxVal) && minVal <= maxVal) {
        this.searchEngine.removeRangeFilter(specKey);
        this.searchEngine.addRangeFilter(specKey, minVal, maxVal);
        this.performSearch();
      }
    }
  }

  /**
   * Clear all filters and search
   */
  clearAllFilters() {
    this.elements.searchInput.value = '';
    this.elements.categoryFilter.value = '';
    this.elements.rangeFilter.value = '';
    this.elements.rangeInputs.style.display = 'none';
    this.elements.rangeMin.value = '';
    this.elements.rangeMax.value = '';
    
    this.searchEngine.clearFilters();
    this.performSearch();
  }

  /**
   * Handle sort changes
   */
  handleSort(sortBy) {
    if (sortBy === 'title') {
      this.currentResults.sort((a, b) => a.product.title.localeCompare(b.product.title));
    } else {
      // Sort by relevance (default)
      this.currentResults.sort((a, b) => b.score - a.score);
    }
    
    this.renderResults();
  }

  /**
   * Perform search and update UI
   */
  performSearch() {
    this.showLoading();
    
    // Simulate async search (in real implementation, this might be async)
    setTimeout(() => {
      this.currentResults = this.searchEngine.search();
      
      // Limit results
      const maxResults = this.data.settings.maxResults || 20;
      if (this.currentResults.length > maxResults) {
        this.currentResults = this.currentResults.slice(0, maxResults);
      }
      
      this.hideLoading();
      
      if (this.currentResults.length === 0) {
        this.showEmptyState();
      } else {
        this.showResults();
      }
    }, 100);
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.elements.loading.style.display = 'flex';
    this.elements.empty.style.display = 'none';
    this.elements.resultsList.style.display = 'none';
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.elements.loading.style.display = 'none';
  }

  /**
   * Show empty state with helpful messaging
   */
  showEmptyState() {
    this.elements.empty.style.display = 'block';
    this.elements.resultsList.style.display = 'none';
    
    // Update empty state messaging based on active filters
    this.updateEmptyStateMessage();
  }

  /**
   * Show results
   */
  showResults() {
    this.elements.empty.style.display = 'none';
    this.elements.resultsList.style.display = 'block';
    
    this.updateResultsCount();
    this.renderResults();
  }

  /**
   * Update empty state message based on current filters
   */
  updateEmptyStateMessage() {
    const hasTextSearch = this.elements.searchInput.value.trim() !== '';
    const hasCategoryFilter = this.elements.categoryFilter.value !== '';
    const hasRangeFilter = this.elements.rangeFilter.value !== '' && 
                          (this.elements.rangeMin.value !== '' || this.elements.rangeMax.value !== '');
    
    const emptyTitle = this.elements.empty.querySelector('.specification-search__empty-title');
    const emptyDescription = this.elements.empty.querySelector('.specification-search__empty-description');
    
    if (hasTextSearch || hasCategoryFilter || hasRangeFilter) {
      emptyTitle.textContent = 'No matching specifications found';
      emptyDescription.textContent = 'Try adjusting your search terms or filters to find what you\'re looking for.';
    } else {
      emptyTitle.textContent = 'No specifications available';
      emptyDescription.textContent = 'There are no products with specifications to search through.';
    }
  }

  /**
   * Update results count display
   */
  updateResultsCount() {
    this.elements.resultsCount.textContent = this.currentResults.length;
  }

  /**
   * Render search results
   */
  renderResults() {
    this.elements.productsContainer.innerHTML = '';
    
    this.currentResults.forEach(result => {
      const productElement = this.createProductElement(result);
      this.elements.productsContainer.appendChild(productElement);
    });
  }

  /**
   * Create product element with highlighted specifications
   */
  createProductElement(result) {
    const { product, highlightedText, matchedSpecs } = result;
    
    const productDiv = document.createElement('div');
    productDiv.className = 'specification-search__product';
    
    // Product header
    const header = document.createElement('div');
    header.className = 'specification-search__product-header';
    
    // Product image
    if (this.data.settings.showImages && product.featured_image.url) {
      const img = document.createElement('img');
      img.src = product.featured_image.url;
      img.alt = product.featured_image.alt || product.title;
      img.className = 'specification-search__product-image';
      header.appendChild(img);
    }
    
    // Product info
    const info = document.createElement('div');
    info.className = 'specification-search__product-info';
    
    const title = document.createElement('h3');
    title.className = 'specification-search__product-title';
    title.innerHTML = `<a href="${product.url}">${product.title}</a>`;
    info.appendChild(title);
    
    if (this.data.settings.showPrices && product.price) {
      const price = document.createElement('div');
      price.className = 'specification-search__product-price';
      price.textContent = this.formatPrice(product.price, product.compare_at_price);
      info.appendChild(price);
    }
    
    header.appendChild(info);
    productDiv.appendChild(header);
    
    // Specifications
    if (matchedSpecs.length > 0) {
      const specsDiv = document.createElement('div');
      specsDiv.className = 'specification-search__product-specs';
      
      const matchesText = document.createElement('div');
      matchesText.className = 'specification-search__spec-matches';
      matchesText.textContent = `${matchedSpecs.length} matching specification${matchedSpecs.length !== 1 ? 's' : ''}:`;
      specsDiv.appendChild(matchesText);
      
      // Show first few matched specifications
      const specsToShow = matchedSpecs.slice(0, 3);
      specsToShow.forEach(specKey => {
        const specElement = this.createSpecificationElement(product, specKey, highlightedText);
        if (specElement) {
          specsDiv.appendChild(specElement);
        }
      });
      
      productDiv.appendChild(specsDiv);
    }
    
    return productDiv;
  }

  /**
   * Create specification element with highlighting
   */
  createSpecificationElement(product, specKey, highlightedText) {
    const [categoryKey, specName] = specKey.split('.');
    const categorySpecs = product.specifications[categoryKey];
    
    if (!categorySpecs || !categorySpecs[specName]) {
      return null;
    }
    
    const spec = categorySpecs[specName];
    const specDiv = document.createElement('div');
    specDiv.className = 'specification-search__spec-item';
    
    const label = document.createElement('span');
    label.className = 'specification-search__spec-label';
    
    // Use highlighted display name if available
    const highlightedSpec = highlightedText[specKey];
    if (highlightedSpec && highlightedSpec.display_name) {
      label.innerHTML = highlightedSpec.display_name;
    } else {
      label.textContent = spec.display_name || this.formatSpecificationName(specName);
    }
    
    const value = document.createElement('span');
    value.className = 'specification-search__spec-value';
    
    // Use highlighted value if available
    if (highlightedSpec && highlightedSpec.value) {
      value.innerHTML = highlightedSpec.value;
    } else {
      value.textContent = spec.value;
    }
    
    // Add unit if present
    if (spec.unit) {
      value.innerHTML += ` <span class="specification-search__spec-unit">${spec.unit}</span>`;
    }
    
    specDiv.appendChild(label);
    specDiv.appendChild(value);
    
    return specDiv;
  }

  /**
   * Format category name for display
   */
  formatCategoryName(category) {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format specification name for display
   */
  formatSpecificationName(specKey) {
    const parts = specKey.split('.');
    const specName = parts[parts.length - 1];
    return specName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format price for display
   */
  formatPrice(price, compareAtPrice) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    const formattedPrice = formatter.format(price / 100);
    
    if (compareAtPrice && compareAtPrice > price) {
      const formattedComparePrice = formatter.format(compareAtPrice / 100);
      return `${formattedPrice} (was ${formattedComparePrice})`;
    }
    
    return formattedPrice;
  }

  /**
   * Get currently selected range specification
   */
  getCurrentRangeSpec() {
    return this.elements.rangeFilter.value;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpecificationSearchInterface;
} else if (typeof window !== 'undefined') {
  window.SpecificationSearchInterface = SpecificationSearchInterface;
}