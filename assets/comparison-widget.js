/**
 * Comparison Widget Controller
 * Handles interactions for comparison widgets on product cards
 */

class ComparisonWidget {
  constructor() {
    this.comparison = null;
    this.widgets = new Map();
    this.init();
  }

  /**
   * Initialize the widget controller
   */
  init() {
    // Wait for ProductComparison to be available
    if (typeof ProductComparison === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    this.comparison = window.productComparison || new ProductComparison();
    this.bindWidgets();
    this.attachEventListeners();
    this.updateAllWidgets();
    
    // Listen for comparison updates
    document.addEventListener('productComparisonUpdated', () => {
      this.updateAllWidgets();
    });
  }

  /**
   * Bind all comparison widgets on the page
   */
  bindWidgets() {
    const widgetElements = document.querySelectorAll('[data-comparison-widget]');
    
    widgetElements.forEach(element => {
      const productId = element.dataset.productId;
      const productHandle = element.dataset.productHandle;
      
      if (productId && productHandle) {
        this.widgets.set(productId, {
          element,
          productId,
          productHandle,
          isActive: false
        });
      }
    });
  }

  /**
   * Attach event listeners to widgets
   */
  attachEventListeners() {
    // Handle add buttons
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-comparison-add]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = addBtn.dataset.productId;
        this.addProduct(productId);
      }
    });

    // Handle remove buttons
    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-comparison-remove]');
      if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = removeBtn.dataset.productId;
        this.removeProduct(productId);
      }
    });

    // Handle toggle buttons (icon style)
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-comparison-toggle]');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = toggleBtn.dataset.productId;
        this.toggleProduct(productId);
      }
    });

    // Handle checkboxes
    document.addEventListener('change', (e) => {
      const checkbox = e.target.closest('[data-comparison-checkbox]');
      if (checkbox) {
        const productId = checkbox.dataset.productId;
        if (checkbox.checked) {
          this.addProduct(productId);
        } else {
          this.removeProduct(productId);
        }
      }
    });
  }

  /**
   * Add product to comparison
   */
  async addProduct(productId) {
    const widget = this.widgets.get(productId);
    if (!widget || !this.comparison) return;

    try {
      // Set loading state
      this.setWidgetLoading(productId, true);

      // Check if comparison is full
      if (this.comparison.getProductCount() >= this.comparison.maxProducts) {
        this.showNotification('Cannot add more products (maximum reached)', 'warning');
        this.setWidgetLoading(productId, false);
        return;
      }

      // Fetch product data
      const productData = await this.fetchProductData(widget.productHandle);
      
      if (productData) {
        const success = this.comparison.addProduct(productData);
        
        if (success) {
          this.updateWidget(productId, true);
          this.showNotification('Product added to comparison', 'success');
          
          // Dispatch custom event
          document.dispatchEvent(new CustomEvent('productComparisonUpdated', {
            detail: { action: 'add', productId, products: this.comparison.getProducts() }
          }));
        } else {
          this.showNotification('Failed to add product to comparison', 'error');
        }
      } else {
        this.showNotification('Failed to load product data', 'error');
      }
    } catch (error) {
      console.error('Failed to add product to comparison:', error);
      this.showNotification('Failed to add product to comparison', 'error');
    } finally {
      this.setWidgetLoading(productId, false);
    }
  }

  /**
   * Remove product from comparison
   */
  removeProduct(productId) {
    if (!this.comparison) return;

    const success = this.comparison.removeProduct(productId);
    
    if (success) {
      this.updateWidget(productId, false);
      this.showNotification('Product removed from comparison', 'success');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('productComparisonUpdated', {
        detail: { action: 'remove', productId, products: this.comparison.getProducts() }
      }));
    }
  }

  /**
   * Toggle product in comparison
   */
  toggleProduct(productId) {
    const widget = this.widgets.get(productId);
    if (!widget) return;

    if (widget.isActive) {
      this.removeProduct(productId);
    } else {
      this.addProduct(productId);
    }
  }

  /**
   * Update a specific widget's state
   */
  updateWidget(productId, isActive) {
    const widget = this.widgets.get(productId);
    if (!widget) return;

    widget.isActive = isActive;
    const element = widget.element;

    // Update button style widgets
    const addBtn = element.querySelector('[data-comparison-add]');
    const removeBtn = element.querySelector('[data-comparison-remove]');
    
    if (addBtn && removeBtn) {
      addBtn.style.display = isActive ? 'none' : 'flex';
      removeBtn.style.display = isActive ? 'flex' : 'none';
    }

    // Update icon style widgets
    const toggleBtn = element.querySelector('[data-comparison-toggle]');
    if (toggleBtn) {
      if (isActive) {
        toggleBtn.classList.add('is-active');
        toggleBtn.setAttribute('aria-label', `Remove from comparison`);
        toggleBtn.setAttribute('title', 'Remove from comparison');
      } else {
        toggleBtn.classList.remove('is-active');
        toggleBtn.setAttribute('aria-label', `Add to comparison`);
        toggleBtn.setAttribute('title', 'Add to comparison');
      }
    }

    // Update checkbox style widgets
    const checkbox = element.querySelector('[data-comparison-checkbox]');
    if (checkbox) {
      checkbox.checked = isActive;
    }
  }

  /**
   * Update all widgets based on current comparison state
   */
  updateAllWidgets() {
    if (!this.comparison) return;

    const products = this.comparison.getProducts();
    const productIds = new Set(products.map(p => p.id));

    this.widgets.forEach((widget, productId) => {
      const isActive = productIds.has(productId);
      this.updateWidget(productId, isActive);
    });
  }

  /**
   * Set loading state for a widget
   */
  setWidgetLoading(productId, isLoading) {
    const widget = this.widgets.get(productId);
    if (!widget) return;

    if (isLoading) {
      widget.element.classList.add('comparison-widget--loading');
    } else {
      widget.element.classList.remove('comparison-widget--loading');
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
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6',
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
   * Get widget count for debugging
   */
  getWidgetCount() {
    return this.widgets.size;
  }

  /**
   * Get active widget count
   */
  getActiveWidgetCount() {
    return Array.from(this.widgets.values()).filter(w => w.isActive).length;
  }
}

// Global instance
window.ComparisonWidget = ComparisonWidget;

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.comparisonWidget) {
      window.comparisonWidget = new ComparisonWidget();
    }
  });
} else {
  if (!window.comparisonWidget) {
    window.comparisonWidget = new ComparisonWidget();
  }
}

export default ComparisonWidget;