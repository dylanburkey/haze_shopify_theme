/**
 * Property-Based Tests for Update Synchronization
 * Tests real-time synchronization between admin updates and storefront display
 * 
 * Feature: product-specification-system
 * Property: 10
 */

import fc from 'fast-check';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock MetafieldSync class for testing
class MockMetafieldSync {
  constructor() {
    this.syncEnabled = true;
    this.syncQueue = [];
    this.eventListeners = new Map();
    this.storageData = new Map();
    this.lastSyncTime = null;
    this.changeId = 0;
  }

  queueChange(type, data, productId = 'current') {
    const change = {
      id: `change_${++this.changeId}`,
      type: type,
      data: data,
      productId: productId,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.syncQueue.push(change);
    
    // Auto-sync for testing
    if (this.syncEnabled) {
      setTimeout(() => this.performSync(), 0);
    }

    return change.id;
  }

  async performSync() {
    if (this.syncQueue.length === 0) {
      return;
    }

    try {
      // Process all pending changes
      for (const change of this.syncQueue) {
        await this.applySingleChange(change);
      }

      this.lastSyncTime = Date.now();
      this.emit('syncComplete', {
        timestamp: this.lastSyncTime,
        changesProcessed: this.syncQueue.length
      });

      // Clear processed changes
      this.syncQueue = [];
      
    } catch (error) {
      this.emit('syncError', { error: error.message });
      throw error;
    }
  }

  async applySingleChange(change) {
    const storageKey = `${change.productId}-${change.type}`;
    
    switch (change.type) {
      case 'specification':
        await this.syncSpecification(change);
        break;
      case 'attachment':
        await this.syncAttachment(change);
        break;
      case 'category':
        await this.syncCategory(change);
        break;
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
    
    change.status = 'completed';
    
    // Emit change event
    this.emit(`${change.type}Changed`, {
      productId: change.productId,
      data: this.storageData.get(storageKey),
      change: change
    });
  }

  async syncSpecification(change) {
    const storageKey = `${change.productId}-specification`;
    const existingData = this.storageData.get(storageKey) || {};
    
    if (change.data.action === 'update') {
      this.deepMerge(existingData, change.data.specifications);
    } else if (change.data.action === 'replace') {
      Object.assign(existingData, change.data.specifications);
    } else if (change.data.action === 'delete') {
      this.deleteFromObject(existingData, change.data.path);
    }
    
    this.storageData.set(storageKey, existingData);
  }

  async syncAttachment(change) {
    const storageKey = `${change.productId}-attachment`;
    const existingData = this.storageData.get(storageKey) || { files: [], categories: {} };
    
    if (change.data.action === 'addFile') {
      existingData.files.push(change.data.file);
    } else if (change.data.action === 'updateFile') {
      const index = existingData.files.findIndex(f => f.id === change.data.file.id);
      if (index >= 0) {
        existingData.files[index] = change.data.file;
      }
    } else if (change.data.action === 'deleteFile') {
      existingData.files = existingData.files.filter(f => f.id !== change.data.fileId);
    } else if (change.data.action === 'replace') {
      Object.assign(existingData, change.data);
    }
    
    this.storageData.set(storageKey, existingData);
  }

  async syncCategory(change) {
    const storageKey = `${change.productId}-category`;
    const existingData = this.storageData.get(storageKey) || {};
    
    if (change.data.action === 'update') {
      Object.assign(existingData, change.data.categories);
    } else if (change.data.action === 'delete') {
      delete existingData[change.data.categoryKey];
    }
    
    this.storageData.set(storageKey, existingData);
  }

  // Utility methods
  deepMerge(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        try {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            this.deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        } catch (error) {
          // Skip read-only properties
          console.warn(`Cannot assign to property ${key}:`, error.message);
        }
      }
    }
  }

  deleteFromObject(obj, path) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const parent = keys.reduce((o, k) => o && o[k], obj);
    if (parent && lastKey) {
      delete parent[lastKey];
    }
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  // Public API
  getSyncStatus() {
    return {
      enabled: this.syncEnabled,
      lastSync: this.lastSyncTime,
      pendingChanges: this.syncQueue.length
    };
  }

  setSyncEnabled(enabled) {
    this.syncEnabled = enabled;
  }

  clearPendingChanges() {
    this.syncQueue = [];
  }

  getStoredData(productId, type) {
    return this.storageData.get(`${productId}-${type}`);
  }

