/**
 * Preset Showcase System
 * 
 * Allows visitors to preview different theme presets without accessing the theme editor.
 * Uses URL parameters and localStorage to persist preset selection across pages.
 * 
 * Features:
 * - Floating preset switcher widget
 * - URL parameter support (?preset=bold-impact)
 * - LocalStorage persistence
 * - Smooth transitions between presets
 * - Preset-specific header/footer variations
 */

class PresetShowcase {
  constructor() {
    this.presets = {
      'default': {
        name: 'Default',
        description: 'Clean industrial design',
        template: 'index',
        headerStyle: 'default',
        footerStyle: 'default'
      },
      'bold-impact': {
        name: 'Bold Impact',
        description: 'High-energy athletic brand',
        template: 'index.bold-impact',
        headerStyle: 'bold',
        footerStyle: 'bold',
        colors: {
          primary: '#7c3aed',
          secondary: '#dc2626',
          background: '#0f0f0f',
          text: '#ffffff'
        }
      },
      'modern-minimal': {
        name: 'Modern Minimal',
        description: 'Clean, sophisticated aesthetic',
        template: 'index.modern-minimal',
        headerStyle: 'minimal',
        footerStyle: 'minimal',
        colors: {
          primary: '#000000',
          secondary: '#666666',
          background: '#ffffff',
          text: '#1a1a1a'
        }
      },
      'tech-forward': {
        name: 'Tech Forward',
        description: 'Futuristic technology brand',
        template: 'index.tech-forward',
        headerStyle: 'tech',
        footerStyle: 'tech',
        colors: {
          primary: '#00d4ff',
          secondary: '#7c3aed',
          background: '#0a0a0f',
          text: '#e0e0e0'
        }
      },
      'warm-artisan': {
        name: 'Warm Artisan',
        description: 'Handcrafted, organic feel',
        template: 'index.warm-artisan',
        headerStyle: 'artisan',
        footerStyle: 'artisan',
        colors: {
          primary: '#b45309',
          secondary: '#166534',
          background: '#fef3c7',
          text: '#451a03'
        }
      },
      'zebra-skimmers': {
        name: 'Zebra Skimmers',
        description: 'Industrial equipment brand',
        template: 'index.zebra-skimmers',
        headerStyle: 'industrial',
        footerStyle: 'industrial',
        colors: {
          primary: '#f59e0b',
          secondary: '#1f2937',
          background: '#ffffff',
          text: '#111827'
        }
      }
    };

    this.currentPreset = this.getPresetFromURL() || this.getPresetFromStorage() || 'default';
    this.showcaseMode = this.isShowcaseMode();
    
    this.init();
  }

