/**
 * Performance Optimization for Product Specification System
 * Implements lazy loading, caching, and optimization strategies
 * 
 * Requirements: Performance considerations
 */

class SpecificationPerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
    this.lazyLoadObserver = null;
    this.loadedModules = new Set();
    
    this.initializeLazyLoading();
    this.initializeIntersectionObserver();
  }

  /**
   * Initialize lazy loading for comparison JavaScript
   */
  initializeLazyLoading() {
    // Lazy load comparison module when needed
    this.setupComparisonLazyLoad();
    
    // Lazy load search module when needed
    this.setupSearchLazyLoad();
    
    // Lazy load export modules when needed
    this.setupExportLazyLoad();
  }

  /**
   * Setup lazy loading for comparison functionality
   */
  setupComparisonLazyLoad() {
    const comparisonTriggers = [
      '[data-comparison-add]',
      '[data-product-comparison]',
      '.product-comparison-widget'
    ];

    comparisonTriggers.forEach(selector => {
      document.addEventListener('click', async (event) => {
        if (event.target.matches(selector) || event.target.closest(selector)) {
          await this.loadComparisonModule();
        }
      });
    });

    // Also load when comparison elements are visible
    this.observeElements(comparisonTriggers, () => this.loadComparisonModule());
  }

  /**
   * Setup lazy loading for search functionality
   */
  setupSearchLazyLoad() {
    const searchTriggers = [
      '[data-spec-search]',
      '.specification-search',
      '.spec-search-input'
    ];

    searchTriggers.forEach(selector => {
      document.addEventListener('focus', async (event) => {
        if (event.target.matches(selector) || event.target.closest(selector)) {
          await this.loadSearchModule();
        }
      }, true);
    });

    // Also load when search elements are visible
    this.observeElements(searchTriggers, () => this.loadSearchModule());
  }

  /**
   * Setup lazy loading for export functionality
   */
  setupExportLazyLoad() {
    const exportTriggers = [
      '[data-export="pdf"]',
      '[data-export="share"]',
      '.spec-export-btn'
    ];

    exportTriggers.forEach(selector => {
      document.addEventListener('click', async (event) => {
        if (event.target.matches(selector) || event.target.closest(selector)) {
          event.preventDefault();
          await this.loadExportModule();
          
          // Re-trigger the click after module is loaded
          setTimeout(() => {
            event.target.click();
          }, 100);
        }
      });
    });
  }

  /**
   * Load comparison module dynamically
   */
  async loadComparisonModule() {
    if (this.loadedModules.has('comparison')) {
      return;
    }

    try {
      // Load comparison CSS if not already loaded
      await this.loadCSS('product-comparison.css');
      
      // Load comparison JavaScript
      await this.loadScript('product-comparison.js');
      
      this.loadedModules.add('comparison');
      
      // Initialize comparison after loading
      if (window.ProductComparison && !window.productComparison) {
        window.productComparison = new window.ProductComparison();
      }
      
    } catch (error) {
      console.error('Failed to load comparison module:', error);
      if (window.specErrorHandler) {
        window.specErrorHandler.logError('module_load_failed', 'Failed to load comparison module', { error: error.message });
      }
    }
  }

  /**
   * Load search module dynamically
   */
  async loadSearchModule() {
    if (this.loadedModules.has('search')) {
      return;
    }

    try {
      // Load search JavaScript
      await this.loadScript('spec-search.js');
      await this.loadScript('specification-search-interface.js');
      
      this.loadedModules.add('search');
      
    } catch (error) {
      console.error('Failed to load search module:', error);
      if (window.specErrorHandler) {
        window.specErrorHandler.logError('module_load_failed', 'Failed to load search module', { error: error.message });
      }
    }
  }

  /**
   * Load export module dynamically
   */
  async loadExportModule() {
    if (this.loadedModules.has('export')) {
      return;
    }

    try {
      // Load export JavaScript
      await this.loadScript('pdf-export.js');
      await this.loadScript('spec-export.js');
      
      this.loadedModules.add('export');
      
    } catch (error) {
      console.error('Failed to load export module:', error);
      if (window.specErrorHandler) {
        window.specErrorHandler.logError('module_load_failed', 'Failed to load export module', { error: error.message });
      }
    }
  }

  /**
   * Load CSS file dynamically
   * @param {string} filename - CSS filename
   * @returns {Promise}
   */
  loadCSS(filename) {
    return new Promise((resolve, reject) => {
      const existingLink = document.querySelector(`link[href*="${filename}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${window.Shopify?.routes?.root || '/'}assets/${filename}`;
      
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load CSS: ${filename}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Load JavaScript file dynamically
   * @param {string} filename - JavaScript filename
   * @returns {Promise}
   */
  loadScript(filename) {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src*="${filename}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `${window.Shopify?.routes?.root || '/'}assets/${filename}`;
      script.defer = true;
      
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${filename}`));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  initializeIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      return; // Fallback for older browsers
    }

    this.lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const callback = entry.target._lazyCallback;
          if (callback) {
            callback();
            this.lazyLoadObserver.unobserve(entry.target);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
  }

  /**
   * Observe elements for lazy loading
   * @param {Array} selectors - CSS selectors to observe
   * @param {Function} callback - Callback to execute when element is visible
   */
  observeElements(selectors, callback) {
    if (!this.lazyLoadObserver) return;

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element._lazyCallback = callback;
        this.lazyLoadObserver.observe(element);
      });
    });
  }

  /**
   * Cache data with expiry
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  setCache(key, data, ttl = this.defaultCacheTTL) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {*} Cached data or null if expired/not found
   */
  getCache(key) {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Optimize metafield data parsing with caching
   * @param {Object} product - Product object
   * @param {string} namespace - Metafield namespace
   * @returns {*} Parsed metafield data
   */
  parseMetafieldWithCache(product, namespace) {
    const cacheKey = `metafield_${product.id}_${namespace}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let data = null;
      
      if (namespace === 'specifications') {
        data = product.metafields?.specifications?.technical?.value;
      } else if (namespace === 'attachments') {
        data = product.metafields?.attachments?.files?.value;
      }

      // Validate and cache the data
      if (data && typeof data === 'object') {
        this.setCache(cacheKey, data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing metafield:', error);
      return null;
    }
  }

  /**
   * Debounce function calls for performance
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately on first call
   * @returns {Function} Debounced function
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  /**
   * Throttle function calls for performance
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Optimize image loading with lazy loading
   * @param {string} selector - CSS selector for images
   */
  optimizeImageLoading(selector = 'img[data-src]') {
    if (!this.lazyLoadObserver) return;

    const images = document.querySelectorAll(selector);
    images.forEach(img => {
      img._lazyCallback = () => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
        }
      };
      this.lazyLoadObserver.observe(img);
    });
  }

  /**
   * Preload critical resources
   * @param {Array} resources - Array of resource URLs
   */
  preloadCriticalResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
        link.as = 'image';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Monitor performance metrics
   */
  monitorPerformance() {
    if (!('PerformanceObserver' in window)) return;

    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (window.specErrorHandler) {
        window.specErrorHandler.logError('performance_metric', 'LCP measured', {
          lcp: lastEntry.startTime,
          element: lastEntry.element?.tagName
        });
      }
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Ignore if not supported
    }

    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (window.specErrorHandler) {
          window.specErrorHandler.logError('performance_metric', 'FID measured', {
            fid: entry.processingStart - entry.startTime,
            eventType: entry.name
          });
        }
      });
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Ignore if not supported
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.disconnect();
    }
    
    this.cache.clear();
    this.cacheExpiry.clear();
    this.loadedModules.clear();
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    return {
      cacheSize: this.cache.size,
      loadedModules: Array.from(this.loadedModules),
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Calculate cache hit rate
   * @returns {number} Cache hit rate percentage
   */
  calculateCacheHitRate() {
    // This would need to be tracked over time in a real implementation
    return 0; // Placeholder
  }

  /**
   * Get memory usage if available
   * @returns {Object|null} Memory usage information
   */
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// Initialize performance optimizer
window.specPerformanceOptimizer = new SpecificationPerformanceOptimizer();

// Clean up expired cache periodically
setInterval(() => {
  window.specPerformanceOptimizer.clearExpiredCache();
}, 60000); // Every minute

// Monitor performance
window.specPerformanceOptimizer.monitorPerformance();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpecificationPerformanceOptimizer;
}