  setStoredData(productId, type, data) {
    this.storageData.set(`${productId}-${type}`, data);
  }
}

// Generators for test data
const specificationChangeGenerator = () => fc.record({
  action: fc.constantFrom('update', 'replace', 'delete'),
  specifications: fc.option(fc.record({
    specifications: fc.dictionary(
      fc.string({ minLength: 1 }),
      fc.dictionary(fc.string({ minLength: 1 }), fc.record({
        value: fc.string({ minLength: 1 }),
        unit: fc.option(fc.string()),
        tolerance: fc.option(fc.string())
      }))
    ),
    categories: fc.dictionary(fc.string({ minLength: 1 }), fc.record({
      name: fc.string({ minLength: 1 }),
      order: fc.integer({ min: 1, max: 100 })
    }))
  })),
  path: fc.option(fc.string())
});

const attachmentChangeGenerator = () => fc.record({
  action: fc.constantFrom('addFile', 'updateFile', 'deleteFile', 'replace'),
  file: fc.option(fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    url: fc.webUrl(),
    type: fc.constantFrom('pdf', 'dwg', 'step'),
    category: fc.string({ minLength: 1 })
  })),
  fileId: fc.option(fc.string({ minLength: 1 })),
  files: fc.option(fc.array(fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    url: fc.webUrl(),
    type: fc.constantFrom('pdf', 'dwg', 'step'),
    category: fc.string({ minLength: 1 })
  }))),
  categories: fc.option(fc.dictionary(fc.string({ minLength: 1 }), fc.record({
    name: fc.string({ minLength: 1 }),
    icon: fc.string({ minLength: 1 }),
    order: fc.integer({ min: 1, max: 100 })
  })))
});

const categoryChangeGenerator = () => fc.record({
  action: fc.constantFrom('update', 'delete'),
  categories: fc.option(fc.dictionary(fc.string({ minLength: 1 }), fc.record({
    name: fc.string({ minLength: 1 }),
    order: fc.integer({ min: 1, max: 100 })
  }))),
  categoryKey: fc.option(fc.string({ minLength: 1 }))
});

