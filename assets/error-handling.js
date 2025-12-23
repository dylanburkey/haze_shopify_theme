/**
 * Comprehensive Error Handling for Product Specification System
 * Provides graceful degradation and user-friendly error messages
 * 
 * Requirements: All error scenarios
 */

class SpecificationErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 50;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    
    // Initialize global error handlers
    this.initializeGlobalHandlers();
  }

  /**
   * Initialize global error handlers
   */
  initializeGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('unhandled_promise', 'Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      });
      
      // Prevent default browser error handling for specification-related errors
      if (this.isSpecificationError(event.reason)) {
        event.preventDefault();
        this.showUserFriendlyError('network_error');
      }
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('javascript_error', 'JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Handle fetch errors globally
    this.interceptFetch();
  }

  /**
   * Check if error is related to specification system
   * @param {*} error - Error object or message
   * @returns {boolean}
   */
  isSpecificationError(error) {
    const errorString = String(error).toLowerCase();
    const specKeywords = [
      'specification', 'metafield', 'comparison', 'attachment',
      'spec-search', 'product-comparison', 'pdf-export'
    ];
    
    return specKeywords.some(keyword => errorString.includes(keyword));
  }

  /**
   * Intercept fetch requests to handle network errors
   */
  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.logError('network_error', 'HTTP error', {
            status: response.status,
            statusText: response.statusText,
            url: args[0]
          });
          
          // Handle specific HTTP errors
          if (response.status === 404) {
            this.handleFileNotFound(args[0]);
          } else if (response.status >= 500) {
            this.handleServerError(response.status);
          }
        }
        
        return response;
      } catch (error) {
        this.logError('network_error', 'Network request failed', {
          url: args[0],
          error: error.message
        });
        
        this.handleNetworkError(error);
        throw error;
      }
    };
  }

  /**
   * Log error with context information
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  logError(type, message, details = {}) {
    const errorEntry = {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errorLog.push(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console for debugging
    console.error('Specification System Error:', errorEntry);
    
    // Send to analytics if available
    this.sendToAnalytics(errorEntry);
  }

  /**
   * Send error to analytics service
   * @param {Object} errorEntry - Error entry object
   */
  sendToAnalytics(errorEntry) {
    try {
      // Send to Google Analytics if available
      if (typeof gtag === 'function') {
        gtag('event', 'exception', {
          description: `${errorEntry.type}: ${errorEntry.message}`,
          fatal: false,
          custom_map: {
            error_type: errorEntry.type,
            error_details: JSON.stringify(errorEntry.details)
          }
        });
      }
      
      // Send to other analytics services as needed
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('Specification System Error', {
          errorType: errorEntry.type,
          errorMessage: errorEntry.message,
          errorDetails: errorEntry.details
        });
      }
    } catch (analyticsError) {
      console.warn('Failed to send error to analytics:', analyticsError);
    }
  }

  /**
   * Handle file not found errors
   * @param {string} url - URL that was not found
   */
  handleFileNotFound(url) {
    if (url.includes('attachment') || url.includes('download')) {
      this.showUserFriendlyError('file_access', 
        'The requested file is temporarily unavailable. Please try again later or contact support.'
      );
    }
  }

  /**
   * Handle server errors
   * @param {number} status - HTTP status code
   */
  handleServerError(status) {
    this.showUserFriendlyError('network_error',
      `Server error (${status}). Please try again in a few moments.`
    );
  }

  /**
   * Handle network errors
   * @param {Error} error - Network error
   */
  handleNetworkError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      this.showUserFriendlyError('network_error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }
  }

  /**
   * Show user-friendly error message
   * @param {string} errorType - Type of error
   * @param {string} customMessage - Custom error message
   */
  showUserFriendlyError(errorType, customMessage = null) {
    const errorMessages = {
      metafield_parse: 'Product specifications are temporarily unavailable. Please refresh the page or contact support.',
      file_access: 'The requested file is temporarily unavailable. Please try again later.',
      comparison_state: 'There was an issue with the product comparison. The comparison has been reset.',
      search_filter: 'Invalid search criteria detected. Please adjust your filters and try again.',
      export_failed: 'Unable to export data at this time. Please try again or contact support.',
      network_error: 'Connection issue detected. Please check your internet connection and try again.',
      generic: 'An unexpected error occurred. Please refresh the page or contact support if the issue continues.'
    };

    const message = customMessage || errorMessages[errorType] || errorMessages.generic;
    
    this.displayErrorNotification(errorType, message);
  }

  /**
   * Display error notification to user
   * @param {string} errorType - Type of error
   * @param {string} message - Error message
   */
  displayErrorNotification(errorType, message) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.spec-error-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `spec-error-notification spec-error-notification--${errorType}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    notification.innerHTML = `
      <div class="spec-error-notification__content">
        <div class="spec-error-notification__icon">
          ${this.getErrorIcon(errorType)}
        </div>
        <div class="spec-error-notification__message">
          ${this.escapeHtml(message)}
        </div>
        <button type="button" class="spec-error-notification__close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    // Add styles
    this.addNotificationStyles(notification);

    // Add event listeners
    const closeButton = notification.querySelector('.spec-error-notification__close');
    closeButton.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-remove after delay
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 8000);

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('spec-error-notification--visible');
    });
  }

  /**
   * Get appropriate icon for error type
   * @param {string} errorType - Type of error
   * @returns {string} SVG icon HTML
   */
  getErrorIcon(errorType) {
    const icons = {
      metafield_parse: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      file_access: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
      comparison_state: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
      search_filter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',
      export_failed: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
      network_error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
      generic: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };

    return icons[errorType] || icons.generic;
  }

  /**
   * Add notification styles
   * @param {HTMLElement} notification - Notification element
   */
  addNotificationStyles(notification) {
    const style = document.createElement('style');
    style.textContent = `
      .spec-error-notification {
        position: fixed;
        top: 1rem;
        right: 1rem;
        max-width: 400px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
      }

      .spec-error-notification--visible {
        transform: translateX(0);
        opacity: 1;
      }

      .spec-error-notification__content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
      }

      .spec-error-notification__icon {
        flex-shrink: 0;
        color: #dc2626;
      }

      .spec-error-notification__message {
        flex: 1;
        font-size: 0.875rem;
        line-height: 1.4;
        color: #7f1d1d;
      }

      .spec-error-notification__close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: #991b1b;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .spec-error-notification__close:hover {
        background: #fecaca;
      }

      .spec-error-notification--network_error {
        background: #fffbeb;
        border-color: #fed7aa;
      }

      .spec-error-notification--network_error .spec-error-notification__icon {
        color: #f59e0b;
      }

      .spec-error-notification--network_error .spec-error-notification__message {
        color: #92400e;
      }

      .spec-error-notification--network_error .spec-error-notification__close {
        color: #92400e;
      }

      .spec-error-notification--network_error .spec-error-notification__close:hover {
        background: #fed7aa;
      }

      @media (max-width: 640px) {
        .spec-error-notification {
          top: 0.5rem;
          right: 0.5rem;
          left: 0.5rem;
          max-width: none;
        }
      }
    `;

    if (!document.querySelector('#spec-error-notification-styles')) {
      style.id = 'spec-error-notification-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Retry failed operation with exponential backoff
   * @param {string} operationId - Unique identifier for the operation
   * @param {Function} operation - Function to retry
   * @param {Object} options - Retry options
   * @returns {Promise} Promise that resolves when operation succeeds or max retries reached
   */
  async retryOperation(operationId, operation, options = {}) {
    const {
      maxRetries = this.maxRetries,
      baseDelay = 1000,
      maxDelay = 10000
    } = options;

    const attempts = this.retryAttempts.get(operationId) || 0;
    
    if (attempts >= maxRetries) {
      this.retryAttempts.delete(operationId);
      throw new Error(`Max retries (${maxRetries}) exceeded for operation: ${operationId}`);
    }

    try {
      const result = await operation();
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      this.retryAttempts.set(operationId, attempts + 1);
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
      
      this.logError('retry_attempt', `Retrying operation ${operationId}`, {
        attempt: attempts + 1,
        maxRetries,
        delay,
        error: error.message
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the operation
      return this.retryOperation(operationId, operation, options);
    }
  }

  /**
   * Validate metafield data structure
   * @param {*} data - Data to validate
   * @param {string} type - Type of data (specifications|attachments)
   * @returns {Object} Validation result
   */
  validateMetafieldData(data, type) {
    const result = {
      isValid: true,
      errors: []
    };

    try {
      if (!data || typeof data !== 'object') {
        result.isValid = false;
        result.errors.push('Data is not a valid object');
        return result;
      }

      if (type === 'specifications') {
        if (!data.specifications || typeof data.specifications !== 'object') {
          result.isValid = false;
          result.errors.push('Missing or invalid specifications object');
        }

        if (data.categories && typeof data.categories !== 'object') {
          result.isValid = false;
          result.errors.push('Invalid categories object');
        }
      } else if (type === 'attachments') {
        if (!Array.isArray(data.files)) {
          result.isValid = false;
          result.errors.push('Missing or invalid files array');
        } else {
          // Validate each file
          data.files.forEach((file, index) => {
            if (!file.id || !file.name || !file.url || !file.type) {
              result.errors.push(`File at index ${index} is missing required fields`);
            }
          });
        }

        if (data.categories && typeof data.categories !== 'object') {
          result.isValid = false;
          result.errors.push('Invalid categories object');
        }
      }

      if (result.errors.length > 0) {
        result.isValid = false;
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Get error log for debugging
   * @returns {Array} Array of error entries
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Export error log for support
   * @returns {string} JSON string of error log
   */
  exportErrorLog() {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errors: this.errorLog
    }, null, 2);
  }
}

// Initialize global error handler
window.specErrorHandler = new SpecificationErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpecificationErrorHandler;
}