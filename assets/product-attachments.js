/**
 * Product Attachments JavaScript
 * Handles download tracking and access control for product attachments
 */

class ProductAttachments {
  constructor() {
    this.init();
  }

  init() {
    // Add click handlers for attachment links
    document.addEventListener('click', this.handleAttachmentClick.bind(this));
    
    // Initialize access control checks
    this.checkAccessLevels();
  }

  /**
   * Handle clicks on attachment links
   * @param {Event} event - Click event
   */
  handleAttachmentClick(event) {
    const link = event.target.closest('.attachment-link');
    if (!link) return;

    // Skip if link is restricted
    if (link.classList.contains('attachment-link--restricted')) {
      event.preventDefault();
      this.handleRestrictedAccess(link);
      return;
    }

    // Track download
    const attachmentId = link.dataset.attachmentId;
    if (attachmentId) {
      this.trackDownload(attachmentId, link.href);
    }

    // Handle different file types
    const fileType = this.getFileTypeFromUrl(link.href);
    this.handleFileTypeSpecificBehavior(fileType, link, event);
  }

  /**
   * Handle restricted access attempts
   * @param {Element} link - The restricted link element
   */
  handleRestrictedAccess(link) {
    const notice = link.querySelector('.attachment-restricted-notice');
    if (notice) {
      // Highlight the notice temporarily
      notice.style.backgroundColor = 'var(--color-error-background, #fee)';
      notice.style.color = 'var(--color-error, #c41e3a)';
      
      setTimeout(() => {
        notice.style.backgroundColor = '';
        notice.style.color = '';
      }, 2000);
    }

    // Show login prompt for customer-level access
    if (notice && notice.textContent.includes('Login required')) {
      this.showLoginPrompt();
    }
  }

  /**
   * Show login prompt for restricted files
   */
  showLoginPrompt() {
    if (confirm('This file requires you to be logged in. Would you like to go to the login page?')) {
      window.location.href = '/account/login?return_url=' + encodeURIComponent(window.location.pathname);
    }
  }

  /**
   * Track attachment downloads
   * @param {string} attachmentId - Unique attachment identifier
   * @param {string} url - File URL
   */
  trackDownload(attachmentId, url) {
    // Track with analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'file_download', {
        'file_name': this.getFileNameFromUrl(url),
        'file_extension': this.getFileTypeFromUrl(url),
        'attachment_id': attachmentId
      });
    }

    // Track with Shopify Analytics if available
    if (window.ShopifyAnalytics && window.ShopifyAnalytics.lib) {
      window.ShopifyAnalytics.lib.track('Attachment Downloaded', {
        attachmentId: attachmentId,
        fileName: this.getFileNameFromUrl(url),
        fileType: this.getFileTypeFromUrl(url)
      });
    }

    // Custom tracking event
    document.dispatchEvent(new CustomEvent('attachment:download', {
      detail: {
        attachmentId: attachmentId,
        url: url,
        fileName: this.getFileNameFromUrl(url),
        fileType: this.getFileTypeFromUrl(url)
      }
    }));
  }

  /**
   * Handle file type specific behavior
   * @param {string} fileType - File extension
   * @param {Element} link - Link element
   * @param {Event} event - Click event
   */
  handleFileTypeSpecificBehavior(fileType, link, event) {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        // PDFs can be viewed in browser or downloaded
        // Let browser handle default behavior
        break;
        
      case 'dwg':
      case 'step':
      case 'stl':
      case 'iges':
      case 'igs':
        // CAD files should always download
        if (!link.hasAttribute('download')) {
          link.setAttribute('download', '');
        }
        break;
        
      case 'zip':
      case 'rar':
      case '7z':
        // Archive files should always download
        if (!link.hasAttribute('download')) {
          link.setAttribute('download', '');
        }
        break;
        
      default:
        // Let browser handle default behavior
        break;
    }
  }

  /**
   * Check access levels for all attachments on page load
   */
  checkAccessLevels() {
    const restrictedLinks = document.querySelectorAll('.attachment-link--restricted');
    
    restrictedLinks.forEach(link => {
      // Add visual indicators for restricted files
      link.style.opacity = '0.6';
      link.style.cursor = 'not-allowed';
      
      // Add tooltip if supported
      const notice = link.querySelector('.attachment-restricted-notice');
      if (notice) {
        link.title = notice.textContent.trim();
      }
    });
  }

  /**
   * Get file type from URL
   * @param {string} url - File URL
   * @returns {string} File extension
   */
  getFileTypeFromUrl(url) {
    const pathname = new URL(url, window.location.origin).pathname;
    const extension = pathname.split('.').pop();
    return extension || 'unknown';
  }

  /**
   * Get file name from URL
   * @param {string} url - File URL
   * @returns {string} File name
   */
  getFileNameFromUrl(url) {
    const pathname = new URL(url, window.location.origin).pathname;
    return pathname.split('/').pop() || 'unknown';
  }

  /**
   * Check if user has access to wholesale files
   * @returns {boolean} Whether user has wholesale access
   */
  hasWholesaleAccess() {
    // This would typically check customer tags or account type
    // Implementation depends on how wholesale customers are identified
    return document.body.classList.contains('customer-wholesale') ||
           document.body.dataset.customerTags?.includes('wholesale');
  }

  /**
   * Refresh access levels (call after login/logout)
   */
  refreshAccessLevels() {
    // Reload the page to refresh access control
    // In a more sophisticated implementation, this could update the UI dynamically
    window.location.reload();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProductAttachments();
  });
} else {
  new ProductAttachments();
}

// Export for use in other scripts
window.ProductAttachments = ProductAttachments;