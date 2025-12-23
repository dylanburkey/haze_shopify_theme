/**
 * PDF Export System for Product Specifications and Comparisons
 * Generates PDF documents with proper formatting, product images, and branding
 * Requirements: 7.1, 7.4, 7.5
 */

class PDFExporter {
  constructor() {
    this.jsPDFLoaded = false;
    this.loadJsPDF();
  }

  /**
   * Loads jsPDF library dynamically
   */
  async loadJsPDF() {
    if (window.jsPDF) {
      this.jsPDFLoaded = true;
      return;
    }

    try {
      // Load jsPDF from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        this.jsPDFLoaded = true;
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to load jsPDF:', error);
    }
  }

  /**
   * Waits for jsPDF to be loaded
   */
  async waitForJsPDF() {
    while (!this.jsPDFLoaded || !window.jsPDF) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Exports product specifications to PDF
   * @param {Object} product - Product object with specifications
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportSpecifications(product, options = {}) {
    await this.waitForJsPDF();
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF();
    
    // Set up document properties
    doc.setProperties({
      title: `${product.name} - Technical Specifications`,
      subject: 'Product Technical Specifications',
      author: options.storeName || 'Store',
      creator: 'Forge Industrial Theme'
    });

    let yPosition = 20;
    
    // Add header with branding
    yPosition = this.addHeader(doc, options, yPosition);
    
    // Add product title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(product.name, 20, yPosition);
    yPosition += 15;
    
    // Add product image if available
    if (product.image && options.includeImages !== false) {
      try {
        yPosition = await this.addProductImage(doc, product.image, yPosition);
      } catch (error) {
        console.warn('Failed to add product image to PDF:', error);
      }
    }
    
    // Add specifications table
    if (product.specifications) {
      yPosition = this.addSpecificationsTable(doc, product.specifications, yPosition);
    }
    
    // Add footer
    this.addFooter(doc, options);
    
    // Save the PDF
    const filename = `${this.sanitizeFilename(product.name)}-specifications.pdf`;
    doc.save(filename);
  }

  /**
   * Exports product comparison to PDF
   * @param {Array} products - Array of products to compare
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportComparison(products, options = {}) {
    await this.waitForJsPDF();
    
    if (!products || products.length === 0) {
      throw new Error('No products provided for comparison export');
    }
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF('landscape'); // Use landscape for comparison tables
    
    // Set up document properties
    doc.setProperties({
      title: 'Product Comparison',
      subject: 'Product Technical Comparison',
      author: options.storeName || 'Store',
      creator: 'Forge Industrial Theme'
    });

    let yPosition = 20;
    
    // Add header with branding
    yPosition = this.addHeader(doc, options, yPosition);
    
    // Add comparison title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    const productNames = products.map(p => p.name).join(' vs ');
    const title = productNames.length > 60 ? 'Product Comparison' : productNames;
    doc.text(title, 20, yPosition);
    yPosition += 15;
    
    // Add product images if available
    if (options.includeImages !== false) {
      try {
        yPosition = await this.addComparisonImages(doc, products, yPosition);
      } catch (error) {
        console.warn('Failed to add product images to comparison PDF:', error);
      }
    }
    
    // Add comparison table
    yPosition = this.addComparisonTable(doc, products, yPosition);
    
    // Add footer
    this.addFooter(doc, options);
    
    // Save the PDF
    const filename = `product-comparison-${Date.now()}.pdf`;
    doc.save(filename);
  }

  /**
   * Adds header with branding to PDF
   * @param {Object} doc - jsPDF document
   * @param {Object} options - Options including branding
   * @param {number} yPosition - Current Y position
   * @returns {number} - New Y position
   */
  addHeader(doc, options, yPosition) {
    // Add store name/logo
    if (options.storeName) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(options.storeName, 20, yPosition);
    }
    
    // Add date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated: ${date}`, doc.internal.pageSize.width - 60, yPosition);
    
    // Add separator line
    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, doc.internal.pageSize.width - 20, yPosition);
    
