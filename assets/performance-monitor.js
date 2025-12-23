/**
 * Performance Monitor
 * Tracks and reports performance metrics for optimization
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      resourceHints: false,
      asyncCSS: false,
      imageOptimization: false,
      serviceWorker: false,
      structuredData: false,
      accessibility: false
    };
    
    this.init();
  }

  init() {
    // Check for resource hints
    this.checkResourceHints();
    
    // Check for async CSS loading
    this.checkAsyncCSS();
    
    // Check for image optimization
    this.checkImageOptimization();
    
    // Check for service worker
    this.checkServiceWorker();
    
    // Check for structured data
    this.checkStructuredData();
    
    // Check accessibility features
    this.checkAccessibility();
    
    // Make metrics available globally for testing
    window.performanceMetrics = this.metrics;
  }

  checkResourceHints() {
    const preconnectLinks = document.querySelectorAll('link[rel="preconnect"]');
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    const dnsPrefetchLinks = document.querySelectorAll('link[rel="dns-prefetch"]');
    
    this.metrics.resourceHints = preconnectLinks.length > 0 || preloadLinks.length > 0 || dnsPrefetchLinks.length > 0;
  }

  checkAsyncCSS() {
    const asyncCSSLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
    const mediaSwapLinks = document.querySelectorAll('link[media="print"][onload]');
    
    this.metrics.asyncCSS = asyncCSSLinks.length > 0 || mediaSwapLinks.length > 0;
  }

  checkImageOptimization() {
    const images = document.querySelectorAll('img');
    let optimizedImages = 0;
    
    images.forEach(img => {
      const hasLazyLoading = img.hasAttribute('loading') || img.classList.contains('lazy');
      const hasResponsive = img.hasAttribute('srcset') || img.hasAttribute('data-srcset') || img.hasAttribute('sizes');
      const hasFetchPriority = img.hasAttribute('fetchpriority');
      
      if (hasLazyLoading || hasResponsive || hasFetchPriority) {
        optimizedImages++;
      }
    });
    
    this.metrics.imageOptimization = images.length > 0 && optimizedImages >= Math.ceil(images.length * 0.5);
  }

  checkServiceWorker() {
    this.metrics.serviceWorker = 'serviceWorker' in navigator && (
      window.serviceWorkerRegistered === true ||
      navigator.serviceWorker.controller !== null
    );
  }

  checkStructuredData() {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    let validSchemas = 0;
    
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@context'] && data['@type']) {
          validSchemas++;
        }
      } catch (e) {
        // Invalid JSON-LD
      }
    });
    
    this.metrics.structuredData = validSchemas > 0;
  }

  checkAccessibility() {
    const skipLink = document.querySelector('a[href="#MainContent"], .skip-link');
    const mainContent = document.querySelector('#MainContent, main[role="main"]');
    const altTexts = document.querySelectorAll('img[alt]');
    const totalImages = document.querySelectorAll('img').length;
    
    const hasSkipLink = skipLink !== null;
    const hasMainContent = mainContent !== null;
    const hasAltTexts = totalImages === 0 || altTexts.length >= Math.ceil(totalImages * 0.8);
    
    this.metrics.accessibility = hasSkipLink && hasMainContent && hasAltTexts;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getScore() {
    const totalChecks = Object.keys(this.metrics).length;
    const passedChecks = Object.values(this.metrics).filter(Boolean).length;
    return Math.round((passedChecks / totalChecks) * 100);
  }

  report() {
    console.log('Performance Metrics:', this.metrics);
    console.log('Performance Score:', this.getScore() + '%');
    return this.metrics;
  }
}

// Initialize performance monitor when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
  });
} else {
  window.performanceMonitor = new PerformanceMonitor();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}