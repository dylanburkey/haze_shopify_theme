/**
 * Product Grid Section JavaScript
 * Zebra Skimmers Theme
 * 
 * Handles add-to-cart button feedback
 */

(function() {
  'use strict';

  class ProductGrid {
    constructor(section) {
      this.section = section;
      this.addButtons = section.querySelectorAll('[data-add-to-cart]');
      
      this.bindEvents();
    }

    bindEvents() {
      this.addButtons.forEach(button => {
        button.addEventListener('click', this.handleAddToCart.bind(this));
      });
    }

    handleAddToCart(event) {
      const button = event.currentTarget;
      const originalText = button.innerHTML;
      
      // Disable button and show loading state
      button.disabled = true;
      button.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Adding...
      `;

      // Simulate add to cart (replace with actual cart logic)
      setTimeout(() => {
        button.classList.add('is-added');
        button.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Added!
        `;

        // Reset after delay
        setTimeout(() => {
          button.disabled = false;
          button.classList.remove('is-added');
          button.innerHTML = originalText;
        }, 2000);
      }, 800);
    }
  }

  // Initialize
  function initProductGrids() {
    document.querySelectorAll('[data-section-type="product-grid"]').forEach(section => {
      new ProductGrid(section);
    });
  }

  // Shopify theme editor support
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      if (event.target.querySelector('[data-section-type="product-grid"]')) {
        initProductGrids();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductGrids);
  } else {
    initProductGrids();
  }

})();
