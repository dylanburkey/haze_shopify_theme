/**
 * Property-Based Tests for Product Catalog Completeness
 * Feature: marketing-preset-showcase, Property 1: Product Catalog Completeness
 * 
 * Validates: Requirements 1.1, 1.2, 1.4, 1.5
 * 
 * Property 1: Product Catalog Completeness
 * For any demo store setup, the product catalog should contain at least 50 industrial/B2B products 
 * distributed across manufacturing, industrial equipment, tools, and safety product categories, 
 * with each product having complete technical specifications, realistic pricing, inventory levels, 
 * and multiple images
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  return result;
}

// Load generated catalog data
let catalogData = null;
let metafieldData = null;
let imageManifest = null;

beforeAll(async () => {
  // Load catalog summary
  const catalogPath = path.join(__dirname, '../../config/generated/catalog-summary.json');
  if (fs.existsSync(catalogPath)) {
    catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  }

  // Load metafield data
  const metafieldPath = path.join(__dirname, '../../config/generated/metafield-data.json');
  if (fs.existsSync(metafieldPath)) {
    metafieldData = JSON.parse(fs.readFileSync(metafieldPath, 'utf8'));
  }

  // Load image manifest
  const imagePath = path.join(__dirname, '../../config/generated/images/image-manifest.json');
  if (fs.existsSync(imagePath)) {
    imageManifest = JSON.parse(fs.readFileSync(imagePath, 'utf8'));
  }

  // Load CSV data for detailed product information
  const csvPath = path.join(__dirname, '../../config/generated/products-import.csv');
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const headers = parseCSVLine(lines[0]);
    
    // Parse CSV into product objects using proper CSV parsing
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i]);
        const product = {};
        headers.forEach((header, index) => {
          product[header.trim()] = values[index] || '';
        });
        products.push(product);
      }
    }
    catalogData.products = products;
  }
});

describe('Product Catalog Completeness Property Tests', () => {
  /**
   * Feature: marketing-preset-showcase, Property 1: Product Catalog Completeness
   * 
   * Property: For any demo store setup, the product catalog should contain at least 50 
   * industrial/B2B products distributed across manufacturing, industrial equipment, tools, 
   * and safety product categories, with each product having complete technical specifications, 
   * realistic pricing, inventory levels, and multiple images
   */
  it('should have at least 50 products total', () => {
    expect(catalogData).toBeTruthy();
    expect(catalogData.total_products).toBeGreaterThanOrEqual(50);
  });

  it('should have products distributed across required categories', () => {
    expect(catalogData).toBeTruthy();
    expect(catalogData.categories).toBeTruthy();
    
    const categoryKeys = catalogData.categories.map(cat => cat.key);
    const requiredCategories = ['manufacturing', 'industrial_equipment', 'tools', 'safety'];
    
    requiredCategories.forEach(requiredCategory => {
      expect(categoryKeys).toContain(requiredCategory);
    });
  });

  it('should have realistic pricing for all products', () => {
    fc.assert(fc.property(
      fc.constantFrom(...(catalogData?.products || [])),
      (product) => {
        // Skip empty products
        if (!product.Handle) return true;
        
        const price = parseFloat(product['Variant Price']);
        const comparePrice = product['Variant Compare At Price'] ? 
          parseFloat(product['Variant Compare At Price']) : null;
        
        // Price should be positive and realistic for industrial products
        expect(price).toBeGreaterThan(0);
        expect(price).toBeLessThan(100000); // Reasonable upper limit
        
        // Compare at price should be higher than regular price if present
        if (comparePrice) {
          expect(comparePrice).toBeGreaterThan(price);
        }
        
        return true;
      }
    ), { numRuns: Math.min(100, catalogData?.products?.length || 0) });
  });

  it('should have inventory levels for all products', () => {
    fc.assert(fc.property(
      fc.constantFrom(...(catalogData?.products || [])),
      (product) => {
        // Skip empty products
        if (!product.Handle) return true;
        
        const inventory = parseInt(product['Variant Inventory Qty']);
        
        // Inventory should be a non-negative number
        expect(inventory).toBeGreaterThanOrEqual(0);
        expect(inventory).toBeLessThan(1000); // Reasonable upper limit
        
        return true;
      }
    ), { numRuns: Math.min(100, catalogData?.products?.length || 0) });
  });

  it('should have complete technical specifications for products with metafield data', () => {
    if (!metafieldData) {
      console.warn('Metafield data not available for testing');
      return;
    }

    fc.assert(fc.property(
      fc.constantFrom(...Object.keys(metafieldData)),
      (productHandle) => {
        const productMetafields = metafieldData[productHandle];
        
        // Should have specifications object
        expect(productMetafields.specifications).toBeTruthy();
        expect(productMetafields.specifications.specifications).toBeTruthy();
        
        const specs = productMetafields.specifications.specifications;
        
        // Should have at least one specification category
        const specCategories = Object.keys(specs);
        expect(specCategories.length).toBeGreaterThan(0);
        
        // Each category should have at least one specification
        specCategories.forEach(category => {
          const categorySpecs = specs[category];
          expect(typeof categorySpecs).toBe('object');
          expect(Object.keys(categorySpecs).length).toBeGreaterThan(0);
          
          // Each specification should have a value, min/max, or description
          Object.values(categorySpecs).forEach(spec => {
            const hasValue = spec.value || spec.min || spec.max || spec.description;
            expect(hasValue).toBeTruthy();
          });
        });
        
        return true;
      }
    ), { numRuns: Math.min(100, Object.keys(metafieldData || {}).length) });
  });

  it('should have product images available', () => {
    if (!imageManifest) {
      console.warn('Image manifest not available for testing');
      return;
    }

    fc.assert(fc.property(
      fc.constantFrom(...Object.keys(imageManifest)),
      (productHandle) => {
        const productImages = imageManifest[productHandle];
        
        // Should have primary and thumbnail images
        expect(productImages.primary).toBeTruthy();
        expect(productImages.thumbnail).toBeTruthy();
        
        // Should have category and title
        expect(productImages.category).toBeTruthy();
        expect(productImages.title).toBeTruthy();
        
        return true;
      }
    ), { numRuns: Math.min(100, Object.keys(imageManifest || {}).length) });
  });

  it('should have proper product categorization', () => {
    fc.assert(fc.property(
      fc.constantFrom(...(catalogData?.products || [])),
      (product) => {
        // Skip empty products
        if (!product.Handle) return true;
        
        // Should have vendor
        expect(product.Vendor).toBeTruthy();
        expect(product.Vendor.length).toBeGreaterThan(0);
        
        // Should have product type
        expect(product.Type).toBeTruthy();
        expect(product.Type.length).toBeGreaterThan(0);
        
        // Should have tags
        expect(product.Tags).toBeTruthy();
        expect(product.Tags.length).toBeGreaterThan(0);
        
        // Should have description
        expect(product['Body (HTML)']).toBeTruthy();
        expect(product['Body (HTML)'].length).toBeGreaterThan(50); // Meaningful description
        
        return true;
      }
    ), { numRuns: Math.min(100, catalogData?.products?.length || 0) });
  });

  it('should have proper SKU and handle formatting', () => {
    fc.assert(fc.property(
      fc.constantFrom(...(catalogData?.products || [])),
      (product) => {
        // Skip empty products
        if (!product.Handle) return true;
        
        // Handle should be URL-friendly
        expect(product.Handle).toMatch(/^[a-z0-9-]+$/);
        expect(product.Handle.length).toBeGreaterThan(5);
        
        // SKU should be present and properly formatted
        expect(product['Variant SKU']).toBeTruthy();
        expect(product['Variant SKU'].length).toBeGreaterThan(3);
        
        return true;
      }
    ), { numRuns: Math.min(100, catalogData?.products?.length || 0) });
  });

  it('should have weight specifications for shipping', () => {
    fc.assert(fc.property(
      fc.constantFrom(...(catalogData?.products || [])),
      (product) => {
        // Skip empty products
        if (!product.Handle) return true;
        
        const weight = parseInt(product['Variant Grams']);
        
        // Weight should be positive and reasonable
        expect(weight).toBeGreaterThan(0);
        expect(weight).toBeLessThan(1000000); // 1000kg max (reasonable for industrial equipment)
        
        // Weight unit should be specified
        expect(product['Variant Weight Unit']).toBe('lb');
        
        return true;
      }
    ), { numRuns: Math.min(100, catalogData?.products?.length || 0) });
  });

  it('should have SEO optimization for all products', () => {
    fc.assert(fc.property(
      fc.constantFrom(...(catalogData?.products || [])),
      (product) => {
        // Skip empty products
        if (!product.Handle) return true;
        
        // Should have SEO title
        expect(product['SEO Title']).toBeTruthy();
        expect(product['SEO Title'].length).toBeGreaterThan(10);
        expect(product['SEO Title'].length).toBeLessThan(70); // SEO best practice
        
        // Should have SEO description
        expect(product['SEO Description']).toBeTruthy();
        expect(product['SEO Description'].length).toBeGreaterThan(50);
        expect(product['SEO Description'].length).toBeLessThan(200); // SEO best practice
        
        return true;
      }
    ), { numRuns: Math.min(100, catalogData?.products?.length || 0) });
  });

  it('should have proper Shopify configuration for all products', () => {
    fc.assert(fc.property(
      fc.constantFrom(...(catalogData?.products || [])),
      (product) => {
        // Skip empty products
        if (!product.Handle) return true;
        
        // Should be published
        expect(product.Published).toBe('TRUE');
        
        // Should require shipping for physical products
        expect(product['Variant Requires Shipping']).toBe('TRUE');
        
        // Should be taxable
        expect(product['Variant Taxable']).toBe('TRUE');
        
        // Should have proper inventory settings
        expect(product['Variant Inventory Tracker']).toBe('shopify');
        expect(product['Variant Inventory Policy']).toBe('deny');
        
        // Should be active
        expect(product.Status).toBe('active');
        
        return true;
      }
    ), { numRuns: Math.min(100, catalogData?.products?.length || 0) });
  });
});

