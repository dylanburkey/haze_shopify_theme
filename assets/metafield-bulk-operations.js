/**
 * Metafield Bulk Operations
 * Handles bulk import/export functionality for product specifications and attachments
 */

class MetafieldBulkOperations {
  constructor() {
    this.supportedFormats = ['json', 'csv'];
    this.validationSchema = null;
    this.loadValidationSchema();
  }

  async loadValidationSchema() {
    try {
      // In a real implementation, this would load from the schema files
      this.validationSchema = {
        specifications: {
          required: ['specifications'],
          properties: {
            specifications: { type: 'object' },
            categories: { type: 'object' }
          }
        },
        attachments: {
          required: ['files'],
          properties: {
            files: { type: 'array' },
            categories: { type: 'object' }
          }
        }
      };
    } catch (error) {
      console.warn('Could not load validation schema:', error);
    }
  }

  /**
   * Export data to various formats
   */
  exportData(data, format = 'json', filename = null) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const defaultFilename = `metafield-export-${timestamp}`;

    switch (format.toLowerCase()) {
      case 'json':
        return this.exportJSON(data, filename || `${defaultFilename}.json`);
      case 'csv':
        return this.exportCSV(data, filename || `${defaultFilename}.csv`);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  exportJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, filename);
    
    return {
      success: true,
      format: 'json',
      filename: filename,
      size: blob.size,
      records: this.countRecords(data)
    };
  }

  exportCSV(data, filename) {
    let csvContent = '';
    
    // Export specifications as CSV
    if (data.specifications && data.specifications.specifications) {
      csvContent += this.specificationsToCSV(data.specifications);
    }
    
    // Add separator if both specifications and attachments exist
    if (data.specifications && data.attachments) {
      csvContent += '\n\n';
    }
    
    // Export attachments as CSV
    if (data.attachments && data.attachments.files) {
      csvContent += this.attachmentsToCSV(data.attachments);
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadBlob(blob, filename);
    
    return {
      success: true,
      format: 'csv',
      filename: filename,
      size: blob.size,
      records: this.countRecords(data)
    };
  }

  specificationsToCSV(specifications) {
    let csv = 'Type,Category,Category_Name,Category_Order,Spec_Key,Display_Name,Value,Unit,Tolerance,Range,Min,Max,Description\n';
    
    // Add category definitions
    Object.keys(specifications.categories || {}).forEach(categoryKey => {
      const category = specifications.categories[categoryKey];
      csv += `category,"${categoryKey}","${this.escapeCsv(category.name)}",${category.order},,,,,,,,,"${this.escapeCsv(category.description || '')}"\n`;
    });
    
    // Add specifications
    Object.keys(specifications.specifications || {}).forEach(categoryKey => {
      const categorySpecs = specifications.specifications[categoryKey];
      Object.keys(categorySpecs).forEach(specKey => {
        const spec = categorySpecs[specKey];
        csv += `specification,"${categoryKey}",,"","${specKey}","${this.escapeCsv(spec.display_name || '')}","${this.escapeCsv(spec.value || '')}","${this.escapeCsv(spec.unit || '')}","${this.escapeCsv(spec.tolerance || '')}","${this.escapeCsv(spec.range || '')}","${this.escapeCsv(spec.min || '')}","${this.escapeCsv(spec.max || '')}","${this.escapeCsv(spec.description || '')}"\n`;
      });
    });
    
    return csv;
  }

  attachmentsToCSV(attachments) {
    let csv = 'Type,Category,Category_Name,Category_Order,Category_Icon,File_ID,File_Name,File_URL,File_Type,File_Size,File_Description,Access_Level,Featured,Order\n';
    
    // Add category definitions
    Object.keys(attachments.categories || {}).forEach(categoryKey => {
      const category = attachments.categories[categoryKey];
      csv += `category,"${categoryKey}","${this.escapeCsv(category.name)}",${category.order},"${this.escapeCsv(category.icon || '')}",,,,,,"${this.escapeCsv(category.description || '')}",,,\n`;
    });
    
    // Add files
    (attachments.files || []).forEach(file => {
      csv += `file,"${file.category}",,,,"${file.id}","${this.escapeCsv(file.name)}","${this.escapeCsv(file.url)}","${file.type}","${this.escapeCsv(file.size || '')}","${this.escapeCsv(file.description || '')}","${file.access_level || 'public'}",${file.featured || false},${file.order || 1}\n`;
    });
    
    return csv;
  }

  /**
   * Import data from various formats
   */
  async importData(file, format = null) {
    const detectedFormat = format || this.detectFormat(file);
    
    try {
      let data;
      switch (detectedFormat.toLowerCase()) {
        case 'json':
          data = await this.importJSON(file);
          break;
        case 'csv':
          data = await this.importCSV(file);
          break;
        default:
          throw new Error(`Unsupported import format: ${detectedFormat}`);
      }
      
      // Validate imported data
      const validation = this.validateImportedData(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      return {
        success: true,
        format: detectedFormat,
        data: data,
        records: this.countRecords(data),
        validation: validation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        format: detectedFormat
      };
    }
  }

  async importJSON(file) {
    const text = await this.readFileAsText(file);
    return JSON.parse(text);
  }

  async importCSV(file) {
    const text = await this.readFileAsText(file);
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Parse CSV headers
    const headers = this.parseCSVLine(lines[0]);
    
    // Determine if this is specifications or attachments CSV
    const isSpecifications = headers.includes('Spec_Key');
    const isAttachments = headers.includes('File_ID');
    
    if (isSpecifications) {
      return this.parseSpecificationsCSV(lines);
    } else if (isAttachments) {
      return this.parseAttachmentsCSV(lines);
    } else {
      throw new Error('CSV format not recognized. Must contain either Spec_Key or File_ID columns.');
    }
  }

  parseSpecificationsCSV(lines) {
    const headers = this.parseCSVLine(lines[0]);
    const data = {
      specifications: {
        specifications: {},
        categories: {}
      }
    };
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      if (row.Type === 'category') {
        data.specifications.categories[row.Category] = {
          name: row.Category_Name,
          order: parseInt(row.Category_Order) || 1,
          collapsible: true,
          description: row.Description || ''
        };
      } else if (row.Type === 'specification') {
        if (!data.specifications.specifications[row.Category]) {
          data.specifications.specifications[row.Category] = {};
        }
        
        const spec = {
          value: row.Value
        };
        
        if (row.Display_Name) spec.display_name = row.Display_Name;
        if (row.Unit) spec.unit = row.Unit;
        if (row.Tolerance) spec.tolerance = row.Tolerance;
        if (row.Range) spec.range = row.Range;
        if (row.Min) spec.min = row.Min;
        if (row.Max) spec.max = row.Max;
        if (row.Description) spec.description = row.Description;
        
        data.specifications.specifications[row.Category][row.Spec_Key] = spec;
      }
    }
    
    return data;
  }

  parseAttachmentsCSV(lines) {
    const headers = this.parseCSVLine(lines[0]);
    const data = {
      attachments: {
        files: [],
        categories: {}
      }
    };
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      if (row.Type === 'category') {
        data.attachments.categories[row.Category] = {
          name: row.Category_Name,
          icon: row.Category_Icon || 'file-generic',
          order: parseInt(row.Category_Order) || 1,
          description: row.File_Description || ''
        };
      } else if (row.Type === 'file') {
        const file = {
          id: row.File_ID,
          name: row.File_Name,
          url: row.File_URL,
          type: row.File_Type,
          category: row.Category,
          access_level: row.Access_Level || 'public',
          featured: row.Featured === 'true' || row.Featured === '1',
          order: parseInt(row.Order) || 1
        };
        
        if (row.File_Size) file.size = row.File_Size;
        if (row.File_Description) file.description = row.File_Description;
        
        data.attachments.files.push(file);
      }
    }
    
    return data;
  }

  /**
   * Validation functions
   */
  validateImportedData(data) {
    const errors = [];
    
    // Validate specifications
    if (data.specifications) {
      const specErrors = this.validateSpecifications(data.specifications);
      errors.push(...specErrors);
    }
    
    // Validate attachments
    if (data.attachments) {
      const attachmentErrors = this.validateAttachments(data.attachments);
      errors.push(...attachmentErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  validateSpecifications(specifications) {
    const errors = [];
    
    if (!specifications.specifications || typeof specifications.specifications !== 'object') {
      errors.push('Specifications must contain a "specifications" object');
      return errors;
    }
    
    // Validate categories
    Object.keys(specifications.categories || {}).forEach(categoryKey => {
      const category = specifications.categories[categoryKey];
      if (!category.name) {
        errors.push(`Category "${categoryKey}" missing required "name" field`);
      }
      if (!category.order || typeof category.order !== 'number') {
        errors.push(`Category "${categoryKey}" missing or invalid "order" field`);
      }
    });
    
    // Validate specifications
    Object.keys(specifications.specifications).forEach(categoryKey => {
      const categorySpecs = specifications.specifications[categoryKey];
      if (typeof categorySpecs !== 'object') {
        errors.push(`Specifications for category "${categoryKey}" must be an object`);
        return;
      }
      
      Object.keys(categorySpecs).forEach(specKey => {
        const spec = categorySpecs[specKey];
        if (!spec.value) {
          errors.push(`Specification "${categoryKey}.${specKey}" missing required "value" field`);
        }
      });
    });
    
    return errors;
  }

  validateAttachments(attachments) {
    const errors = [];
    
    if (!Array.isArray(attachments.files)) {
      errors.push('Attachments must contain a "files" array');
      return errors;
    }
    
    // Validate categories
    Object.keys(attachments.categories || {}).forEach(categoryKey => {
      const category = attachments.categories[categoryKey];
      if (!category.name) {
        errors.push(`Attachment category "${categoryKey}" missing required "name" field`);
      }
      if (!category.icon) {
        errors.push(`Attachment category "${categoryKey}" missing required "icon" field`);
      }
      if (!category.order || typeof category.order !== 'number') {
        errors.push(`Attachment category "${categoryKey}" missing or invalid "order" field`);
      }
    });
    
    // Validate files
    attachments.files.forEach((file, index) => {
      const requiredFields = ['id', 'name', 'url', 'type', 'category'];
      requiredFields.forEach(field => {
        if (!file[field]) {
          errors.push(`File at index ${index} missing required "${field}" field`);
        }
      });
      
      // Validate URL format
      if (file.url && !this.isValidUrl(file.url)) {
        errors.push(`File "${file.name || index}" has invalid URL format`);
      }
      
      // Validate access level
      if (file.access_level && !['public', 'customer', 'wholesale'].includes(file.access_level)) {
        errors.push(`File "${file.name || index}" has invalid access_level. Must be: public, customer, or wholesale`);
      }
    });
    
    return errors;
  }

  /**
   * Utility functions
   */
  detectFormat(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (this.supportedFormats.includes(extension)) {
      return extension;
    }
    
    // Try to detect by MIME type
    if (file.type === 'application/json') return 'json';
    if (file.type === 'text/csv' || file.type === 'application/csv') return 'csv';
    
    // Default to JSON
    return 'json';
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  escapeCsv(value) {
    if (typeof value !== 'string') return value;
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
      return value.replace(/"/g, '""');
    }
    return value;
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  countRecords(data) {
    let count = 0;
    
    if (data.specifications) {
      // Count categories
      count += Object.keys(data.specifications.categories || {}).length;
      
      // Count specifications
      Object.keys(data.specifications.specifications || {}).forEach(categoryKey => {
        count += Object.keys(data.specifications.specifications[categoryKey] || {}).length;
      });
    }
    
    if (data.attachments) {
      // Count categories
      count += Object.keys(data.attachments.categories || {}).length;
      
      // Count files
      count += (data.attachments.files || []).length;
    }
    
    return count;
  }

  /**
   * Batch operations for multiple products
   */
  async batchExport(productIds, format = 'json') {
    const batchData = {};
    
    // In a real implementation, this would fetch data from Shopify API
    // For now, we'll simulate with localStorage data
    productIds.forEach(productId => {
      const productData = localStorage.getItem(`metafield-admin-data-${productId}`);
      if (productData) {
        batchData[productId] = JSON.parse(productData);
      }
    });
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `batch-export-${timestamp}.${format}`;
    
    return this.exportData(batchData, format, filename);
  }

  async batchImport(file, format = null) {
    const importResult = await this.importData(file, format);
    
    if (!importResult.success) {
      return importResult;
    }
    
    const batchData = importResult.data;
    const results = [];
    
    // Process each product in the batch
    Object.keys(batchData).forEach(productId => {
      try {
        localStorage.setItem(`metafield-admin-data-${productId}`, JSON.stringify(batchData[productId]));
        results.push({
          productId: productId,
          success: true,
          records: this.countRecords(batchData[productId])
        });
      } catch (error) {
        results.push({
          productId: productId,
          success: false,
          error: error.message
        });
      }
    });
    
    return {
      success: true,
      format: importResult.format,
      results: results,
      totalProducts: results.length,
      successfulProducts: results.filter(r => r.success).length
    };
  }
}

// Export for use in other modules
window.MetafieldBulkOperations = MetafieldBulkOperations;