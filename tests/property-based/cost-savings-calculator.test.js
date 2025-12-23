import { test, expect } from 'vitest';
import fc from 'fast-check';

// Feature: product-specification-system, Property 24: Cost Savings Calculator Accuracy
// Feature: product-specification-system, Property 27: Cost Comparison Chart Generation

/**
 * Cost Savings Calculator Implementation
 * Simulates the calculator logic from the theme
 */
class CostSavingsCalculator {
  constructor(themePrice = 320) {
    this.themePrice = themePrice;
  }

  calculateSavings(selectedFeatures) {
    const monthlyTotal = selectedFeatures.reduce((sum, feature) => sum + feature.monthlyCost, 0);
    const annualCost = monthlyTotal * 12;
    const annualSavings = Math.max(0, annualCost - this.themePrice);
    const threeYearCost = annualCost * 3;
    const threeYearSavings = Math.max(0, threeYearCost - this.themePrice);
    const paybackDays = monthlyTotal > 0 ? Math.ceil((this.themePrice / monthlyTotal) * 30) : 0;
    const roiPercentage = annualCost > 0 ? ((annualSavings / this.themePrice) * 100) : 0;

    return {
      monthlyTotal,
      annualCost,
      annualSavings,
      threeYearCost,
      threeYearSavings,
      paybackDays,
      roiPercentage
    };
  }

  generateChart(calculationData) {
    const { monthlyTotal, annualCost, threeYearCost, threeYearSavings } = calculationData;
    
    const maxValue = Math.max(this.themePrice, annualCost, threeYearCost);
    
    return {
      themeBar: {
        label: 'Theme Cost',
        value: this.themePrice,
        width: Math.max(5, (this.themePrice / maxValue) * 100)
      },
      yearlyBars: [1, 2, 3].map(year => ({
        label: `Year ${year} Apps`,
        value: annualCost,
        width: Math.max(5, (annualCost / maxValue) * 100)
      })),
      totalBar: {
        label: '3-Year Total',
        value: threeYearCost,
        width: Math.max(5, (threeYearCost / maxValue) * 100)
      },
      savings: {
        total: threeYearSavings,
        roi: calculationData.roiPercentage
      }
    };
  }
}

// Generators for property-based testing
const featureArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  monthlyCost: fc.float({ min: 5, max: 200, noNaN: true })
});

const selectedFeaturesArbitrary = fc.array(featureArbitrary, { minLength: 0, maxLength: 10 });

const themePriceArbitrary = fc.float({ min: 100, max: 500, noNaN: true });

const appCostDataArbitrary = fc.record({
  loyalty: fc.float({ min: 50, max: 200, noNaN: true }),
  seo: fc.float({ min: 10, max: 100, noNaN: true }),
  mega_menu: fc.float({ min: 10, max: 50, noNaN: true }),
  faq: fc.float({ min: 5, max: 30, noNaN: true }),
  attachments: fc.float({ min: 10, max: 50, noNaN: true }),
  pwa: fc.float({ min: 20, max: 80, noNaN: true })
});

