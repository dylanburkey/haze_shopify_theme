/**
 * Product Filters
 * Handles faceted filtering on collection pages
 */

class ProductFilters {
  constructor() {
    this.form = document.querySelector("[data-filters-form]");
    this.productGrid = document.querySelector("[data-product-grid]");
    this.filterInputs = document.querySelectorAll("[data-filter-input]");
    this.sortSelect = document.querySelector("[data-sort-select]");
    this.clearButton = document.querySelector("[data-filters-clear]");
    this.removeButtons = document.querySelectorAll("[data-filter-remove]");

    // Debounce timer for price inputs
    this.debounceTimer = null;

    this.bindEvents();
    this.initPriceSliders();
  }

  bindEvents() {
    // Filter checkbox/select changes
    this.filterInputs.forEach((input) => {
      if (input.type === "number") {
        // Debounce price inputs
        input.addEventListener("input", () => this.debounceSubmit());
      } else {
        input.addEventListener("change", () => this.submitForm());
      }
    });

    // Sort select
    this.sortSelect?.addEventListener("change", () => this.submitForm());

    // Clear all filters
    this.clearButton?.addEventListener("click", (e) => {
      e.preventDefault();
      this.clearFilters();
    });

    // Remove individual filters
    this.removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = button.href;
      });
    });

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
      window.location.reload();
    });
  }

  initPriceSliders() {
    const minSlider = document.querySelector("[data-price-slider-min]");
    const maxSlider = document.querySelector("[data-price-slider-max]");
    const minInput = document.querySelector("[data-price-min]");
    const maxInput = document.querySelector("[data-price-max]");

    if (!minSlider || !maxSlider) return;

    // Sync sliders with inputs
    minSlider.addEventListener("input", () => {
      const minVal = parseInt(minSlider.value);
      const maxVal = parseInt(maxSlider.value);

      if (minVal > maxVal - 10) {
        minSlider.value = maxVal - 10;
      }

      if (minInput) minInput.value = minSlider.value;
      this.debounceSubmit();
    });

    maxSlider.addEventListener("input", () => {
      const minVal = parseInt(minSlider.value);
      const maxVal = parseInt(maxSlider.value);

      if (maxVal < minVal + 10) {
        maxSlider.value = minVal + 10;
      }

      if (maxInput) maxInput.value = maxSlider.value;
      this.debounceSubmit();
    });

    // Sync inputs with sliders
    minInput?.addEventListener("input", () => {
      if (minSlider) minSlider.value = minInput.value;
    });

    maxInput?.addEventListener("input", () => {
      if (maxSlider) maxSlider.value = maxInput.value;
    });
  }

  debounceSubmit() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.submitForm();
    }, 500);
  }

  async submitForm() {
    if (!this.form) return;

    const formData = new FormData(this.form);
    const searchParams = new URLSearchParams();

    // Build search params from form data
    for (const [key, value] of formData.entries()) {
      if (value) {
        searchParams.append(key, value);
      }
    }

    // Build the new URL
    const url = `${window.location.pathname}?${searchParams.toString()}`;

    // Show loading state
    this.showLoading();

    try {
      // Fetch the filtered content
      const response = await fetch(url, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Update the product grid
      const newGrid = doc.querySelector("[data-product-grid]");
      if (newGrid && this.productGrid) {
        this.productGrid.innerHTML = newGrid.innerHTML;
      }

      // Update the URL without page reload
      window.history.pushState({}, "", url);

      // Update product count if present
      const newCount = doc.querySelector(".collection-toolbar__count");
      const currentCount = document.querySelector(".collection-toolbar__count");
      if (newCount && currentCount) {
        currentCount.textContent = newCount.textContent;
      }

      // Update active filters display
      const newActiveFilters = doc.querySelector(".active-filters");
      const currentActiveFilters = document.querySelector(".active-filters");
      if (newActiveFilters) {
        if (currentActiveFilters) {
          currentActiveFilters.outerHTML = newActiveFilters.outerHTML;
        } else {
          // Insert after the form
          this.form.insertAdjacentHTML("afterend", newActiveFilters.outerHTML);
        }
        // Rebind remove buttons
        this.removeButtons = document.querySelectorAll("[data-filter-remove]");
        this.removeButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = button.href;
          });
        });
      } else if (currentActiveFilters) {
        currentActiveFilters.remove();
      }

      // Update pagination if present
      const newPagination = doc.querySelector(".pagination");
      const currentPagination = document.querySelector(".pagination");
      if (newPagination && currentPagination) {
        currentPagination.outerHTML = newPagination.outerHTML;
      } else if (!newPagination && currentPagination) {
        currentPagination.remove();
      }
    } catch (error) {
      console.error("Filter error:", error);
      // Fallback to full page navigation
      window.location.href = url;
    } finally {
      this.hideLoading();
    }
  }

  clearFilters() {
    // Navigate to collection URL without any params
    window.location.href = window.location.pathname;
  }

  showLoading() {
    this.productGrid?.classList.add("is-loading");
    document.body.style.cursor = "wait";
  }

  hideLoading() {
    this.productGrid?.classList.remove("is-loading");
    document.body.style.cursor = "";
  }
}

