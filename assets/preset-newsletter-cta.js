/**
 * Newsletter CTA Section JavaScript
 * Zebra Skimmers Theme
 * 
 * Handles form submission with success/error states
 */

(function() {
  'use strict';

  class NewsletterCTA {
    constructor(section) {
      this.section = section;
      this.form = section.querySelector('[data-newsletter-form]');
      this.input = this.form ? this.form.querySelector('input[type="email"]') : null;
      this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;
      this.successMsg = section.querySelector('[data-success-message]');
      this.errorMsg = section.querySelector('[data-error-message]');
      
      if (this.form) {
        this.bindEvents();
      }
    }

    bindEvents() {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(event) {
      event.preventDefault();
      
      const email = this.input.value.trim();
      
      if (!this.validateEmail(email)) {
        this.showError();
        return;
      }

      // Disable form
      this.submitBtn.disabled = true;
      const originalText = this.submitBtn.innerHTML;
      this.submitBtn.innerHTML = 'Sending...';

      // Simulate API call (replace with actual submission logic)
      // For actual Shopify newsletter, you would submit to /contact
      setTimeout(() => {
        // Simulate success
        this.showSuccess();
        this.input.value = '';
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalText;
      }, 1000);
    }

    validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }

    showSuccess() {
      this.hideMessages();
      this.successMsg.hidden = false;
      
      // Auto-hide after delay
      setTimeout(() => {
        this.successMsg.hidden = true;
      }, 5000);
    }

    showError() {
      this.hideMessages();
      this.errorMsg.hidden = false;
      
      // Auto-hide after delay
      setTimeout(() => {
        this.errorMsg.hidden = true;
      }, 5000);
    }

    hideMessages() {
      this.successMsg.hidden = true;
      this.errorMsg.hidden = true;
    }
  }

  // Initialize
  function initNewsletterCTAs() {
    document.querySelectorAll('[data-section-type="newsletter-cta"]').forEach(section => {
      new NewsletterCTA(section);
    });
  }

  // Shopify theme editor support
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      if (event.target.querySelector('[data-section-type="newsletter-cta"]')) {
        initNewsletterCTAs();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsletterCTAs);
  } else {
    initNewsletterCTAs();
  }

})();
