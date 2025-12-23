/**
 * Product Catalog Verification Script
 * Verifies that all components of the product catalog system are working correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function verifyCatalog() {
  console.log('🔍 Verifying Product Catalog System...\n');

  const generatedDir = path.join(__dirname, 'generated');
  const imagesDir = path.join(generatedDir, 'images');

  // Check if all required files exist
  const requiredFiles = [
    'products-import.csv',
    'metafield-data.json',
    'catalog-summary.json',
    'collections-structure.json',
    'images/image-manifest.json'
  ];

  console.log('📁 Checking required files:');
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(generatedDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  });

  if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Run the generators first.');
    return false;
  }

  // Load and verify data
  const catalogSummary = JSON.parse(fs.readFileSync(path.join(generatedDir, 'catalog-summary.json'), 'utf8'));
  const metafieldData = JSON.parse(fs.readFileSync(path.join(generatedDir, 'metafield-data.json'), 'utf8'));
  const imageManifest = JSON.parse(fs.readFileSync(path.join(imagesDir, 'image-manifest.json'), 'utf8'));
  const collectionsData = JSON.parse(fs.readFileSync(path.join(generatedDir, 'collections-structure.json'), 'utf8'));

  // Verify product counts
  console.log('\n📊 Product Count Verification:');
  console.log(`  Total products (summary): ${catalogSummary.total_products}`);
  console.log(`  Products with metafields: ${Object.keys(metafieldData).length}`);
  console.log(`  Products with images: ${Object.keys(imageManifest).length}`);

  const expectedCount = 55;
  const countsMatch = catalogSummary.total_products === expectedCount &&
                     Object.keys(metafieldData).length === expectedCount &&
                     Object.keys(imageManifest).length === expectedCount;

  console.log(`  ${countsMatch ? '✅' : '❌'} All counts match expected (${expectedCount})`);

  // Verify CSV structure
  console.log('\n📄 CSV File Verification:');
  const csvContent = fs.readFileSync(path.join(generatedDir, 'products-import.csv'), 'utf8');
  const csvLines = csvContent.split('\n').filter(line => line.trim());
  const csvProductCount = csvLines.length - 1; // Subtract header
  console.log(`  CSV lines (including header): ${csvLines.length}`);
  console.log(`  CSV product count: ${csvProductCount}`);
  console.log(`  ${csvProductCount === expectedCount ? '✅' : '❌'} CSV product count matches`);

  // Verify image files
  console.log('\n🖼️  Image File Verification:');
  const imageFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.svg'));
  const expectedImageCount = expectedCount * 2; // Primary + thumbnail for each product
  console.log(`  Image files found: ${imageFiles.length}`);
  console.log(`  Expected image files: ${expectedImageCount}`);
  console.log(`  ${imageFiles.length === expectedImageCount ? '✅' : '❌'} Image count matches`);

  // Verify categories
  console.log('\n📂 Category Verification:');
  const categories = ['manufacturing', 'industrial_equipment', 'tools', 'safety'];
  categories.forEach(category => {
    const categoryProducts = Object.keys(imageManifest).filter(handle => 
      imageManifest[handle].category === category
    );
    console.log(`  ${category}: ${categoryProducts.length} products`);
  });

  // Verify collections
  console.log('\n🗂️  Collections Verification:');
  console.log(`  Collections defined: ${collectionsData.length}`);
  collectionsData.forEach(collection => {
    console.log(`  - ${collection.title} (${collection.handle})`);
  });

  // Sample metafield verification
  console.log('\n🔧 Sample Metafield Verification:');
  const sampleProduct = Object.keys(metafieldData)[0];
  const sampleData = metafieldData[sampleProduct];
  console.log(`  Sample product: ${sampleProduct}`);
  console.log(`  Has specifications: ${!!sampleData.specifications ? '✅' : '❌'}`);
  console.log(`  Has attachments: ${!!sampleData.attachments ? '✅' : '❌'}`);
  console.log(`  Attachment count: ${sampleData.attachments?.length || 0}`);

  console.log('\n🎉 Product Catalog System Verification Complete!');
  
  if (countsMatch && csvProductCount === expectedCount && imageFiles.length === expectedImageCount) {
    console.log('✅ All systems are working correctly!');
    return true;
  } else {
    console.log('❌ Some issues were found. Please check the output above.');
    return false;
  }
}

// Run verification
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyCatalog();
}

export { verifyCatalog };