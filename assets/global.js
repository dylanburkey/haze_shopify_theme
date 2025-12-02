/* ==========================================================================
   Global JavaScript
   Core functionality for the theme
   ========================================================================== */

(function() {
  'use strict';

  /* --------------------------------------------------------------------------
     Utility Functions
     -------------------------------------------------------------------------- */

  const Utils = {
    /**
     * Debounce function execution
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function}
     */
    debounce(fn, delay = 300) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    /**
     * Fetch wrapper with error handling
     * @param {string} url - URL to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise}
     */
    async fetchJSON(url, options = {}) {
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },

    /**
     * Get section HTML via Section Rendering API
     * @param {string} sectionId - Section ID to fetch
     * @param {string} url - URL to fetch from
     * @returns {Promise<string>}
     */
    async fetchSection(sectionId, url = window.location.href) {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(`${url}${separator}sections=${sectionId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch section: ${sectionId}`);
      }

      const data = await response.json();
      return data[sectionId];
    },

    /**
     * Trap focus within an element
     * @param {HTMLElement} element - Element to trap focus within
     * @returns {Function} - Cleanup function
     */
    trapFocus(element) {
      const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      function handleKeyDown(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }

      element.addEventListener('keydown', handleKeyDown);
      firstFocusable?.focus();

      return () => element.removeEventListener('keydown', handleKeyDown);
    },

    /**
     * Format money according to Shopify's money format
     * @param {number} cents - Amount in cents
     * @param {string} format - Money format string
     * @returns {string}
     */
    formatMoney(cents, format = window.Shopify?.moneyFormat || '${{amount}}') {
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }

      const value = cents / 100;

      const formatters = {
        amount: value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        amount_no_decimals: Math.floor(value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        amount_with_comma_separator: value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'),
        amount_no_decimals_with_comma_separator: Math.floor(value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
      };

      let formattedValue = format;

      for (const [key, val] of Object.entries(formatters)) {
        formattedValue = formattedValue.replace(`{{${key}}}`, val);
      }

      return formattedValue;
    }
  };

  /* --------------------------------------------------------------------------
     Cart API
     -------------------------------------------------------------------------- */

  const CartAPI = {
    /**
     * Get cart contents
     * @returns {Promise<Object>}
     */
    async get() {
      return Utils.fetchJSON('/cart.js');
    },

    /**
     * Add item to cart
     * @param {Object} item - Item to add
     * @returns {Promise<Object>}
     */
    async add(item) {
      return Utils.fetchJSON('/cart/add.js', {
        method: 'POST',
        body: JSON.stringify(item)
      });
    },

    /**
     * Update cart item
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>}
     */
    async update(updates) {
      return Utils.fetchJSON('/cart/update.js', {
        method: 'POST',
        body: JSON.stringify(updates)
      });
    },

    /**
     * Change cart item quantity
     * @param {string} key - Line item key
     * @param {number} quantity - New quantity
     * @returns {Promise<Object>}
     */
    async change(key, quantity) {
      return Utils.fetchJSON('/cart/change.js', {
        method: 'POST',
        body: JSON.stringify({ id: key, quantity })
      });
    },

    /**
     * Clear cart
     * @returns {Promise<Object>}
     */
    async clear() {
      return Utils.fetchJSON('/cart/clear.js', {
        method: 'POST'
      });
    }
  };

  /* --------------------------------------------------------------------------
     Custom Events
     -------------------------------------------------------------------------- */

  const Events = {
    /**
     * Dispatch a custom event
     * @param {string} name - Event name
     * @param {Object} detail - Event detail
     */
    dispatch(name, detail = {}) {
      document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    },

    /**
     * Subscribe to a custom event
     * @param {string} name - Event name
     * @param {Function} callback - Event callback
     * @returns {Function} - Unsubscribe function
     */
    subscribe(name, callback) {
      document.addEventListener(name, callback);
      return () => document.removeEventListener(name, callback);
    }
  };

  /* --------------------------------------------------------------------------
     Expose to Global Scope
     -------------------------------------------------------------------------- */

  window.theme = window.theme || {};
  window.theme.Utils = Utils;
  window.theme.CartAPI = CartAPI;
  window.theme.Events = Events;

  /* --------------------------------------------------------------------------
     Initialize
     -------------------------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    // Emit ready event
    Events.dispatch('theme:ready');
  });

})();
