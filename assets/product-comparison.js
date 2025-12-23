/**
 * Product Comparison Engine
 * Handles side-by-side product specification comparisons
 * Supports up to 4 products with difference highlighting and missing value handling
 */

class ProductComparison {
  constructor() {
    this.products = [];
    this.maxProducts = 4;
    this.storageKey = 'shopify-product-comparison';
    
    // Load existing comparison from localStorage
    this.loadFromStorage();
  }

  /**
   * Adds a product to the comparison
   * @param {Object} product - Product object with id and specifications
   * @returns {boolean} - True if added successfully, false if limit reached
   */
  addProduct(product) {
    try {
      if (this.products.length >= this.maxProducts) {
        this.showError('Maximum comparison limit reached. Please remove a product first.');
        return false;
      }
      
      // Validate product object
      if (!product || !product.id) {
        this.showError('Invalid product data provided.');
        return false;
      }
      
      // Check if product already exists
      const existingIndex = this.products.findIndex(p => p.id === product.id);
      if (existingIndex !== -1) {
        this.showError('Product is already in comparison.');
        return false;
      }
      
      this.products.push(product);
      this.saveToStorage();
      
      // Update URL state if we're in a browser environment
      if (typeof window !== 'undefined' && window.history) {
        this.updateUrlState({ view: 'comparison' });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding product to comparison:', error);
      this.showError('Failed to add product to comparison.');
      return false;
    }
  }

  /**
   * Removes a product from the comparison
   * @param {string} productId - ID of product to remove
   * @returns {boolean} - True if removed successfully
   */
  removeProduct(productId) {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    
    if (this.products.length < initialLength) {
      this.saveToStorage();
      
      // Update URL state if we're in a browser environment
      if (typeof window !== 'undefined' && window.history) {
        this.updateUrlState({ view: 'comparison' });
      }
      
      return true;
    }
    return false;
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
    this.saveToStorage();
    
    // Clear URL state if we're in a browser environment
    if (typeof window !== 'undefined' && window.history) {
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('compare');
      currentUrl.searchParams.delete('view');
      currentUrl.searchParams.delete('highlight');
      currentUrl.searchParams.delete('t');
      
      try {
        window.history.replaceState(null, document.title, currentUrl.toString());
      } catch (error) {
        console.warn('Failed to clear URL state:', error);
      }
    }
  }

  /**
   * Gets all products in comparison
   * @returns {Array}
   */
  getProducts() {
    return [...this.products];
  }

  /**
   * Renders the comparison table in side-by-side layout
   * @param {HTMLElement} container - Container element to render into
   * @returns {string} - HTML string of comparison table
   */
  renderComparison(container = null) {
    try {
      if (this.products.length === 0) {
        const html = '<div class="product-comparison__empty">No products selected for comparison.</div>';
        if (container) {
          container.innerHTML = html;
        }
        return html;
      }

      // Validate products have required data
      const validProducts = this.products.filter(product => 
        product && product.id && product.name
      );
      
      if (validProducts.length === 0) {
        const errorHtml = '<div class="product-comparison__error">Invalid product data. Please refresh and try again.</div>';
        if (container) {
          container.innerHTML = errorHtml;
        }
        return errorHtml;
      }

      let html = '<div class="product-comparison">\n';
    
    // Add export controls
    html += '  <div class="product-comparison__controls">\n';
    html += '    <div class="product-comparison__export-buttons">\n';
    html += '      <button type="button" class="product-comparison__export-btn product-comparison__export-pdf" data-export="pdf">\n';
    html += '        <svg class="product-comparison__export-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n';
    html += '          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>\n';
    html += '          <polyline points="14 2 14 8 20 8"/>\n';
    html += '          <line x1="16" y1="13" x2="8" y2="13"/>\n';
    html += '          <line x1="16" y1="17" x2="8" y2="17"/>\n';
    html += '        </svg>\n';
    html += '        Export PDF\n';
    html += '      </button>\n';
    html += '      <button type="button" class="product-comparison__export-btn product-comparison__share-btn" data-export="share">\n';
    html += '        <svg class="product-comparison__export-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n';
    html += '          <circle cx="18" cy="5" r="3"/>\n';
    html += '          <circle cx="6" cy="12" r="3"/>\n';
    html += '          <circle cx="18" cy="19" r="3"/>\n';
    html += '          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>\n';
    html += '          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>\n';
    html += '        </svg>\n';
    html += '        Share Link\n';
    html += '      </button>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    
    html += '  <div class="product-comparison__container">\n';
    html += '    <table class="product-comparison__table">\n';
    html += '      <thead>\n';
    html += '        <tr class="product-comparison__header-row">\n';
    html += '          <th class="product-comparison__spec-label">Specification</th>\n';
    
    // Add column header for each product
    for (const product of validProducts) {
      html += `          <th class="product-comparison__product-header">\n`;
      html += `            <div class="product-comparison__product-info">\n`;
      html += `              <h3 class="product-comparison__product-name">${this.escapeHtml(product.name)}</h3>\n`;
      if (product.image) {
        html += `              <img src="${this.escapeHtml(product.image)}" alt="${this.escapeHtml(product.name)}" class="product-comparison__product-image" onerror="this.style.display='none'">\n`;
      }
      html += `              <button type="button" class="product-comparison__remove-btn" data-product-id="${this.escapeHtml(product.id)}" aria-label="Remove ${this.escapeHtml(product.name)} from comparison">\n`;
      html += `                <span class="product-comparison__remove-icon">×</span>\n`;
      html += `              </button>\n`;
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
    
    if (container) {
      container.innerHTML = html;
      this.attachEventListeners(container);
    }
    
    return html;
    } catch (error) {
      console.error('Error rendering comparison:', error);
      const errorHtml = '<div class="product-comparison__error">Failed to load comparison. Please refresh and try again.</div>';
      if (container) {
        container.innerHTML = errorHtml;
      }
      return errorHtml;
    }
  }

  /**
   * Gets all unique specification keys across all products
   * @returns {Array<string>}
   */
  getAllSpecificationKeys() {
    const keys = new Set();
    
    for (const product of this.products) {
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
    
    return Array.from(keys).sort();
  }

  /**
   * Renders a single specification row across all products
   * Enhanced with missing value handling and difference highlighting
   * @param {string} specKey - Full specification key (category.spec)
   * @returns {string} - HTML for the row
   */
  renderSpecificationRow(specKey) {
    const [categoryKey, specName] = specKey.split('.');
    
    let html = '        <tr class="product-comparison__row">\n';
    
    // Specification label
    const displayName = this.formatSpecName(specName);
    html += `          <td class="product-comparison__spec-name">${this.escapeHtml(displayName)}</td>\n`;
    
    // Get values for each product
    const values = validProducts.map(product => {
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
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const highlightClass = valuesDiffer ? ' product-comparison__cell--different' : '';
      html += `          <td class="product-comparison__value${highlightClass}">\n`;
      
      if (value) {
        html += '            <div class="product-comparison__value-content">\n';
        html += `              <span class="product-comparison__main-value">${this.escapeHtml(value.value)}`;
        if (value.unit) {
          html += `<span class="product-comparison__unit">${this.escapeHtml(value.unit)}</span>`;
        }
        html += '</span>\n';
        
        // Add tolerance or range if present
        if (value.tolerance) {
          html += `              <span class="product-comparison__tolerance">${this.escapeHtml(value.tolerance)}</span>\n`;
        } else if (value.range) {
          html += `              <span class="product-comparison__range">${this.escapeHtml(value.range)}</span>\n`;
        }
        
        // Add description if present
        if (value.description) {
          html += `              <span class="product-comparison__description">${this.escapeHtml(value.description)}</span>\n`;
        }
        
        html += '            </div>\n';
      } else {
        // Missing value handling - graceful display with N/A
        html += '            <span class="product-comparison__missing" title="Not specified for this product">N/A</span>\n';
      }
      
      html += '          </td>\n';
    }
    
    html += '        </tr>\n';
    return html;
  }

  /**
   * Checks if specification values differ across products
   * Enhanced to handle missing values and different data types
   * @param {Array} values - Array of specification values
   * @returns {boolean}
   */
  checkValuesDiffer(values) {
    const nonNullValues = values.filter(v => v !== null);
    if (nonNullValues.length <= 1) return false;
    
    // Compare the actual values, handling different formats
    const firstValue = this.normalizeValueForComparison(nonNullValues[0]);
    return nonNullValues.some(v => {
      const normalizedValue = this.normalizeValueForComparison(v);
      return normalizedValue !== firstValue;
    });
  }

  /**
   * Normalizes a specification value for comparison
   * @param {Object} value - Specification value object
   * @returns {string} - Normalized value for comparison
   */
  normalizeValueForComparison(value) {
    if (!value || !value.value) return '';
    
    // Convert to string and normalize whitespace
    let normalized = String(value.value).trim().toLowerCase();
    
    // Handle numeric values - remove units for comparison
    if (value.unit) {
      // Remove common unit variations for comparison
      normalized = normalized.replace(/\s*(mm|cm|m|in|ft|kg|g|lb|oz|psi|bar|°c|°f|v|a|w|hz|rpm)\s*$/i, '');
    }
    
    return normalized;
  }

  /**
   * Formats specification name for display
   * @param {string} specName - Raw specification name
   * @returns {string}
   */
  formatSpecName(specName) {
    return specName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Escapes HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return String(text);
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Attaches event listeners to the comparison table
   * @param {HTMLElement} container - Container element
   */
  attachEventListeners(container) {
    // Handle remove product buttons
    const removeButtons = container.querySelectorAll('.product-comparison__remove-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = button.dataset.productId;
        if (productId) {
          this.removeProduct(productId);
          this.renderComparison(container);
          
          // Dispatch custom event for other components to listen
          document.dispatchEvent(new CustomEvent('productComparisonUpdated', {
            detail: { action: 'remove', productId, products: this.getProducts() }
          }));
        }
      });
    });

    // Handle export buttons
    const exportButtons = container.querySelectorAll('.product-comparison__export-btn');
    exportButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const exportType = button.dataset.export;
        
        try {
          button.disabled = true;
          button.classList.add('product-comparison__export-btn--loading');
          
          if (exportType === 'pdf') {
            await this.exportToPDF();
          } else if (exportType === 'share') {
            await this.shareComparison();
          }
        } catch (error) {
          console.error('Export failed:', error);
          this.showExportError(error.message);
        } finally {
          button.disabled = false;
          button.classList.remove('product-comparison__export-btn--loading');
        }
      });
    });
  }

  /**
   * Shares comparison via URL
   */
  async shareComparison() {
    // Generate shareable URL with current view options
    const shareUrl = this.generateShareableUrl({
      view: 'comparison',
      highlightDifferences: true,
      includeTimestamp: true
    });
    
    if (navigator.share) {
      // Use native sharing if available
      try {
        await navigator.share({
          title: 'Product Comparison',
          text: `Compare ${this.products.length} products - ${this.products.map(p => p.name).join(' vs ')}`,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback to clipboard
      this.copyToClipboard(shareUrl);
    }
  }

  /**
   * Copies text to clipboard
   * @param {string} text - Text to copy
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        this.showShareSuccess('Link copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showShareSuccess('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.showExportError('Failed to copy link. Please copy manually: ' + text);
    }
  }

  /**
   * Shows export error message
   * @param {string} message - Error message
   */
  showExportError(message) {
    this.showError(message);
  }

  /**
   * Shows error message to user
   * @param {string} message - Error message
   */
  showError(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'product-comparison__notification product-comparison__notification--error';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Shows share success message
   * @param {string} message - Success message
   */
  showShareSuccess(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'product-comparison__notification product-comparison__notification--success';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Saves comparison state to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    } catch (e) {
      console.warn('Failed to save comparison to localStorage:', e);
    }
  }

  /**
   * Loads comparison state from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.products = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load comparison from localStorage:', e);
      this.products = [];
    }
  }

  /**
   * Exports comparison data for sharing or saving
   * @returns {Object}
   */
  exportComparison() {
    return {
      products: this.products,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Imports comparison data
   * @param {Object} data - Comparison data to import
   * @returns {boolean} - Success status
   */
  importComparison(data) {
    try {
      if (data && Array.isArray(data.products)) {
        this.products = data.products.slice(0, this.maxProducts);
        this.saveToStorage();
        return true;
      }
    } catch (e) {
      console.warn('Failed to import comparison data:', e);
    }
    return false;
  }

  /**
   * Generates a shareable URL with comparison state
   * @param {Object} options - Additional options to encode in URL
   * @returns {string}
   */
  generateShareableUrl(options = {}) {
    const productIds = this.products.map(p => p.id);
    const currentUrl = new URL(window.location);
    
    // Clear existing comparison parameters
    currentUrl.searchParams.delete('compare');
    currentUrl.searchParams.delete('view');
    currentUrl.searchParams.delete('highlight');
    
    if (productIds.length > 0) {
      // Encode product IDs
      currentUrl.searchParams.set('compare', productIds.join(','));
      
      // Encode view options if provided
      if (options.view) {
        currentUrl.searchParams.set('view', options.view);
      }
      
      // Encode difference highlighting preference
      if (options.highlightDifferences !== undefined) {
        currentUrl.searchParams.set('highlight', options.highlightDifferences ? '1' : '0');
      }
      
      // Encode timestamp for cache busting
      if (options.includeTimestamp) {
        currentUrl.searchParams.set('t', Date.now().toString());
      }
    }
    
    return currentUrl.toString();
  }

  /**
   * Loads comparison from URL parameters
   * @param {Array<Object>} availableProducts - Products available for comparison
   * @returns {Object} - Load result with success status and loaded options
   */
  loadFromUrl(availableProducts = []) {
    const urlParams = new URLSearchParams(window.location.search);
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
        
        return result;
      }
    }
    
    return result;
  }

  /**
   * Updates the current URL with comparison state without page reload
   * @param {Object} options - Options to encode
   */
  updateUrlState(options = {}) {
    const newUrl = this.generateShareableUrl(options);
    
    try {
      // Update URL without page reload
      window.history.replaceState(
        { comparison: this.exportComparison() },
        document.title,
        newUrl
      );
    } catch (error) {
      console.warn('Failed to update URL state:', error);
    }
  }

  /**
   * Generates a short shareable code for the comparison
   * @returns {string} - Short code that can be used to restore comparison
   */
  generateShareCode() {
    const productIds = this.products.map(p => p.id);
    const data = {
      products: productIds,
      timestamp: Date.now()
    };
    
    // Create a simple base64 encoded string
    try {
      const jsonString = JSON.stringify(data);
      const encoded = btoa(jsonString);
      
      // Make it URL-safe and shorter
      return encoded
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .substring(0, 12); // Keep it short
    } catch (error) {
      console.warn('Failed to generate share code:', error);
      return null;
    }
  }

  /**
   * Loads comparison from a share code
   * @param {string} shareCode - Share code to decode
   * @param {Array<Object>} availableProducts - Available products
   * @returns {boolean} - Success status
   */
  loadFromShareCode(shareCode, availableProducts = []) {
    try {
      // This is a simplified implementation - in a real system,
      // you'd want to store the full comparison data server-side
      // and use the share code as a lookup key
      
      // For now, we'll just return false as this would require
      // server-side storage
      console.warn('Share code loading requires server-side implementation');
      return false;
    } catch (error) {
      console.warn('Failed to load from share code:', error);
      return false;
    }
  }

  /**
   * Exports comparison to PDF
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportToPDF(options = {}) {
    if (this.products.length === 0) {
      throw new Error('No products in comparison to export');
    }
    
    // Ensure PDF exporter is available
    if (!window.pdfExporter) {
      await this.loadPDFExporter();
    }
    
    const exportOptions = {
      storeName: options.storeName || document.title,
      includeImages: options.includeImages !== false,
      footerText: options.footerText || 'Generated by Forge Industrial Theme',
      ...options
    };
    
    await window.pdfExporter.exportComparison(this.products, exportOptions);
  }

  /**
   * Loads PDF exporter if not already loaded
   */
  async loadPDFExporter() {
    if (window.pdfExporter) return;
    
    // Dynamically import PDF exporter
    try {
      const module = await import('./pdf-export.js');
      if (!window.pdfExporter) {
        window.pdfExporter = new module.default();
      }
    } catch (error) {
      console.error('Failed to load PDF exporter:', error);
      throw new Error('PDF export functionality is not available');
    }
  }
}

// Global instance for easy access
window.ProductComparison = ProductComparison;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComparison);
} else {
  initializeComparison();
}

function initializeComparison() {
  // Initialize global comparison instance
  if (!window.productComparison) {
    window.productComparison = new ProductComparison();
  }
  
  // Handle comparison widget initialization
  const comparisonWidgets = document.querySelectorAll('[data-product-comparison]');
  comparisonWidgets.forEach(widget => {
    const comparison = new ProductComparison();
    comparison.renderComparison(widget);
  });
}

export default ProductComparison;