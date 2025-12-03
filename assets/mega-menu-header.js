/**
 * Mega Menu Header JavaScript
 * Based on Valero.com navigation pattern
 *
 * Features:
 * - Hover-triggered mega dropdowns (desktop)
 * - Click-triggered mobile menu
 * - Keyboard navigation & accessibility
 * - Search panel toggle
 * - Focus management
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    hoverDelay: 150,        // Delay before showing dropdown on hover
    hoverOutDelay: 300,     // Delay before hiding dropdown when mouse leaves
    breakpoint: 1024,       // Mobile/desktop breakpoint
    focusTrapSelector: 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  };

  /**
   * MegaMenuHeader Class
   * Manages all header functionality
   */
  class MegaMenuHeader {
    constructor(element) {
      this.header = element;
      this.sectionId = element.dataset.sectionId;

      // Elements
      this.nav = element.querySelector('[data-mega-nav]');
      this.dropdownItems = element.querySelectorAll('[data-mega-dropdown]');
      this.mobileToggle = element.querySelector('[data-mobile-toggle]');
      this.mobileMenu = document.getElementById('mobile-menu');
      this.searchToggle = element.querySelector('[data-search-toggle]');
      this.searchPanel = document.getElementById('header-search');
      this.searchClose = element.querySelector('[data-search-close]');
      this.overlay = document.querySelector('[data-mega-overlay]');

      // State
      this.activeDropdown = null;
      this.hoverTimeout = null;
      this.isDesktop = window.innerWidth >= CONFIG.breakpoint;

      this.init();
    }

    init() {
      this.bindEvents();
      this.setupMobileSubmenus();
      this.handleResize();
    }

    bindEvents() {
      // Desktop dropdown events
      this.dropdownItems.forEach(item => {
        const toggle = item.querySelector('[data-dropdown-toggle]');
        const panel = item.querySelector('[data-dropdown-panel]');

        if (this.isDesktop) {
          // Hover events for desktop
          item.addEventListener('mouseenter', () => this.handleDropdownEnter(item, panel));
          item.addEventListener('mouseleave', () => this.handleDropdownLeave(item, panel));
        }

        // Click/keyboard events for toggle button
        if (toggle) {
          toggle.addEventListener('click', (e) => this.handleDropdownClick(e, item, panel));
          toggle.addEventListener('keydown', (e) => this.handleDropdownKeydown(e, item, panel));
        }
      });

      // Mobile toggle
      if (this.mobileToggle && this.mobileMenu) {
        this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
      }

      // Search toggle
      if (this.searchToggle && this.searchPanel) {
        this.searchToggle.addEventListener('click', () => this.toggleSearch());
      }

      if (this.searchClose) {
        this.searchClose.addEventListener('click', () => this.closeSearch());
      }

      // Overlay click
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.closeAll());
      }

      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeAll();
        }
      });

      // Click outside to close dropdowns
      document.addEventListener('click', (e) => {
        if (!this.header.contains(e.target) && !this.mobileMenu?.contains(e.target)) {
          this.closeAllDropdowns();
        }
      });

      // Resize handler
      window.addEventListener('resize', () => this.handleResize());
    }

    // Desktop Dropdown Handlers
    handleDropdownEnter(item, panel) {
      if (!this.isDesktop) return;

      clearTimeout(this.hoverTimeout);

      this.hoverTimeout = setTimeout(() => {
        this.openDropdown(item, panel);
      }, CONFIG.hoverDelay);
    }

    handleDropdownLeave(item, panel) {
      if (!this.isDesktop) return;

      clearTimeout(this.hoverTimeout);

      this.hoverTimeout = setTimeout(() => {
        this.closeDropdown(item, panel);
      }, CONFIG.hoverOutDelay);
    }

    handleDropdownClick(e, item, panel) {
      e.preventDefault();

      const isOpen = item.hasAttribute('data-dropdown-open');

      if (isOpen) {
        this.closeDropdown(item, panel);
      } else {
        this.closeAllDropdowns();
        this.openDropdown(item, panel);
      }
    }

    handleDropdownKeydown(e, item, panel) {
      const toggle = item.querySelector('[data-dropdown-toggle]');

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.handleDropdownClick(e, item, panel);
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (!item.hasAttribute('data-dropdown-open')) {
            this.openDropdown(item, panel);
          }
          // Focus first link in dropdown
          const firstLink = panel.querySelector('a, button');
          if (firstLink) firstLink.focus();
          break;

        case 'ArrowUp':
          e.preventDefault();
          this.closeDropdown(item, panel);
          toggle?.focus();
          break;
      }
    }

    openDropdown(item, panel) {
      // Close other dropdowns
      this.closeAllDropdowns();

      item.setAttribute('data-dropdown-open', '');
      panel.hidden = false;

      const toggle = item.querySelector('[data-dropdown-toggle]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
      }

      this.activeDropdown = item;

      // Show overlay on desktop
      if (this.isDesktop && this.overlay) {
        this.overlay.setAttribute('data-visible', '');
      }
    }

    closeDropdown(item, panel) {
      item.removeAttribute('data-dropdown-open');
      panel.hidden = true;

      const toggle = item.querySelector('[data-dropdown-toggle]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }

      if (this.activeDropdown === item) {
        this.activeDropdown = null;
      }

      // Hide overlay if no dropdowns open
      if (!this.activeDropdown && this.overlay) {
        this.overlay.removeAttribute('data-visible');
      }
    }

    closeAllDropdowns() {
      this.dropdownItems.forEach(item => {
        const panel = item.querySelector('[data-dropdown-panel]');
        if (panel) {
          this.closeDropdown(item, panel);
        }
      });

      if (this.overlay) {
        this.overlay.removeAttribute('data-visible');
      }
    }

    // Mobile Menu
    toggleMobileMenu() {
      const isOpen = this.mobileToggle.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    }

    openMobileMenu() {
      this.mobileToggle.setAttribute('aria-expanded', 'true');
      this.mobileMenu.setAttribute('data-open', '');
      this.mobileMenu.hidden = false;
      document.body.classList.add('mega-menu-open');

      // Focus first focusable element
      const firstFocusable = this.mobileMenu.querySelector(CONFIG.focusTrapSelector);
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }

      // Setup focus trap
      this.setupFocusTrap(this.mobileMenu);
    }

    closeMobileMenu() {
      this.mobileToggle.setAttribute('aria-expanded', 'false');
      this.mobileMenu.removeAttribute('data-open');
      document.body.classList.remove('mega-menu-open');

      // Return focus to toggle
      this.mobileToggle.focus();

      // Remove focus trap
      this.removeFocusTrap();

      // Hide after transition
      setTimeout(() => {
        if (!this.mobileMenu.hasAttribute('data-open')) {
          this.mobileMenu.hidden = true;
        }
      }, 300);
    }

    setupMobileSubmenus() {
      const submenuToggles = this.mobileMenu?.querySelectorAll('[data-mobile-submenu-toggle]');

      submenuToggles?.forEach(toggle => {
        toggle.addEventListener('click', () => {
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
          const submenu = toggle.nextElementSibling;

          if (isExpanded) {
            toggle.setAttribute('aria-expanded', 'false');
            submenu.hidden = true;
          } else {
            toggle.setAttribute('aria-expanded', 'true');
            submenu.hidden = false;
          }
        });
      });
    }

    // Search Panel
    toggleSearch() {
      const isOpen = this.searchToggle.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        this.closeSearch();
      } else {
        this.openSearch();
      }
    }

    openSearch() {
      this.searchToggle.setAttribute('aria-expanded', 'true');
      this.searchPanel.hidden = false;

      // Focus input
      const input = this.searchPanel.querySelector('input');
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }

    closeSearch() {
      this.searchToggle.setAttribute('aria-expanded', 'false');
      this.searchPanel.hidden = true;
      this.searchToggle.focus();
    }

    // Close all menus
    closeAll() {
      this.closeAllDropdowns();

      if (this.mobileMenu?.hasAttribute('data-open')) {
        this.closeMobileMenu();
      }

      if (this.searchToggle?.getAttribute('aria-expanded') === 'true') {
        this.closeSearch();
      }
    }

    // Focus Trap for Mobile Menu
    setupFocusTrap(container) {
      this.focusTrapHandler = (e) => {
        if (e.key !== 'Tab') return;

        const focusables = container.querySelectorAll(CONFIG.focusTrapSelector);
        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      };

      document.addEventListener('keydown', this.focusTrapHandler);
    }

    removeFocusTrap() {
      if (this.focusTrapHandler) {
        document.removeEventListener('keydown', this.focusTrapHandler);
        this.focusTrapHandler = null;
      }
    }

    // Responsive Handler
    handleResize() {
      const wasDesktop = this.isDesktop;
      this.isDesktop = window.innerWidth >= CONFIG.breakpoint;

      // If switching between mobile/desktop, close everything
      if (wasDesktop !== this.isDesktop) {
        this.closeAll();
        this.rebindDropdownEvents();
      }
    }

    rebindDropdownEvents() {
      // Re-initialize dropdown events based on viewport
      this.dropdownItems.forEach(item => {
        const clone = item.cloneNode(true);
        item.parentNode.replaceChild(clone, item);
      });

      // Re-query and rebind
      this.dropdownItems = this.header.querySelectorAll('[data-mega-dropdown]');

      this.dropdownItems.forEach(item => {
        const toggle = item.querySelector('[data-dropdown-toggle]');
        const panel = item.querySelector('[data-dropdown-panel]');

        if (this.isDesktop) {
          item.addEventListener('mouseenter', () => this.handleDropdownEnter(item, panel));
          item.addEventListener('mouseleave', () => this.handleDropdownLeave(item, panel));
        }

        if (toggle) {
          toggle.addEventListener('click', (e) => this.handleDropdownClick(e, item, panel));
          toggle.addEventListener('keydown', (e) => this.handleDropdownKeydown(e, item, panel));
        }
      });
    }
  }

  // Initialize
  function init() {
    const headers = document.querySelectorAll('[data-mega-header]');
    headers.forEach(header => new MegaMenuHeader(header));
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on Shopify section load (Theme Editor)
  document.addEventListener('shopify:section:load', (e) => {
    const header = e.target.querySelector('[data-mega-header]');
    if (header) {
      new MegaMenuHeader(header);
    }
  });

})();