test('Property 24: Cost Savings Calculator Accuracy - Monthly and annual calculations should be mathematically correct', () => {
  fc.assert(
    fc.property(
      themePriceArbitrary,
      selectedFeaturesArbitrary,
      (themePrice, selectedFeatures) => {
        const calculator = new CostSavingsCalculator(themePrice);
        const result = calculator.calculateSavings(selectedFeatures);
        
        // Calculate expected values manually
        const expectedMonthlyTotal = selectedFeatures.reduce((sum, f) => sum + f.monthlyCost, 0);
        const expectedAnnualCost = expectedMonthlyTotal * 12;
        const expectedAnnualSavings = Math.max(0, expectedAnnualCost - themePrice);
        const expectedThreeYearCost = expectedAnnualCost * 3;
        const expectedThreeYearSavings = Math.max(0, expectedThreeYearCost - themePrice);
        
        // Verify calculations are correct
        const monthlyMatch = Math.abs(result.monthlyTotal - expectedMonthlyTotal) < 0.01;
        const annualCostMatch = Math.abs(result.annualCost - expectedAnnualCost) < 0.01;
        const annualSavingsMatch = Math.abs(result.annualSavings - expectedAnnualSavings) < 0.01;
        const threeYearCostMatch = Math.abs(result.threeYearCost - expectedThreeYearCost) < 0.01;
        const threeYearSavingsMatch = Math.abs(result.threeYearSavings - expectedThreeYearSavings) < 0.01;
        
        return monthlyMatch && annualCostMatch && annualSavingsMatch && 
               threeYearCostMatch && threeYearSavingsMatch;
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 24: Cost Savings Calculator Accuracy - Payback period should be calculated correctly', () => {
  fc.assert(
    fc.property(
      themePriceArbitrary,
      selectedFeaturesArbitrary,
      (themePrice, selectedFeatures) => {
        const calculator = new CostSavingsCalculator(themePrice);
        const result = calculator.calculateSavings(selectedFeatures);
        
        const monthlyTotal = selectedFeatures.reduce((sum, f) => sum + f.monthlyCost, 0);
        
        if (monthlyTotal === 0) {
          // If no monthly costs, payback should be 0
          return result.paybackDays === 0;
        } else {
          // Payback period should be theme price divided by monthly savings, converted to days
          const expectedPaybackDays = Math.ceil((themePrice / monthlyTotal) * 30);
          return result.paybackDays === expectedPaybackDays;
        }
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 24: Cost Savings Calculator Accuracy - ROI percentage should be calculated correctly', () => {
  fc.assert(
    fc.property(
      themePriceArbitrary,
      selectedFeaturesArbitrary,
      (themePrice, selectedFeatures) => {
        const calculator = new CostSavingsCalculator(themePrice);
        const result = calculator.calculateSavings(selectedFeatures);
        
        const monthlyTotal = selectedFeatures.reduce((sum, f) => sum + f.monthlyCost, 0);
        const annualCost = monthlyTotal * 12;
        
        if (annualCost === 0) {
          // If no annual costs, ROI should be 0
          return result.roiPercentage === 0;
        } else {
          // ROI should be (annual savings / theme price) * 100
          const annualSavings = Math.max(0, annualCost - themePrice);
          const expectedROI = (annualSavings / themePrice) * 100;
          return Math.abs(result.roiPercentage - expectedROI) < 0.01;
        }
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 24: Cost Savings Calculator Accuracy - Savings should never be negative', () => {
  fc.assert(
    fc.property(
      themePriceArbitrary,
      selectedFeaturesArbitrary,
      (themePrice, selectedFeatures) => {
        const calculator = new CostSavingsCalculator(themePrice);
        const result = calculator.calculateSavings(selectedFeatures);
        
        // All savings values should be non-negative
        return result.annualSavings >= 0 && 
               result.threeYearSavings >= 0 &&
               result.monthlyTotal >= 0 &&
               result.annualCost >= 0 &&
               result.threeYearCost >= 0 &&
               result.paybackDays >= 0 &&
               result.roiPercentage >= 0;
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 27: Cost Comparison Chart Generation - Chart should contain all required elements', () => {
  fc.assert(
    fc.property(
      themePriceArbitrary,
      selectedFeaturesArbitrary,
      (themePrice, selectedFeatures) => {
        const calculator = new CostSavingsCalculator(themePrice);
        const calculationData = calculator.calculateSavings(selectedFeatures);
        const chart = calculator.generateChart(calculationData);
        
        // Chart should have all required elements
        const hasThemeBar = chart.themeBar && 
                           chart.themeBar.label === 'Theme Cost' &&
                           chart.themeBar.value === themePrice &&
                           typeof chart.themeBar.width === 'number';
        
        const hasYearlyBars = Array.isArray(chart.yearlyBars) &&
                             chart.yearlyBars.length === 3 &&
                             chart.yearlyBars.every((bar, index) => 
                               bar.label === `Year ${index + 1} Apps` &&
                               typeof bar.value === 'number' &&
                               typeof bar.width === 'number'
                             );
        
        const hasTotalBar = chart.totalBar &&
                           chart.totalBar.label === '3-Year Total' &&
                           typeof chart.totalBar.value === 'number' &&
                           typeof chart.totalBar.width === 'number';
        
        const hasSavings = chart.savings &&
                          typeof chart.savings.total === 'number' &&
                          typeof chart.savings.roi === 'number';
        
        return hasThemeBar && hasYearlyBars && hasTotalBar && hasSavings;
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 27: Cost Comparison Chart Generation - Chart bar widths should be proportional', () => {
  fc.assert(
    fc.property(
      themePriceArbitrary,
      selectedFeaturesArbitrary,
      (themePrice, selectedFeatures) => {
        const calculator = new CostSavingsCalculator(themePrice);
        const calculationData = calculator.calculateSavings(selectedFeatures);
        const chart = calculator.generateChart(calculationData);
        
        // All bar widths should be between 5 and 100 (percentage)
        const themeWidthValid = chart.themeBar.width >= 5 && chart.themeBar.width <= 100;
        const yearlyWidthsValid = chart.yearlyBars.every(bar => 
          bar.width >= 5 && bar.width <= 100
        );
        const totalWidthValid = chart.totalBar.width >= 5 && chart.totalBar.width <= 100;
        
        // The largest value should have width close to 100%
        const maxValue = Math.max(
          themePrice,
          calculationData.annualCost,
          calculationData.threeYearCost
        );
        
        let maxWidthCorrect = true;
        if (maxValue === themePrice) {
          maxWidthCorrect = Math.abs(chart.themeBar.width - 100) < 1;
        } else if (maxValue === calculationData.threeYearCost) {
          maxWidthCorrect = Math.abs(chart.totalBar.width - 100) < 1;
        } else if (maxValue === calculationData.annualCost) {
          maxWidthCorrect = chart.yearlyBars.some(bar => Math.abs(bar.width - 100) < 1);
        }
        
        return themeWidthValid && yearlyWidthsValid && totalWidthValid && maxWidthCorrect;
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 27: Cost Comparison Chart Generation - Chart values should match calculation data', () => {
  fc.assert(
    fc.property(
      themePriceArbitrary,
      selectedFeaturesArbitrary,
      (themePrice, selectedFeatures) => {
        const calculator = new CostSavingsCalculator(themePrice);
        const calculationData = calculator.calculateSavings(selectedFeatures);
        const chart = calculator.generateChart(calculationData);
        
        // Chart values should match the calculation data
        const themeValueMatch = chart.themeBar.value === themePrice;
        const yearlyValuesMatch = chart.yearlyBars.every(bar => 
          Math.abs(bar.value - calculationData.annualCost) < 0.01
        );
        const totalValueMatch = Math.abs(chart.totalBar.value - calculationData.threeYearCost) < 0.01;
        const savingsMatch = Math.abs(chart.savings.total - calculationData.threeYearSavings) < 0.01 &&
                            Math.abs(chart.savings.roi - calculationData.roiPercentage) < 0.01;
        
        return themeValueMatch && yearlyValuesMatch && totalValueMatch && savingsMatch;
      }
    ),
    { numRuns: 100 }
  );
});

// Edge case tests
test('Property 24: Cost Savings Calculator Accuracy - Zero monthly costs should result in zero savings', () => {
  const calculator = new CostSavingsCalculator(320);
  const result = calculator.calculateSavings([]);
  
  expect(result.monthlyTotal).toBe(0);
  expect(result.annualCost).toBe(0);
  expect(result.annualSavings).toBe(0);
  expect(result.threeYearSavings).toBe(0);
  expect(result.paybackDays).toBe(0);
  expect(result.roiPercentage).toBe(0);
});

test('Property 24: Cost Savings Calculator Accuracy - High theme price should result in longer payback', () => {
  const features = [{ name: 'Test Feature', monthlyCost: 100 }];
  
  const lowPriceCalculator = new CostSavingsCalculator(100);
  const highPriceCalculator = new CostSavingsCalculator(500);
  
  const lowResult = lowPriceCalculator.calculateSavings(features);
  const highResult = highPriceCalculator.calculateSavings(features);
  
  expect(highResult.paybackDays).toBeGreaterThan(lowResult.paybackDays);
});

test('Property 27: Cost Comparison Chart Generation - Empty features should still generate valid chart', () => {
  const calculator = new CostSavingsCalculator(320);
  const calculationData = calculator.calculateSavings([]);
  const chart = calculator.generateChart(calculationData);
  
  expect(chart.themeBar.value).toBe(320);
  expect(chart.yearlyBars).toHaveLength(3);
  expect(chart.totalBar.value).toBe(0);
  expect(chart.savings.total).toBe(0);
});