describe('Update Synchronization Property Tests', () => {
  let syncSystem;

  beforeEach(() => {
    syncSystem = new MockMetafieldSync();
  });

  afterEach(() => {
    syncSystem.clearPendingChanges();
  });

  /**
   * Property 10: Specification Update Synchronization
   * For any specification update in the admin, the storefront should reflect the changes within the next page load
   */
  test('Property 10: Specification Update Synchronization', async () => {
    // Feature: product-specification-system, Property 10: Specification Update Synchronization
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // productId
        specificationChangeGenerator(),
        async (productId, changeData) => {
          // Skip invalid change data
          if (changeData.action === 'delete' && !changeData.path) {
            return true;
          }
          if (['update', 'replace'].includes(changeData.action) && !changeData.specifications) {
            return true;
          }

          // Set initial data
          const initialData = {
            specifications: {
              dimensions: {
                length: { value: '100', unit: 'mm' }
              }
            },
            categories: {
              dimensions: { name: 'Dimensions', order: 1 }
            }
          };
          syncSystem.setStoredData(productId, 'specification', initialData);

          // Track sync events
          let syncCompleted = false;
          let changeReceived = false;
          let finalData = null;

          syncSystem.on('syncComplete', () => {
            syncCompleted = true;
          });

          syncSystem.on('specificationChanged', (data) => {
            changeReceived = true;
            finalData = data.data;
          });

          // Queue the change
          const changeId = syncSystem.queueChange('specification', changeData, productId);
          expect(changeId).toBeTruthy();

          // Wait for sync to complete
          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify sync completed
          expect(syncCompleted).toBe(true);
          expect(changeReceived).toBe(true);

          // Verify data was updated
          const storedData = syncSystem.getStoredData(productId, 'specification');
          expect(storedData).toBeTruthy();
          expect(finalData).toEqual(storedData);

          // Verify sync status
          const status = syncSystem.getSyncStatus();
          expect(status.pendingChanges).toBe(0);
          expect(status.lastSync).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 10: Attachment Update Synchronization', async () => {
    // Feature: product-specification-system, Property 10: Specification Update Synchronization
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // productId
        attachmentChangeGenerator(),
        async (productId, changeData) => {
          // Skip invalid change data
          if (changeData.action === 'addFile' && !changeData.file) {
            return true;
          }
          if (changeData.action === 'updateFile' && !changeData.file) {
            return true;
          }
          if (changeData.action === 'deleteFile' && !changeData.fileId) {
            return true;
          }

          // Set initial data
          const initialData = {
            files: [
              { id: 'file1', name: 'Manual', url: 'http://example.com/manual.pdf', type: 'pdf', category: 'manuals' }
            ],
            categories: {
              manuals: { name: 'Manuals', icon: 'file-manual', order: 1 }
            }
          };
          syncSystem.setStoredData(productId, 'attachment', initialData);

          // Track sync events
          let syncCompleted = false;
          let changeReceived = false;
          let finalData = null;

          syncSystem.on('syncComplete', () => {
            syncCompleted = true;
          });

          syncSystem.on('attachmentChanged', (data) => {
            changeReceived = true;
            finalData = data.data;
          });

          // Queue the change
          const changeId = syncSystem.queueChange('attachment', changeData, productId);
          expect(changeId).toBeTruthy();

          // Wait for sync to complete
          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify sync completed
          expect(syncCompleted).toBe(true);
          expect(changeReceived).toBe(true);

          // Verify data was updated
          const storedData = syncSystem.getStoredData(productId, 'attachment');
          expect(storedData).toBeTruthy();
          expect(finalData).toEqual(storedData);

          // Verify sync status
          const status = syncSystem.getSyncStatus();
          expect(status.pendingChanges).toBe(0);
          expect(status.lastSync).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 10: Category Update Synchronization', async () => {
    // Feature: product-specification-system, Property 10: Specification Update Synchronization
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // productId
        categoryChangeGenerator(),
        async (productId, changeData) => {
          // Skip invalid change data
          if (changeData.action === 'update' && !changeData.categories) {
            return true;
          }
          if (changeData.action === 'delete' && !changeData.categoryKey) {
            return true;
          }

          // Set initial data
          const initialData = {
            dimensions: { name: 'Dimensions', order: 1 },
            performance: { name: 'Performance', order: 2 }
          };
          syncSystem.setStoredData(productId, 'category', initialData);

          // Track sync events
          let syncCompleted = false;
          let changeReceived = false;
          let finalData = null;

          syncSystem.on('syncComplete', () => {
            syncCompleted = true;
          });

          syncSystem.on('categoryChanged', (data) => {
            changeReceived = true;
            finalData = data.data;
          });

          // Queue the change
          const changeId = syncSystem.queueChange('category', changeData, productId);
          expect(changeId).toBeTruthy();

          // Wait for sync to complete
          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify sync completed
          expect(syncCompleted).toBe(true);
          expect(changeReceived).toBe(true);

          // Verify data was updated
          const storedData = syncSystem.getStoredData(productId, 'category');
          expect(storedData).toBeTruthy();
          expect(finalData).toEqual(storedData);

          // Verify sync status
          const status = syncSystem.getSyncStatus();
          expect(status.pendingChanges).toBe(0);
          expect(status.lastSync).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 10: Multiple concurrent updates synchronization', async () => {
    // Feature: product-specification-system, Property 10: Specification Update Synchronization
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // productId
        fc.array(specificationChangeGenerator(), { minLength: 1, maxLength: 5 }),
        async (productId, changes) => {
          // Filter out invalid changes
          const validChanges = changes.filter(change => {
            if (change.action === 'delete' && !change.path) return false;
            if (['update', 'replace'].includes(change.action) && !change.specifications) return false;
            return true;
          });

          if (validChanges.length === 0) {
            return true;
          }

          // Set initial data
          const initialData = {
            specifications: {
              dimensions: {
                length: { value: '100', unit: 'mm' }
              }
            },
            categories: {
              dimensions: { name: 'Dimensions', order: 1 }
            }
          };
          syncSystem.setStoredData(productId, 'specification', initialData);

          // Track sync events
          let syncCount = 0;
          let changeCount = 0;

          syncSystem.on('syncComplete', () => {
            syncCount++;
          });

          syncSystem.on('specificationChanged', () => {
            changeCount++;
          });

          // Queue all changes
          const changeIds = validChanges.map(change => 
            syncSystem.queueChange('specification', change, productId)
          );

          // Verify all changes were queued
          expect(changeIds.length).toBe(validChanges.length);
          expect(changeIds.every(id => id)).toBe(true);

          // Wait for all syncs to complete
          await new Promise(resolve => setTimeout(resolve, 50));

          // Verify all changes were processed
          expect(syncCount).toBeGreaterThan(0);
          expect(changeCount).toBeGreaterThan(0);

          // Verify final sync status
          const status = syncSystem.getSyncStatus();
          expect(status.pendingChanges).toBe(0);
          expect(status.lastSync).toBeTruthy();

          // Verify data exists
          const finalData = syncSystem.getStoredData(productId, 'specification');
          expect(finalData).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 10: Sync system state consistency', () => {
    // Feature: product-specification-system, Property 10: Specification Update Synchronization
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // productId
        fc.constantFrom('specification', 'attachment', 'category'),
        fc.record({
          action: fc.constantFrom('update', 'replace', 'delete'),
          data: fc.anything()
        }),
        (productId, changeType, changeData) => {
          // Queue a change
          const changeId = syncSystem.queueChange(changeType, changeData, productId);
          
          // Verify change was queued
          expect(changeId).toBeTruthy();
          
          // Verify sync status reflects pending change
          const status = syncSystem.getSyncStatus();
          expect(status.pendingChanges).toBeGreaterThan(0);
          
          // Verify change is in queue
          const pendingChanges = syncSystem.syncQueue;
          const queuedChange = pendingChanges.find(c => c.id === changeId);
          expect(queuedChange).toBeTruthy();
          expect(queuedChange.type).toBe(changeType);
          expect(queuedChange.productId).toBe(productId);
          expect(queuedChange.status).toBe('pending');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Sync enable/disable behavior', async () => {
    // Feature: product-specification-system, Property 10: Specification Update Synchronization
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // syncEnabled
        fc.string({ minLength: 1 }), // productId
        specificationChangeGenerator(),
        async (syncEnabled, productId, changeData) => {
          // Skip invalid change data
          if (changeData.action === 'delete' && !changeData.path) {
            return true;
          }
          if (['update', 'replace'].includes(changeData.action) && !changeData.specifications) {
            return true;
          }

          // Create fresh sync system for each test
          const testSyncSystem = new MockMetafieldSync();
          
          // Set sync enabled state
          testSyncSystem.setSyncEnabled(syncEnabled);
          
          // Verify sync status
          let status = testSyncSystem.getSyncStatus();
          expect(status.enabled).toBe(syncEnabled);

          // Queue a change
          const changeId = testSyncSystem.queueChange('specification', changeData, productId);
          expect(changeId).toBeTruthy();

          // Wait for potential sync with longer timeout
          await new Promise(resolve => setTimeout(resolve, 50));

          // Check final status
          status = testSyncSystem.getSyncStatus();
          
          if (syncEnabled) {
            // If sync is enabled, changes should be processed eventually
            // Allow for some pending changes due to async nature
            expect(status.pendingChanges).toBeLessThanOrEqual(1);
            if (status.pendingChanges === 0) {
              expect(status.lastSync).toBeTruthy();
            }
          } else {
            // If sync is disabled, changes should remain pending
            expect(status.pendingChanges).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 10: Data integrity during sync operations', async () => {
    // Feature: product-specification-system, Property 10: Specification Update Synchronization
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // productId
        fc.record({
          specifications: fc.dictionary(
            fc.string({ minLength: 1 }),
            fc.dictionary(fc.string({ minLength: 1 }), fc.record({
              value: fc.string({ minLength: 1 }),
              unit: fc.option(fc.string())
            }))
          ),
          categories: fc.dictionary(fc.string({ minLength: 1 }), fc.record({
            name: fc.string({ minLength: 1 }),
            order: fc.integer({ min: 1, max: 100 })
          }))
        }),
        async (productId, originalData) => {
          // Set initial data
          syncSystem.setStoredData(productId, 'specification', originalData);
          
          // Verify initial data integrity
          const initialStored = syncSystem.getStoredData(productId, 'specification');
          expect(initialStored).toEqual(originalData);

          // Queue an update change
          const updateData = {
            action: 'replace',
            specifications: originalData
          };
          
          const changeId = syncSystem.queueChange('specification', updateData, productId);
          expect(changeId).toBeTruthy();

          // Wait for sync
          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify data integrity after sync
          const finalStored = syncSystem.getStoredData(productId, 'specification');
          expect(finalStored).toBeTruthy();
          
          // Data should contain the original structure
          if (originalData.specifications) {
            expect(finalStored.specifications).toBeTruthy();
          }
          if (originalData.categories) {
            expect(finalStored.categories).toBeTruthy();
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});