    return yPosition + 10;
  }

  /**
   * Adds product image to PDF
   * @param {Object} doc - jsPDF document
   * @param {string} imageUrl - Product image URL
   * @param {number} yPosition - Current Y position
   * @returns {Promise<number>} - New Y position
   */
  async addProductImage(doc, imageUrl, yPosition) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const maxWidth = 60;
          const maxHeight = 60;
          
          // Calculate scaled dimensions
          let { width, height } = this.calculateImageDimensions(
            img.width, img.height, maxWidth, maxHeight
          );
          
          // Add image to PDF
          doc.addImage(img, 'JPEG', 20, yPosition, width, height);
          resolve(yPosition + height + 10);
        } catch (error) {
          console.warn('Error adding image to PDF:', error);
          resolve(yPosition);
        }
      };
      
      img.onerror = () => {
        console.warn('Failed to load image for PDF:', imageUrl);
        resolve(yPosition);
      };
      
      // Set timeout to avoid hanging
      setTimeout(() => resolve(yPosition), 5000);
      
      img.src = imageUrl;
    });
  }

  /**
   * Adds comparison product images to PDF
   * @param {Object} doc - jsPDF document
   * @param {Array} products - Products array
   * @param {number} yPosition - Current Y position
   * @returns {Promise<number>} - New Y position
   */
  async addComparisonImages(doc, products, yPosition) {
    const imagePromises = products.map((product, index) => {
      if (!product.image) return Promise.resolve(null);
      
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            const maxWidth = 40;
            const maxHeight = 40;
            const xPosition = 20 + (index * 70);
            
            let { width, height } = this.calculateImageDimensions(
              img.width, img.height, maxWidth, maxHeight
            );
            
            doc.addImage(img, 'JPEG', xPosition, yPosition, width, height);
            
            // Add product name below image
            doc.setFontSize(8);
            doc.text(product.name.substring(0, 15), xPosition, yPosition + height + 8);
            
            resolve({ width, height });
          } catch (error) {
            resolve(null);
          }
        };
        
        img.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 3000);
        
        img.src = product.image;
      });
    });
    
    const results = await Promise.all(imagePromises);
    const maxHeight = Math.max(...results.filter(r => r).map(r => r.height), 0);
    
    return yPosition + maxHeight + 20;
  }

  /**
   * Adds specifications table to PDF
   * @param {Object} doc - jsPDF document
   * @param {Object} specifications - Specifications data
   * @param {number} yPosition - Current Y position
   * @returns {number} - New Y position
   */
  addSpecificationsTable(doc, specifications, yPosition) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Technical Specifications', 20, yPosition);
    yPosition += 10;
    
    // Table setup
    const tableData = [];
    const pageWidth = doc.internal.pageSize.width;
    const tableWidth = pageWidth - 40;
    const colWidth = tableWidth / 2;
    
    // Process specifications by category
    for (const [categoryKey, categorySpecs] of Object.entries(specifications)) {
      if (typeof categorySpecs !== 'object') continue;
      
      // Add category header
      tableData.push([{
        content: this.formatCategoryName(categoryKey),
        colSpan: 2,
        styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      }]);
      
      // Add specifications
      for (const [specKey, specValue] of Object.entries(categorySpecs)) {
        if (typeof specValue === 'object' && specValue.value) {
          const formattedValue = this.formatSpecificationValue(specValue);
          tableData.push([
            this.formatSpecName(specKey),
            formattedValue
          ]);
        }
      }
    }
    
    // Draw table manually for better control
    yPosition = this.drawTable(doc, tableData, 20, yPosition, colWidth);
    
    return yPosition + 10;
  }

  /**
   * Adds comparison table to PDF
   * @param {Object} doc - jsPDF document
   * @param {Array} products - Products to compare
   * @param {number} yPosition - Current Y position
   * @returns {number} - New Y position
   */
  addComparisonTable(doc, products, yPosition) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Specification Comparison', 20, yPosition);
    yPosition += 10;
    
    // Get all unique specification keys
    const allSpecKeys = this.getAllSpecificationKeys(products);
    
    // Table setup
    const pageWidth = doc.internal.pageSize.width;
    const tableWidth = pageWidth - 40;
    const specColWidth = tableWidth * 0.3;
    const productColWidth = (tableWidth * 0.7) / products.length;
    
    // Table header
    const headerRow = ['Specification', ...products.map(p => p.name.substring(0, 20))];
    yPosition = this.drawTableRow(doc, headerRow, 20, yPosition, 
      [specColWidth, ...Array(products.length).fill(productColWidth)], true);
    
    // Table rows
    for (const specKey of allSpecKeys) {
      const [categoryKey, specName] = specKey.split('.');
      const displayName = this.formatSpecName(specName);
      
      const rowData = [displayName];
      
      // Get values for each product
      for (const product of products) {
        const value = this.getSpecificationValue(product, categoryKey, specName);
        rowData.push(value || 'N/A');
      }
      
      yPosition = this.drawTableRow(doc, rowData, 20, yPosition,
        [specColWidth, ...Array(products.length).fill(productColWidth)]);
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPosition = 20;
      }
    }
    
    return yPosition + 10;
  }

  /**
   * Draws a table row
   * @param {Object} doc - jsPDF document
   * @param {Array} rowData - Row data array
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Array} colWidths - Column widths array
   * @param {boolean} isHeader - Whether this is a header row
   * @returns {number} - New Y position
   */
  drawTableRow(doc, rowData, x, y, colWidths, isHeader = false) {
    const rowHeight = 8;
    let currentX = x;
    
    // Set font style
    if (isHeader) {
      doc.setFont(undefined, 'bold');
      doc.setFillColor(240, 240, 240);
    } else {
      doc.setFont(undefined, 'normal');
      doc.setFillColor(255, 255, 255);
    }
    
    doc.setFontSize(8);
    doc.setDrawColor(200, 200, 200);
    
    // Draw cells
    for (let i = 0; i < rowData.length; i++) {
      const cellWidth = colWidths[i] || colWidths[colWidths.length - 1];
      
      // Draw cell background
      doc.rect(currentX, y - rowHeight + 2, cellWidth, rowHeight, 'FD');
      
      // Draw cell text
      const text = String(rowData[i]).substring(0, 30); // Truncate long text
      doc.text(text, currentX + 2, y - 2);
      
      currentX += cellWidth;
    }
    
    return y + rowHeight;
  }

  /**
   * Draws a simple table
   * @param {Object} doc - jsPDF document
   * @param {Array} tableData - Table data
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} colWidth - Column width
   * @returns {number} - New Y position
   */
  drawTable(doc, tableData, x, y, colWidth) {
    const rowHeight = 8;
    let currentY = y;
    
    doc.setFontSize(8);
    doc.setDrawColor(200, 200, 200);
    
    for (const row of tableData) {
      if (Array.isArray(row)) {
        // Regular row
        doc.setFont(undefined, 'normal');
        doc.setFillColor(255, 255, 255);
        
        // Draw cells
        doc.rect(x, currentY - rowHeight + 2, colWidth, rowHeight, 'FD');
        doc.rect(x + colWidth, currentY - rowHeight + 2, colWidth, rowHeight, 'FD');
        
        // Add text
        doc.text(String(row[0]).substring(0, 25), x + 2, currentY - 2);
        doc.text(String(row[1]).substring(0, 25), x + colWidth + 2, currentY - 2);
      } else if (row.content) {
        // Header row
        doc.setFont(undefined, 'bold');
        doc.setFillColor(240, 240, 240);
        
        doc.rect(x, currentY - rowHeight + 2, colWidth * 2, rowHeight, 'FD');
        doc.text(String(row.content), x + 2, currentY - 2);
      }
      
      currentY += rowHeight;
      
      // Check if we need a new page
      if (currentY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        currentY = 20;
      }
    }
    
    return currentY;
  }

  /**
   * Adds footer to PDF
   * @param {Object} doc - jsPDF document
   * @param {Object} options - Options
   */
  addFooter(doc, options) {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    // Add footer text
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    
    const footerText = options.footerText || 'Generated by Forge Industrial Theme';
    doc.text(footerText, 20, pageHeight - 10);
    
    // Add page number
    const pageNum = `Page ${doc.internal.getCurrentPageInfo().pageNumber}`;
    doc.text(pageNum, pageWidth - 40, pageHeight - 10);
  }

  /**
   * Gets all unique specification keys across products
   * @param {Array} products - Products array
   * @returns {Array} - Unique specification keys
   */
  getAllSpecificationKeys(products) {
    const keys = new Set();
    
    for (const product of products) {
      if (product.specifications) {
        for (const categoryKey of Object.keys(product.specifications)) {
          const categorySpecs = product.specifications[categoryKey];
          if (categorySpecs && typeof categorySpecs === 'object') {
            for (const specKey of Object.keys(categorySpecs)) {
              keys.add(`${categoryKey}.${specKey}`);
            }
          }
        }
      }
    }
    
    return Array.from(keys).sort();
  }

  /**
   * Gets specification value from product
   * @param {Object} product - Product object
   * @param {string} categoryKey - Category key
   * @param {string} specName - Specification name
   * @returns {string} - Formatted specification value
   */
  getSpecificationValue(product, categoryKey, specName) {
    if (product.specifications && 
        product.specifications[categoryKey] && 
        product.specifications[categoryKey][specName]) {
      return this.formatSpecificationValue(product.specifications[categoryKey][specName]);
    }
    return null;
  }

  /**
   * Formats specification value for display
   * @param {Object} specValue - Specification value object
   * @returns {string} - Formatted value
   */
  formatSpecificationValue(specValue) {
    if (typeof specValue === 'string') return specValue;
    if (!specValue || !specValue.value) return '';
    
    let formatted = String(specValue.value);
    
    if (specValue.unit) {
      formatted += ` ${specValue.unit}`;
    }
    
    if (specValue.tolerance) {
      formatted += ` (${specValue.tolerance})`;
    } else if (specValue.range) {
      formatted += ` (${specValue.range})`;
    }
    
    return formatted;
  }

  /**
   * Formats category name for display
   * @param {string} categoryKey - Category key
   * @returns {string} - Formatted category name
   */
  formatCategoryName(categoryKey) {
    return categoryKey
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Formats specification name for display
   * @param {string} specName - Specification name
   * @returns {string} - Formatted name
   */
  formatSpecName(specName) {
    return specName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Calculates scaled image dimensions
   * @param {number} originalWidth - Original width
   * @param {number} originalHeight - Original height
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @returns {Object} - Scaled dimensions
   */
  calculateImageDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width, height };
  }

  /**
   * Sanitizes filename for safe file saving
   * @param {string} filename - Original filename
   * @returns {string} - Sanitized filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
}

// Global instance
window.PDFExporter = PDFExporter;

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePDFExporter);
} else {
  initializePDFExporter();
}

function initializePDFExporter() {
  if (!window.pdfExporter) {
    window.pdfExporter = new PDFExporter();
  }
}

export default PDFExporter;