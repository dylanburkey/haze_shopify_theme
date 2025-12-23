import { test, expect } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Feature: marketing-preset-showcase, Property 2: Metafield Data Population Completeness

/**
 * Load the actual product catalog and metafield data from the demo store
 */
function loadDemoStoreData() {
  try {
    // Load product catalog
    const productsPath = path.join(process.cwd(), 'config/generated/products-import.csv');
    const productsCSV = fs.readFileSync(productsPath, 'utf-8');
    
    // Parse CSV to get product handles (skip header row)
    const productLines = productsCSV.split('\n').slice(1).filter(line => line.trim());
    const productHandles = productLines.map(line => {
      const handle = line.split(',')[0];
      return handle;
    }).filter(handle => handle && handle.trim());

    // Load metafield data
    const metafieldPath = path.join(process.cwd(), 'config/generated/metafield-data.json');
    const metafieldData = JSON.parse(fs.readFileSync(metafieldPath, 'utf-8'));

    // Load metafield definitions for validation
    const definitionsPath = path.join(process.cwd(), 'config/metafield_definitions.json');
    const definitions = JSON.parse(fs.readFileSync(definitionsPath, 'utf-8'));

    return {
      productHandles,
      metafieldData,
      definitions: definitions.metafield_definitions
    };
  } catch (error) {
    throw new Error(`Failed to load demo store data: ${error.message}`);
  }
}

/**
 * Validate that a specification metafield follows the expected schema
 */
function validateSpecificationMetafield(specData) {
  if (!specData || typeof specData !== 'object') {
    return { valid: false, error: 'Specification data must be an object' };
  }

  if (!specData.specifications || typeof specData.specifications !== 'object') {
    return { valid: false, error: 'Missing specifications object' };
  }

  // Check that specifications have categories with valid structure
  for (const [categoryKey, categorySpecs] of Object.entries(specData.specifications)) {
    if (typeof categorySpecs !== 'object') {
      return { valid: false, error: `Category ${categoryKey} must be an object` };
    }

    // Check individual specifications within category
    for (const [specKey, specValue] of Object.entries(categorySpecs)) {
      if (!specValue || typeof specValue !== 'object') {
        return { valid: false, error: `Specification ${categoryKey}.${specKey} must be an object` };
      }

      // Specification must have either a value, or min/max range, or range string
      if (!specValue.value && !specValue.range && !(specValue.min && specValue.max)) {
        return { valid: false, error: `Specification ${categoryKey}.${specKey} must have a value, range, or min/max` };
      }
    }
  }

  return { valid: true };
}

/**
 * Validate that attachments follow the expected schema
 */
function validateAttachments(attachments) {
  if (!Array.isArray(attachments)) {
    return { valid: false, error: 'Attachments must be an array' };
  }

  for (const [index, attachment] of attachments.entries()) {
    if (!attachment || typeof attachment !== 'object') {
      return { valid: false, error: `Attachment ${index} must be an object` };
    }

    const requiredFields = ['id', 'name', 'url', 'type', 'category'];
    for (const field of requiredFields) {
      if (!attachment[field]) {
        return { valid: false, error: `Attachment ${index} missing required field: ${field}` };
      }
    }

    // Validate URL format
    if (!attachment.url.startsWith('/files/') && !attachment.url.startsWith('http')) {
      return { valid: false, error: `Attachment ${index} has invalid URL format: ${attachment.url}` };
    }

    // Validate file type
    const validTypes = ['pdf', 'dwg', 'step', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'zip'];
    if (!validTypes.includes(attachment.type.toLowerCase())) {
      return { valid: false, error: `Attachment ${index} has unsupported file type: ${attachment.type}` };
    }
  }

  return { valid: true };
}

/**
 * Check if a product should have attachments based on its type/category
 */
function shouldHaveAttachments(productHandle) {
  // Industrial equipment, tools, and machinery should have attachments
  const attachmentCategories = [
    'industrial', 'equipment', 'machine', 'tool', 'welder', 'skimmer', 
    'conveyor', 'press', 'lathe', 'grinder', 'cutter', 'generator'
  ];
  
  return attachmentCategories.some(category => 
    productHandle.toLowerCase().includes(category)
  );
}

test('Property 2: Metafield Data Population Completeness - All demo store products should have complete metafield data', () => {
  const { productHandles, metafieldData } = loadDemoStoreData();
  
  // Verify we have a reasonable number of products (at least 50 as per requirements)
  expect(productHandles.length).toBeGreaterThanOrEqual(50);
  
  // Test each product for complete metafield population
  for (const productHandle of productHandles) {
    if (!productHandle || productHandle.trim() === '') continue;
    
    const productMetafields = metafieldData[productHandle];
    
    // Every product should have metafield data
    expect(productMetafields, `Product ${productHandle} should have metafield data`).toBeDefined();
    
    // Every product should have specifications
    expect(productMetafields.specifications, `Product ${productHandle} should have specifications`).toBeDefined();
    
    // Validate specification structure
    const specValidation = validateSpecificationMetafield(productMetafields.specifications);
    expect(specValidation.valid, `Product ${productHandle} specifications invalid: ${specValidation.error}`).toBe(true);
    
    // Products that should have attachments must have them
    if (shouldHaveAttachments(productHandle)) {
      expect(productMetafields.attachments, `Product ${productHandle} should have attachments`).toBeDefined();
      expect(Array.isArray(productMetafields.attachments), `Product ${productHandle} attachments should be an array`).toBe(true);
      expect(productMetafields.attachments.length, `Product ${productHandle} should have at least one attachment`).toBeGreaterThan(0);
      
      // Validate attachment structure
      const attachmentValidation = validateAttachments(productMetafields.attachments);
      expect(attachmentValidation.valid, `Product ${productHandle} attachments invalid: ${attachmentValidation.error}`).toBe(true);
    }
  }
});

