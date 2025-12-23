/**
 * Product Image Asset Management System
 * Manages product images and creates placeholder assets for demo products
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product image specifications for different categories
const imageSpecs = {
  manufacturing: {
    primary_color: '#2563eb', // Blue
    accent_color: '#1e40af',
    style: 'technical',
    backgrounds: ['factory', 'workshop', 'industrial']
  },
  industrial_equipment: {
    primary_color: '#dc2626', // Red
    accent_color: '#b91c1c',
    style: 'heavy_duty',
    backgrounds: ['warehouse', 'construction', 'facility']
  },
  tools: {
    primary_color: '#ea580c', // Orange
    accent_color: '#c2410c',
    style: 'professional',
    backgrounds: ['workshop', 'garage', 'workbench']
  },
  safety: {
    primary_color: '#16a34a', // Green
    accent_color: '#15803d',
    style: 'safety',
    backgrounds: ['workplace', 'construction', 'industrial']
  }
};

// Generate SVG placeholder images for products
function generateProductSVG(productTitle, category, width = 800, height = 600) {
  const specs = imageSpecs[category] || imageSpecs.manufacturing;
  const productName = productTitle.split(' ').slice(0, 3).join(' '); // First 3 words
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${specs.primary_color};stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:${specs.accent_color};stop-opacity:0.2" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${specs.primary_color}" stroke-width="0.5" opacity="0.1"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#bg-gradient)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    
    <!-- Product representation -->
    <g transform="translate(${width/2}, ${height/2})">
      <!-- Main product shape -->
      <rect x="-120" y="-80" width="240" height="160" rx="8" fill="${specs.primary_color}" opacity="0.8"/>
      <rect x="-110" y="-70" width="220" height="140" rx="4" fill="white" opacity="0.9"/>
      
      <!-- Technical details -->
      <circle cx="-80" cy="-40" r="8" fill="${specs.accent_color}" opacity="0.6"/>
      <circle cx="80" cy="-40" r="8" fill="${specs.accent_color}" opacity="0.6"/>
      <rect x="-60" y="-10" width="120" height="4" fill="${specs.primary_color}" opacity="0.4"/>
      <rect x="-40" y="10" width="80" height="4" fill="${specs.primary_color}" opacity="0.4"/>
      
      <!-- Brand indicator -->
      <rect x="-100" y="50" width="200" height="20" rx="10" fill="${specs.accent_color}" opacity="0.8"/>
      <text x="0" y="64" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">INDUSTRIAL GRADE</text>
    </g>
    
    <!-- Product title -->
    <text x="${width/2}" y="50" text-anchor="middle" fill="${specs.primary_color}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${productName}</text>
    
    <!-- Category indicator -->
    <rect x="20" y="20" width="120" height="24" rx="12" fill="${specs.accent_color}"/>
    <text x="80" y="36" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${category.toUpperCase()}</text>
    
    <!-- Specifications indicator -->
    <g transform="translate(${width-150}, ${height-100})">
      <rect width="120" height="60" rx="4" fill="white" stroke="${specs.primary_color}" stroke-width="2" opacity="0.9"/>
      <text x="60" y="20" text-anchor="middle" fill="${specs.primary_color}" font-family="Arial, sans-serif" font-size="10" font-weight="bold">SPECIFICATIONS</text>
      <line x1="10" y1="30" x2="110" y2="30" stroke="${specs.primary_color}" stroke-width="1" opacity="0.3"/>
      <text x="10" y="42" fill="${specs.primary_color}" font-family="Arial, sans-serif" font-size="8">• Technical Data</text>
      <text x="10" y="52" fill="${specs.primary_color}" font-family="Arial, sans-serif" font-size="8">• CAD Files</text>
    </g>
  </svg>`;
}

// Generate product image assets
function generateProductImages() {
  const outputDir = path.join(__dirname, 'generated', 'images');
  
  // Create images directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read the generated metafield data to get product list
  const metafieldPath = path.join(__dirname, 'generated', 'metafield-data.json');
  if (!fs.existsSync(metafieldPath)) {
    console.error('Metafield data not found. Run product-catalog-generator.js first.');
    return;
  }

  const metafieldData = JSON.parse(fs.readFileSync(metafieldPath, 'utf8'));
  const imageManifest = {};

  // Generate images for each product
  Object.keys(metafieldData).forEach(productHandle => {
    // Determine category from handle patterns
    let category = 'manufacturing';
    if (productHandle.includes('tool') || productHandle.includes('wrench') || productHandle.includes('drill')) {
      category = 'tools';
    } else if (productHandle.includes('safety') || productHandle.includes('helmet') || productHandle.includes('vest')) {
      category = 'safety';
    } else if (productHandle.includes('conveyor') || productHandle.includes('crane') || productHandle.includes('forklift')) {
      category = 'industrial_equipment';
    }

    // Generate product title from handle
    const productTitle = productHandle
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Generate primary product image
    const primarySVG = generateProductSVG(productTitle, category, 800, 600);
    fs.writeFileSync(path.join(outputDir, `${productHandle}-primary.svg`), primarySVG);

    // Generate thumbnail image
    const thumbnailSVG = generateProductSVG(productTitle, category, 400, 300);
    fs.writeFileSync(path.join(outputDir, `${productHandle}-thumb.svg`), thumbnailSVG);

    // Add to manifest
    imageManifest[productHandle] = {
      primary: `${productHandle}-primary.svg`,
      thumbnail: `${productHandle}-thumb.svg`,
      category,
      title: productTitle
    };
  });

  // Save image manifest
  fs.writeFileSync(
    path.join(outputDir, 'image-manifest.json'),
    JSON.stringify(imageManifest, null, 2)
  );

  console.log(`Generated ${Object.keys(imageManifest).length * 2} product images`);
  console.log(`Images saved to: ${outputDir}`);
  console.log('- Primary images (800x600): *-primary.svg');
  console.log('- Thumbnail images (400x300): *-thumb.svg');
  console.log('- image-manifest.json (Image reference file)');
}

// Generate collection structure for organizing products
function generateCollectionStructure() {
  const collections = [
    {
      handle: 'manufacturing-equipment',
      title: 'Manufacturing Equipment',
      description: 'Professional manufacturing equipment including CNC machines, lathes, mills, and production tools designed for precision manufacturing operations.',
      sort_order: 'manual',
      template_suffix: 'specifications',
      seo_title: 'Manufacturing Equipment - Industrial Grade Machinery',
      seo_description: 'Shop professional manufacturing equipment including CNC machines, lathes, mills, and precision tools. Industrial grade quality with technical specifications.'
    },
    {
      handle: 'industrial-equipment',
      title: 'Industrial Equipment',
      description: 'Heavy-duty industrial equipment for material handling, power generation, and facility operations. Built for demanding commercial and industrial applications.',
      sort_order: 'manual',
      template_suffix: 'specifications',
      seo_title: 'Industrial Equipment - Heavy Duty Commercial Grade',
      seo_description: 'Heavy-duty industrial equipment including cranes, forklifts, compressors, and material handling systems. Commercial grade reliability.'
    },
    {
      handle: 'professional-tools',
      title: 'Professional Tools',
      description: 'Professional-grade tools for industrial, commercial, and heavy-duty applications. Precision engineered for reliability and performance.',
      sort_order: 'manual',
      template_suffix: 'specifications',
      seo_title: 'Professional Tools - Industrial Grade Power Tools',
      seo_description: 'Professional tools including power tools, hand tools, and precision instruments. Industrial grade quality for demanding applications.'
    },
    {
      handle: 'safety-equipment',
      title: 'Safety Equipment',
      description: 'OSHA compliant safety equipment and personal protective equipment (PPE) for industrial workplaces. Certified for maximum protection.',
      sort_order: 'manual',
      template_suffix: 'specifications',
      seo_title: 'Safety Equipment - OSHA Compliant PPE & Safety Gear',
      seo_description: 'OSHA compliant safety equipment including PPE, safety storage, and workplace protection systems. Certified industrial safety gear.'
    },
    {
      handle: 'all-products',
      title: 'All Products',
      description: 'Complete catalog of industrial and manufacturing equipment, tools, and safety products. Professional grade solutions for every industrial need.',
      sort_order: 'manual',
      template_suffix: 'specifications',
      seo_title: 'All Industrial Products - Complete Equipment Catalog',
      seo_description: 'Complete catalog of industrial equipment, manufacturing tools, and safety products. Professional grade solutions for industrial applications.'
    }
  ];

  const outputDir = path.join(__dirname, 'generated');
  fs.writeFileSync(
    path.join(outputDir, 'collections-structure.json'),
    JSON.stringify(collections, null, 2)
  );

  console.log('Generated collection structure');
  console.log(`Collections saved to: ${path.join(outputDir, 'collections-structure.json')}`);
}

// Main function
function generateAssets() {
  console.log('Generating product image assets...');
  generateProductImages();
  
  console.log('\nGenerating collection structure...');
  generateCollectionStructure();
  
  console.log('\nAsset generation complete!');
}

// Export functions
export {
  generateProductSVG,
  generateProductImages,
  generateCollectionStructure,
  generateAssets
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAssets();
}