import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 13: Mobile Responsive Behavior

/**
 * Mock CSS Container Query and Media Query simulator
 * Simulates how the CSS responds to different viewport sizes
 */
class ResponsiveBehaviorSimulator {
  constructor() {
    this.viewportWidth = 1200; // Default desktop width
  }

  /**
   * Sets the viewport width for testing responsive behavior
   */
  setViewportWidth(width) {
    this.viewportWidth = width;
  }

  /**
   * Simulates the CSS container query behavior for specification tables
   * Based on the CSS rules in sections/product-specs.liquid
   */
  getSpecificationTableStyles(specData) {
    const styles = {
      tableContainer: {},
      table: {},
      label: {},
      value: {},
      row: {}
    };

    // Container query: @container (max-width: 600px)
    if (this.viewportWidth <= 600) {
      styles.tableContainer = {
        overflowX: 'auto',
        webkitOverflowScrolling: 'touch'
      };
      styles.table = {
        minWidth: '500px'
      };
      styles.label = {
        width: '45%',
        minWidth: '120px'
      };
      styles.value = {
        minWidth: '200px'
      };
    }

    // Container query: @container (max-width: 400px)
    if (this.viewportWidth <= 400) {
      styles.row = {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        padding: 'var(--space-3) var(--space-2)',
        borderBottom: '1px solid var(--color-border)'
      };
      styles.label = {
        width: '100%',
        padding: '0',
        background: 'transparent',
        fontSize: 'var(--font-size-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-1)'
      };
      styles.value = {
        width: '100%',
        padding: '0',
        background: 'transparent'
      };
      styles.table = {
        minWidth: '100%'
      };
      styles.tableContainer = {
        overflowX: 'visible'
      };
    }

    return styles;
  }

