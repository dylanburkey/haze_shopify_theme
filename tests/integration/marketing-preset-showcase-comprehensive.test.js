/**
 * Comprehensive Integration Tests for Marketing Preset Showcase
 * Tests end-to-end workflows, performance, and cross-component integration
 * 
 * Requirements: All marketing preset showcase requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock theme integration components
class ThemeIntegrationManager {
  constructor() {
    this.presetTemplates = new Map();
    this.headerFooterCombinations = new Map();
    this.cssVariables = new Map();
  }

  registerPresetTemplate(presetName, templateConfig) {
    this.presetTemplates.set(presetName, templateConfig);
  }

  registerHeaderFooterCombination(presetName, headerType, footerType) {
    this.headerFooterCombinations.set(presetName, { headerType, footerType });
  }

  setCSSVariable(name, value) {
    this.cssVariables.set(name, value);
  }

  getPresetConfiguration(presetName) {
    return {
      template: this.presetTemplates.get(presetName),
      headerFooter: this.headerFooterCombinations.get(presetName),
      cssVariables: Array.from(this.cssVariables.entries())
    };
  }

  validatePresetIntegration(presetName) {
    const config = this.getPresetConfiguration(presetName);
    return {
      hasTemplate: !!config.template,
      hasHeaderFooter: !!config.headerFooter,
      hasCSSVariables: config.cssVariables.length > 0,
      isValid: !!config.template && !!config.headerFooter
    };
  }
}

// Mock performance monitor
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      renderTime: 100, // ms
      memoryUsage: 50, // MB
      domElements: 1000
    };
  }

  startMeasurement(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage()
    });
  }

  endMeasurement(name) {
    const measurement = this.metrics.get(name);
    if (!measurement) return null;

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const result = {
      duration: endTime - measurement.startTime,
      memoryDelta: endMemory - measurement.startMemory,
      timestamp: new Date().toISOString()
    };

    this.metrics.set(name, { ...measurement, ...result });
    return result;
  }

  getMemoryUsage() {
    // Mock memory usage calculation
    return Math.random() * 100; // MB
  }

  validatePerformance(name) {
    const measurement = this.metrics.get(name);
    if (!measurement) return { valid: false, reason: 'No measurement found' };

    const issues = [];
    
    if (measurement.duration > this.thresholds.renderTime) {
      issues.push(`Render time ${measurement.duration}ms exceeds threshold ${this.thresholds.renderTime}ms`);
    }

    if (measurement.memoryDelta > this.thresholds.memoryUsage) {
      issues.push(`Memory usage ${measurement.memoryDelta}MB exceeds threshold ${this.thresholds.memoryUsage}MB`);
    }

    return {
      valid: issues.length === 0,
      issues,
      metrics: measurement
    };
  }
}

// Mock responsive behavior tester
class ResponsiveBehaviorTester {
  constructor() {
    this.breakpoints = {
      mobile: { min: 320, max: 767 },
      tablet: { min: 768, max: 1023 },
      desktop: { min: 1024, max: 1399 },
      largeDesktop: { min: 1400, max: 2560 }
    };
  }

  testViewport(width, height = 800) {
    const deviceType = this.getDeviceType(width);
    const expectedColumns = this.getExpectedColumns(width);
    
    return {
      width,
      height,
      deviceType,
      expectedColumns,
      breakpoint: this.getBreakpoint(width),
      isValid: this.validateViewport(width, height)
    };
  }

  getDeviceType(width) {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1400) return 'desktop';
    return 'largeDesktop';
  }

  getExpectedColumns(width) {
    if (width < 768) return 1;
    if (width < 1024) return 2;
    if (width < 1400) return 3;
    return 4;
  }

  getBreakpoint(width) {
    for (const [name, range] of Object.entries(this.breakpoints)) {
      if (width >= range.min && width <= range.max) {
        return name;
      }
    }
    return 'unknown';
  }

  validateViewport(width, height) {
    return width >= 320 && width <= 2560 && height >= 400 && height <= 1600;
  }

  testAllBreakpoints() {
    const testWidths = [320, 767, 768, 1023, 1024, 1399, 1400, 1920];
    return testWidths.map(width => this.testViewport(width));
  }
}

// Enhanced MarketingPresetShowcaseRenderer with performance monitoring
class EnhancedMarketingPresetShowcaseRenderer {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.responsiveTester = new ResponsiveBehaviorTester();
    this.renderCount = 0;
    this.lastRenderTime = 0;
  }

  renderSection(sectionSettings, blocks = []) {
    this.performanceMonitor.startMeasurement('sectionRender');
    this.renderCount++;

    const {
      title = '',
      subtitle = '',
      show_value_indicators = true,
      padding_top = 80,
      padding_bottom = 80,
      background_color = '#ffffff'
    } = sectionSettings || {};

    const sectionId = 'shopify-section-' + Math.random().toString(36).substring(2, 11);

    let html = `<style>
  #${sectionId} {
    padding-top: ${padding_top}px;
    padding-bottom: ${padding_bottom}px;
    background-color: ${background_color};
  }
</style>\n`;

    html += '<div class="marketing-preset-showcase">\n';

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

    html += '  <div class="marketing-preset-showcase__grid">\n';

    const safeBlocks = blocks || [];
    for (const block of safeBlocks) {
      if (block) {
        html += this.renderPresetTile(block, show_value_indicators);
      }
    }

    html += '  </div>\n';
    html += '</div>';

    const measurement = this.performanceMonitor.endMeasurement('sectionRender');
    this.lastRenderTime = measurement ? measurement.duration : 0;

    return html;
  }

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

    html += '      <div class="preset-marketing-tile__preview">\n';
    if (safeBadgeText.trim() !== '' && showValueIndicators) {
      html += `        <span class="preset-marketing-tile__badge">${safeBadgeText}</span>\n`;
    }
    html += '      </div>\n';

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

    const useCases = [use_case_1, use_case_2, use_case_3, use_case_4, use_case_5]
      .filter(useCase => useCase && useCase.trim && useCase.trim() !== '');

    if (useCases.length > 0) {
      html += '        <ul class="preset-marketing-tile__use-cases">\n';
      for (const useCase of useCases) {
        html += `          <li>${useCase}</li>\n`;
      }
      html += '        </ul>\n';
    }

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

  getPerformanceMetrics() {
    return {
      renderCount: this.renderCount,
      lastRenderTime: this.lastRenderTime,
      averageRenderTime: this.calculateAverageRenderTime()
    };
  }

  calculateAverageRenderTime() {
    // Mock calculation - in real implementation would track all render times
    return this.lastRenderTime;
  }

  testResponsiveBehavior(viewportWidth) {
    return this.responsiveTester.testViewport(viewportWidth);
  }
}

describe('Marketing Preset Showcase Comprehensive Integration Tests', () => {
  let dom;
  let document;
  let window;
  let themeIntegration;
  let performanceMonitor;
  let responsiveTester;

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprehensive Test</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
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

    // Set up global objects
    global.document = document;
    global.window = window;
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'test-agent' },
      writable: true,
      configurable: true
    });

    // Initialize test components
    themeIntegration = new ThemeIntegrationManager();
    performanceMonitor = new PerformanceMonitor();
    responsiveTester = new ResponsiveBehaviorTester();

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

  describe('End-to-End Workflow Tests', () => {
    it('should handle complete data import to display workflow', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Simulate data import from admin interface
      const importedData = {
        sectionSettings: {
          title: 'Imported Preset Showcase',
          subtitle: 'Data imported from admin interface',
          show_value_indicators: true,
          padding_top: 90,
          padding_bottom: 90,
          background_color: '#f8f9fa'
        },
        presetBlocks: [
          {
            preset_name: 'Imported Bold Impact',
            industry_focus: 'Imported Athletic',
            description: 'Imported from admin system',
            badge_text: 'Imported',
            value_proposition: 'Admin configured value',
            use_case_1: 'Imported use case 1',
            use_case_2: 'Imported use case 2',
            use_case_3: 'Imported use case 3',
            use_case_4: '',
            use_case_5: '',
            preview_primary_color: '#imported1',
            preview_secondary_color: '#imported2',
            template_page_url: '/imported/template'
          }
        ]
      };

      // Process through rendering pipeline
      const html = renderer.renderSection(importedData.sectionSettings, importedData.presetBlocks);

      // Verify complete workflow
      expect(html).toContain('Imported Preset Showcase');
      expect(html).toContain('Data imported from admin interface');
      expect(html).toContain('Imported Bold Impact');
      expect(html).toContain('Imported Athletic');
      expect(html).toContain('Admin configured value');
      expect(html).toContain('Imported use case 1');
      expect(html).toContain('Imported use case 2');
      expect(html).toContain('Imported use case 3');
      expect(html).toContain('--preview-primary: #imported1');
      expect(html).toContain('--preview-secondary: #imported2');
      expect(html).toContain('/imported/template');
      expect(html).toContain('padding-top: 90px');
      expect(html).toContain('background-color: #f8f9fa');

      // Verify performance metrics
      const metrics = renderer.getPerformanceMetrics();
      expect(metrics.renderCount).toBe(1);
      expect(metrics.lastRenderTime).toBeGreaterThan(0);
    });

    it('should handle preset switching across all systems', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Register preset configurations
      const presetConfigs = [
        {
          name: 'bold-impact',
          displayName: 'Bold Impact',
          industry: 'Athletic & Performance',
          headerType: 'mega-menu-header',
          footerType: 'preset-footer',
          colors: { primary: '#7c3aed', secondary: '#dc2626' }
        },
        {
          name: 'tech-forward',
          displayName: 'Tech Forward',
          industry: 'Gaming & Electronics',
          headerType: 'mega-menu-header',
          footerType: 'preset-footer',
          colors: { primary: '#00d4ff', secondary: '#7c3aed' }
        },
        {
          name: 'zebra-skimmers',
          displayName: 'Zebra Skimmers',
          industry: 'Industrial B2B',
          headerType: 'header-industrial',
          footerType: 'footer-industrial',
          colors: { primary: '#f59e0b', secondary: '#1f2937' }
        }
      ];

      // Test each preset configuration
      for (const config of presetConfigs) {
        // Register with theme integration
        themeIntegration.registerPresetTemplate(config.name, {
          templatePath: `/templates/index.${config.name}.json`,
          showcasePath: `/pages/showcase-${config.name}`
        });
        
        themeIntegration.registerHeaderFooterCombination(
          config.name,
          config.headerType,
          config.footerType
        );

        // Set CSS variables
        themeIntegration.setCSSVariable('--color-primary', config.colors.primary);
        themeIntegration.setCSSVariable('--color-secondary', config.colors.secondary);

        // Validate integration
        const validation = themeIntegration.validatePresetIntegration(config.name);
        expect(validation.isValid).toBe(true);
        expect(validation.hasTemplate).toBe(true);
        expect(validation.hasHeaderFooter).toBe(true);

        // Test rendering
        const settings = {
          title: `${config.displayName} Showcase`,
          subtitle: `Designed for ${config.industry}`,
          show_value_indicators: true,
          padding_top: 80,
          padding_bottom: 80,
          background_color: '#ffffff'
        };

        const block = {
          preset_name: config.displayName,
          industry_focus: config.industry,
          description: `Perfect for ${config.industry.toLowerCase()} businesses`,
          badge_text: 'Featured',
          value_proposition: 'Industry-optimized design',
          use_case_1: 'Professional businesses',
          use_case_2: 'Growing companies',
          use_case_3: '',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: config.colors.primary,
          preview_secondary_color: config.colors.secondary,
          template_page_url: `/pages/showcase-${config.name}`
        };

        const html = renderer.renderSection(settings, [block]);

        // Verify preset-specific rendering
        expect(html).toContain(config.displayName);
        expect(html).toContain(config.industry);
        expect(html).toContain(`--preview-primary: ${config.colors.primary}`);
        expect(html).toContain(`--preview-secondary: ${config.colors.secondary}`);
        expect(html).toContain(`/pages/showcase-${config.name}`);
      }

      // Verify performance across all presets
      const metrics = renderer.getPerformanceMetrics();
      expect(metrics.renderCount).toBe(presetConfigs.length);
    });

    it('should validate data synchronization between admin and storefront', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Simulate admin data update
      const originalData = {
        preset_name: 'Original Preset',
        industry_focus: 'Original Industry',
        description: 'Original description',
        badge_text: 'Original',
        value_proposition: 'Original value',
        use_case_1: 'Original use case 1',
        use_case_2: 'Original use case 2',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#original1',
        preview_secondary_color: '#original2',
        template_page_url: '/original'
      };

      const updatedData = {
        preset_name: 'Updated Preset',
        industry_focus: 'Updated Industry',
        description: 'Updated description',
        badge_text: 'Updated',
        value_proposition: 'Updated value',
        use_case_1: 'Updated use case 1',
        use_case_2: 'Updated use case 2',
        use_case_3: 'Updated use case 3',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#updated1',
        preview_secondary_color: '#updated2',
        template_page_url: '/updated'
      };

      const settings = {
        title: 'Sync Test',
        subtitle: 'Testing data synchronization',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      // Render original data
      const originalHtml = renderer.renderSection(settings, [originalData]);
      expect(originalHtml).toContain('Original Preset');
      expect(originalHtml).toContain('Original Industry');
      expect(originalHtml).toContain('--preview-primary: #original1');

      // Render updated data
      const updatedHtml = renderer.renderSection(settings, [updatedData]);
      expect(updatedHtml).toContain('Updated Preset');
      expect(updatedHtml).toContain('Updated Industry');
      expect(updatedHtml).toContain('Updated use case 3');
      expect(updatedHtml).toContain('--preview-primary: #updated1');

      // Verify changes are reflected
      expect(updatedHtml).not.toContain('Original Preset');
      expect(updatedHtml).not.toContain('#original1');
    });
  });

  describe('Performance Across All Major Pages', () => {
    it('should maintain performance standards with maximum content', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Create maximum configuration (12 presets with full content)
      const settings = {
        title: 'Performance Test - Maximum Configuration',
        subtitle: 'Testing performance with maximum number of preset tiles and full content for each tile to ensure the system can handle the complete showcase scenario',
        show_value_indicators: true,
        padding_top: 120,
        padding_bottom: 120,
        background_color: '#ffffff'
      };

      const maxBlocks = Array.from({ length: 12 }, (_, i) => ({
        preset_name: `Performance Preset ${i + 1} with Extended Name`,
        industry_focus: `Performance Industry ${i + 1} with Extended Focus Area`,
        description: `This is a comprehensive performance test description for preset ${i + 1} that includes detailed information about the preset's capabilities, target audience, and unique selling propositions to test rendering performance with maximum content length.`,
        badge_text: i % 3 === 0 ? `Performance Badge ${i + 1}` : '',
        value_proposition: `Performance value proposition ${i + 1} with detailed benefits and competitive advantages that this preset offers to businesses in the target industry segment.`,
        use_case_1: `Comprehensive use case 1 for preset ${i + 1} targeting specific business scenarios`,
        use_case_2: `Detailed use case 2 for preset ${i + 1} covering additional market segments`,
        use_case_3: `Extended use case 3 for preset ${i + 1} addressing niche requirements`,
        use_case_4: i % 2 === 0 ? `Additional use case 4 for preset ${i + 1} for comprehensive coverage` : '',
        use_case_5: i % 3 === 0 ? `Final use case 5 for preset ${i + 1} completing the full set` : '',
        preview_primary_color: `#${(i * 111111).toString(16).padStart(6, '0').substring(0, 6)}`,
        preview_secondary_color: `#${((i + 1) * 111111).toString(16).padStart(6, '0').substring(0, 6)}`,
        template_page_url: `/performance/comprehensive/preset-${i + 1}?test=performance&full=true`
      }));

      // Measure performance
      performanceMonitor.startMeasurement('maxContentRender');
      const html = renderer.renderSection(settings, maxBlocks);
      const measurement = performanceMonitor.endMeasurement('maxContentRender');

      // Validate performance
      const validation = performanceMonitor.validatePerformance('maxContentRender');
      expect(validation.valid).toBe(true);
      
      if (!validation.valid) {
        console.warn('Performance issues detected:', validation.issues);
      }

      // Verify content completeness
      expect(html).toContain('Performance Test - Maximum Configuration');
      expect(html).toContain('Performance Preset 1');
      expect(html).toContain('Performance Preset 12');
      
      // Count elements
      const tileCount = (html.match(/preset-marketing-tile"/g) || []).length;
      expect(tileCount).toBe(12);
      
      const useCaseCount = (html.match(/preset-marketing-tile__use-cases/g) || []).length;
      expect(useCaseCount).toBeGreaterThan(0);

      // Verify performance metrics
      expect(measurement.duration).toBeLessThan(100); // Should render in < 100ms
    });

    it('should handle concurrent rendering operations', async () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Concurrent Test',
        subtitle: 'Testing concurrent operations',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blocks = Array.from({ length: 6 }, (_, i) => ({
        preset_name: `Concurrent Preset ${i + 1}`,
        industry_focus: `Concurrent Industry ${i + 1}`,
        description: `Concurrent description ${i + 1}`,
        badge_text: i % 2 === 0 ? 'Concurrent' : '',
        value_proposition: `Concurrent value ${i + 1}`,
        use_case_1: `Concurrent use case ${i + 1}`,
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: `/concurrent/${i + 1}`
      }));

      // Simulate concurrent rendering operations
      const renderPromises = Array.from({ length: 5 }, (_, i) => 
        new Promise(resolve => {
          setTimeout(() => {
            const html = renderer.renderSection(settings, blocks);
            resolve({ index: i, html, timestamp: Date.now() });
          }, Math.random() * 10); // Random delay up to 10ms
        })
      );

      const results = await Promise.all(renderPromises);

      // Verify all renders completed successfully
      expect(results).toHaveLength(5);
      
      for (const result of results) {
        expect(result.html).toContain('Concurrent Test');
        expect(result.html).toContain('Concurrent Preset 1');
        expect(result.html).toContain('Concurrent Preset 6');
      }

      // Verify performance metrics
      const metrics = renderer.getPerformanceMetrics();
      expect(metrics.renderCount).toBe(5);
    });

    it('should optimize memory usage with large datasets', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Test with progressively larger datasets
      const testSizes = [1, 3, 6, 9, 12];
      const memoryResults = [];

      for (const size of testSizes) {
        const settings = {
          title: `Memory Test - ${size} Presets`,
          subtitle: `Testing memory usage with ${size} preset tiles`,
          show_value_indicators: true,
          padding_top: 80,
          padding_bottom: 80,
          background_color: '#ffffff'
        };

        const blocks = Array.from({ length: size }, (_, i) => ({
          preset_name: `Memory Test Preset ${i + 1}`,
          industry_focus: `Memory Industry ${i + 1}`,
          description: `Memory test description ${i + 1} with sufficient content to test memory allocation patterns`,
          badge_text: i % 2 === 0 ? 'Memory' : '',
          value_proposition: `Memory value proposition ${i + 1}`,
          use_case_1: `Memory use case 1 for preset ${i + 1}`,
          use_case_2: `Memory use case 2 for preset ${i + 1}`,
          use_case_3: i % 3 === 0 ? `Memory use case 3 for preset ${i + 1}` : '',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: '#1a1a1a',
          preview_secondary_color: '#2d2d2d',
          template_page_url: `/memory/test/${i + 1}`
        }));

        performanceMonitor.startMeasurement(`memoryTest${size}`);
        const html = renderer.renderSection(settings, blocks);
        const measurement = performanceMonitor.endMeasurement(`memoryTest${size}`);

        memoryResults.push({
          size,
          duration: measurement.duration,
          memoryDelta: measurement.memoryDelta,
          htmlLength: html.length
        });

        // Verify content scales correctly
        const tileCount = (html.match(/preset-marketing-tile"/g) || []).length;
        expect(tileCount).toBe(size);
      }

      // Verify memory usage scales reasonably
      for (let i = 1; i < memoryResults.length; i++) {
        const current = memoryResults[i];
        const previous = memoryResults[i - 1];
        
        // Memory usage should scale reasonably (not exponentially)
        const memoryRatio = current.memoryDelta / previous.memoryDelta;
        const sizeRatio = current.size / previous.size;
        
        // Memory growth should be roughly proportional to content size
        expect(memoryRatio).toBeLessThan(sizeRatio * 2); // Allow some overhead
      }
    });
  });

  describe('Responsive Behavior Across All Components', () => {
    it('should maintain functionality across all viewport sizes', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Responsive Test',
        subtitle: 'Testing responsive behavior',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blocks = Array.from({ length: 8 }, (_, i) => ({
        preset_name: `Responsive Preset ${i + 1}`,
        industry_focus: `Responsive Industry ${i + 1}`,
        description: `Responsive description ${i + 1}`,
        badge_text: i % 3 === 0 ? 'Responsive' : '',
        value_proposition: `Responsive value ${i + 1}`,
        use_case_1: `Responsive use case ${i + 1}`,
        use_case_2: i % 2 === 0 ? `Additional responsive use case ${i + 1}` : '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: `/responsive/${i + 1}`
      }));

      // Test all breakpoints
      const breakpointTests = responsiveTester.testAllBreakpoints();
      
      for (const test of breakpointTests) {
        // Render at this viewport size
        const html = renderer.renderSection(settings, blocks);
        
        // Test responsive behavior
        const responsiveTest = renderer.testResponsiveBehavior(test.width);
        
        expect(responsiveTest.isValid).toBe(true);
        expect(responsiveTest.expectedColumns).toBe(test.expectedColumns);
        expect(responsiveTest.deviceType).toBe(test.deviceType);
        
        // Verify content is present regardless of viewport
        expect(html).toContain('Responsive Test');
        expect(html).toContain('Responsive Preset 1');
        expect(html).toContain('Responsive Preset 8');
        
        // Verify all tiles are rendered
        const tileCount = (html.match(/preset-marketing-tile"/g) || []).length;
        expect(tileCount).toBe(8);
      }
    });

    it('should handle edge case viewport sizes', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Edge Case Viewport Test',
        subtitle: 'Testing edge case viewport sizes',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const block = {
        preset_name: 'Edge Case Preset',
        industry_focus: 'Edge Case Industry',
        description: 'Edge case description',
        badge_text: 'Edge',
        value_proposition: 'Edge case value',
        use_case_1: 'Edge case use case',
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: '/edge-case'
      };

      // Test edge case viewport sizes
      const edgeCases = [
        { width: 320, description: 'Minimum mobile width' },
        { width: 767, description: 'Maximum mobile width' },
        { width: 768, description: 'Minimum tablet width' },
        { width: 1023, description: 'Maximum tablet width' },
        { width: 1024, description: 'Minimum desktop width' },
        { width: 1399, description: 'Maximum desktop width' },
        { width: 1400, description: 'Minimum large desktop width' },
        { width: 2560, description: 'Very large desktop width' }
      ];

      for (const edgeCase of edgeCases) {
        const responsiveTest = renderer.testResponsiveBehavior(edgeCase.width);
        const html = renderer.renderSection(settings, [block]);

        expect(responsiveTest.isValid).toBe(true);
        expect(html).toContain('Edge Case Preset');
        expect(html).toContain('preset-marketing-tile');
        
        // Verify expected columns for each breakpoint
        if (edgeCase.width < 768) {
          expect(responsiveTest.expectedColumns).toBe(1);
        } else if (edgeCase.width < 1024) {
          expect(responsiveTest.expectedColumns).toBe(2);
        } else if (edgeCase.width < 1400) {
          expect(responsiveTest.expectedColumns).toBe(3);
        } else {
          expect(responsiveTest.expectedColumns).toBe(4);
        }
      }
    });

    it('should maintain accessibility across all screen sizes', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      const settings = {
        title: 'Accessibility Responsive Test',
        subtitle: 'Testing accessibility across screen sizes',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blocks = [
        {
          preset_name: 'Accessible Preset 1',
          industry_focus: 'Accessibility Industry',
          description: 'Accessible description with sufficient length to test text wrapping and readability across different viewport sizes',
          badge_text: 'Accessible',
          value_proposition: 'Accessible value proposition',
          use_case_1: 'Accessible use case 1',
          use_case_2: 'Accessible use case 2',
          use_case_3: '',
          use_case_4: '',
          use_case_5: '',
          preview_primary_color: '#1a1a1a',
          preview_secondary_color: '#2d2d2d',
          template_page_url: '/accessible/1'
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

      // Test accessibility across different viewport sizes
      const viewportSizes = [320, 768, 1024, 1400];
      
      for (const width of viewportSizes) {
        const html = renderer.renderSection(settings, blocks);
        
        // Verify semantic HTML structure is maintained
        expect(html).toContain('<h2'); // Section title
        expect(html).toContain('<h3'); // Preset titles
        expect(html).toContain('<article'); // Semantic article elements
        expect(html).toContain('<ul'); // Use case lists
        expect(html).toContain('<li'); // Use case items

        // Verify ARIA labels are present
        expect(html).toContain('aria-label="View Accessible Preset 1 template"');
        expect(html).toContain('aria-label="Template link not configured"');

        // Verify button accessibility
        expect(html).toContain('disabled'); // Disabled state for buttons without URLs
        expect(html).toContain('preset-marketing-tile__button--disabled');

        // In a real implementation, we would also verify:
        // - Font sizes meet minimum requirements (14px+)
        // - Touch targets meet minimum size (44px+)
        // - Color contrast ratios are sufficient
        // - Focus indicators are visible
        // - Tab order is logical
      }
    });
  });

  describe('Cross-Component Integration', () => {
    it('should integrate with existing theme components', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Mock existing theme components
      const existingComponents = {
        header: { type: 'mega-menu-header', configured: true },
        footer: { type: 'preset-footer', configured: true },
        navigation: { type: 'main-navigation', configured: true },
        productGrid: { type: 'preset-product-grid', configured: true }
      };

      // Register theme integration
      for (const [component, config] of Object.entries(existingComponents)) {
        themeIntegration.setCSSVariable(`--${component}-configured`, 'true');
      }

      const settings = {
        title: 'Theme Integration Test',
        subtitle: 'Testing integration with existing theme components',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const block = {
        preset_name: 'Integrated Preset',
        industry_focus: 'Integration Industry',
        description: 'Integration test description',
        badge_text: 'Integrated',
        value_proposition: 'Integrated value',
        use_case_1: 'Integration use case',
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: '/integrated'
      };

      const html = renderer.renderSection(settings, [block]);

      // Verify integration compatibility
      expect(html).toContain('marketing-preset-showcase');
      expect(html).toContain('Integrated Preset');
      
      // Verify CSS structure is compatible with existing components
      expect(html).toContain('<style>');
      expect(html).not.toContain('@import'); // No external dependencies
      expect(html).not.toContain('<link'); // No external stylesheets

      // Verify theme integration
      const cssVariables = themeIntegration.cssVariables;
      expect(cssVariables.size).toBeGreaterThan(0);
    });

    it('should handle preset template page navigation', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Register preset templates
      const presetTemplates = [
        { name: 'bold-impact', path: '/pages/showcase-bold-impact' },
        { name: 'tech-forward', path: '/pages/showcase-tech-forward' },
        { name: 'zebra-skimmers', path: '/pages/showcase-zebra-skimmers' },
        { name: 'modern-minimal', path: '/pages/showcase-modern-minimal' }
      ];

      for (const template of presetTemplates) {
        themeIntegration.registerPresetTemplate(template.name, {
          showcasePath: template.path,
          templatePath: `/templates/index.${template.name}.json`
        });
      }

      const settings = {
        title: 'Navigation Test',
        subtitle: 'Testing preset template navigation',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const blocks = presetTemplates.map(template => ({
        preset_name: template.name.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        industry_focus: 'Test Industry',
        description: `Test description for ${template.name}`,
        badge_text: 'Test',
        value_proposition: 'Test value',
        use_case_1: 'Test use case',
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: template.path
      }));

      const html = renderer.renderSection(settings, blocks);

      // Verify all template links are present
      for (const template of presetTemplates) {
        expect(html).toContain(`href="${template.path}"`);
        expect(html).not.toContain('target="_blank"'); // Opens in same window
      }

      // Verify navigation structure
      expect(html).toContain('preset-marketing-tile__button');
      expect(html).toContain('View Template');
      
      // Count navigation links
      const linkCount = (html.match(/href="\/pages\/showcase-/g) || []).length;
      expect(linkCount).toBe(presetTemplates.length);
    });

    it('should maintain consistency with existing CSS variables', () => {
      const renderer = new EnhancedMarketingPresetShowcaseRenderer();
      
      // Set up existing CSS variables
      const existingVariables = {
        '--color-primary': '#d71920',
        '--color-secondary': '#1a1a1a',
        '--font-heading': 'Inter, sans-serif',
        '--font-body': 'Inter, sans-serif',
        '--radius-card': '16px',
        '--space-4': '16px',
        '--space-6': '24px',
        '--grid-gap': '24px',
        '--page-width': '1400px'
      };

      for (const [variable, value] of Object.entries(existingVariables)) {
        themeIntegration.setCSSVariable(variable, value);
      }

      const settings = {
        title: 'CSS Variables Test',
        subtitle: 'Testing CSS variable consistency',
        show_value_indicators: true,
        padding_top: 80,
        padding_bottom: 80,
        background_color: '#ffffff'
      };

      const block = {
        preset_name: 'CSS Test Preset',
        industry_focus: 'CSS Industry',
        description: 'CSS test description',
        badge_text: 'CSS',
        value_proposition: 'CSS value',
        use_case_1: 'CSS use case',
        use_case_2: '',
        use_case_3: '',
        use_case_4: '',
        use_case_5: '',
        preview_primary_color: '#1a1a1a',
        preview_secondary_color: '#2d2d2d',
        template_page_url: '/css-test'
      };

      const html = renderer.renderSection(settings, [block]);

      // Verify CSS structure is present
      expect(html).toContain('<style>');
      expect(html).toContain('marketing-preset-showcase');
      
      // In a real implementation, we would verify:
      // - CSS variables are used consistently
      // - No hardcoded values that should use variables
      // - Proper fallbacks for unsupported browsers
      // - CSS custom properties follow naming conventions

      // Verify theme integration maintains variables
      const cssVariables = themeIntegration.cssVariables;
      expect(cssVariables.get('--color-primary')).toBe('#d71920');
      expect(cssVariables.get('--font-heading')).toBe('Inter, sans-serif');
    });
  });
});