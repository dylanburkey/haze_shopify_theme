/**
 * Product Catalog Generator for Forge Industrial Theme
 * Generates 50+ industrial/B2B products with complete specifications and attachments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product categories and their characteristics
const productCategories = {
  manufacturing: {
    name: "Manufacturing Equipment",
    products: [
      {
        title: "Industrial Oil Skimmer ZS-1000",
        handle: "industrial-oil-skimmer-zs-1000",
        vendor: "Zebra Skimmers",
        product_type: "Oil Removal Equipment",
        price: 2499.00,
        compare_at_price: 2799.00,
        sku: "ZS-1000-STD",
        inventory: 15,
        weight: 85,
        tags: ["industrial", "oil-removal", "coolant-management", "manufacturing"],
        description: "Professional-grade oil skimmer designed for industrial coolant systems. Removes tramp oil and floating contaminants to extend coolant life and improve machining performance.",
        specifications: {
          dimensions: {
            length: { value: "24", unit: "in", tolerance: "±0.5", display_name: "Length" },
            width: { value: "18", unit: "in", tolerance: "±0.5", display_name: "Width" },
            height: { value: "36", unit: "in", tolerance: "±1", display_name: "Height" },
            weight: { value: "85", unit: "lbs", display_name: "Weight" }
          },
          performance: {
            flow_rate: { value: "10", unit: "GPM", range: "5-15", display_name: "Flow Rate" },
            removal_rate: { value: "95", unit: "%", description: "Oil removal efficiency", display_name: "Removal Efficiency" },
            temperature_range: { min: "32", max: "180", unit: "°F", display_name: "Operating Temperature" }
          },
          electrical: {
            voltage: { value: "120", unit: "VAC", display_name: "Input Voltage" },
            power: { value: "0.5", unit: "HP", display_name: "Motor Power" },
            frequency: { value: "60", unit: "Hz", display_name: "Frequency" }
          }
        }
      },
      {
        title: "Coolant Management System CMS-2000",
        handle: "coolant-management-system-cms-2000",
        vendor: "Zebra Skimmers",
        product_type: "Coolant Systems",
        price: 15000.00,
        compare_at_price: 17500.00,
        sku: "CMS-2000-PRO",
        inventory: 8,
        weight: 450,
        tags: ["industrial", "coolant-management", "manufacturing", "automation"],
        description: "Complete coolant management solution with automated monitoring, filtration, and chemical dosing for large manufacturing operations.",
        specifications: {
          dimensions: {
            length: { value: "72", unit: "in", tolerance: "±1", display_name: "Length" },
            width: { value: "48", unit: "in", tolerance: "±1", display_name: "Width" },
            height: { value: "84", unit: "in", tolerance: "±2", display_name: "Height" },
            weight: { value: "450", unit: "lbs", display_name: "Weight" }
          },
          performance: {
            flow_rate: { value: "100", unit: "GPM", range: "50-150", display_name: "Flow Rate" },
            tank_capacity: { value: "500", unit: "gal", display_name: "Tank Capacity" },
            filtration: { value: "5", unit: "micron", description: "Particle filtration rating" }
          },
          electrical: {
            voltage: { value: "480", unit: "VAC", display_name: "Input Voltage" },
            power: { value: "5", unit: "HP", display_name: "Total Power" },
            control: { value: "PLC", description: "Programmable Logic Controller" }
          }
        }
      }
    ]
  },
  industrial_equipment: {
    name: "Industrial Equipment",
    products: [
      {
        title: "Heavy Duty Conveyor Belt System",
        handle: "heavy-duty-conveyor-belt-system",
        vendor: "Industrial Solutions",
        product_type: "Material Handling",
        price: 8500.00,
        compare_at_price: 9200.00,
        sku: "CONV-HD-100",
        inventory: 12,
        weight: 320,
        tags: ["industrial", "material-handling", "conveyor", "heavy-duty"],
        description: "Robust conveyor system designed for heavy industrial applications. Features steel construction and variable speed control.",
        specifications: {
          dimensions: {
            length: { value: "100", unit: "ft", display_name: "Belt Length" },
            width: { value: "24", unit: "in", display_name: "Belt Width" },
            height: { value: "42", unit: "in", display_name: "Height" },
            weight: { value: "320", unit: "lbs", display_name: "Weight" }
          },
          performance: {
            capacity: { value: "1000", unit: "lbs/min", display_name: "Capacity" },
            speed: { value: "0-200", unit: "ft/min", display_name: "Variable Speed" },
            load_capacity: { value: "500", unit: "lbs/ft", display_name: "Load Capacity" }
          },
          materials: {
            frame: { value: "Carbon Steel", description: "Powder coated carbon steel frame" },
            belt: { value: "Rubber", description: "Heavy duty rubber belt material" },
            rollers: { value: "Steel", description: "Precision steel rollers" }
          }
        }
      }
    ]
  },
  tools: {
    name: "Industrial Tools",
    products: [
      {
        title: "Professional Welding Station WS-300",
        handle: "professional-welding-station-ws-300",
        vendor: "WeldPro",
        product_type: "Welding Equipment",
        price: 3200.00,
        compare_at_price: 3600.00,
        sku: "WS-300-PRO",
        inventory: 20,
        weight: 95,
        tags: ["welding", "tools", "professional", "industrial"],
        description: "Complete welding station with advanced controls, fume extraction, and precision positioning. Ideal for professional fabrication work.",
        specifications: {
          welding: {
            current_range: { min: "10", max: "300", unit: "A", display_name: "Current Range" },
            duty_cycle: { value: "60", unit: "%", description: "At maximum current" },
            processes: { value: "MIG/TIG/Stick", description: "Supported welding processes" }
          },
          electrical: {
            input_voltage: { value: "230/460", unit: "VAC", display_name: "Input Voltage" },
            power: { value: "15", unit: "kW", display_name: "Power Consumption" },
            efficiency: { value: "85", unit: "%", display_name: "Efficiency" }
          }
        }
      }
    ]
  },
  safety: {
    name: "Safety Equipment",
    products: [
      {
        title: "Industrial Safety Cabinet SC-45",
        handle: "industrial-safety-cabinet-sc-45",
        vendor: "SafeGuard",
        product_type: "Safety Storage",
        price: 1200.00,
        compare_at_price: 1350.00,
        sku: "SC-45-YEL",
        inventory: 25,
        weight: 180,
        tags: ["safety", "storage", "industrial", "compliance"],
        description: "OSHA compliant safety cabinet for flammable liquid storage. Features double-wall construction and automatic closing doors.",
        specifications: {
          dimensions: {
            width: { value: "43", unit: "in", display_name: "Width" },
            depth: { value: "18", unit: "in", display_name: "Depth" },
            height: { value: "65", unit: "in", display_name: "Height" },
            capacity: { value: "45", unit: "gal", display_name: "Storage Capacity" }
          },
          safety: {
            fire_rating: { value: "10", unit: "min", description: "Fire resistance rating" },
            compliance: { value: "OSHA/NFPA", description: "Regulatory compliance" },
            construction: { value: "Double Wall", description: "18-gauge steel double wall" }
          }
        }
      }
    ]
  }
};

// Generate attachment data for products
function generateAttachments(productHandle, category) {
  const baseAttachments = [
    {
      id: `${productHandle}_manual`,
      name: "Installation Manual",
      url: `/files/${productHandle}-manual.pdf`,
      type: "pdf",
      size: "2.4 MB",
      category: "manuals",
      description: "Complete installation and setup guide",
      access_level: "public",
      featured: true,
      order: 1
    },
    {
      id: `${productHandle}_operation`,
      name: "Operation Manual",
      url: `/files/${productHandle}-operation.pdf`,
      type: "pdf",
      size: "3.1 MB",
      category: "manuals",
      description: "Operating procedures and maintenance",
      access_level: "public",
      featured: false,
      order: 2
    }
  ];

  // Add category-specific attachments
  if (category === 'manufacturing' || category === 'industrial_equipment') {
    baseAttachments.push(
      {
        id: `${productHandle}_cad`,
        name: "3D CAD Model",
        url: `/files/${productHandle}-model.step`,
        type: "step",
        size: "15.2 MB",
        category: "cad",
        description: "STEP format 3D model",
        access_level: "customer",
        featured: true,
        order: 1
      },
      {
        id: `${productHandle}_drawing`,
        name: "Technical Drawing",
        url: `/files/${productHandle}-drawing.dwg`,
        type: "dwg",
        size: "1.8 MB",
        category: "cad",
        description: "AutoCAD technical drawing",
        access_level: "customer",
        featured: false,
        order: 2
      }
    );
  }

  if (category === 'safety') {
    baseAttachments.push({
      id: `${productHandle}_sds`,
      name: "Safety Data Sheet",
      url: `/files/${productHandle}-sds.pdf`,
      type: "pdf",
      size: "0.8 MB",
      category: "safety",
      description: "Material safety data sheet",
      access_level: "public",
      featured: true,
      order: 1
    });
  }

  // Add compliance certificates
  baseAttachments.push(
    {
      id: `${productHandle}_ce`,
      name: "CE Certificate",
      url: `/files/${productHandle}-ce.pdf`,
      type: "pdf",
      size: "0.6 MB",
      category: "certificates",
      description: "European Conformity certification",
      access_level: "public",
      featured: true,
      order: 1
    },
    {
      id: `${productHandle}_iso`,
      name: "ISO 9001 Certificate",
      url: `/files/${productHandle}-iso.pdf`,
      type: "pdf",
      size: "1.0 MB",
      category: "certificates",
      description: "Quality management certification",
      access_level: "public",
      featured: false,
      order: 2
    }
  );

  return baseAttachments;
}

// Generate additional products for each category to reach 50+ total
function generateAdditionalProducts() {
  const additionalProducts = [];
  
  // Manufacturing Equipment (15 more products)
  const manufacturingProducts = [
    "CNC Machining Center MC-400",
    "Hydraulic Press HP-50T",
    "Industrial Lathe IL-1640",
    "Milling Machine MM-3000",
    "Grinding Machine GM-1200",
    "Drill Press DP-20",
    "Band Saw BS-14",
    "Surface Grinder SG-818",
    "Boring Machine BM-100",
    "Plasma Cutter PC-65",
    "Waterjet Cutter WJ-3020",
    "Laser Cutter LC-1325",
    "Punch Press PP-30T",
    "Shear Machine SM-10",
    "Roll Former RF-24"
  ];

  manufacturingProducts.forEach((title, index) => {
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    additionalProducts.push({
      title,
      handle,
      vendor: "Industrial Manufacturing",
      product_type: "Manufacturing Equipment",
      price: 5000 + (index * 500),
      compare_at_price: 5500 + (index * 500),
      sku: `MFG-${1000 + index}`,
      inventory: 5 + (index % 10),
      weight: 200 + (index * 50),
      tags: ["manufacturing", "industrial", "equipment", "cnc"],
      description: `Professional ${title.toLowerCase()} designed for precision manufacturing operations. Features advanced controls and robust construction.`,
      category: "manufacturing"
    });
  });

  // Industrial Equipment (10 more products)
  const industrialProducts = [
    "Air Compressor AC-100HP",
    "Industrial Generator IG-250KW",
    "Forklift Electric FE-5000",
    "Overhead Crane OC-10T",
    "Pallet Jack PJ-5500",
    "Industrial Vacuum IV-3000",
    "Pressure Washer PW-4000PSI",
    "Material Lift ML-2000",
    "Dock Leveler DL-8x6",
    "Loading Dock Seal LDS-9x10"
  ];

  industrialProducts.forEach((title, index) => {
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    additionalProducts.push({
      title,
      handle,
      vendor: "Heavy Industries",
      product_type: "Industrial Equipment",
      price: 8000 + (index * 1000),
      compare_at_price: 9000 + (index * 1000),
      sku: `IND-${2000 + index}`,
      inventory: 3 + (index % 8),
      weight: 500 + (index * 100),
      tags: ["industrial", "equipment", "heavy-duty", "commercial"],
      description: `Heavy-duty ${title.toLowerCase()} built for demanding industrial applications. Engineered for reliability and performance.`,
      category: "industrial_equipment"
    });
  });

  // Tools (15 more products)
  const toolProducts = [
    "Angle Grinder AG-9",
    "Impact Wrench IW-1000",
    "Circular Saw CS-7.25",
    "Reciprocating Saw RS-12A",
    "Hammer Drill HD-18V",
    "Rotary Hammer RH-1.5",
    "Belt Sander BS-4x24",
    "Orbital Sander OS-5",
    "Router RT-2.25HP",
    "Jigsaw JS-6.5A",
    "Planer PL-6",
    "Multimeter MM-600V",
    "Torque Wrench TW-250",
    "Pipe Wrench PW-24",
    "Tool Chest TC-26"
  ];

  toolProducts.forEach((title, index) => {
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    additionalProducts.push({
      title,
      handle,
      vendor: "ProTools",
      product_type: "Professional Tools",
      price: 150 + (index * 50),
      compare_at_price: 200 + (index * 50),
      sku: `TOOL-${3000 + index}`,
      inventory: 25 + (index % 15),
      weight: 5 + (index * 2),
      tags: ["tools", "professional", "industrial", "power-tools"],
      description: `Professional-grade ${title.toLowerCase()} designed for industrial and commercial use. Built for durability and precision.`,
      category: "tools"
    });
  });

  // Safety Equipment (10 more products)
  const safetyProducts = [
    "Hard Hat Safety Helmet",
    "Safety Glasses Clear Lens",
    "Work Gloves Cut Resistant",
    "Safety Boots Steel Toe",
    "High Vis Safety Vest",
    "Respirator Half Face",
    "Fall Protection Harness",
    "Safety Barrier System",
    "Emergency Eye Wash Station",
    "First Aid Kit Industrial"
  ];

  safetyProducts.forEach((title, index) => {
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    additionalProducts.push({
      title,
      handle,
      vendor: "SafetyFirst",
      product_type: "Safety Equipment",
      price: 25 + (index * 25),
      compare_at_price: 35 + (index * 25),
      sku: `SAFE-${4000 + index}`,
      inventory: 50 + (index % 20),
      weight: 1 + (index * 0.5),
      tags: ["safety", "ppe", "industrial", "compliance"],
      description: `OSHA compliant ${title.toLowerCase()} for industrial workplace safety. Meets or exceeds safety standards.`,
      category: "safety"
    });
  });

  return additionalProducts;
}

// Generate CSV for product import
function generateProductCSV() {
  const allProducts = [];
  
  // Add base products from categories
  Object.keys(productCategories).forEach(categoryKey => {
    const category = productCategories[categoryKey];
    category.products.forEach(product => {
      product.category = categoryKey;
      allProducts.push(product);
    });
  });

  // Add additional products
  allProducts.push(...generateAdditionalProducts());

  // CSV headers
  const csvHeaders = [
    'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type',
    'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
    'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker',
    'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service',
    'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable',
    'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
    'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category',
    'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN',
    'Google Shopping / AdWords Grouping', 'Google Shopping / AdWords Labels',
    'Google Shopping / Condition', 'Google Shopping / Custom Product', 'Google Shopping / Custom Label 0',
    'Google Shopping / Custom Label 1', 'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3',
    'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit', 'Variant Tax Code',
    'Cost per item', 'Status'
  ];

  // Helper function to properly escape CSV values
  function escapeCSVValue(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If the value contains commas, quotes, or newlines, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
  }

  const csvRows = [csvHeaders.join(',')];

  allProducts.forEach(product => {
    const row = [
      escapeCSVValue(product.handle),
      escapeCSVValue(product.title),
      escapeCSVValue(product.description),
      escapeCSVValue(product.vendor),
      escapeCSVValue(productCategories[product.category]?.name || 'Industrial'),
      escapeCSVValue(product.product_type),
      escapeCSVValue(product.tags.join(', ')),
      'TRUE', // Published
      'Title', // Option1 Name
      'Default Title', // Option1 Value
      '', '', '', '', // Option2 and Option3
      escapeCSVValue(product.sku),
      Math.round(product.weight * 453.592), // Convert lbs to grams
      'shopify', // Inventory Tracker
      product.inventory,
      'deny', // Inventory Policy
      'manual', // Fulfillment Service
      product.price,
      product.compare_at_price || '',
      'TRUE', // Requires Shipping
      'TRUE', // Taxable
      '', // Barcode
      '', // Image Src (to be added manually)
      '', // Image Position
      escapeCSVValue(product.title), // Image Alt Text
      'FALSE', // Gift Card
      escapeCSVValue(`${product.title} - ${product.vendor}`), // SEO Title
      escapeCSVValue(`${product.description.substring(0, 160)}...`), // SEO Description
      '', '', '', '', '', '', '', '', '', '', '', '', '', // Google Shopping fields
      '', // Variant Image
      'lb', // Weight Unit
      '', // Tax Code
      Math.round(product.price * 0.6), // Cost per item (60% of price)
      'active' // Status
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Generate basic specifications for additional products
function generateBasicSpecifications(product, category) {
  const baseSpecs = {
    dimensions: {
      weight: { value: product.weight.toString(), unit: "lbs", display_name: "Weight" }
    }
  };

  // Add category-specific specifications
  switch (category) {
    case 'manufacturing':
      baseSpecs.performance = {
        capacity: { value: "Industrial Grade", description: "Professional capacity rating" },
        precision: { value: "±0.001", unit: "in", display_name: "Precision" }
      };
      baseSpecs.electrical = {
        voltage: { value: "230/460", unit: "VAC", display_name: "Input Voltage" },
        power: { value: Math.ceil(product.price / 1000).toString(), unit: "HP", display_name: "Power" }
      };
      break;
    
    case 'industrial_equipment':
      baseSpecs.performance = {
        capacity: { value: "Heavy Duty", description: "Industrial capacity rating" },
        duty_cycle: { value: "Continuous", description: "Operating duty cycle" }
      };
      baseSpecs.electrical = {
        voltage: { value: "480", unit: "VAC", display_name: "Input Voltage" },
        power: { value: Math.ceil(product.price / 2000).toString(), unit: "HP", display_name: "Power" }
      };
      break;
    
    case 'tools':
      baseSpecs.performance = {
        rating: { value: "Professional Grade", description: "Tool rating" },
        duty_cycle: { value: "Heavy Duty", description: "Usage rating" }
      };
      if (product.price > 500) {
        baseSpecs.electrical = {
          voltage: { value: "120", unit: "VAC", display_name: "Input Voltage" },
          power: { value: (product.price / 400).toFixed(1), unit: "HP", display_name: "Power" }
        };
      }
      break;
    
    case 'safety':
      baseSpecs.safety = {
        compliance: { value: "OSHA/ANSI", description: "Safety compliance standards" },
        rating: { value: "Industrial Grade", description: "Safety rating" }
      };
      break;
  }

  return baseSpecs;
}

// Generate metafield data for products
function generateMetafieldData() {
  const metafieldData = {};
  
  // Add base products with detailed specifications
  Object.keys(productCategories).forEach(categoryKey => {
    const category = productCategories[categoryKey];
    category.products.forEach(product => {
      if (product.specifications) {
        metafieldData[product.handle] = {
          specifications: {
            specifications: product.specifications,
            categories: {
              dimensions: { name: "Dimensions & Weight", order: 1, collapsible: true },
              performance: { name: "Performance Specifications", order: 2, collapsible: true },
              electrical: { name: "Electrical Requirements", order: 3, collapsible: true },
              materials: { name: "Materials & Construction", order: 4, collapsible: false },
              welding: { name: "Welding Specifications", order: 2, collapsible: true },
              safety: { name: "Safety & Compliance", order: 5, collapsible: true }
            }
          },
          attachments: generateAttachments(product.handle, categoryKey)
        };
      }
    });
  });

  // Add additional products with basic specifications
  const additionalProducts = generateAdditionalProducts();
  additionalProducts.forEach(product => {
    const specifications = generateBasicSpecifications(product, product.category);
    metafieldData[product.handle] = {
      specifications: {
        specifications,
        categories: {
          dimensions: { name: "Dimensions & Weight", order: 1, collapsible: true },
          performance: { name: "Performance Specifications", order: 2, collapsible: true },
          electrical: { name: "Electrical Requirements", order: 3, collapsible: true },
          safety: { name: "Safety & Compliance", order: 4, collapsible: true }
        }
      },
      attachments: generateAttachments(product.handle, product.category)
    };
  });

  return metafieldData;
}

// Main generation function
function generateProductCatalog() {
  const outputDir = path.join(__dirname, 'generated');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate CSV file
  const csvContent = generateProductCSV();
  fs.writeFileSync(path.join(outputDir, 'products-import.csv'), csvContent);

  // Generate metafield data
  const metafieldData = generateMetafieldData();
  fs.writeFileSync(
    path.join(outputDir, 'metafield-data.json'), 
    JSON.stringify(metafieldData, null, 2)
  );

  // Generate summary
  const summary = {
    total_products: Object.keys(productCategories).reduce((sum, key) => 
      sum + productCategories[key].products.length, 0) + 50,
    categories: Object.keys(productCategories).map(key => ({
      key,
      name: productCategories[key].name,
      product_count: productCategories[key].products.length
    })),
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(outputDir, 'catalog-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`Generated product catalog with ${summary.total_products} products`);
  console.log(`Files created in: ${outputDir}`);
  console.log('- products-import.csv (Shopify import file)');
  console.log('- metafield-data.json (Specification and attachment data)');
  console.log('- catalog-summary.json (Generation summary)');
}

// Export for use in other scripts
export {
  productCategories,
  generateAttachments,
  generateProductCSV,
  generateMetafieldData,
  generateProductCatalog
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateProductCatalog();
}