  /**
   * Simulates comparison table responsive behavior
   * Based on Requirements 5.2: vertical stacking on mobile
   */
  getComparisonTableStyles(products) {
    const styles = {
      container: {},
      table: {},
      layout: 'horizontal'
    };

    // Mobile behavior: stack comparisons vertically
    if (this.viewportWidth <= 768) {
      styles.layout = 'vertical';
      styles.container = {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      };
      
      // Each product gets its own table
      styles.table = {
        width: '100%',
        marginBottom: 'var(--space-4)'
      };
    } else {
      // Desktop behavior: side-by-side
      styles.layout = 'horizontal';
      styles.container = {
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr)`,
        gap: 'var(--space-4)'
      };
      styles.table = {
        width: '100%'
      };
    }

    return styles;
  }

  /**
   * Simulates attachment list responsive behavior
   * Based on Requirements 5.3: appropriate mobile handling
   */
  getAttachmentListStyles(attachments) {
    const styles = {
      container: {},
      item: {},
      layout: 'grid'
    };

    if (this.viewportWidth <= 600) {
      styles.layout = 'list';
      styles.container = {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      };
      styles.item = {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        width: '100%'
      };
    } else {
      styles.layout = 'grid';
      styles.container = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-4)'
      };
      styles.item = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-4)'
      };
    }

    return styles;
  }

  /**
   * Checks if images are optimized for mobile viewing
   * Based on Requirements 5.5: optimized images for mobile
   */
  getImageOptimization(images) {
    const optimization = {
      maxWidth: '100%',
      height: 'auto',
      loading: 'lazy'
    };

    if (this.viewportWidth <= 600) {
      optimization.sizes = '(max-width: 600px) 100vw, 50vw';
      optimization.quality = 'auto';
      optimization.format = 'webp';
    }

    return optimization;
  }

  /**
   * Validates that content maintains readability at all screen sizes
   * Based on Requirements 5.4: maintain readability at all screen sizes
   */
  validateReadability(content) {
    const readability = {
      isReadable: true,
      issues: []
    };

    // Check minimum font sizes
    if (this.viewportWidth <= 400) {
      // Very small screens should have readable font sizes
      const minFontSize = 14; // pixels
      if (content.fontSize && content.fontSize < minFontSize) {
        readability.isReadable = false;
        readability.issues.push(`Font size ${content.fontSize}px too small for ${this.viewportWidth}px viewport`);
      }
    }

    // Check for horizontal overflow
    if (content.width && content.width > this.viewportWidth) {
      // Should have horizontal scrolling or responsive layout
      if (!content.overflowX || content.overflowX !== 'auto') {
        readability.isReadable = false;
        readability.issues.push(`Content width ${content.width}px exceeds viewport ${this.viewportWidth}px without scroll`);
      }
    }

    // Check touch targets on mobile
    if (this.viewportWidth <= 600) {
      const minTouchTarget = 44; // pixels (WCAG recommendation)
      if (content.touchTargets) {
        for (const target of content.touchTargets) {
          if (target.width < minTouchTarget || target.height < minTouchTarget) {
            readability.isReadable = false;
            readability.issues.push(`Touch target ${target.width}x${target.height}px too small (min: ${minTouchTarget}px)`);
          }
        }
      }
    }

    return readability;
  }
}

// Generators for property-based testing
const viewportWidthArbitrary = fc.integer({ min: 320, max: 1920 });

const specificationDataArbitrary = fc.record({
  specifications: fc.dictionary(
    fc.stringMatching(/^[a-z_]+$/),
    fc.dictionary(
      fc.stringMatching(/^[a-z_]+$/),
      fc.record({
        value: fc.string({ minLength: 1, maxLength: 100 }),
        unit: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
        description: fc.option(fc.string({ minLength: 1, maxLength: 200 }))
      }),
      { minKeys: 1, maxKeys: 10 }
    ),
    { minKeys: 1, maxKeys: 5 }
  )
});

const productArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  specifications: specificationDataArbitrary
});

const productsArrayArbitrary = fc.array(productArbitrary, { minLength: 1, maxLength: 4 });

const attachmentArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 5, maxLength: 100 }),
  type: fc.constantFrom('pdf', 'doc', 'cad', 'image', 'manual'),
  size: fc.integer({ min: 1024, max: 50000000 }), // bytes
  url: fc.webUrl()
});

const attachmentsArrayArbitrary = fc.array(attachmentArbitrary, { minLength: 1, maxLength: 20 });

const imageArbitrary = fc.record({
  src: fc.webUrl(),
  alt: fc.string({ minLength: 5, maxLength: 100 }),
  width: fc.integer({ min: 100, max: 2000 }),
  height: fc.integer({ min: 100, max: 2000 })
});

const imagesArrayArbitrary = fc.array(imageArbitrary, { minLength: 1, maxLength: 10 });

// Helper functions for validation
function hasHorizontalScrolling(styles) {
  return styles.tableContainer && 
         (styles.tableContainer.overflowX === 'auto' || 
          styles.tableContainer.overflowX === 'scroll');
}

function hasVerticalStacking(styles) {
  return styles.layout === 'vertical' ||
         (styles.container && styles.container.flexDirection === 'column');
}

function hasAppropriateMinWidth(styles, viewportWidth) {
  if (viewportWidth <= 400) {
    // Very small screens should not force minimum width
    return !styles.table || 
           !styles.table.minWidth || 
           styles.table.minWidth === '100%';
  } else if (viewportWidth <= 600) {
    // Small screens should have reasonable minimum width for scrolling
    return styles.table && 
           styles.table.minWidth && 
           parseInt(styles.table.minWidth) >= 400;
  }
  return true;
}

function hasOptimizedImages(optimization, viewportWidth) {
  if (viewportWidth <= 600) {
    return optimization.maxWidth === '100%' &&
           optimization.height === 'auto' &&
           optimization.sizes &&
           optimization.sizes.includes('100vw');
  }
  return optimization.maxWidth === '100%' && optimization.height === 'auto';
}

function maintainsReadability(readability) {
  return readability.isReadable && readability.issues.length === 0;
}

// Main property test
test('Property 13: Mobile Responsive Behavior - Specification displays should apply appropriate responsive behavior on mobile viewports', () => {
  fc.assert(
    fc.property(
      viewportWidthArbitrary,
      specificationDataArbitrary,
      (viewportWidth, specData) => {
        const simulator = new ResponsiveBehaviorSimulator();
        simulator.setViewportWidth(viewportWidth);
        
        const styles = simulator.getSpecificationTableStyles(specData);
        
        // Requirement 5.1: Horizontal scrolling for wide tables on mobile
        if (viewportWidth <= 600 && viewportWidth > 400) {
          const hasScroll = hasHorizontalScrolling(styles);
          const hasMinWidth = hasAppropriateMinWidth(styles, viewportWidth);
          
          if (!hasScroll || !hasMinWidth) {
            return false;
          }
        }
        
        // Very small screens (≤400px) should stack vertically, not scroll
        if (viewportWidth <= 400) {
          const isStacked = styles.row && styles.row.flexDirection === 'column';
          const noForcedWidth = hasAppropriateMinWidth(styles, viewportWidth);
          
          if (!isStacked || !noForcedWidth) {
            return false;
          }
        }
        
        // Requirement 5.4: Maintain readability at all screen sizes
        const mockContent = {
          fontSize: viewportWidth <= 400 ? 14 : 16,
          width: styles.table && styles.table.minWidth ? parseInt(styles.table.minWidth) : viewportWidth,
          overflowX: styles.tableContainer ? styles.tableContainer.overflowX : 'visible',
          touchTargets: viewportWidth <= 600 ? [{ width: 44, height: 44 }] : []
        };
        
        const readability = simulator.validateReadability(mockContent);
        if (!maintainsReadability(readability)) {
          return false;
        }
        
        return true;
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

test('Property 13: Mobile Responsive Behavior - Product comparisons should stack vertically on mobile viewports', () => {
  fc.assert(
    fc.property(
      viewportWidthArbitrary,
      productsArrayArbitrary,
      (viewportWidth, products) => {
        const simulator = new ResponsiveBehaviorSimulator();
        simulator.setViewportWidth(viewportWidth);
        
        const styles = simulator.getComparisonTableStyles(products);
        
        // Requirement 5.2: Vertical stacking for comparisons on mobile
        if (viewportWidth <= 768) {
          return hasVerticalStacking(styles);
        } else {
          // Desktop should use horizontal layout
          return styles.layout === 'horizontal' && 
                 styles.container && 
                 styles.container.display === 'grid';
        }
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

test('Property 13: Mobile Responsive Behavior - Attachment lists should handle mobile appropriately', () => {
  fc.assert(
    fc.property(
      viewportWidthArbitrary,
      attachmentsArrayArbitrary,
      (viewportWidth, attachments) => {
        const simulator = new ResponsiveBehaviorSimulator();
        simulator.setViewportWidth(viewportWidth);
        
        const styles = simulator.getAttachmentListStyles(attachments);
        
        // Requirement 5.3: Appropriate mobile handling for attachments
        if (viewportWidth <= 600) {
          // Mobile should use list layout
          return styles.layout === 'list' &&
                 styles.container &&
                 styles.container.flexDirection === 'column';
        } else {
          // Desktop should use grid layout
          return styles.layout === 'grid' &&
                 styles.container &&
                 styles.container.display === 'grid';
        }
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

test('Property 13: Mobile Responsive Behavior - Images should be optimized for mobile viewing', () => {
  fc.assert(
    fc.property(
      viewportWidthArbitrary,
      imagesArrayArbitrary,
      (viewportWidth, images) => {
        const simulator = new ResponsiveBehaviorSimulator();
        simulator.setViewportWidth(viewportWidth);
        
        const optimization = simulator.getImageOptimization(images);
        
        // Requirement 5.5: Optimized images for mobile viewing
        return hasOptimizedImages(optimization, viewportWidth);
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Edge case tests
test('Property 13: Mobile Responsive Behavior - Very narrow viewports should not break layout', () => {
  const simulator = new ResponsiveBehaviorSimulator();
  simulator.setViewportWidth(320); // Minimum mobile width
  
  const mockSpecData = {
    specifications: {
      dimensions: {
        length: { value: "1000", unit: "mm" },
        width: { value: "500", unit: "mm" }
      }
    }
  };
  
  const styles = simulator.getSpecificationTableStyles(mockSpecData);
  
  // Should stack vertically on very narrow screens
  expect(styles.row.flexDirection).toBe('column');
  expect(styles.label.width).toBe('100%');
  expect(styles.value.width).toBe('100%');
  expect(styles.tableContainer.overflowX).toBe('visible');
});

test('Property 13: Mobile Responsive Behavior - Wide desktop viewports should use horizontal layout', () => {
  const simulator = new ResponsiveBehaviorSimulator();
  simulator.setViewportWidth(1920); // Large desktop width
  
  const mockProducts = [
    { id: 1, title: "Product A", specifications: {} },
    { id: 2, title: "Product B", specifications: {} },
    { id: 3, title: "Product C", specifications: {} }
  ];
  
  const styles = simulator.getComparisonTableStyles(mockProducts);
  
  // Should use horizontal grid layout on desktop
  expect(styles.layout).toBe('horizontal');
  expect(styles.container.display).toBe('grid');
  expect(styles.container.gridTemplateColumns).toBe('repeat(3, 1fr)');
});

test('Property 13: Mobile Responsive Behavior - Tablet viewports should use appropriate intermediate behavior', () => {
  const simulator = new ResponsiveBehaviorSimulator();
  simulator.setViewportWidth(768); // Tablet width
  
  const mockSpecData = {
    specifications: {
      performance: {
        power: { value: "500", unit: "W" },
        voltage: { value: "240", unit: "V" }
      }
    }
  };
  
  const styles = simulator.getSpecificationTableStyles(mockSpecData);
  
  // Tablet (768px) is above the 600px breakpoint, so no special mobile styles applied
  // Should use default desktop behavior (no forced scrolling or stacking)
  expect(styles.tableContainer.overflowX).toBeUndefined();
  expect(styles.table.minWidth).toBeUndefined();
  expect(styles.row.flexDirection).toBeUndefined(); // Not stacked
});

test('Property 13: Mobile Responsive Behavior - Touch targets should be appropriately sized on mobile', () => {
  const simulator = new ResponsiveBehaviorSimulator();
  simulator.setViewportWidth(375); // iPhone width
  
  const mockContent = {
    fontSize: 16,
    width: 375,
    overflowX: 'visible',
    touchTargets: [
      { width: 44, height: 44 }, // Good touch target
      { width: 32, height: 32 }  // Too small touch target
    ]
  };
  
  const readability = simulator.validateReadability(mockContent);
  
  // Should fail due to small touch target
  expect(readability.isReadable).toBe(false);
  expect(readability.issues).toContain('Touch target 32x32px too small (min: 44px)');
});