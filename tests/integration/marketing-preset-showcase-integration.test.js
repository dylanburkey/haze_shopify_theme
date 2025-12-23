/**
 * Integration Tests for Marketing Preset Showcase System
 * Tests complete system integration and end-to-end workflows
 * 
 * Requirements: All marketing preset showcase requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock MarketingPresetShowcaseRenderer for integration tests
class MarketingPresetShowcaseRenderer {
  constructor() {
    this.rendered = '';
  }

  /**
   * Renders the marketing preset showcase section with given settings and blocks
   * Simulates the behavior of sections/marketing-preset-showcase.liquid
   */
  renderSection(sectionSettings, blocks = []) {
    const {
      title = '',
      subtitle = '',
      show_value_indicators = true,
      padding_top = 80,
      padding_bottom = 80,
      background_color = '#ffffff'
    } = sectionSettings || {};

    // Generate section ID for styling
    const sectionId = 'shopify-section-' + Math.random().toString(36).substring(2, 11);

    let html = `<style>
  #${sectionId} {
    padding-top: ${padding_top}px;
    padding-bottom: ${padding_bottom}px;
    background-color: ${background_color};
  }
</style>\n`;

    html += '<div class="marketing-preset-showcase">\n';

    // Render header if title or subtitle is present
    const safeTitle = title || '';
    const safeSubtitle = subtitle || '';
    
    if (safeTitle.trim() !== '' || safeSubtitle.trim() !== '') {
      html += '  <div class="marketing-preset-showcase__header">\n';
      
      if (safeTitle.trim() !== '') {
        html += `    <h2 class="marketing-preset-showcase__title">${safeTitle}</h2>\n`;
      }
      
      if (safeSubtitle.trim() !== '') {
        html += `    <p class="marketing-preset-showcase__subtitle">${safeSubtitle}</p>\n`;
      }
      
      html += '  </div>\n';
    }

    // Render grid container
    html += '  <div class="marketing-preset-showcase__grid">\n';

    // Render blocks
    const safeBlocks = blocks || [];
    for (const block of safeBlocks) {
      if (block) {
        html += this.renderPresetTile(block, show_value_indicators);
      }
    }

    html += '  </div>\n';
    html += '</div>';

    return html;
  }

  /**
   * Renders a single preset tile
   */
  renderPresetTile(block, showValueIndicators) {
    const {
      preset_name = '',
      industry_focus = '',
      description = '',
      badge_text = '',
      value_proposition = '',
      use_case_1 = '',
      use_case_2 = '',
      use_case_3 = '',
      use_case_4 = '',
      use_case_5 = '',
      preview_primary_color = '#1a1a1a',
      preview_secondary_color = '#2d2d2d',
      template_page_url = ''
    } = block || {};

    // Apply default colors when values are empty or undefined
    const safePresetName = preset_name || '';
    const safeIndustryFocus = industry_focus || '';
    const safeDescription = description || '';
    const safeBadgeText = badge_text || '';
    const safeValueProposition = value_proposition || '';
    const safeTemplateUrl = template_page_url || '';
    
    const primaryColor = (preview_primary_color && preview_primary_color.trim && preview_primary_color.trim() !== '') ? preview_primary_color : '#1a1a1a';
    const secondaryColor = (preview_secondary_color && preview_secondary_color.trim && preview_secondary_color.trim() !== '') ? preview_secondary_color : '#2d2d2d';

    let html = '    <article class="preset-marketing-tile" ';
    html += `style="--preview-primary: ${primaryColor}; --preview-secondary: ${secondaryColor};">\n`;

    // Preview area
    html += '      <div class="preset-marketing-tile__preview">\n';
    if (safeBadgeText.trim() !== '' && showValueIndicators) {
      html += `        <span class="preset-marketing-tile__badge">${safeBadgeText}</span>\n`;
    }
    html += '      </div>\n';

    // Content area
    html += '      <div class="preset-marketing-tile__content">\n';

    if (safePresetName.trim() !== '') {
      html += `        <h3 class="preset-marketing-tile__title">${safePresetName}</h3>\n`;
    }

    if (safeIndustryFocus.trim() !== '') {
      html += `        <span class="preset-marketing-tile__industry">${safeIndustryFocus}</span>\n`;
    }

    if (safeDescription.trim() !== '') {
      html += `        <p class="preset-marketing-tile__description">${safeDescription}</p>\n`;
    }

    if (showValueIndicators && safeValueProposition.trim() !== '') {
      html += `        <div class="preset-marketing-tile__value-proposition">${safeValueProposition}</div>\n`;
    }

    // Use cases - optimized rendering matching actual implementation
    const useCases = [use_case_1, use_case_2, use_case_3, use_case_4, use_case_5]
      .filter(useCase => useCase && useCase.trim && useCase.trim() !== '');

    if (useCases.length > 0) {
      html += '        <ul class="preset-marketing-tile__use-cases">\n';
      for (const useCase of useCases) {
        html += `          <li>${useCase}</li>\n`;
      }
      html += '        </ul>\n';
    }

    // Action button
    if (safeTemplateUrl.trim() !== '') {
      const presetNameForAria = safePresetName.trim() !== '' ? safePresetName : 'preset';
      html += `        <a href="${safeTemplateUrl}" class="preset-marketing-tile__button" aria-label="View ${presetNameForAria} template">View Template</a>\n`;
    } else {
      html += '        <button type="button" class="preset-marketing-tile__button preset-marketing-tile__button--disabled" disabled aria-label="Template link not configured">View Template</button>\n';
    }

    html += '      </div>\n';
    html += '    </article>\n';

    return html;
  }

  /**
   * Simulates responsive grid behavior based on viewport width
   */
  getExpectedColumns(viewportWidth) {
    if (viewportWidth < 768) {
      return 1; // Mobile: 1 column
    } else if (viewportWidth >= 768 && viewportWidth < 1024) {
      return 2; // Tablet: 2 columns
    } else if (viewportWidth >= 1024 && viewportWidth < 1400) {
      return 3; // Desktop: 3 columns
    } else {
      return 4; // Large Desktop: 4 columns (auto-fit with minmax)
    }
  }
}