// Additional integration tests for catalog completeness
describe('Product Catalog Integration Tests', () => {
  it('should have consistent data across all generated files', () => {
    if (!catalogData || !metafieldData || !imageManifest) {
      console.warn('Not all data files available for integration testing');
      return;
    }

    // Products with metafield data should have corresponding images
    Object.keys(metafieldData).forEach(productHandle => {
      expect(imageManifest[productHandle]).toBeTruthy();
    });

    // Products with images should have corresponding metafield data
    Object.keys(imageManifest).forEach(productHandle => {
      expect(metafieldData[productHandle]).toBeTruthy();
    });
  });

  it('should meet minimum product count requirements per category', () => {
    expect(catalogData).toBeTruthy();
    
    // Should have reasonable distribution across categories
    const totalProducts = catalogData.total_products;
    expect(totalProducts).toBeGreaterThanOrEqual(50);
    
    // Each category should have at least some products
    catalogData.categories.forEach(category => {
      expect(category.product_count).toBeGreaterThan(0);
    });
  });

  it('should have realistic cost structure for ROI calculations', () => {
    if (!catalogData?.products) return;

    const products = catalogData.products.filter(p => p.Handle);
    const prices = products.map(p => parseFloat(p['Variant Price']));
    
    // Should have a good range of prices for different scenarios
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    expect(minPrice).toBeLessThan(1000); // Some affordable products
    expect(maxPrice).toBeGreaterThan(5000); // Some high-value products
    
    // Should have products in different price ranges for calculator scenarios
    const lowPriceProducts = prices.filter(p => p < 1000).length;
    const midPriceProducts = prices.filter(p => p >= 1000 && p < 5000).length;
    const highPriceProducts = prices.filter(p => p >= 5000).length;
    
    expect(lowPriceProducts).toBeGreaterThan(0);
    expect(midPriceProducts).toBeGreaterThan(0);
    expect(highPriceProducts).toBeGreaterThan(0);
  });
});