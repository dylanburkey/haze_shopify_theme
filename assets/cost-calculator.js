/**
 * Cost Savings Calculator
 * 
 * Interactive calculator for demonstrating theme value proposition
 * Includes real-time calculations, chart generation, and export functionality
 */

class CostCalculator {
  constructor(options = {}) {
    this.themePrice = options.themePrice || 320;
    this.container = options.container || document.getElementById('cost-calculator');
    this.checkboxes = this.container?.querySelectorAll('.feature-item__checkbox') || [];
    this.elements = this.getElements();
    this.chartCanvas = this.container?.querySelector('#cost-chart-canvas');
    
    this.init();
  }
  
  getElements() {
    if (!this.container) return {};
    
    return {
      monthlyTotal: this.container.querySelector('#monthly-cost'),
      annualSavings: this.container.querySelector('#annual-savings'),
      threeYearSavings: this.container.querySelector('#three-year-savings'),
      paybackPeriod: this.container.querySelector('#payback-period'),
      tabs: this.container.querySelectorAll('.cost-calculator__tab'),
      contents: this.container.querySelectorAll('.cost-calculator__content')
    };
  }
  
  init() {
    if (!this.container) return;
    
    this.setupEventListeners();
    this.calculateSavings();
  }
  
  setupEventListeners() {
    // Feature checkbox listeners
    this.checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.calculateSavings());
    });
    
    // Tab navigation listeners
    this.elements.tabs?.forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
  }
  
  switchTab(targetTab) {
    // Update active tab
    this.elements.tabs?.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetTab);
    });
    
    // Update active content
    this.elements.contents?.forEach(content => {
      const isTarget = content.id === targetTab + '-content';
      content.classList.toggle('active', isTarget);
    });
  }
  
  calculateSavings() {
    const data = this.getCalculationData();
    this.updateDisplay(data);
    this.updateChart(data);
    
    return data;
  }
  
  getCalculationData() {
    let monthlyTotal = 0;
    
    this.checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        monthlyTotal += parseFloat(checkbox.dataset.monthlyCost || 0);
      }
    });
    
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
  
  updateDisplay(data) {
    if (this.elements.monthlyTotal) {
      this.elements.monthlyTotal.textContent = '$' + data.monthlyTotal.toFixed(0);
    }
    
    if (this.elements.annualSavings) {
      this.elements.annualSavings.textContent = '$' + data.annualSavings.toFixed(0);
    }
    
    if (this.elements.threeYearSavings) {
      this.elements.threeYearSavings.textContent = '$' + data.threeYearSavings.toFixed(0);
    }
    
    if (this.elements.paybackPeriod) {
      this.elements.paybackPeriod.textContent = data.paybackDays + ' days';
    }
  }
  
  updateChart(data) {
    if (!this.chartCanvas) return;
    
    const maxValue = Math.max(
      this.themePrice,
      data.annualCost,
      data.threeYearCost
    );
    
    const chartHTML = this.generateChartHTML(data, maxValue);
    this.chartCanvas.innerHTML = chartHTML;
  }
  
  generateChartHTML(data, maxValue) {
    const barWidth = (value) => Math.max(5, (value / maxValue) * 100);
    
    return `
      <div class="cost-chart__bar">
        <div class="cost-chart__bar-label">Theme Cost</div>
        <div class="cost-chart__bar-visual" style="width: ${barWidth(this.themePrice)}%"></div>
        <div class="cost-chart__bar-value">$${this.themePrice}</div>
      </div>
      <div class="cost-chart__bar">
        <div class="cost-chart__bar-label">Year 1 Apps</div>
        <div class="cost-chart__bar-visual" style="width: ${barWidth(data.annualCost)}%; background: linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)"></div>
        <div class="cost-chart__bar-value">$${data.annualCost.toFixed(0)}</div>
      </div>
      <div class="cost-chart__bar">
        <div class="cost-chart__bar-label">Year 2 Apps</div>
        <div class="cost-chart__bar-visual" style="width: ${barWidth(data.annualCost)}%; background: linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)"></div>
        <div class="cost-chart__bar-value">$${data.annualCost.toFixed(0)}</div>
      </div>
      <div class="cost-chart__bar">
        <div class="cost-chart__bar-label">Year 3 Apps</div>
        <div class="cost-chart__bar-visual" style="width: ${barWidth(data.annualCost)}%; background: linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)"></div>
        <div class="cost-chart__bar-value">$${data.annualCost.toFixed(0)}</div>
      </div>
      <div class="cost-chart__bar">
        <div class="cost-chart__bar-label">3-Year Total</div>
        <div class="cost-chart__bar-visual" style="width: ${barWidth(data.threeYearCost)}%; background: linear-gradient(90deg, #ff4757 0%, #ff6b6b 100%)"></div>
        <div class="cost-chart__bar-value">$${data.threeYearCost.toFixed(0)}</div>
      </div>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--color-primary, #d71920); text-align: center;">
        <strong>Total Savings: $${data.threeYearSavings.toFixed(0)} over 3 years</strong>
        <br>
        <small style="opacity: 0.8; margin-top: 8px; display: block;">ROI: ${data.roiPercentage.toFixed(0)}% in first year</small>
      </div>
    `;
  }
  
  exportCalculation(format = 'json') {
    const data = this.getCalculationData();
    const exportData = {
      themePrice: this.themePrice,
      selectedFeatures: this.getSelectedFeatures(),
      calculations: data,
      timestamp: new Date().toISOString()
    };
    
    switch (format.toLowerCase()) {
      case 'json':
        return this.exportAsJSON(exportData);
      case 'csv':
        return this.exportAsCSV(exportData);
      case 'pdf':
        return this.exportAsPDF(exportData);
      default:
        return exportData;
    }
  }
  
  getSelectedFeatures() {
    const features = [];
    this.checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const label = checkbox.parentElement.querySelector('label h3');
        const cost = checkbox.dataset.monthlyCost;
        features.push({
          name: label?.textContent || 'Unknown Feature',
          monthlyCost: parseFloat(cost || 0)
        });
      }
    });
    return features;
  }
  
  exportAsJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-savings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return data;
  }
  
  exportAsCSV(data) {
    const csvRows = [
      ['Metric', 'Value'],
      ['Theme Price', `$${data.themePrice}`],
      ['Monthly App Costs', `$${data.calculations.monthlyTotal}`],
      ['Annual Savings', `$${data.calculations.annualSavings}`],
      ['3-Year Savings', `$${data.calculations.threeYearSavings}`],
      ['Payback Period', `${data.calculations.paybackDays} days`],
      ['ROI Percentage', `${data.calculations.roiPercentage.toFixed(1)}%`],
      [''],
      ['Selected Features', 'Monthly Cost'],
      ...data.selectedFeatures.map(f => [f.name, `$${f.monthlyCost}`])
    ];
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-savings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return csvContent;
  }
  
  exportAsPDF(data) {
    // Simple PDF export using window.print with custom styles
    const printWindow = window.open('', '_blank');
    const printContent = this.generatePrintContent(data);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cost Savings Analysis</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .metric { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
            .metric-label { font-weight: bold; }
            .metric-value { font-size: 1.2em; color: #d71920; }
            .features { margin-top: 30px; }
            .feature { padding: 10px; border-bottom: 1px solid #eee; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    return data;
  }
  
  generatePrintContent(data) {
    const featuresHTML = data.selectedFeatures
      .map(f => `<div class="feature">${f.name}: $${f.monthlyCost}/month</div>`)
      .join('');
    
    return `
      <div class="header">
        <h1>Cost Savings Analysis</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="metric">
        <div class="metric-label">Theme Price:</div>
        <div class="metric-value">$${data.themePrice}</div>
      </div>
      
      <div class="metric">
        <div class="metric-label">Monthly App Costs:</div>
        <div class="metric-value">$${data.calculations.monthlyTotal}</div>
      </div>
      
      <div class="metric">
        <div class="metric-label">Annual Savings:</div>
        <div class="metric-value">$${data.calculations.annualSavings}</div>
      </div>
      
      <div class="metric">
        <div class="metric-label">3-Year Savings:</div>
        <div class="metric-value">$${data.calculations.threeYearSavings}</div>
      </div>
      
      <div class="metric">
        <div class="metric-label">Payback Period:</div>
        <div class="metric-value">${data.calculations.paybackDays} days</div>
      </div>
      
      <div class="metric">
        <div class="metric-label">ROI (First Year):</div>
        <div class="metric-value">${data.calculations.roiPercentage.toFixed(1)}%</div>
      </div>
      
      <div class="features">
        <h3>Selected Features:</h3>
        ${featuresHTML}
      </div>
    `;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if cost calculator exists on page
  const calculatorElement = document.getElementById('cost-calculator');
  if (calculatorElement) {
    // Extract theme price from data attribute or default
    const themePrice = calculatorElement.dataset.themePrice || 320;
    
    // Initialize calculator
    window.costCalculator = new CostCalculator({
      themePrice: parseFloat(themePrice),
      container: calculatorElement
    });
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CostCalculator;
}