/**
 * Metafield Synchronization System
 * Handles real-time synchronization between admin updates and storefront display
 */

class MetafieldSync {
  constructor() {
    this.syncEnabled = true;
    this.syncInterval = 5000; // 5 seconds
    this.lastSyncTime = null;
    this.syncQueue = [];
    this.eventListeners = new Map();
    this.storageKey = 'metafield-sync-data';
    this.changeTracker = new Map();
    
    // Initialize synchronization
    this.init();
  }

  init() {
    // Set up storage event listener for cross-tab synchronization
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.handleStorageChange(e);
      }
    });

    // Set up periodic sync check
    if (this.syncEnabled) {
      this.startPeriodicSync();
    }

    // Set up visibility change listener to sync when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.syncEnabled) {
        this.performSync();
      }
    });

    // Set up beforeunload to save pending changes
    window.addEventListener('beforeunload', () => {
      this.flushPendingChanges();
    });
  }

  /**
   * Enable or disable real-time synchronization
   */
  setSyncEnabled(enabled) {
    this.syncEnabled = enabled;
    
    if (enabled) {
      this.startPeriodicSync();
    } else {
      this.stopPeriodicSync();
    }
  }

  /**
   * Start periodic synchronization
   */
  startPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      this.performSync();
    }, this.syncInterval);
  }

  /**
   * Stop periodic synchronization
   */
  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Queue a change for synchronization
   */
  queueChange(type, data, productId = 'current') {
    const change = {
      id: this.generateChangeId(),
      type: type, // 'specification', 'attachment', 'category'
      data: data,
      productId: productId,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.syncQueue.push(change);
    this.trackChange(change);
    
    // Trigger immediate sync for critical changes
    if (this.isCriticalChange(type)) {
      this.performSync();
    }

    return change.id;
  }

  /**
   * Track changes for conflict resolution
   */
  trackChange(change) {
    const key = `${change.productId}-${change.type}`;
    if (!this.changeTracker.has(key)) {
      this.changeTracker.set(key, []);
    }
    this.changeTracker.get(key).push(change);
  }

  /**
   * Perform synchronization
   */
  async performSync() {
    if (this.syncQueue.length === 0) {
      return;
    }

    try {
      // Group changes by product and type
      const groupedChanges = this.groupChanges();
      
      // Process each group
      for (const [key, changes] of groupedChanges) {
        await this.syncChangeGroup(key, changes);
      }

      // Update last sync time
      this.lastSyncTime = Date.now();
      
      // Emit sync complete event
      this.emit('syncComplete', {
        timestamp: this.lastSyncTime,
        changesProcessed: this.syncQueue.length
      });

      // Clear processed changes
      this.syncQueue = [];
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('syncError', { error: error.message });
    }
  }

  /**
   * Group changes by product and type for efficient processing
   */
  groupChanges() {
    const groups = new Map();
    
    this.syncQueue.forEach(change => {
      const key = `${change.productId}-${change.type}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(change);
    });

    return groups;
  }

  /**
   * Sync a group of related changes
   */
  async syncChangeGroup(key, changes) {
    const [productId, type] = key.split('-');
    
    // Sort changes by timestamp
    changes.sort((a, b) => a.timestamp - b.timestamp);
    
    // Apply changes in order
    for (const change of changes) {
      await this.applySingleChange(change);
    }

    // Update storage with final state
    await this.updateStorage(productId, type, changes);
  }

  /**
   * Apply a single change
   */
  async applySingleChange(change) {
    try {
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
          console.warn('Unknown change type:', change.type);
      }
      
      change.status = 'completed';
      
    } catch (error) {
      change.status = 'failed';
      change.error = error.message;
      throw error;
    }
  }

  /**
   * Sync specification changes
   */
  async syncSpecification(change) {
    const { data, productId } = change;
    
    // In a real implementation, this would call Shopify Admin API
    // For now, we'll simulate with localStorage
    const storageKey = `metafield-specifications-${productId}`;
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    // Merge changes
    if (data.action === 'update') {
      this.deepMerge(existingData, data.specifications);
    } else if (data.action === 'delete') {
      this.deleteFromObject(existingData, data.path);
    } else if (data.action === 'replace') {
      Object.assign(existingData, data.specifications);
    }
    
    // Save updated data
    localStorage.setItem(storageKey, JSON.stringify(existingData));
    
    // Emit change event for UI updates
    this.emit('specificationChanged', {
      productId: productId,
      data: existingData,
      change: change
    });
  }

  /**
   * Sync attachment changes
   */
  async syncAttachment(change) {
    const { data, productId } = change;
    
    const storageKey = `metafield-attachments-${productId}`;
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{"files": [], "categories": {}}');
    
    if (data.action === 'addFile') {
      existingData.files.push(data.file);
    } else if (data.action === 'updateFile') {
      const index = existingData.files.findIndex(f => f.id === data.file.id);
      if (index >= 0) {
        existingData.files[index] = data.file;
      }
    } else if (data.action === 'deleteFile') {
      existingData.files = existingData.files.filter(f => f.id !== data.fileId);
    } else if (data.action === 'updateCategories') {
      Object.assign(existingData.categories, data.categories);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(existingData));
    
    this.emit('attachmentChanged', {
      productId: productId,
      data: existingData,
      change: change
    });
  }

  /**
   * Sync category changes
   */
  async syncCategory(change) {
    const { data, productId } = change;
    
    const storageKey = `metafield-categories-${productId}`;
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (data.action === 'update') {
      Object.assign(existingData, data.categories);
    } else if (data.action === 'delete') {
      delete existingData[data.categoryKey];
    }
    
    localStorage.setItem(storageKey, JSON.stringify(existingData));
    
    this.emit('categoryChanged', {
      productId: productId,
      data: existingData,
      change: change
    });
  }

  /**
   * Update storage with consolidated changes
   */
  async updateStorage(productId, type, changes) {
    const storageKey = `${this.storageKey}-${productId}-${type}`;
    const syncData = {
      lastSync: Date.now(),
      changes: changes.map(c => ({
        id: c.id,
        timestamp: c.timestamp,
        status: c.status,
        error: c.error
      }))
    };
    
    localStorage.setItem(storageKey, JSON.stringify(syncData));
  }

  /**
   * Handle storage changes from other tabs/windows
   */
  handleStorageChange(event) {
    if (!event.newValue) return;
    
    try {
      const data = JSON.parse(event.newValue);
      
      // Check if this is a sync data update
      if (event.key.includes(this.storageKey)) {
        this.handleRemoteSync(data);
      } else {
        // Handle direct data changes
        this.handleRemoteDataChange(event.key, data);
      }
      
    } catch (error) {
      console.error('Error handling storage change:', error);
    }
  }

  /**
   * Handle sync updates from other tabs
   */
  handleRemoteSync(syncData) {
    // Update UI to reflect remote changes
    this.emit('remoteSync', syncData);
    
    // Refresh local data if needed
    if (this.shouldRefreshLocalData(syncData)) {
      this.refreshLocalData();
    }
  }

  /**
   * Handle direct data changes from other tabs
   */
  handleRemoteDataChange(key, data) {
    // Determine the type of change
    let changeType = 'unknown';
    if (key.includes('specifications')) {
      changeType = 'specification';
    } else if (key.includes('attachments')) {
      changeType = 'attachment';
    } else if (key.includes('categories')) {
      changeType = 'category';
    }
    
    // Emit change event for UI updates
    this.emit('remoteDataChange', {
      type: changeType,
      key: key,
      data: data
    });
  }

  /**
   * Check if local data should be refreshed
   */
  shouldRefreshLocalData(syncData) {
    // Refresh if remote sync is more recent than local
    return !this.lastSyncTime || syncData.lastSync > this.lastSyncTime;
  }

  /**
   * Refresh local data from storage
   */
  refreshLocalData() {
    this.emit('refreshRequired');
  }

  /**
   * Flush pending changes before page unload
   */
  flushPendingChanges() {
    if (this.syncQueue.length > 0) {
      // Save pending changes to storage for recovery
      const pendingData = {
        timestamp: Date.now(),
        changes: this.syncQueue
      };
      localStorage.setItem(`${this.storageKey}-pending`, JSON.stringify(pendingData));
    }
  }

  /**
   * Recover pending changes after page load
   */
  recoverPendingChanges() {
    const pendingData = localStorage.getItem(`${this.storageKey}-pending`);
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        
        // Only recover recent changes (within last 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (data.timestamp > fiveMinutesAgo) {
          this.syncQueue.push(...data.changes);
          this.performSync();
        }
        
        // Clean up pending data
        localStorage.removeItem(`${this.storageKey}-pending`);
        
      } catch (error) {
        console.error('Error recovering pending changes:', error);
      }
    }
  }

  /**
   * Utility methods
   */
  generateChangeId() {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isCriticalChange(type) {
    // Define which changes should trigger immediate sync
    return ['specification', 'attachment'].includes(type);
  }

  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
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

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Public API methods
   */
  
  /**
   * Manually trigger synchronization
   */
  sync() {
    return this.performSync();
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      enabled: this.syncEnabled,
      lastSync: this.lastSyncTime,
      pendingChanges: this.syncQueue.length,
      isOnline: navigator.onLine
    };
  }

  /**
   * Clear all pending changes
   */
  clearPendingChanges() {
    this.syncQueue = [];
    this.changeTracker.clear();
  }

  /**
   * Get pending changes
   */
  getPendingChanges() {
    return [...this.syncQueue];
  }

  /**
   * Force refresh from server
   */
  forceRefresh() {
    this.clearPendingChanges();
    this.refreshLocalData();
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  window.MetafieldSync = MetafieldSync;
  
  // Create global instance
  window.metafieldSync = new MetafieldSync();
  
  // Recover pending changes on load
  document.addEventListener('DOMContentLoaded', () => {
    window.metafieldSync.recoverPendingChanges();
  });
}

export default MetafieldSync;