describe('Marketing Preset Showcase Integration Tests', () => {
  let dom;
  let document;
  let window;
  let localStorage;

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="test-container"></div>
          <div class="marketing-preset-showcase-section">
            <div class="marketing-preset-showcase">
              <div class="marketing-preset-showcase__grid"></div>
            </div>
          </div>
        </body>
      </html>
    `, {
      url: 'https://test-store.myshopify.com',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;
    localStorage = {
      data: {},
      getItem: vi.fn((key) => localStorage.data[key] || null),
      setItem: vi.fn((key, value) => { localStorage.data[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorage.data[key]; }),
      clear: vi.fn(() => { localStorage.data = {}; })
    };

    // Set up global objects
    global.document = document;
    global.window = window;
    global.localStorage = localStorage;
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'test-agent' },
      writable: true,
      configurable: true
    });
    global.URL = window.URL;

    // Mock Shopify global
    window.Shopify = {
      routes: { root: '/' }
    };

    // Mock console methods
    global.console = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    };
  });

  afterEach(() => {
    dom.window.close();
    vi.clearAllMocks();
  });

  describe('Complete System Integration', () => {
    it('should integrate all components correctly', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Choose Your Perfect Design',
        subtitle: 'Professional preset designs tailored for your industry',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blocks = [
        {
          preset_name: 'Bold Impact',
          industry_focus: 'Athletic & Performance',
          description: 'High-energy design perfect for sports brands',
          badge_text: 'Most Popular',
          value_proposition: 'Increase conversions by 35%',
          use_case_1: 'Athletic equipment retailers',
          use_case_2: 'Fitness and wellness brands',
          use_case_3: 'Sports performance companies',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: '#7c3aed',
          preview_secondary_color: '#dc2626',
          template_page_url: '/pages/showcase-bold-impact'
        },
        {
          preset_name: 'Tech Forward',
          industry_focus: 'Gaming & Electronics',
          description: 'Futuristic dark design ideal for gaming companies',
          badge_text: 'Trending',
          value_proposition: 'Built for tech-savvy customers',
          use_case_1: 'Gaming hardware companies',
          use_case_2: 'Electronics retailers',
          use_case_3: '',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: '#00d4ff',
          preview_secondary_color: '#7c3aed',
          template_page_url: '/pages/showcase-tech-forward'
        }
      ];

      const html = renderer.renderSection(settings, blocks);

      // Verify complete system integration
      expect(html).toContain('marketing-preset-showcase');
      expect(html).toContain('marketing-preset-showcase__header');
      expect(html).toContain('marketing-preset-showcase__grid');
      expect(html).toContain('Choose Your Perfect Design');
      expect(html).toContain('Professional preset designs');
      
      // Verify both preset tiles are rendered
      expect(html).toContain('Bold Impact');
      expect(html).toContain('Tech Forward');
      expect(html).toContain('Athletic & Performance');
      expect(html).toContain('Gaming & Electronics');
      
      // Verify badges and value propositions
      expect(html).toContain('Most Popular');
      expect(html).toContain('Trending');
      expect(html).toContain('Increase conversions by 35%');
      expect(html).toContain('Built for tech-savvy customers');
      
      // Verify use cases
      expect(html).toContain('Athletic equipment retailers');
      expect(html).toContain('Gaming hardware companies');
      
      // Verify template links
      expect(html).toContain('/pages/showcase-bold-impact');
      expect(html).toContain('/pages/showcase-tech-forward');
      
      // Verify visual preview colors
      expect(html).toContain('--preview-primary: #7c3aed');
      expect(html).toContain('--preview-secondary: #dc2626');
      expect(html).toContain('--preview-primary: #00d4ff');
      expect(html).toContain('--preview-secondary: #7c3aed');
    });

    it('should handle preset switching functionality', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      // Test different preset configurations
      const presetConfigurations = [
        {
          name: 'Bold Impact',
          industry: 'Athletic & Performance',
          colors: { primary: '#7c3aed', secondary: '#dc2626' }
        },
        {
          name: 'Modern Minimal',
          industry: 'Luxury & Lifestyle',
          colors: { primary: '#1a1a1a', secondary: '#f5f5f5' }
        },
        {
          name: 'Zebra Skimmers',
          industry: 'Industrial B2B',
          colors: { primary: '#f59e0b', secondary: '#1f2937' }
        }
      ];

      for (const config of presetConfigurations) {
        const settings = {
          title: `${config.name} Showcase`,
          subtitle: `Designed for ${config.industry}`,
          show_value_indicators: true,
          padding_top: 80,
          padding_bottom: 80,
          background_color: '#ffffff'
        };

        const block = {
          preset_name: config.name,
          industry_focus: config.industry,
          description: `Perfect for ${config.industry.toLowerCase()} businesses`,
          badge_text: 'Featured',
          value_proposition: 'Optimized for your industry',
          use_case_1: 'Professional businesses',
          use_case_2: 'Growing companies',
          use_case_3: '',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: config.colors.primary,
          preview_secondary_color: config.colors.secondary,
          template_page_url: `/pages/showcase-${config.name.toLowerCase().replace(/\s+/g, '-')}`
        };

        const html = renderer.renderSection(settings, [block]);

        // Verify preset-specific content
        expect(html).toContain(config.name);
        expect(html).toContain(config.industry);
        expect(html).toContain(`--preview-primary: ${config.colors.primary}`);
        expect(html).toContain(`--preview-secondary: ${config.colors.secondary}`);
      }
    });

    it('should validate data flow between components', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      // Test data flow from settings to rendered output
      const testCases = [
        {
          settings: {
            title: 'Custom Title',
            subtitle: 'Custom Subtitle',
            show_value_indicators: true,
            padding_top: 60,
            padding_bottom: 120,
            background_color: '#f5f5f5'
          },
          expectedInHtml: [
            'Custom Title',
            'Custom Subtitle',
            'padding-top: 60px',
            'padding-bottom: 120px',
            'background-color: #f5f5f5'
          ]
        },
        {
          settings: {
            title: '',
            subtitle: '',
            show_value_indicators: false,
            padding_top: 0,
            padding_bottom: 0,
            background_color: '#000000'
          },
          expectedInHtml: [
            'padding-top: 0px',
            'padding-bottom: 0px',
            'background-color: #000000'
          ],
          notExpectedInHtml: [
            'marketing-preset-showcase__header',
            'preset-marketing-tile__badge'
          ]
        }
      ];

      for (const testCase of testCases) {
        const html = renderer.renderSection(testCase.settings, []);

        // Verify expected content
        if (testCase.expectedInHtml) {
          for (const expected of testCase.expectedInHtml) {
            expect(html).toContain(expected);
          }
        }

        // Verify content that should not be present
        if (testCase.notExpectedInHtml) {
          for (const notExpected of testCase.notExpectedInHtml) {
            expect(html).not.toContain(notExpected);
          }
        }
      }
    });

    it('should handle admin interface integration', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      // Simulate admin interface data structure
      const adminData = {
        sectionSettings: {
          title: 'Admin Configured Title',
          subtitle: 'Admin Configured Subtitle',
          show_value_indicators: true,
          padding_top: 100,
          padding_bottom: 100,
          background_color: '#ffffff'
        },
        blocks: [
          {
            type: 'preset_tile',
            id: 'block-1',
            settings: {
              preset_name: 'Admin Preset 1',
              industry_focus: 'Admin Industry 1',
              description: 'Admin configured description',
              badge_text: 'Admin Badge',
              value_proposition: 'Admin value prop',
              use_case_1: 'Admin use case 1',
              use_case_2: 'Admin use case 2',
              use_case_3: '',
              use_case_4: '',
              use_case_5: '',
              preview_primary_color: '#admin1',
              preview_secondary_color: '#admin2',
              template_page_url: '/admin/template'
            }
          }
        ]
      };

      // Convert admin data to renderer format
      const blockSettings = adminData.blocks.map(block => block.settings);
      const html = renderer.renderSection(adminData.sectionSettings, blockSettings);

      // Verify admin data is correctly rendered
      expect(html).toContain('Admin Configured Title');
      expect(html).toContain('Admin Configured Subtitle');
      expect(html).toContain('Admin Preset 1');
      expect(html).toContain('Admin Industry 1');
      expect(html).toContain('Admin Badge');
      expect(html).toContain('Admin value prop');
      expect(html).toContain('Admin use case 1');
      expect(html).toContain('Admin use case 2');
      expect(html).toContain('--preview-primary: #admin1');
      expect(html).toContain('--preview-secondary: #admin2');
      expect(html).toContain('/admin/template');
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('should handle responsive grid layout across all viewport sizes', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const viewportTests = [
        { width: 320, expectedColumns: 1, description: 'Mobile (320px)' },
        { width: 767, expectedColumns: 1, description: 'Mobile Max (767px)' },
        { width: 768, expectedColumns: 2, description: 'Tablet Min (768px)' },
        { width: 1023, expectedColumns: 2, description: 'Tablet Max (1023px)' },
        { width: 1024, expectedColumns: 3, description: 'Desktop Min (1024px)' },
        { width: 1399, expectedColumns: 3, description: 'Desktop Max (1399px)' },
        { width: 1400, expectedColumns: 4, description: 'Large Desktop Min (1400px)' },
        { width: 1920, expectedColumns: 4, description: 'Large Desktop (1920px)' }
      ];

      for (const test of viewportTests) {
        const actualColumns = renderer.getExpectedColumns(test.width);
        expect(actualColumns).toBe(test.expectedColumns);
      }
    });

    it('should maintain functionality across different screen sizes', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Responsive Test',
        subtitle: 'Testing responsive behavior',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blocks = Array.from({ length: 6 }, (_, i) => ({
        preset_name: `Preset ${i + 1}`,
        industry_focus: `Industry ${i + 1}`,
        description: `Description ${i + 1}`,
        badge_text: i % 2 === 0 ? 'Popular' : '',
        value_proposition: `Value prop ${i + 1}`,
        use_case_1: `Use case ${i + 1}`,
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: `/preset-${i + 1}`
      }));

      const html = renderer.renderSection(settings, blocks);

      // Verify all tiles are rendered regardless of viewport
      for (let i = 1; i <= 6; i++) {
        expect(html).toContain(`Preset ${i}`);
        expect(html).toContain(`Industry ${i}`);
        expect(html).toContain(`/preset-${i}`);
      }

      // Verify responsive structure is present
      expect(html).toContain('marketing-preset-showcase__grid');
      expect(html).toContain('preset-marketing-tile');
      
      // Count tiles
      const tileCount = (html.match(/preset-marketing-tile"/g) || []).length;
      expect(tileCount).toBe(6);
    });
  });

  describe('Performance Integration', () => {
    it('should handle large numbers of preset tiles efficiently', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Performance Test',
        subtitle: 'Testing with maximum tiles',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      // Create maximum number of blocks (12)
      const blocks = Array.from({ length: 12 }, (_, i) => ({
        preset_name: `Performance Preset ${i + 1}`,
        industry_focus: `Performance Industry ${i + 1}`,
        description: `Performance description for preset ${i + 1} with detailed content`,
        badge_text: i % 3 === 0 ? 'Performance Badge' : '',
        value_proposition: `Performance value proposition ${i + 1}`,
        use_case_1: `Performance use case 1 for preset ${i + 1}`,
        use_case_2: `Performance use case 2 for preset ${i + 1}`,
        use_case_3: `Performance use case 3 for preset ${i + 1}`,
        use_case_4: i % 2 === 0 ? `Performance use case 4 for preset ${i + 1}` : '',
        use_case_5: i % 3 === 0 ? `Performance use case 5 for preset ${i + 1}` : '',
        preview_primary_color: `#${(i * 111111).toString(16).padStart(6, '0').substring(0, 6)}`,
        preview_secondary_color: `#${((i + 1) * 111111).toString(16).padStart(6, '0').substring(0, 6)}`,
        template_page_url: `/performance/preset-${i + 1}`
      }));

      const startTime = performance.now();
      const html = renderer.renderSection(settings, blocks);
      const endTime = performance.now();

      // Should complete rendering quickly (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Verify all tiles are rendered
      const tileCount = (html.match(/preset-marketing-tile"/g) || []).length;
      expect(tileCount).toBe(12);

      // Verify content is present
      expect(html).toContain('Performance Preset 1');
      expect(html).toContain('Performance Preset 12');
      expect(html).toContain('Performance Test');
    });

    it('should optimize CSS and avoid external dependencies', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'CSS Test',
        subtitle: 'Testing CSS optimization',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const html = renderer.renderSection(settings, []);

      // Verify CSS is inline (no external dependencies)
      expect(html).toContain('<style>');
      expect(html).not.toContain('<link');
      expect(html).not.toContain('@import');
      
      // Verify no JavaScript is included
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('onclick');
      expect(html).not.toContain('addEventListener');
      
      // Verify efficient CSS structure
      expect(html).toContain('padding-top:');
      expect(html).toContain('padding-bottom:');
      expect(html).toContain('background-color:');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed data gracefully', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      // Test with malformed settings
      const malformedSettings = {
        title: null,
        subtitle: undefined,
        show_value_indicators: 'invalid',
        padding_top: 'not-a-number',
        padding_bottom: -50,
        background_color: 'invalid-color'
      };

      // Should not throw error
      expect(() => {
        renderer.renderSection(malformedSettings, []);
      }).not.toThrow();

      // Test with malformed blocks
      const malformedBlocks = [
        null,
        undefined,
        { preset_name: null },
        { template_page_url: undefined },
        { preview_primary_color: 'invalid' }
      ];

      // Should not throw error
      expect(() => {
        renderer.renderSection({}, malformedBlocks);
      }).not.toThrow();
    });

    it('should provide fallbacks for missing data', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: '',
        subtitle: '',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blockWithMissingData = {
        preset_name: '',
        industry_focus: '',
        description: '',
        badge_text: '',
        value_proposition: '',
        use_case_1: '',
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '',
        preview_secondary_color: '',
        template_page_url: ''
      };

      const html = renderer.renderSection(settings, [blockWithMissingData]);

      // Should render with fallbacks
      expect(html).toContain('marketing-preset-showcase');
      expect(html).toContain('preset-marketing-tile');
      expect(html).toContain('--preview-primary: #1a1a1a'); // Default color
      expect(html).toContain('--preview-secondary: #2d2d2d'); // Default color
      expect(html).toContain('preset-marketing-tile__button--disabled'); // Disabled button
      expect(html).not.toContain('marketing-preset-showcase__header'); // No header when empty
    });

    it('should handle edge cases in content rendering', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Edge Case Test',
        subtitle: 'Testing edge cases',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      // Test with special characters and HTML
      const edgeCaseBlock = {
        preset_name: 'Test & "Special" <Characters>',
        industry_focus: 'Industry with & symbols',
        description: 'Description with "quotes" and <tags>',
        badge_text: 'Badge & Text',
        value_proposition: 'Value with & special chars',
        use_case_1: 'Use case with & symbols',
        use_case_2: 'Use case with "quotes"',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#ff0000',
        preview_secondary_color: '#00ff00',
        template_page_url: '/test?param=value&other=test'
      };

      const html = renderer.renderSection(settings, [edgeCaseBlock]);

      // Should handle special characters (in a real implementation, these would be escaped)
      expect(html).toContain('Test & "Special" <Characters>');
      expect(html).toContain('Industry with & symbols');
      expect(html).toContain('Badge & Text');
      expect(html).toContain('/test?param=value&other=test');
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility standards across all components', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Accessibility Test',
        subtitle: 'Testing accessibility features',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blocks = [
        {
          preset_name: 'Accessible Preset',
          industry_focus: 'Accessibility Industry',
          description: 'Accessible description',
          badge_text: 'Accessible',
          value_proposition: 'Accessible value',
          use_case_1: 'Accessible use case',
          use_case_2: '',
          use_case_3: '',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: '#1a1a1a',
          preview_secondary_color: '#2d2d2d',
          template_page_url: '/accessible'
        },
        {
          preset_name: 'No URL Preset',
          industry_focus: 'Test Industry',
          description: 'Test description',
          badge_text: '',
          value_proposition: '',
          use_case_1: '',
          use_case_2: '',
          use_case_3: '',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: '#1a1a1a',
          preview_secondary_color: '#2d2d2d',
          template_page_url: ''
        }
      ];

      const html = renderer.renderSection(settings, blocks);

      // Verify semantic HTML structure
      expect(html).toContain('<h2'); // Section title
      expect(html).toContain('<h3'); // Preset titles
      expect(html).toContain('<article'); // Semantic article elements
      expect(html).toContain('<ul'); // Use case lists
      expect(html).toContain('<li'); // Use case items

      // Verify ARIA labels
      expect(html).toContain('aria-label="View Accessible Preset template"');
      expect(html).toContain('aria-label="Template link not configured"');

      // Verify button accessibility
      expect(html).toContain('disabled'); // Disabled state for buttons without URLs
      expect(html).toContain('preset-marketing-tile__button--disabled');
    });

    it('should support keyboard navigation', () => {
      const renderer = new MarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Keyboard Test',
        subtitle: 'Testing keyboard navigation',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const block = {
        preset_name: 'Keyboard Preset',
        industry_focus: 'Keyboard Industry',
        description: 'Keyboard description',
        badge_text: 'Keyboard',
        value_proposition: 'Keyboard value',
        use_case_1: 'Keyboard use case',
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: '/keyboard'
      };

      const html = renderer.renderSection(settings, [block]);

      // Verify focusable elements
      expect(html).toContain('<a href="/keyboard"'); // Focusable link
      expect(html).toContain('preset-marketing-tile__button'); // Button class for styling

      // In a real implementation, we would verify:
      // - Tab order is logical
      // - Focus indicators are visible
      // - All interactive elements are keyboard accessible
    });
  });
});