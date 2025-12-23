import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 9: Metafield Data Round-Trip

/**
 * Simulates Shopify metafield storage and retrieval
 * In a real Shopify environment, this would be handled by the platform
 */
class MockMetafieldStorage {
  constructor() {
    this.storage = new Map();
  }

  // Simulate storing data to metafield (JSON serialization)
  store(namespace, key, data) {
    const metafieldKey = `${namespace}.${key}`;
    const serialized = JSON.stringify(data);
    this.storage.set(metafieldKey, serialized);
    return true;
  }

  // Simulate retrieving data from metafield (JSON deserialization)
  retrieve(namespace, key) {
    const metafieldKey = `${namespace}.${key}`;
    const serialized = this.storage.get(metafieldKey);
    if (!serialized) return null;
    return JSON.parse(serialized);
  }
}

// Generators for property-based testing
const specificationValueArbitrary = fc.record({
  value: fc.string({ minLength: 1, maxLength: 100 }),
  unit: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  tolerance: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  range: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  min: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  max: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  display_name: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
});

const categoryKeyArbitrary = fc.stringMatching(/^[a-z_]+$/);

const specificationCategoryArbitrary = fc.dictionary(
  categoryKeyArbitrary,
  fc.dictionary(
    categoryKeyArbitrary,
    specificationValueArbitrary,
    { minKeys: 1, maxKeys: 10 }
  ),
  { minKeys: 1, maxKeys: 5 }
);

const categoryDefinitionArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  order: fc.integer({ min: 1, max: 100 }),
  collapsible: fc.boolean(),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }))
});

const categoriesArbitrary = fc.dictionary(
  categoryKeyArbitrary,
  categoryDefinitionArbitrary,
  { minKeys: 1, maxKeys: 10 }
);

const specificationDataArbitrary = fc.record({
  specifications: specificationCategoryArbitrary,
  categories: categoriesArbitrary
});

// Helper function to deep compare objects, ignoring undefined values
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  // Handle arrays
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }
  
  // Handle objects - filter out undefined values as JSON.stringify removes them
  const keys1 = Object.keys(obj1).filter(k => obj1[k] !== undefined);
  const keys2 = Object.keys(obj2).filter(k => obj2[k] !== undefined);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

// Helper function to remove undefined values (simulates JSON serialization behavior)
function removeUndefined(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test('Property 9: Metafield Data Round-Trip - Specification data should survive storage and retrieval', () => {
  fc.assert(
    fc.property(specificationDataArbitrary, (originalData) => {
      const storage = new MockMetafieldStorage();
      
      // Store the specification data
      const stored = storage.store('specifications', 'technical', originalData);
      expect(stored).toBe(true);
      
      // Retrieve the specification data
      const retrievedData = storage.retrieve('specifications', 'technical');
      
      // The retrieved data should be equivalent to the original
      // Note: JSON serialization removes undefined values, so we need to account for that
      const normalizedOriginal = removeUndefined(originalData);
      
      return deepEqual(retrievedData, normalizedOriginal);
    }),
    { 
      numRuns: 100,
      verbose: true
    }
  );
});

test('Property 9: Metafield Data Round-Trip - Empty specification data should be handled correctly', () => {
  const storage = new MockMetafieldStorage();
  
  const emptyData = {
    specifications: {},
    categories: {}
  };
  
  // Store empty data
  const stored = storage.store('specifications', 'technical', emptyData);
  expect(stored).toBe(true);
  
  // Retrieve empty data
  const retrievedData = storage.retrieve('specifications', 'technical');
  expect(retrievedData).toEqual(emptyData);
});

test('Property 9: Metafield Data Round-Trip - Non-existent metafield should return null', () => {
  const storage = new MockMetafieldStorage();
  
  // Try to retrieve non-existent data
  const retrievedData = storage.retrieve('specifications', 'nonexistent');
  expect(retrievedData).toBeNull();
});

test('Property 9: Metafield Data Round-Trip - Multiple metafields should be independent', () => {
  fc.assert(
    fc.property(
      specificationDataArbitrary,
      specificationDataArbitrary,
      (data1, data2) => {
        const storage = new MockMetafieldStorage();
        
        // Store two different datasets
        storage.store('specifications', 'technical', data1);
        storage.store('specifications', 'categories', data2);
        
        // Retrieve both datasets
        const retrieved1 = storage.retrieve('specifications', 'technical');
        const retrieved2 = storage.retrieve('specifications', 'categories');
        
        // Each should match its original data
        const normalized1 = removeUndefined(data1);
        const normalized2 = removeUndefined(data2);
        
        return deepEqual(retrieved1, normalized1) && deepEqual(retrieved2, normalized2);
      }
    ),
    { numRuns: 50 }
  );
});