test('Property 2: Metafield Data Population Completeness - Specifications should be organized in tables', () => {
  const { metafieldData } = loadDemoStoreData();
  
  // Test a sample of products to ensure specifications are properly organized
  const sampleProducts = Object.keys(metafieldData).slice(0, 10);
  
  for (const productHandle of sampleProducts) {
    const productMetafields = metafieldData[productHandle];
    const specifications = productMetafields.specifications;
    
    // Should have categories for organization
    expect(specifications.categories, `Product ${productHandle} should have specification categories`).toBeDefined();
    expect(typeof specifications.categories, `Product ${productHandle} categories should be an object`).toBe('object');
    
    // Categories should have proper structure for table display
    for (const [categoryKey, categoryDef] of Object.entries(specifications.categories)) {
      expect(categoryDef.name, `Category ${categoryKey} should have a display name`).toBeDefined();
      expect(typeof categoryDef.name, `Category ${categoryKey} name should be a string`).toBe('string');
      expect(categoryDef.order, `Category ${categoryKey} should have display order`).toBeDefined();
      expect(typeof categoryDef.order, `Category ${categoryKey} order should be a number`).toBe('number');
      expect(categoryDef.order, `Category ${categoryKey} order should be positive`).toBeGreaterThan(0);
    }
    
    // Specifications should be organized by category
    for (const categoryKey of Object.keys(specifications.categories)) {
      if (specifications.specifications[categoryKey]) {
        const categorySpecs = specifications.specifications[categoryKey];
        expect(typeof categorySpecs, `Category ${categoryKey} specifications should be an object`).toBe('object');
        
        // Each specification should have proper structure for table display
        for (const [specKey, specValue] of Object.entries(categorySpecs)) {
          // Specification must have either a value, or min/max range, or range string
          const hasValue = specValue.value || specValue.range || (specValue.min && specValue.max);
          expect(hasValue, `Specification ${categoryKey}.${specKey} should have a value, range, or min/max`).toBeTruthy();
          
          // Should have display name or use key as fallback
          const displayName = specValue.display_name || specKey.replace(/_/g, ' ');
          expect(displayName.length, `Specification ${categoryKey}.${specKey} should have a display name`).toBeGreaterThan(0);
        }
      }
    }
  }
});

test('Property 2: Metafield Data Population Completeness - Relevant products should have appropriate attachments', () => {
  const { metafieldData } = loadDemoStoreData();
  
  // Test products that should have specific types of attachments
  const industrialProducts = Object.keys(metafieldData).filter(handle => 
    shouldHaveAttachments(handle)
  );
  
  expect(industrialProducts.length, 'Should have industrial products that require attachments').toBeGreaterThan(0);
  
  for (const productHandle of industrialProducts.slice(0, 10)) { // Test first 10 for performance
    const productMetafields = metafieldData[productHandle];
    
    expect(productMetafields.attachments, `Industrial product ${productHandle} should have attachments`).toBeDefined();
    expect(Array.isArray(productMetafields.attachments), `Product ${productHandle} attachments should be an array`).toBe(true);
    
    const attachments = productMetafields.attachments;
    
    // Should have different types of attachments
    const attachmentTypes = attachments.map(att => att.category);
    const uniqueTypes = [...new Set(attachmentTypes)];
    
    expect(uniqueTypes.length, `Product ${productHandle} should have attachments in multiple categories`).toBeGreaterThan(0);
    
    // Common attachment categories for industrial products
    const expectedCategories = ['manuals', 'cad', 'certificates'];
    const hasExpectedCategory = expectedCategories.some(cat => attachmentTypes.includes(cat));
    expect(hasExpectedCategory, `Product ${productHandle} should have attachments in expected categories (manuals, cad, certificates)`).toBe(true);
    
    // Attachments should have proper metadata
    for (const attachment of attachments) {
      expect(attachment.name.length, `Attachment ${attachment.id} should have a meaningful name`).toBeGreaterThan(0);
      expect(attachment.size, `Attachment ${attachment.id} should have size information`).toBeDefined();
      expect(attachment.description, `Attachment ${attachment.id} should have a description`).toBeDefined();
      expect(['public', 'customer', 'wholesale'].includes(attachment.access_level), 
        `Attachment ${attachment.id} should have valid access level`).toBe(true);
    }
  }
});

// Property-based test using fast-check for additional validation
test('Property 2: Metafield Data Population Completeness - Metafield data structure should be consistent', () => {
  const { metafieldData } = loadDemoStoreData();
  
  fc.assert(
    fc.property(
      fc.constantFrom(...Object.keys(metafieldData)),
      (productHandle) => {
        const productMetafields = metafieldData[productHandle];
        
        // Basic structure validation
        expect(productMetafields).toBeDefined();
        expect(typeof productMetafields).toBe('object');
        
        // Specifications validation
        if (productMetafields.specifications) {
          const specValidation = validateSpecificationMetafield(productMetafields.specifications);
          expect(specValidation.valid).toBe(true);
        }
        
        // Attachments validation
        if (productMetafields.attachments) {
          const attachmentValidation = validateAttachments(productMetafields.attachments);
          expect(attachmentValidation.valid).toBe(true);
        }
        
        return true;
      }
    ),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});