// Mobile filter toggle
class MobileFilters {
  constructor() {
    this.sidebar = document.querySelector(".collection-sidebar");
    this.toggleButton = null;
    this.closeButton = null;
    this.backdrop = null;

    this.init();
  }

  init() {
    if (!this.sidebar) return;

    // Create toggle button for mobile
    this.createToggleButton();
    this.createBackdrop();
    this.bindEvents();
  }

  createToggleButton() {
    // Check if button already exists
    if (document.querySelector("[data-filter-toggle]")) return;

    const toolbar = document.querySelector(".collection-toolbar");
    if (!toolbar) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button--secondary filter-toggle";
    button.dataset.filterToggle = "";
    button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
      Filters
    `;

    toolbar.insertBefore(button, toolbar.firstChild);
    this.toggleButton = button;

    // Add close button to sidebar
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "filter-close";
    closeButton.dataset.filterClose = "";
    closeButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    this.sidebar.insertBefore(closeButton, this.sidebar.firstChild);
    this.closeButton = closeButton;

    // Add styles for mobile
    const style = document.createElement("style");
    style.textContent = `
      .filter-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      @media (min-width: 64rem) {
        .filter-toggle {
          display: none;
        }
      }

      .filter-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        margin-left: auto;
        margin-bottom: 1rem;
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        cursor: pointer;
      }

      @media (min-width: 64rem) {
        .filter-close {
          display: none;
        }
      }

      .filter-backdrop {
        position: fixed;
        inset: 0;
        z-index: calc(var(--z-modal) - 1);
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.25s, visibility 0.25s;
      }

      .filter-backdrop.is-visible {
        opacity: 1;
        visibility: visible;
      }

      @media (min-width: 64rem) {
        .filter-backdrop {
          display: none;
        }
      }

      [data-product-grid].is-loading {
        opacity: 0.5;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  createBackdrop() {
    if (document.querySelector(".filter-backdrop")) return;

    this.backdrop = document.createElement("div");
    this.backdrop.className = "filter-backdrop";
    document.body.appendChild(this.backdrop);
  }

  bindEvents() {
    this.toggleButton?.addEventListener("click", () => this.open());
    this.closeButton?.addEventListener("click", () => this.close());
    this.backdrop?.addEventListener("click", () => this.close());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.sidebar?.classList.contains("is-open")) {
        this.close();
      }
    });
  }

  open() {
    this.sidebar?.classList.add("is-open");
    this.backdrop?.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.sidebar?.classList.remove("is-open");
    this.backdrop?.classList.remove("is-visible");
    document.body.style.overflow = "";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  new ProductFilters();
  new MobileFilters();
});
