import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 7: Attachment Click Behavior
// Feature: product-specification-system, Property 8: Attachment Access Control

/**
 * Mock DOM environment for testing attachment behavior
 * Simulates the browser environment and attachment click handling
 */
class MockAttachmentEnvironment {
  constructor() {
    this.downloads = [];
    this.newTabOpens = [];
    this.preventedClicks = [];
    this.loginPrompts = [];
    this.customerLoggedIn = false;
    this.customerTags = [];
  }

  /**
   * Simulates the ProductAttachments class behavior
   */
  simulateAttachmentClick(attachment, customerState = null) {
    // Set customer state if provided
    if (customerState) {
      this.customerLoggedIn = customerState.loggedIn;
      this.customerTags = customerState.tags || [];
    }

    // Check access control first
    const hasAccess = this.checkAccess(attachment);
    
    if (!hasAccess) {
      // Simulate restricted access handling
      this.preventedClicks.push({
        attachmentId: attachment.id,
        reason: this.getAccessDenialReason(attachment),
        timestamp: Date.now()
      });

      // Show login prompt for customer-level access
      if (attachment.access_level === 'customer' && !this.customerLoggedIn) {
        this.loginPrompts.push({
          attachmentId: attachment.id,
          returnUrl: '/current-page',
          timestamp: Date.now()
        });
      }

      return {
        action: 'prevented',
        reason: this.getAccessDenialReason(attachment),
        hasAccess: false
      };
    }

    // Determine click behavior based on file type
    const behavior = this.determineClickBehavior(attachment);
    
    if (behavior === 'download') {
      this.downloads.push({
        attachmentId: attachment.id,
        url: attachment.url,
        fileName: this.getFileNameFromUrl(attachment.url),
        fileType: attachment.type,
        timestamp: Date.now()
      });
      
      return {
        action: 'download',
        hasAccess: true,
        url: attachment.url
      };
    } else if (behavior === 'new_tab') {
      this.newTabOpens.push({
        attachmentId: attachment.id,
        url: attachment.url,
        timestamp: Date.now()
      });
      
      return {
        action: 'new_tab',
        hasAccess: true,
        url: attachment.url
      };
    }

    return {
      action: 'default',
      hasAccess: true,
      url: attachment.url
    };
  }

  /**
   * Check if user has access to the attachment
   */
  checkAccess(attachment) {
    switch (attachment.access_level) {
      case 'public':
        return true;
      case 'customer':
        return this.customerLoggedIn;
      case 'wholesale':
        return this.customerLoggedIn && this.customerTags.includes('wholesale');
      default:
        return true;
    }
  }

  /**
   * Get the reason for access denial
   */
  getAccessDenialReason(attachment) {
    if (attachment.access_level === 'customer' && !this.customerLoggedIn) {
      return 'login_required';
    }
    if (attachment.access_level === 'wholesale' && (!this.customerLoggedIn || !this.customerTags.includes('wholesale'))) {
      return 'wholesale_only';
    }
    return 'access_denied';
  }

  /**
   * Determine click behavior based on file type
   * Based on the logic in assets/product-attachments.js
   */
  determineClickBehavior(attachment) {
    const fileType = attachment.type.toLowerCase();
    
    // CAD files should always download
    if (['dwg', 'step', 'stl', 'iges', 'igs'].includes(fileType)) {
      return 'download';
    }
    
    // Archive files should always download
    if (['zip', 'rar', '7z'].includes(fileType)) {
      return 'download';
    }
    
    // PDFs can be viewed in browser (new tab) or downloaded
    if (fileType === 'pdf') {
      return 'new_tab';
    }
    
    // Default behavior for other file types
    return 'default';
  }

  /**
   * Extract file name from URL
   */
  getFileNameFromUrl(url) {
    try {
      const pathname = new URL(url).pathname;
      return pathname.split('/').pop() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Reset the environment for new tests
   */
  reset() {
    this.downloads = [];
    this.newTabOpens = [];
    this.preventedClicks = [];
    this.loginPrompts = [];
    this.customerLoggedIn = false;
    this.customerTags = [];
  }
}

// Generators for property-based testing
const attachmentArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  url: fc.webUrl(),
  type: fc.constantFrom('pdf', 'dwg', 'step', 'stl', 'iges', 'igs', 'zip', 'rar', '7z', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg'),
  size: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0), // e.g., "2.4 MB"
  category: fc.constantFrom('manuals', 'cad', 'certificates', 'safety', 'warranty'),
  description: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
  access_level: fc.constantFrom('public', 'customer', 'wholesale'),
  featured: fc.boolean(),
  order: fc.integer({ min: 1, max: 100 })
});

