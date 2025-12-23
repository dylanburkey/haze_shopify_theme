/**
 * Metafield Admin Interface
 * JavaScript-based admin tools for managing product specifications and attachments
 */

class MetafieldAdmin {
  constructor() {
    this.apiVersion = '2023-10';
    this.baseUrl = window.location.origin;
    this.accessToken = null;
    this.bulkOperations = new MetafieldBulkOperations();
    this.syncSystem = window.metafieldSync || new MetafieldSync();
    
    // Initialize admin interface
    this.init();
    
    // Set up sync event listeners
    this.setupSyncListeners();
  }

  init() {
    // Create admin interface container
    this.createAdminInterface();
    
    // Bind event listeners
    this.bindEvents();
    
    // Load existing data
    this.loadProductData();
  }

  createAdminInterface() {
    const adminContainer = document.createElement('div');
    adminContainer.id = 'metafield-admin';
    adminContainer.className = 'metafield-admin-container';
    
    adminContainer.innerHTML = `
      <div class="admin-header">
        <h2>Product Specification Admin</h2>
        <div class="admin-actions">
          <button id="save-all" class="btn btn-primary">Save All Changes</button>
          <button id="export-data" class="btn btn-secondary">Export Data</button>
          <button id="import-data" class="btn btn-secondary">Import Data</button>
          <button id="bulk-operations" class="btn btn-secondary">Bulk Operations</button>
          <button id="sync-status" class="btn btn-secondary">Sync Status</button>
        </div>
      </div>
      
      <div class="admin-tabs">
        <button class="tab-btn active" data-tab="specifications">Specifications</button>
        <button class="tab-btn" data-tab="attachments">Attachments</button>
        <button class="tab-btn" data-tab="categories">Categories</button>
      </div>
      
      <div class="admin-content">
        <!-- Specifications Tab -->
        <div id="specifications-tab" class="tab-content active">
          <div class="section-header">
            <h3>Technical Specifications</h3>
            <button id="add-category" class="btn btn-small">Add Category</button>
          </div>
          <div id="specifications-container"></div>
        </div>
        
        <!-- Attachments Tab -->
        <div id="attachments-tab" class="tab-content">
          <div class="section-header">
            <h3>Product Attachments</h3>
            <button id="add-attachment" class="btn btn-small">Add Attachment</button>
          </div>
          <div id="attachments-container"></div>
        </div>
        
        <!-- Categories Tab -->
        <div id="categories-tab" class="tab-content">
          <div class="section-header">
            <h3>Category Management</h3>
            <div class="category-types">
              <button id="add-spec-category" class="btn btn-small">Add Spec Category</button>
              <button id="add-attachment-category" class="btn btn-small">Add Attachment Category</button>
            </div>
          </div>
          <div id="categories-container"></div>
        </div>
      </div>
      
      <!-- Import/Export Modal -->
      <div id="import-export-modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h3 id="modal-title">Import/Export Data</h3>
          <div id="modal-body"></div>
        </div>
      </div>
      
      <!-- Bulk Operations Modal -->
      <div id="bulk-operations-modal" class="modal">
        <div class="modal-content">
          <span class="close-bulk">&times;</span>
          <h3>Bulk Operations</h3>
          <div class="bulk-operations-content">
            <div class="bulk-section">
              <h4>Bulk Export</h4>
              <p>Export data from multiple products at once</p>
              <div class="bulk-controls">
                <input type="text" id="bulk-product-ids" placeholder="Product IDs (comma-separated)" style="width: 300px;">
                <select id="bulk-export-format">
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <button id="bulk-export-btn" class="btn btn-primary">Export</button>
              </div>
            </div>
            
            <div class="bulk-section">
              <h4>Bulk Import</h4>
              <p>Import data to multiple products from a batch file</p>
              <div class="bulk-controls">
                <input type="file" id="bulk-import-file" accept=".json,.csv">
                <button id="bulk-import-btn" class="btn btn-primary">Import</button>
              </div>
              <div id="bulk-import-results"></div>
            </div>
            
            <div class="bulk-section">
              <h4>Data Validation</h4>
              <p>Validate data structure before importing</p>
              <div class="bulk-controls">
                <input type="file" id="validate-file" accept=".json,.csv">
                <button id="validate-btn" class="btn btn-secondary">Validate</button>
              </div>
              <div id="validation-results"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sync Status Modal -->
      <div id="sync-status-modal" class="modal">
        <div class="modal-content">
          <span class="close-sync">&times;</span>
          <h3>Synchronization Status</h3>
          <div class="sync-status-content">
            <div class="sync-info">
              <div class="sync-stat">
                <label>Sync Enabled:</label>
                <span id="sync-enabled-status">Yes</span>
                <button id="toggle-sync" class="btn btn-small">Toggle</button>
              </div>
              <div class="sync-stat">
                <label>Last Sync:</label>
                <span id="last-sync-time">Never</span>
              </div>
              <div class="sync-stat">
                <label>Pending Changes:</label>
                <span id="pending-changes-count">0</span>
              </div>
              <div class="sync-stat">
                <label>Connection Status:</label>
                <span id="connection-status">Online</span>
              </div>
            </div>
            
            <div class="sync-actions">
              <button id="force-sync" class="btn btn-primary">Force Sync Now</button>
              <button id="clear-pending" class="btn btn-secondary">Clear Pending</button>
              <button id="force-refresh" class="btn btn-secondary">Force Refresh</button>
            </div>
            
            <div class="sync-log">
              <h4>Recent Sync Activity</h4>
              <div id="sync-log-content"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(adminContainer);
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Add buttons
    document.getElementById('add-category').addEventListener('click', () => {
      this.addSpecificationCategory();
    });
    
    document.getElementById('add-attachment').addEventListener('click', () => {
      this.addAttachment();
    });
    
    document.getElementById('add-spec-category').addEventListener('click', () => {
      this.addSpecificationCategory();
    });
    
    document.getElementById('add-attachment-category').addEventListener('click', () => {
      this.addAttachmentCategory();
    });

    // Save and export buttons
    document.getElementById('save-all').addEventListener('click', () => {
      this.saveAllChanges();
    });
    
    document.getElementById('export-data').addEventListener('click', () => {
      this.exportData();
    });
    
    document.getElementById('import-data').addEventListener('click', () => {
      this.importData();
    });
    
    document.getElementById('bulk-operations').addEventListener('click', () => {
      this.showBulkOperations();
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', () => {
      document.getElementById('import-export-modal').style.display = 'none';
    });
    
    document.querySelector('.close-bulk').addEventListener('click', () => {
      document.getElementById('bulk-operations-modal').style.display = 'none';
    });
    
    // Bulk operations events
    document.getElementById('bulk-export-btn').addEventListener('click', () => {
      this.performBulkExport();
    });
    
    document.getElementById('bulk-import-btn').addEventListener('click', () => {
      this.performBulkImport();
    });
    
    document.getElementById('validate-btn').addEventListener('click', () => {
      this.validateFile();
    });
    
    document.getElementById('sync-status').addEventListener('click', () => {
      this.showSyncStatus();
    });
    
    // Sync modal events
    document.querySelector('.close-sync').addEventListener('click', () => {
      document.getElementById('sync-status-modal').style.display = 'none';
    });
    
    document.getElementById('toggle-sync').addEventListener('click', () => {
      this.toggleSync();
    });
    
    document.getElementById('force-sync').addEventListener('click', () => {
      this.forceSync();
    });
    
    document.getElementById('clear-pending').addEventListener('click', () => {
      this.clearPendingChanges();
    });
    
    document.getElementById('force-refresh').addEventListener('click', () => {
      this.forceRefresh();
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  loadProductData() {
    // In a real implementation, this would fetch from Shopify Admin API
    // For now, we'll use localStorage or provide manual input
    const savedData = localStorage.getItem('metafield-admin-data');
    if (savedData) {
      this.data = JSON.parse(savedData);
    } else {
      this.data = {
        specifications: {
          categories: {},
          specifications: {}
        },
        attachments: {
          files: [],
          categories: {}
        }
      };
    }
    
    this.renderSpecifications();
    this.renderAttachments();
    this.renderCategories();
  }

  renderSpecifications() {
    const container = document.getElementById('specifications-container');
    container.innerHTML = '';

    // Render each category
    Object.keys(this.data.specifications.categories || {}).forEach(categoryKey => {
      const category = this.data.specifications.categories[categoryKey];
      const categoryDiv = this.createSpecificationCategoryEditor(categoryKey, category);
      container.appendChild(categoryDiv);
    });
  }

  createSpecificationCategoryEditor(categoryKey, category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-editor';
    categoryDiv.dataset.categoryKey = categoryKey;

    categoryDiv.innerHTML = `
      <div class="category-header">
        <input type="text" class="category-name" value="${category.name || ''}" placeholder="Category Name">
        <input type="number" class="category-order" value="${category.order || 1}" placeholder="Order" min="1">
        <label>
          <input type="checkbox" class="category-collapsible" ${category.collapsible ? 'checked' : ''}>
          Collapsible
        </label>
        <button class="btn btn-danger btn-small delete-category">Delete</button>
      </div>
      <div class="category-description">
        <textarea class="category-desc" placeholder="Category Description">${category.description || ''}</textarea>
      </div>
      <div class="specifications-list">
        <h4>Specifications</h4>
        <button class="btn btn-small add-specification" data-category="${categoryKey}">Add Specification</button>
        <div class="specs-container" data-category="${categoryKey}"></div>
      </div>
    `;

    // Render specifications for this category
    const specsContainer = categoryDiv.querySelector('.specs-container');
    const categorySpecs = this.data.specifications.specifications[categoryKey] || {};
    
    Object.keys(categorySpecs).forEach(specKey => {
      const spec = categorySpecs[specKey];
      const specEditor = this.createSpecificationEditor(categoryKey, specKey, spec);
      specsContainer.appendChild(specEditor);
    });

    // Bind events
    categoryDiv.querySelector('.delete-category').addEventListener('click', () => {
      this.deleteSpecificationCategory(categoryKey);
    });
    
    categoryDiv.querySelector('.add-specification').addEventListener('click', () => {
      this.addSpecification(categoryKey);
    });

    return categoryDiv;
  }

  createSpecificationEditor(categoryKey, specKey, spec) {
    const specDiv = document.createElement('div');
    specDiv.className = 'specification-editor';
    specDiv.dataset.specKey = specKey;

    specDiv.innerHTML = `
      <div class="spec-header">
        <input type="text" class="spec-key" value="${specKey}" placeholder="Specification Key">
        <input type="text" class="spec-display-name" value="${spec.display_name || ''}" placeholder="Display Name">
        <button class="btn btn-danger btn-small delete-spec">Delete</button>
      </div>
      <div class="spec-fields">
        <div class="field-group">
          <label>Value:</label>
          <input type="text" class="spec-value" value="${spec.value || ''}" placeholder="Value">
        </div>
        <div class="field-group">
          <label>Unit:</label>
          <input type="text" class="spec-unit" value="${spec.unit || ''}" placeholder="Unit">
        </div>
        <div class="field-group">
          <label>Tolerance:</label>
          <input type="text" class="spec-tolerance" value="${spec.tolerance || ''}" placeholder="±5">
        </div>
        <div class="field-group">
          <label>Range:</label>
          <input type="text" class="spec-range" value="${spec.range || ''}" placeholder="0-150">
        </div>
        <div class="field-group">
          <label>Min:</label>
          <input type="text" class="spec-min" value="${spec.min || ''}" placeholder="Minimum">
        </div>
        <div class="field-group">
          <label>Max:</label>
          <input type="text" class="spec-max" value="${spec.max || ''}" placeholder="Maximum">
        </div>
        <div class="field-group full-width">
          <label>Description:</label>
          <textarea class="spec-description" placeholder="Rich text description">${spec.description || ''}</textarea>
        </div>
      </div>
    `;

    // Bind delete event
    specDiv.querySelector('.delete-spec').addEventListener('click', () => {
      this.deleteSpecification(categoryKey, specKey);
    });

    return specDiv;
  }

  renderAttachments() {
    const container = document.getElementById('attachments-container');
    container.innerHTML = '';

    // Render each attachment
    (this.data.attachments.files || []).forEach((file, index) => {
      const attachmentDiv = this.createAttachmentEditor(file, index);
      container.appendChild(attachmentDiv);
    });
  }

  createAttachmentEditor(file, index) {
    const attachmentDiv = document.createElement('div');
    attachmentDiv.className = 'attachment-editor';
    attachmentDiv.dataset.index = index;

    attachmentDiv.innerHTML = `
      <div class="attachment-header">
        <input type="text" class="file-name" value="${file.name || ''}" placeholder="File Name">
        <select class="file-category">
          ${this.getCategoryOptions('attachment', file.category)}
        </select>
        <button class="btn btn-danger btn-small delete-attachment">Delete</button>
      </div>
      <div class="attachment-fields">
        <div class="field-group">
          <label>ID:</label>
          <input type="text" class="file-id" value="${file.id || ''}" placeholder="Unique ID">
        </div>
        <div class="field-group">
          <label>URL:</label>
          <input type="url" class="file-url" value="${file.url || ''}" placeholder="File URL">
        </div>
        <div class="field-group">
          <label>Type:</label>
          <input type="text" class="file-type" value="${file.type || ''}" placeholder="pdf, dwg, step">
        </div>
        <div class="field-group">
          <label>Size:</label>
          <input type="text" class="file-size" value="${file.size || ''}" placeholder="2.4 MB">
        </div>
        <div class="field-group">
          <label>Access Level:</label>
          <select class="file-access">
            <option value="public" ${file.access_level === 'public' ? 'selected' : ''}>Public</option>
            <option value="customer" ${file.access_level === 'customer' ? 'selected' : ''}>Customer</option>
            <option value="wholesale" ${file.access_level === 'wholesale' ? 'selected' : ''}>Wholesale</option>
          </select>
        </div>
        <div class="field-group">
          <label>Order:</label>
          <input type="number" class="file-order" value="${file.order || 1}" min="1">
        </div>
        <div class="field-group">
          <label>
            <input type="checkbox" class="file-featured" ${file.featured ? 'checked' : ''}>
            Featured
          </label>
        </div>
        <div class="field-group full-width">
          <label>Description:</label>
          <textarea class="file-description" placeholder="File description">${file.description || ''}</textarea>
        </div>
      </div>
    `;

    // Bind delete event
    attachmentDiv.querySelector('.delete-attachment').addEventListener('click', () => {
      this.deleteAttachment(index);
    });

    return attachmentDiv;
  }

  renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = `
      <div class="categories-section">
        <h4>Specification Categories</h4>
        <div id="spec-categories-list"></div>
      </div>
      <div class="categories-section">
        <h4>Attachment Categories</h4>
        <div id="attachment-categories-list"></div>
      </div>
    `;

    // Render specification categories
    const specCategoriesContainer = document.getElementById('spec-categories-list');
    Object.keys(this.data.specifications.categories || {}).forEach(categoryKey => {
      const category = this.data.specifications.categories[categoryKey];
      const categoryEditor = this.createCategoryEditor('specification', categoryKey, category);
      specCategoriesContainer.appendChild(categoryEditor);
    });

    // Render attachment categories
    const attachmentCategoriesContainer = document.getElementById('attachment-categories-list');
    Object.keys(this.data.attachments.categories || {}).forEach(categoryKey => {
      const category = this.data.attachments.categories[categoryKey];
      const categoryEditor = this.createCategoryEditor('attachment', categoryKey, category);
      attachmentCategoriesContainer.appendChild(categoryEditor);
    });
  }

  createCategoryEditor(type, categoryKey, category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-editor-simple';
    categoryDiv.dataset.type = type;
    categoryDiv.dataset.categoryKey = categoryKey;

    const iconField = type === 'attachment' ? `
      <div class="field-group">
        <label>Icon:</label>
        <input type="text" class="category-icon" value="${category.icon || ''}" placeholder="file-pdf">
      </div>
    ` : '';

    categoryDiv.innerHTML = `
      <div class="category-simple-header">
        <input type="text" class="category-key" value="${categoryKey}" placeholder="Category Key">
        <input type="text" class="category-name" value="${category.name || ''}" placeholder="Category Name">
        <button class="btn btn-danger btn-small delete-category">Delete</button>
      </div>
      <div class="category-simple-fields">
        <div class="field-group">
          <label>Order:</label>
          <input type="number" class="category-order" value="${category.order || 1}" min="1">
        </div>
        ${iconField}
        <div class="field-group full-width">
          <label>Description:</label>
          <textarea class="category-description" placeholder="Category description">${category.description || ''}</textarea>
        </div>
      </div>
    `;

    // Bind delete event
    categoryDiv.querySelector('.delete-category').addEventListener('click', () => {
      this.deleteCategory(type, categoryKey);
    });

    return categoryDiv;
  }

  getCategoryOptions(type, selectedCategory) {
    const categories = type === 'attachment' 
      ? this.data.attachments.categories 
      : this.data.specifications.categories;
    
    let options = '<option value="">Select Category</option>';
    
    Object.keys(categories || {}).forEach(categoryKey => {
      const category = categories[categoryKey];
      const selected = categoryKey === selectedCategory ? 'selected' : '';
      options += `<option value="${categoryKey}" ${selected}>${category.name}</option>`;
    });
    
    return options;
  }

  // Add methods
  addSpecificationCategory() {
    const categoryKey = prompt('Enter category key (lowercase, underscores only):');
    if (!categoryKey || !/^[a-z_]+$/.test(categoryKey)) {
      alert('Invalid category key. Use lowercase letters and underscores only.');
      return;
    }

    if (!this.data.specifications.categories) {
      this.data.specifications.categories = {};
    }
    if (!this.data.specifications.specifications) {
      this.data.specifications.specifications = {};
    }

    this.data.specifications.categories[categoryKey] = {
      name: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      order: Object.keys(this.data.specifications.categories).length + 1,
      collapsible: true
    };
    
    this.data.specifications.specifications[categoryKey] = {};
    
    this.renderSpecifications();
  }

  addSpecification(categoryKey) {
    const specKey = prompt('Enter specification key (lowercase, underscores only):');
    if (!specKey || !/^[a-z_]+$/.test(specKey)) {
      alert('Invalid specification key. Use lowercase letters and underscores only.');
      return;
    }

    if (!this.data.specifications.specifications[categoryKey]) {
      this.data.specifications.specifications[categoryKey] = {};
    }

    this.data.specifications.specifications[categoryKey][specKey] = {
      value: '',
      display_name: specKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };

    this.renderSpecifications();
  }

  addAttachment() {
    const fileId = prompt('Enter file ID:');
    if (!fileId) return;

    if (!this.data.attachments.files) {
      this.data.attachments.files = [];
    }

    this.data.attachments.files.push({
      id: fileId,
      name: '',
      url: '',
      type: '',
      size: '',
      category: '',
      description: '',
      access_level: 'public',
      featured: false,
      order: this.data.attachments.files.length + 1
    });

    this.renderAttachments();
  }

  addAttachmentCategory() {
    const categoryKey = prompt('Enter category key (lowercase, underscores only):');
    if (!categoryKey || !/^[a-z_]+$/.test(categoryKey)) {
      alert('Invalid category key. Use lowercase letters and underscores only.');
      return;
    }

    if (!this.data.attachments.categories) {
      this.data.attachments.categories = {};
    }

    this.data.attachments.categories[categoryKey] = {
      name: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: 'file-generic',
      order: Object.keys(this.data.attachments.categories).length + 1
    };

    this.renderCategories();
  }

  // Delete methods
  deleteSpecificationCategory(categoryKey) {
    if (confirm(`Delete category "${categoryKey}" and all its specifications?`)) {
      delete this.data.specifications.categories[categoryKey];
      delete this.data.specifications.specifications[categoryKey];
      this.renderSpecifications();
    }
  }

  deleteSpecification(categoryKey, specKey) {
    if (confirm(`Delete specification "${specKey}"?`)) {
      delete this.data.specifications.specifications[categoryKey][specKey];
      this.renderSpecifications();
    }
  }

  deleteAttachment(index) {
    if (confirm('Delete this attachment?')) {
      this.data.attachments.files.splice(index, 1);
      this.renderAttachments();
    }
  }

  deleteCategory(type, categoryKey) {
    if (confirm(`Delete category "${categoryKey}"?`)) {
      if (type === 'specification') {
        delete this.data.specifications.categories[categoryKey];
      } else {
        delete this.data.attachments.categories[categoryKey];
      }
      this.renderCategories();
    }
  }

  // Save and export methods
  saveAllChanges() {
    // Collect all form data
    this.collectFormData();
    
    // Queue changes for synchronization
    this.queueSpecificationChange('replace', this.data.specifications);
    this.queueAttachmentChange('replace', this.data.attachments);
    
    // Save to localStorage (in real implementation, would save to Shopify)
    localStorage.setItem('metafield-admin-data', JSON.stringify(this.data));
    
    // Show success message
    this.showNotification('Changes saved and queued for sync!', 'success');
  }

  collectFormData() {
    // Collect specification data
    document.querySelectorAll('#specifications-container .category-editor').forEach(categoryDiv => {
      const categoryKey = categoryDiv.dataset.categoryKey;
      const category = this.data.specifications.categories[categoryKey];
      
      category.name = categoryDiv.querySelector('.category-name').value;
      category.order = parseInt(categoryDiv.querySelector('.category-order').value) || 1;
      category.collapsible = categoryDiv.querySelector('.category-collapsible').checked;
      category.description = categoryDiv.querySelector('.category-desc').value;

      // Collect specifications for this category
      categoryDiv.querySelectorAll('.specification-editor').forEach(specDiv => {
        const oldSpecKey = specDiv.dataset.specKey;
        const newSpecKey = specDiv.querySelector('.spec-key').value;
        
        const specData = {
          value: specDiv.querySelector('.spec-value').value,
          display_name: specDiv.querySelector('.spec-display-name').value,
          unit: specDiv.querySelector('.spec-unit').value,
          tolerance: specDiv.querySelector('.spec-tolerance').value,
          range: specDiv.querySelector('.spec-range').value,
          min: specDiv.querySelector('.spec-min').value,
          max: specDiv.querySelector('.spec-max').value,
          description: specDiv.querySelector('.spec-description').value
        };

        // Remove empty fields
        Object.keys(specData).forEach(key => {
          if (!specData[key]) delete specData[key];
        });

        // Handle key changes
        if (oldSpecKey !== newSpecKey) {
          delete this.data.specifications.specifications[categoryKey][oldSpecKey];
        }
        
        this.data.specifications.specifications[categoryKey][newSpecKey] = specData;
      });
    });

    // Collect attachment data
    document.querySelectorAll('#attachments-container .attachment-editor').forEach((attachmentDiv, index) => {
      const file = this.data.attachments.files[index];
      
      file.id = attachmentDiv.querySelector('.file-id').value;
      file.name = attachmentDiv.querySelector('.file-name').value;
      file.url = attachmentDiv.querySelector('.file-url').value;
      file.type = attachmentDiv.querySelector('.file-type').value;
      file.size = attachmentDiv.querySelector('.file-size').value;
      file.category = attachmentDiv.querySelector('.file-category').value;
      file.description = attachmentDiv.querySelector('.file-description').value;
      file.access_level = attachmentDiv.querySelector('.file-access').value;
      file.order = parseInt(attachmentDiv.querySelector('.file-order').value) || 1;
      file.featured = attachmentDiv.querySelector('.file-featured').checked;
    });

    // Collect category data
    document.querySelectorAll('.category-editor-simple').forEach(categoryDiv => {
      const type = categoryDiv.dataset.type;
      const oldCategoryKey = categoryDiv.dataset.categoryKey;
      const newCategoryKey = categoryDiv.querySelector('.category-key').value;
      
      const categoryData = {
        name: categoryDiv.querySelector('.category-name').value,
        order: parseInt(categoryDiv.querySelector('.category-order').value) || 1,
        description: categoryDiv.querySelector('.category-description').value
      };

      if (type === 'attachment') {
        categoryData.icon = categoryDiv.querySelector('.category-icon').value;
      }

      // Handle key changes
      const categoriesObj = type === 'specification' 
        ? this.data.specifications.categories 
        : this.data.attachments.categories;
      
      if (oldCategoryKey !== newCategoryKey) {
        delete categoriesObj[oldCategoryKey];
      }
      
      categoriesObj[newCategoryKey] = categoryData;
    });
  }

  exportData() {
    this.collectFormData();
    
    const modal = document.getElementById('import-export-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Export Data';
    modalBody.innerHTML = `
      <div class="export-options">
        <h4>Export Format</h4>
        <div class="format-selection">
          <label>
            <input type="radio" name="export-format" value="json" checked>
            JSON (Complete data structure)
          </label>
          <label>
            <input type="radio" name="export-format" value="csv">
            CSV (Spreadsheet format)
          </label>
        </div>
        
        <h4>Export Options</h4>
        <div class="export-checkboxes">
          <label>
            <input type="checkbox" id="export-specifications" checked>
            Include Specifications
          </label>
          <label>
            <input type="checkbox" id="export-attachments" checked>
            Include Attachments
          </label>
          <label>
            <input type="checkbox" id="export-categories" checked>
            Include Categories
          </label>
        </div>
        
        <div class="export-actions">
          <button id="download-export" class="btn btn-primary">Download Export</button>
          <button id="preview-export" class="btn btn-secondary">Preview Data</button>
        </div>
      </div>
      
      <div id="export-preview" style="display: none;">
        <h4>Data Preview</h4>
        <textarea id="export-preview-text" style="width: 100%; height: 300px; font-family: monospace;" readonly></textarea>
      </div>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('download-export').addEventListener('click', () => {
      const format = document.querySelector('input[name="export-format"]:checked').value;
      const exportData = this.prepareExportData();
      
      try {
        const result = this.bulkOperations.exportData(exportData, format);
        this.showNotification(`Export successful! Downloaded ${result.filename} (${result.records} records)`, 'success');
        modal.style.display = 'none';
      } catch (error) {
        this.showNotification(`Export failed: ${error.message}`, 'error');
      }
    });
    
    document.getElementById('preview-export').addEventListener('click', () => {
      const format = document.querySelector('input[name="export-format"]:checked').value;
      const exportData = this.prepareExportData();
      
      const previewDiv = document.getElementById('export-preview');
      const previewText = document.getElementById('export-preview-text');
      
      if (format === 'json') {
        previewText.value = JSON.stringify(exportData, null, 2);
      } else {
        // For CSV, show a simplified preview
        previewText.value = 'CSV Preview:\n\nSpecifications: ' + 
          Object.keys(exportData.specifications?.specifications || {}).length + ' categories\n' +
          'Attachments: ' + (exportData.attachments?.files?.length || 0) + ' files\n\n' +
          'Use Download Export to get the full CSV file.';
      }
      
      previewDiv.style.display = 'block';
    });
  }

