/**
 * Product Form Component
 * Handles variant selection, quantity updates, and add-to-cart functionality
 */
(function() {
  'use strict';

  class ProductForm extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form');
      this.submitButton = this.querySelector('[type="submit"]');
      this.errorMessageWrapper = this.querySelector('.product-form__error-message-wrapper');
    }

    connectedCallback() {
      this.form?.addEventListener('submit', this.onSubmitHandler.bind(this));
    }

    async onSubmitHandler(event) {
      event.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();
      this.submitButton.setAttribute('aria-disabled', 'true');
      this.submitButton.classList.add('loading');

      const formData = new FormData(this.form);
      const config = {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/javascript'
        }
      };

      formData.append('sections', this.getSectionsToRender().map(s => s.id));
      formData.append('sections_url', window.location.pathname);
      config.body = formData;

      try {
        const response = await fetch(`${routes.cart_add_url}`, config);
        const data = await response.json();

        if (data.status) {
          this.handleErrorMessage(data.description);
          return;
        }

        this.renderContents(data);
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));
      } catch (error) {
        console.error('Add to cart error:', error);
        this.handleErrorMessage('An error occurred. Please try again.');
      } finally {
        this.submitButton.classList.remove('loading');
        this.submitButton.removeAttribute('aria-disabled');
      }
    }

    handleErrorMessage(message = false) {
      if (this.errorMessageWrapper) {
        this.errorMessageWrapper.toggleAttribute('hidden', !message);
        if (message) {
          this.errorMessageWrapper.textContent = message;
        }
      }
    }

    getSectionsToRender() {
      return [
        { id: 'cart-icon-bubble' },
        { id: 'cart-drawer' }
      ];
    }

    renderContents(data) {
      this.getSectionsToRender().forEach(section => {
        const sectionElement = document.getElementById(section.id);
        if (sectionElement && data.sections && data.sections[section.id]) {
          sectionElement.innerHTML = this.getSectionInnerHTML(data.sections[section.id]);
        }
      });
    }

    getSectionInnerHTML(html) {
      return new DOMParser().parseFromString(html, 'text/html').querySelector('.shopify-section')?.innerHTML || '';
    }
  }

  customElements.define('product-form', ProductForm);
})();