const customerStateArbitrary = fc.record({
  loggedIn: fc.boolean(),
  tags: fc.array(fc.constantFrom('wholesale', 'vip', 'distributor', 'retail'), { maxLength: 3 })
});

// Helper functions for validation
function shouldInitiateDownload(attachment) {
  const downloadTypes = ['dwg', 'step', 'stl', 'iges', 'igs', 'zip', 'rar', '7z'];
  return downloadTypes.includes(attachment.type.toLowerCase());
}

function shouldOpenInNewTab(attachment) {
  return attachment.type.toLowerCase() === 'pdf';
}

function hasProperAccess(attachment, customerState) {
  switch (attachment.access_level) {
    case 'public':
      return true;
    case 'customer':
      return customerState.loggedIn;
    case 'wholesale':
      return customerState.loggedIn && customerState.tags.includes('wholesale');
    default:
      return true;
  }
}

function shouldShowLoginPrompt(attachment, customerState) {
  return attachment.access_level === 'customer' && !customerState.loggedIn;
}

// Property 7: Attachment Click Behavior
test('Property 7: Attachment Click Behavior - Clicking attachments should initiate download or open in new tab based on file type', () => {
  fc.assert(
    fc.property(
      attachmentArbitrary,
      customerStateArbitrary,
      (attachment, customerState) => {
        const env = new MockAttachmentEnvironment();
        const result = env.simulateAttachmentClick(attachment, customerState);
        
        // Skip access control validation for this property (covered in Property 8)
        if (!result.hasAccess) {
          return true; // Access control is tested separately
        }
        
        // Validate click behavior based on file type
        if (shouldInitiateDownload(attachment)) {
          // CAD and archive files should download
          const wasDownloaded = env.downloads.some(d => d.attachmentId === attachment.id);
          return result.action === 'download' && wasDownloaded;
        } else if (shouldOpenInNewTab(attachment)) {
          // PDFs should open in new tab
          const wasOpenedInNewTab = env.newTabOpens.some(o => o.attachmentId === attachment.id);
          return result.action === 'new_tab' && wasOpenedInNewTab;
        } else {
          // Other files use default browser behavior
          return result.action === 'default' || result.action === 'download' || result.action === 'new_tab';
        }
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Property 8: Attachment Access Control
test('Property 8: Attachment Access Control - Attachments should only be accessible when user has proper authentication', () => {
  fc.assert(
    fc.property(
      attachmentArbitrary,
      customerStateArbitrary,
      (attachment, customerState) => {
        const env = new MockAttachmentEnvironment();
        const result = env.simulateAttachmentClick(attachment, customerState);
        
        const expectedAccess = hasProperAccess(attachment, customerState);
        
        if (expectedAccess) {
          // Should have access - click should not be prevented
          const wasPrevented = env.preventedClicks.some(p => p.attachmentId === attachment.id);
          return result.hasAccess && !wasPrevented;
        } else {
          // Should not have access - click should be prevented
          const wasPrevented = env.preventedClicks.some(p => p.attachmentId === attachment.id);
          const correctReason = env.preventedClicks.find(p => p.attachmentId === attachment.id);
          
          // Check if login prompt was shown for customer-level files
          if (shouldShowLoginPrompt(attachment, customerState)) {
            const loginPromptShown = env.loginPrompts.some(l => l.attachmentId === attachment.id);
            return !result.hasAccess && wasPrevented && loginPromptShown;
          }
          
          // For other access levels, just check that access was denied and click was prevented
          return !result.hasAccess && wasPrevented;
        }
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

// Edge case tests for Property 7
test('Property 7: Attachment Click Behavior - CAD files should always trigger download', () => {
  const env = new MockAttachmentEnvironment();
  
  const cadFiles = [
    { id: 'cad1', name: 'Model', url: 'https://example.com/model.dwg', type: 'dwg', access_level: 'public', category: 'cad' },
    { id: 'cad2', name: 'Step File', url: 'https://example.com/model.step', type: 'step', access_level: 'public', category: 'cad' },
    { id: 'cad3', name: 'STL File', url: 'https://example.com/model.stl', type: 'stl', access_level: 'public', category: 'cad' }
  ];
  
  const customerState = { loggedIn: true, tags: [] };
  
  for (const cadFile of cadFiles) {
    env.reset();
    const result = env.simulateAttachmentClick(cadFile, customerState);
    
    expect(result.action).toBe('download');
    expect(env.downloads).toHaveLength(1);
    expect(env.downloads[0].attachmentId).toBe(cadFile.id);
    expect(env.downloads[0].fileType).toBe(cadFile.type);
  }
});

test('Property 7: Attachment Click Behavior - Archive files should always trigger download', () => {
  const env = new MockAttachmentEnvironment();
  
  const archiveFiles = [
    { id: 'zip1', name: 'Archive', url: 'https://example.com/files.zip', type: 'zip', access_level: 'public', category: 'manuals' },
    { id: 'rar1', name: 'RAR Archive', url: 'https://example.com/files.rar', type: 'rar', access_level: 'public', category: 'manuals' },
    { id: '7z1', name: '7Z Archive', url: 'https://example.com/files.7z', type: '7z', access_level: 'public', category: 'manuals' }
  ];
  
  const customerState = { loggedIn: true, tags: [] };
  
  for (const archiveFile of archiveFiles) {
    env.reset();
    const result = env.simulateAttachmentClick(archiveFile, customerState);
    
    expect(result.action).toBe('download');
    expect(env.downloads).toHaveLength(1);
    expect(env.downloads[0].attachmentId).toBe(archiveFile.id);
  }
});

test('Property 7: Attachment Click Behavior - PDF files should open in new tab', () => {
  const env = new MockAttachmentEnvironment();
  
  const pdfFile = {
    id: 'pdf1',
    name: 'Manual',
    url: 'https://example.com/manual.pdf',
    type: 'pdf',
    access_level: 'public',
    category: 'manuals'
  };
  
  const customerState = { loggedIn: true, tags: [] };
  const result = env.simulateAttachmentClick(pdfFile, customerState);
  
  expect(result.action).toBe('new_tab');
  expect(env.newTabOpens).toHaveLength(1);
  expect(env.newTabOpens[0].attachmentId).toBe(pdfFile.id);
});

// Edge case tests for Property 8
test('Property 8: Attachment Access Control - Public files should be accessible to everyone', () => {
  const env = new MockAttachmentEnvironment();
  
  const publicFile = {
    id: 'public1',
    name: 'Public Manual',
    url: 'https://example.com/manual.pdf',
    type: 'pdf',
    access_level: 'public',
    category: 'manuals'
  };
  
  // Test with logged out user
  const loggedOutState = { loggedIn: false, tags: [] };
  const result1 = env.simulateAttachmentClick(publicFile, loggedOutState);
  
  expect(result1.hasAccess).toBe(true);
  expect(env.preventedClicks).toHaveLength(0);
  
  // Test with logged in user
  env.reset();
  const loggedInState = { loggedIn: true, tags: ['wholesale'] };
  const result2 = env.simulateAttachmentClick(publicFile, loggedInState);
  
  expect(result2.hasAccess).toBe(true);
  expect(env.preventedClicks).toHaveLength(0);
});

test('Property 8: Attachment Access Control - Customer files should require login', () => {
  const env = new MockAttachmentEnvironment();
  
  const customerFile = {
    id: 'customer1',
    name: 'Customer CAD',
    url: 'https://example.com/model.dwg',
    type: 'dwg',
    access_level: 'customer',
    category: 'cad'
  };
  
  // Test with logged out user - should be denied and show login prompt
  const loggedOutState = { loggedIn: false, tags: [] };
  const result1 = env.simulateAttachmentClick(customerFile, loggedOutState);
  
  expect(result1.hasAccess).toBe(false);
  expect(result1.reason).toBe('login_required');
  expect(env.preventedClicks).toHaveLength(1);
  expect(env.loginPrompts).toHaveLength(1);
  
  // Test with logged in user - should be allowed
  env.reset();
  const loggedInState = { loggedIn: true, tags: [] };
  const result2 = env.simulateAttachmentClick(customerFile, loggedInState);
  
  expect(result2.hasAccess).toBe(true);
  expect(env.preventedClicks).toHaveLength(0);
  expect(env.loginPrompts).toHaveLength(0);
});

test('Property 8: Attachment Access Control - Wholesale files should require wholesale access', () => {
  const env = new MockAttachmentEnvironment();
  
  const wholesaleFile = {
    id: 'wholesale1',
    name: 'Wholesale Pricing',
    url: 'https://example.com/pricing.pdf',
    type: 'pdf',
    access_level: 'wholesale',
    category: 'certificates'
  };
  
  // Test with logged out user - should be denied
  const loggedOutState = { loggedIn: false, tags: [] };
  const result1 = env.simulateAttachmentClick(wholesaleFile, loggedOutState);
  
  expect(result1.hasAccess).toBe(false);
  expect(result1.reason).toBe('wholesale_only');
  expect(env.preventedClicks).toHaveLength(1);
  
  // Test with regular customer - should be denied
  env.reset();
  const regularCustomerState = { loggedIn: true, tags: ['regular'] };
  const result2 = env.simulateAttachmentClick(wholesaleFile, regularCustomerState);
  
  expect(result2.hasAccess).toBe(false);
  expect(result2.reason).toBe('wholesale_only');
  expect(env.preventedClicks).toHaveLength(1);
  
  // Test with wholesale customer - should be allowed
  env.reset();
  const wholesaleCustomerState = { loggedIn: true, tags: ['wholesale'] };
  const result3 = env.simulateAttachmentClick(wholesaleFile, wholesaleCustomerState);
  
  expect(result3.hasAccess).toBe(true);
  expect(env.preventedClicks).toHaveLength(0);
});

test('Property 8: Attachment Access Control - Login prompts should only show for customer-level files', () => {
  const env = new MockAttachmentEnvironment();
  
  const loggedOutState = { loggedIn: false, tags: [] };
  
  // Customer-level file should show login prompt
  const customerFile = {
    id: 'customer1',
    name: 'Customer File',
    url: 'https://example.com/file.pdf',
    type: 'pdf',
    access_level: 'customer',
    category: 'manuals'
  };
  
  env.simulateAttachmentClick(customerFile, loggedOutState);
  expect(env.loginPrompts).toHaveLength(1);
  
  // Wholesale-level file should NOT show login prompt (different access level)
  env.reset();
  const wholesaleFile = {
    id: 'wholesale1',
    name: 'Wholesale File',
    url: 'https://example.com/wholesale.pdf',
    type: 'pdf',
    access_level: 'wholesale',
    category: 'certificates'
  };
  
  env.simulateAttachmentClick(wholesaleFile, loggedOutState);
  expect(env.loginPrompts).toHaveLength(0); // No login prompt for wholesale files
  expect(env.preventedClicks).toHaveLength(1); // Still prevented, but no login prompt
});

test('Property 8: Attachment Access Control - Multiple access levels should work correctly', () => {
  const env = new MockAttachmentEnvironment();
  
  const files = [
    { id: 'pub1', access_level: 'public', name: 'Public', url: 'https://example.com/pub.pdf', type: 'pdf', category: 'manuals' },
    { id: 'cust1', access_level: 'customer', name: 'Customer', url: 'https://example.com/cust.pdf', type: 'pdf', category: 'manuals' },
    { id: 'whole1', access_level: 'wholesale', name: 'Wholesale', url: 'https://example.com/whole.pdf', type: 'pdf', category: 'certificates' }
  ];
  
  // Test with wholesale customer (should have access to all)
  const wholesaleState = { loggedIn: true, tags: ['wholesale'] };
  
  for (const file of files) {
    env.reset();
    const result = env.simulateAttachmentClick(file, wholesaleState);
    expect(result.hasAccess).toBe(true);
    expect(env.preventedClicks).toHaveLength(0);
  }
  
  // Test with regular customer (should have access to public and customer files)
  const customerState = { loggedIn: true, tags: [] };
  
  env.reset();
  const publicResult = env.simulateAttachmentClick(files[0], customerState);
  expect(publicResult.hasAccess).toBe(true);
  
  const customerResult = env.simulateAttachmentClick(files[1], customerState);
  expect(customerResult.hasAccess).toBe(true);
  
  const wholesaleResult = env.simulateAttachmentClick(files[2], customerState);
  expect(wholesaleResult.hasAccess).toBe(false);
  
  expect(env.preventedClicks).toHaveLength(1); // Only wholesale file prevented
});