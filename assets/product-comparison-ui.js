/**
 * Product Comparison UI Controller
 * Handles UI interactions for product comparison controls and display
 * Integrates with the ProductComparison engine
 */

class ProductComparisonUI {
  constructor() {
    this.comparison = null;
    this.config = {
      maxProducts: 4,
      autoShow: true,
      persistState: true,
      showDifferences: true,
      mobileStackLayout: true
    };
    
    this.elements = {
      controls: null,
      display: null,
      counter: null,
      addBtn: null,
      removeBtn: null,
      viewBtn: null,
      clearBtn: null,
      exportBtn: null,
      shareBtn: null,
      productList: null,
      tableContainer: null,
      emptyState: null
    };
    
    this.currentProduct = null;
    this.init();
  }

  /**
   * Initialize the comparison UI
   */
  init() {
    // Wait for ProductComparison to be available
    if (typeof ProductComparison === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    this.comparison = new ProductComparison();
    this.loadConfig();
    this.bindElements();
    this.attachEventListeners();
    this.updateUI();
    
    // Load from URL if present
    this.loadFromURL();
    
    // Listen for comparison updates
    document.addEventListener('productComparisonUpdated', (e) => {
      this.updateUI();
    });
  }

  /**
   * Load configuration from section settings
   */
  loadConfig() {
    const configElement = document.querySelector('[data-comparison-config]');
    if (configElement) {
      try {
        const sectionConfig = JSON.parse(configElement.textContent);
        this.config = { ...this.config, ...sectionConfig };
        
        // Update comparison max products
        if (this.comparison) {
          this.comparison.maxProducts = this.config.maxProducts;
        }
      } catch (e) {
        console.warn('Failed to parse comparison config:', e);
      }
    }
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.elements.controls = document.querySelector('[data-comparison-controls]');
    this.elements.display = document.querySelector('[data-comparison-display]');
    this.elements.counter = document.querySelector('[data-comparison-counter]');
    this.elements.addBtn = document.querySelector('[data-add-to-comparison]');
    this.elements.removeBtn = document.querySelector('[data-remove-from-comparison]');
    this.elements.viewBtn = document.querySelector('[data-view-comparison]');
    this.elements.clearBtn = document.querySelector('[data-clear-comparison]');
    this.elements.exportBtn = document.querySelector('[data-export-comparison]');
    this.elements.shareBtn = document.querySelector('[data-share-comparison]');
    this.elements.productList = document.querySelector('[data-comparison-product-list]');
    this.elements.tableContainer = document.querySelector('[data-comparison-table]');
    this.elements.emptyState = document.querySelector('[data-comparison-empty]');
    
    // Get current product info from add button
    if (this.elements.addBtn) {
      this.currentProduct = {
        id: this.elements.addBtn.dataset.productId,
        handle: this.elements.addBtn.dataset.productHandle
      };
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add to comparison
    if (this.elements.addBtn) {
      this.elements.addBtn.addEventListener('click', () => {
        this.addCurrentProduct();
      });
    }

    // Remove from comparison
    if (this.elements.removeBtn) {
      this.elements.removeBtn.addEventListener('click', () => {
        this.removeCurrentProduct();
      });
    }

    // View comparison
    if (this.elements.viewBtn) {
      this.elements.viewBtn.addEventListener('click', () => {
        this.showComparison();
      });
    }

    // Clear comparison
    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener('click', () => {
        this.clearComparison();
      });
    }

    // Export comparison
    if (this.elements.exportBtn) {
      this.elements.exportBtn.addEventListener('click', () => {
        this.exportComparison();
      });
    }

    // Share comparison
    if (this.elements.shareBtn) {
      this.elements.shareBtn.addEventListener('click', () => {
        this.shareComparison();
      });
    }

    // Handle product removal from list
    if (this.elements.productList) {
      this.elements.productList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove-product]');
        if (removeBtn) {
          const productId = removeBtn.dataset.removeProduct;
          this.comparison.removeProduct(productId);
          this.updateUI();
        }
      });
    }
  }

  /**
   * Add current product to comparison
   */
  async addCurrentProduct() {
    if (!this.currentProduct || !this.comparison) return;
    
    try {
      // Fetch product data
      const productData = await this.fetchProductData(this.currentProduct.handle);
      
      if (productData) {
        const success = this.comparison.addProduct(productData);
        
        if (success) {
          this.updateUI();
          this.showNotification('Product added to comparison', 'success');
          
          if (this.config.autoShow) {
            this.showComparison();
          }
        } else {
          this.showNotification('Cannot add more products (maximum reached)', 'warning');
        }
      }
    } catch (error) {
      console.error('Failed to add product to comparison:', error);
      this.showNotification('Failed to add product to comparison', 'error');
    }
  }

  /**
   * Remove current product from comparison
   */
  removeCurrentProduct() {
    if (!this.currentProduct || !this.comparison) return;
    
    const success = this.comparison.removeProduct(this.currentProduct.id);
    
    if (success) {
      this.updateUI();
      this.showNotification('Product removed from comparison', 'success');
    }
  }

  /**
   * Show comparison table
   */
  showComparison() {
    if (this.elements.display) {
      this.elements.display.scrollIntoView({ behavior: 'smooth' });
    }
    
    this.renderComparison();
  }

  /**
   * Clear all products from comparison
   */
  clearComparison() {
    if (!this.comparison) return;
    
    if (confirm('Are you sure you want to clear all products from comparison?')) {
      this.comparison.clear();
      this.updateUI();
      this.showNotification('Comparison cleared', 'success');
    }
  }

  /**
   * Export comparison as PDF
   */
  exportComparison() {
    // This would integrate with a PDF generation service
    // For now, we'll use the browser's print functionality
    const comparisonHtml = this.comparison.renderComparison();
    
    if (comparisonHtml) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Product Comparison</title>
          <link rel="stylesheet" href="${window.location.origin}/assets/product-comparison.css">
          <style>
            body { margin: 2rem; font-family: Arial, sans-serif; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Product Comparison</h1>
          ${comparisonHtml}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * Share comparison via URL
   */
  shareComparison() {
    if (!this.comparison) return;
    
    const shareUrl = this.comparison.generateShareableUrl();
    
    if (navigator.share) {
      navigator.share({
        title: 'Product Comparison',
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showNotification('Comparison URL copied to clipboard', 'success');
      }).catch(() => {
        // Fallback: show URL in prompt
        prompt('Copy this URL to share the comparison:', shareUrl);
      });
    }
  }

  /**
   * Update UI based on current comparison state
   */
  updateUI() {
    if (!this.comparison) return;
    
    const products = this.comparison.getProducts();
    const productCount = products.length;
    const isCurrentProductInComparison = this.currentProduct && 
      products.some(p => p.id === this.currentProduct.id);
    
    // Update counter
    if (this.elements.counter) {
      this.elements.counter.textContent = productCount;
    }
    
    // Update buttons visibility
    if (this.elements.addBtn) {
      this.elements.addBtn.style.display = 
        !isCurrentProductInComparison && productCount < this.config.maxProducts ? 'flex' : 'none';
    }
    
    if (this.elements.removeBtn) {
      this.elements.removeBtn.style.display = isCurrentProductInComparison ? 'flex' : 'none';
    }
    
    if (this.elements.viewBtn) {
      this.elements.viewBtn.style.display = productCount > 0 ? 'flex' : 'none';
    }
    
    if (this.elements.clearBtn) {
      this.elements.clearBtn.style.display = productCount > 0 ? 'flex' : 'none';
    }
    
    if (this.elements.exportBtn) {
      this.elements.exportBtn.style.display = productCount > 1 ? 'flex' : 'none';
    }
    
    if (this.elements.shareBtn) {
      this.elements.shareBtn.style.display = productCount > 1 ? 'flex' : 'none';
    }
    
    // Update product list
    this.updateProductList(products);
    
    // Update comparison display
    this.renderComparison();
  }

  /**
   * Update the product list display
   */
  updateProductList(products) {
    if (!this.elements.productList) return;
    
    if (products.length === 0) {
      this.elements.productList.innerHTML = '';
      return;
    }
    
    const html = products.map(product => `
      <div class="comparison-product-item">
        ${product.image ? `<img src="${this.escapeHtml(product.image)}" alt="${this.escapeHtml(product.name)}" class="comparison-product-item__image">` : ''}
        <span class="comparison-product-item__name">${this.escapeHtml(product.name)}</span>
        <button type="button" class="comparison-product-item__remove" data-remove-product="${this.escapeHtml(product.id)}" aria-label="Remove ${this.escapeHtml(product.name)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `).join('');
    
    this.elements.productList.innerHTML = html;
  }

  /**
   * Render the comparison table
   */
  renderComparison() {
    if (!this.elements.tableContainer || !this.comparison) return;
    
    const products = this.comparison.getProducts();
    
    if (products.length === 0) {
      // Show empty state
      if (this.elements.emptyState) {
        this.elements.emptyState.style.display = 'block';
      }
      this.elements.tableContainer.innerHTML = '';
      return;
    }
    
    // Hide empty state
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = 'none';
    }
    
    // Render comparison table
    const comparisonHtml = this.comparison.renderComparison();
    this.elements.tableContainer.innerHTML = comparisonHtml;
    
    // Attach event listeners to the rendered table
    const tableElement = this.elements.tableContainer.querySelector('.product-comparison');
    if (tableElement) {
      this.comparison.attachEventListeners(tableElement);
    }
  }

  /**
   * Fetch product data from Shopify
   */
  async fetchProductData(handle) {
    try {
      const response = await fetch(`/products/${handle}.js`);
      if (!response.ok) throw new Error('Product not found');
      
      const productData = await response.json();
      
      // Transform Shopify product data to comparison format
      return {
        id: productData.id.toString(),
        name: productData.title,
        handle: productData.handle,
        image: productData.featured_image,
        specifications: this.parseProductSpecifications(productData)
      };
    } catch (error) {
      console.error('Failed to fetch product data:', error);
      return null;
    }
  }

  /**
   * Parse product specifications from metafields
   */
  parseProductSpecifications(productData) {
    // This would parse the specifications from product metafields
    // For now, return a basic structure
    const specs = {};
    
    // Check for specifications metafield
    if (productData.metafields && productData.metafields.specifications) {
      try {
        specs = JSON.parse(productData.metafields.specifications.technical || '{}');
      } catch (e) {
        console.warn('Failed to parse product specifications:', e);
      }
    }
    
    return specs;
  }

  /**
   * Load comparison from URL parameters
   */
  loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const compareParam = urlParams.get('compare');
    
    if (compareParam && this.comparison) {
      // This would need to fetch products by ID and add them to comparison
      // Implementation depends on available product data
      console.log('Loading comparison from URL:', compareParam);
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `comparison-notification comparison-notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      zIndex: '9999',
      fontSize: '0.875rem',
      fontWeight: '500',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return String(text);
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global instance
window.ProductComparisonUI = ProductComparisonUI;

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.productComparisonUI) {
      window.productComparisonUI = new ProductComparisonUI();
    }
  });
} else {
  if (!window.productComparisonUI) {
    window.productComparisonUI = new ProductComparisonUI();
  }
}

export default ProductComparisonUI;