  init() {
    // Apply current preset
    this.applyPreset(this.currentPreset, false);
    
    // Only show switcher in showcase mode or when URL param present
    if (this.showcaseMode) {
      this.createSwitcherWidget();
      this.bindEvents();
    }
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      const preset = this.getPresetFromURL() || 'default';
      this.applyPreset(preset, false);
    });
  }

  isShowcaseMode() {
    // Enable showcase mode if:
    // 1. URL has ?showcase=true or ?preset=xxx
    // 2. We're on a preset showcase page
    // 3. LocalStorage has showcase mode enabled
    const params = new URLSearchParams(window.location.search);
    return params.has('showcase') || 
           params.has('preset') || 
           localStorage.getItem('preset-showcase-mode') === 'true' ||
           document.body.classList.contains('template-page-preset-showcase');
  }

  getPresetFromURL() {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('preset');
    return preset && this.presets[preset] ? preset : null;
  }

  getPresetFromStorage() {
    return localStorage.getItem('selected-preset');
  }

  savePresetToStorage(preset) {
    localStorage.setItem('selected-preset', preset);
  }

  applyPreset(presetId, updateURL = true) {
    const preset = this.presets[presetId];
    if (!preset) return;

    this.currentPreset = presetId;
    this.savePresetToStorage(presetId);

    // Update body class
    document.body.className = document.body.className.replace(/preset-\S+/g, '');
    document.body.classList.add(`preset-${presetId}`);

    // Apply CSS custom properties if preset has custom colors
    if (preset.colors) {
      const root = document.documentElement;
      Object.entries(preset.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Update header style
    this.updateHeaderStyle(preset.headerStyle);
    
    // Update footer style  
    this.updateFooterStyle(preset.footerStyle);

    // Update URL without page reload
    if (updateURL && presetId !== 'default') {
      const url = new URL(window.location);
      url.searchParams.set('preset', presetId);
      window.history.pushState({ preset: presetId }, '', url);
    } else if (updateURL && presetId === 'default') {
      const url = new URL(window.location);
      url.searchParams.delete('preset');
      window.history.pushState({ preset: presetId }, '', url);
    }

    // Dispatch event for other components to react
    document.dispatchEvent(new CustomEvent('preset-changed', { 
      detail: { preset: presetId, config: preset } 
    }));

    // Update active state in switcher
    this.updateSwitcherActiveState(presetId);
  }

  updateHeaderStyle(style) {
    const header = document.querySelector('header, .header, [data-section-type="header"]');
    if (header) {
      header.className = header.className.replace(/header-style-\S+/g, '');
      header.classList.add(`header-style-${style}`);
    }
  }

  updateFooterStyle(style) {
    const footer = document.querySelector('footer, .footer, [data-section-type="footer"]');
    if (footer) {
      footer.className = footer.className.replace(/footer-style-\S+/g, '');
      footer.classList.add(`footer-style-${style}`);
    }
  }

  createSwitcherWidget() {
    const widget = document.createElement('div');
    widget.className = 'preset-switcher';
    widget.innerHTML = `
      <button class="preset-switcher__toggle" aria-label="Toggle preset switcher" aria-expanded="false">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4 4m-7 0l-4-4m0 11l4-4m7 0l4 4"></path>
        </svg>
        <span>Presets</span>
      </button>
      <div class="preset-switcher__panel" hidden>
        <div class="preset-switcher__header">
          <h3>Theme Presets</h3>
          <p>Preview different design styles</p>
        </div>
        <div class="preset-switcher__list">
          ${Object.entries(this.presets).map(([id, preset]) => `
            <button class="preset-switcher__item ${id === this.currentPreset ? 'is-active' : ''}" 
                    data-preset="${id}">
              <span class="preset-switcher__name">${preset.name}</span>
              <span class="preset-switcher__desc">${preset.description}</span>
            </button>
          `).join('')}
        </div>
        <div class="preset-switcher__footer">
          <a href="/?preset=${this.currentPreset}" class="preset-switcher__view-full">
            View Full Homepage →
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    this.widget = widget;
  }

  bindEvents() {
    if (!this.widget) return;

    const toggle = this.widget.querySelector('.preset-switcher__toggle');
    const panel = this.widget.querySelector('.preset-switcher__panel');
    const items = this.widget.querySelectorAll('.preset-switcher__item');

    // Toggle panel
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      panel.hidden = isExpanded;
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.widget.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      }
    });

    // Preset selection
    items.forEach(item => {
      item.addEventListener('click', () => {
        const presetId = item.dataset.preset;
        this.applyPreset(presetId);
      });
    });

    // Keyboard navigation
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
        toggle.focus();
      }
    });
  }

  updateSwitcherActiveState(presetId) {
    if (!this.widget) return;
    
    const items = this.widget.querySelectorAll('.preset-switcher__item');
    items.forEach(item => {
      item.classList.toggle('is-active', item.dataset.preset === presetId);
    });

    // Update view full link
    const viewFullLink = this.widget.querySelector('.preset-switcher__view-full');
    if (viewFullLink) {
      viewFullLink.href = `/?preset=${presetId}`;
    }
  }

  // Public API
  static enable() {
    localStorage.setItem('preset-showcase-mode', 'true');
    window.location.reload();
  }

  static disable() {
    localStorage.removeItem('preset-showcase-mode');
    localStorage.removeItem('selected-preset');
    window.location.href = window.location.pathname;
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.presetShowcase = new PresetShowcase();
});

// Expose to window for console access
window.PresetShowcase = PresetShowcase;