  prepareExportData() {
    const exportData = {};
    
    if (document.getElementById('export-specifications').checked) {
      exportData.specifications = this.data.specifications;
    }
    
    if (document.getElementById('export-attachments').checked) {
      exportData.attachments = this.data.attachments;
    }
    
    return exportData;
  }

  importData() {
    const modal = document.getElementById('import-export-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Import Data';
    modalBody.innerHTML = `
      <div class="import-options">
        <h4>Select File</h4>
        <input type="file" id="import-file" accept=".json,.csv" style="margin-bottom: 15px;">
        
        <h4>Import Options</h4>
        <div class="import-checkboxes">
          <label>
            <input type="checkbox" id="merge-data" checked>
            Merge with existing data (unchecked = replace all)
          </label>
          <label>
            <input type="checkbox" id="validate-before-import" checked>
            Validate data before importing
          </label>
        </div>
        
        <div class="import-actions">
          <button id="process-import" class="btn btn-primary">Import Data</button>
          <button id="validate-only" class="btn btn-secondary">Validate Only</button>
        </div>
      </div>
      
      <div id="import-results" style="display: none;">
        <h4>Import Results</h4>
        <div id="import-status"></div>
      </div>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('process-import').addEventListener('click', async () => {
      await this.processImport(false);
    });
    
    document.getElementById('validate-only').addEventListener('click', async () => {
      await this.processImport(true);
    });
  }

  async processImport(validateOnly = false) {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
      this.showNotification('Please select a file to import', 'error');
      return;
    }
    
    const mergeData = document.getElementById('merge-data').checked;
    const validateFirst = document.getElementById('validate-before-import').checked;
    
    try {
      const result = await this.bulkOperations.importData(file);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const resultsDiv = document.getElementById('import-results');
      const statusDiv = document.getElementById('import-status');
      
      if (validateOnly || !result.validation.valid) {
        // Show validation results
        statusDiv.innerHTML = `
          <div class="validation-summary">
            <h5>Validation Results</h5>
            <p><strong>Format:</strong> ${result.format.toUpperCase()}</p>
            <p><strong>Records:</strong> ${result.records}</p>
            <p><strong>Valid:</strong> ${result.validation.valid ? 'Yes' : 'No'}</p>
            ${result.validation.errors.length > 0 ? `
              <div class="validation-errors">
                <h6>Errors:</h6>
                <ul>
                  ${result.validation.errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
        
        if (validateOnly) {
          this.showNotification('Validation complete', result.validation.valid ? 'success' : 'error');
        } else if (!result.validation.valid) {
          this.showNotification('Import failed: Data validation errors', 'error');
        }
      } else {
        // Import the data
        if (mergeData) {
          this.mergeImportedData(result.data);
        } else {
          this.data = result.data;
        }
        
        this.renderSpecifications();
        this.renderAttachments();
        this.renderCategories();
        
        statusDiv.innerHTML = `
          <div class="import-success">
            <h5>Import Successful</h5>
            <p><strong>Format:</strong> ${result.format.toUpperCase()}</p>
            <p><strong>Records Imported:</strong> ${result.records}</p>
            <p><strong>Mode:</strong> ${mergeData ? 'Merged' : 'Replaced'}</p>
          </div>
        `;
        
        this.showNotification(`Import successful! ${result.records} records imported`, 'success');
        document.getElementById('import-export-modal').style.display = 'none';
      }
      
      resultsDiv.style.display = 'block';
      
    } catch (error) {
      this.showNotification(`Import failed: ${error.message}`, 'error');
    }
  }

  mergeImportedData(importedData) {
    if (importedData.specifications) {
      if (!this.data.specifications) this.data.specifications = {};
      
      // Merge categories
      if (importedData.specifications.categories) {
        if (!this.data.specifications.categories) this.data.specifications.categories = {};
        Object.assign(this.data.specifications.categories, importedData.specifications.categories);
      }
      
      // Merge specifications
      if (importedData.specifications.specifications) {
        if (!this.data.specifications.specifications) this.data.specifications.specifications = {};
        Object.keys(importedData.specifications.specifications).forEach(categoryKey => {
          if (!this.data.specifications.specifications[categoryKey]) {
            this.data.specifications.specifications[categoryKey] = {};
          }
          Object.assign(this.data.specifications.specifications[categoryKey], 
                       importedData.specifications.specifications[categoryKey]);
        });
      }
    }
    
    if (importedData.attachments) {
      if (!this.data.attachments) this.data.attachments = {};
      
      // Merge categories
      if (importedData.attachments.categories) {
        if (!this.data.attachments.categories) this.data.attachments.categories = {};
        Object.assign(this.data.attachments.categories, importedData.attachments.categories);
      }
      
      // Merge files (avoid duplicates by ID)
      if (importedData.attachments.files) {
        if (!this.data.attachments.files) this.data.attachments.files = [];
        
        importedData.attachments.files.forEach(newFile => {
          const existingIndex = this.data.attachments.files.findIndex(f => f.id === newFile.id);
          if (existingIndex >= 0) {
            this.data.attachments.files[existingIndex] = newFile; // Replace existing
          } else {
            this.data.attachments.files.push(newFile); // Add new
          }
        });
      }
    }
  }

  showBulkOperations() {
    const modal = document.getElementById('bulk-operations-modal');
    modal.style.display = 'block';
  }

  async performBulkExport() {
    const productIds = document.getElementById('bulk-product-ids').value
      .split(',')
      .map(id => id.trim())
      .filter(id => id);
    
    if (productIds.length === 0) {
      this.showNotification('Please enter at least one product ID', 'error');
      return;
    }
    
    const format = document.getElementById('bulk-export-format').value;
    
    try {
      const result = await this.bulkOperations.batchExport(productIds, format);
      this.showNotification(`Bulk export successful! Downloaded ${result.filename} with data from ${productIds.length} products`, 'success');
    } catch (error) {
      this.showNotification(`Bulk export failed: ${error.message}`, 'error');
    }
  }

  async performBulkImport() {
    const fileInput = document.getElementById('bulk-import-file');
    const file = fileInput.files[0];
    
    if (!file) {
      this.showNotification('Please select a file for bulk import', 'error');
      return;
    }
    
    try {
      const result = await this.bulkOperations.batchImport(file);
      
      const resultsDiv = document.getElementById('bulk-import-results');
      
      if (result.success) {
        resultsDiv.innerHTML = `
          <div class="bulk-import-success">
            <h5>Bulk Import Results</h5>
            <p><strong>Total Products:</strong> ${result.totalProducts}</p>
            <p><strong>Successful:</strong> ${result.successfulProducts}</p>
            <p><strong>Failed:</strong> ${result.totalProducts - result.successfulProducts}</p>
            
            ${result.results.length > 0 ? `
              <div class="product-results">
                <h6>Product Details:</h6>
                <ul>
                  ${result.results.map(r => `
                    <li>
                      Product ${r.productId}: 
                      ${r.success ? `✓ Success (${r.records} records)` : `✗ Failed - ${r.error}`}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
        
        this.showNotification(`Bulk import completed! ${result.successfulProducts}/${result.totalProducts} products imported successfully`, 'success');
      } else {
        resultsDiv.innerHTML = `
          <div class="bulk-import-error">
            <h5>Bulk Import Failed</h5>
            <p><strong>Error:</strong> ${result.error}</p>
          </div>
        `;
        
        this.showNotification(`Bulk import failed: ${result.error}`, 'error');
      }
      
    } catch (error) {
      this.showNotification(`Bulk import failed: ${error.message}`, 'error');
    }
  }

  async validateFile() {
    const fileInput = document.getElementById('validate-file');
    const file = fileInput.files[0];
    
    if (!file) {
      this.showNotification('Please select a file to validate', 'error');
      return;
    }
    
    try {
      const result = await this.bulkOperations.importData(file);
      
      const resultsDiv = document.getElementById('validation-results');
      
      resultsDiv.innerHTML = `
        <div class="validation-results">
          <h5>Validation Results</h5>
          <p><strong>File:</strong> ${file.name}</p>
          <p><strong>Format:</strong> ${result.format?.toUpperCase() || 'Unknown'}</p>
          <p><strong>Valid:</strong> ${result.success && result.validation?.valid ? 'Yes' : 'No'}</p>
          
          ${result.success ? `
            <p><strong>Records:</strong> ${result.records}</p>
            
            ${result.validation?.errors?.length > 0 ? `
              <div class="validation-errors">
                <h6>Validation Errors:</h6>
                <ul>
                  ${result.validation.errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
              </div>
            ` : '<p class="validation-success">✓ All validation checks passed</p>'}
          ` : `
            <div class="validation-errors">
              <h6>File Error:</h6>
              <p>${result.error}</p>
            </div>
          `}
        </div>
      `;
      
      this.showNotification('File validation complete', result.success && result.validation?.valid ? 'success' : 'error');
      
    } catch (error) {
      this.showNotification(`Validation failed: ${error.message}`, 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
      padding: 12px 20px;
      border-radius: 4px;
      border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
      z-index: 1000;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease;
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  /**
   * Synchronization methods
   */
  setupSyncListeners() {
    // Listen for sync events
    this.syncSystem.on('syncComplete', (data) => {
      this.updateSyncStatus();
      this.showNotification(`Sync completed: ${data.changesProcessed} changes processed`, 'success');
    });

    this.syncSystem.on('syncError', (data) => {
      this.showNotification(`Sync error: ${data.error}`, 'error');
    });

    this.syncSystem.on('specificationChanged', (data) => {
      this.handleRemoteSpecificationChange(data);
    });

    this.syncSystem.on('attachmentChanged', (data) => {
      this.handleRemoteAttachmentChange(data);
    });

    this.syncSystem.on('categoryChanged', (data) => {
      this.handleRemoteCategoryChange(data);
    });

    this.syncSystem.on('remoteSync', (data) => {
      this.showNotification('Remote changes detected - refreshing data', 'info');
      this.loadProductData();
    });

    this.syncSystem.on('refreshRequired', () => {
      this.loadProductData();
    });
  }

  queueSpecificationChange(action, data) {
    return this.syncSystem.queueChange('specification', {
      action: action,
      specifications: data,
      timestamp: Date.now()
    });
  }

  queueAttachmentChange(action, data) {
    return this.syncSystem.queueChange('attachment', {
      action: action,
      ...data,
      timestamp: Date.now()
    });
  }

  queueCategoryChange(action, data) {
    return this.syncSystem.queueChange('category', {
      action: action,
      ...data,
      timestamp: Date.now()
    });
  }

  handleRemoteSpecificationChange(data) {
    // Update local data without triggering new sync
    this.data.specifications = data.data;
    this.renderSpecifications();
  }

  handleRemoteAttachmentChange(data) {
    // Update local data without triggering new sync
    this.data.attachments = data.data;
    this.renderAttachments();
  }

  handleRemoteCategoryChange(data) {
    // Update local data without triggering new sync
    if (data.change.data.type === 'specification') {
      this.data.specifications.categories = data.data;
    } else {
      this.data.attachments.categories = data.data;
    }
    this.renderCategories();
  }

  showSyncStatus() {
    const modal = document.getElementById('sync-status-modal');
    this.updateSyncStatus();
    modal.style.display = 'block';
  }

  updateSyncStatus() {
    const status = this.syncSystem.getSyncStatus();
    
    document.getElementById('sync-enabled-status').textContent = status.enabled ? 'Yes' : 'No';
    document.getElementById('last-sync-time').textContent = status.lastSync 
      ? new Date(status.lastSync).toLocaleString() 
      : 'Never';
    document.getElementById('pending-changes-count').textContent = status.pendingChanges;
    document.getElementById('connection-status').textContent = status.isOnline ? 'Online' : 'Offline';
    
    // Update sync log
    this.updateSyncLog();
  }

  updateSyncLog() {
    const logContent = document.getElementById('sync-log-content');
    const pendingChanges = this.syncSystem.getPendingChanges();
    
    if (pendingChanges.length === 0) {
      logContent.innerHTML = '<p>No pending changes</p>';
      return;
    }
    
    const logHtml = pendingChanges.map(change => `
      <div class="sync-log-entry">
        <span class="log-time">${new Date(change.timestamp).toLocaleTimeString()}</span>
        <span class="log-type">${change.type}</span>
        <span class="log-status status-${change.status}">${change.status}</span>
        ${change.error ? `<span class="log-error">${change.error}</span>` : ''}
      </div>
    `).join('');
    
    logContent.innerHTML = logHtml;
  }

  toggleSync() {
    const currentStatus = this.syncSystem.getSyncStatus();
    this.syncSystem.setSyncEnabled(!currentStatus.enabled);
    this.updateSyncStatus();
    
    const newStatus = currentStatus.enabled ? 'disabled' : 'enabled';
    this.showNotification(`Synchronization ${newStatus}`, 'info');
  }

  async forceSync() {
    try {
      await this.syncSystem.sync();
      this.showNotification('Force sync completed', 'success');
      this.updateSyncStatus();
    } catch (error) {
      this.showNotification(`Force sync failed: ${error.message}`, 'error');
    }
  }

  clearPendingChanges() {
    this.syncSystem.clearPendingChanges();
    this.updateSyncStatus();
    this.showNotification('Pending changes cleared', 'info');
  }

  forceRefresh() {
    this.syncSystem.forceRefresh();
    this.showNotification('Force refresh initiated', 'info');
  }
}

// Initialize admin interface when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're in admin mode
  if (window.location.search.includes('admin=true') || window.location.pathname.includes('admin')) {
    new MetafieldAdmin();
  }
});

// Export for use in other contexts
window.MetafieldAdmin = MetafieldAdmin;