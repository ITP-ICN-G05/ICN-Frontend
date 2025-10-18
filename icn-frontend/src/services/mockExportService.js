import { checkTierAccess, getTierLimit } from '../utils/tierConfig';
import { TIER_FEATURES, TIER_LIMITS } from '../utils/tierConfig';

class MockExportService {
  async exportToCSV(companyIds, tierLevel) {
    await this.delay(800);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check tier access
    if (!checkTierAccess(user.tier, TIER_FEATURES.EXPORT_BASIC)) {
      throw new Error('Export feature not available in free tier. Upgrade to Plus or Premium to export company data.');
    }
    
    // Check export limits
    const exportLimit = getTierLimit(user.tier, TIER_LIMITS.EXPORT_LIMIT);
    if (exportLimit === 0) {
      throw new Error('No exports remaining this month. Upgrade your plan for more exports.');
    }
    
    // Create mock CSV data
    const csvData = this.generateCSV(companyIds, user.tier);
    
    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `companies-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { 
      success: true,
      downloadUrl: url,
      filename: `companies-export-${Date.now()}.csv`
    };
  }
  
  async exportToPDF(companyIds, tierLevel) {
    await this.delay(1000);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check tier access - PDF export requires full export access
    if (!checkTierAccess(user.tier, TIER_FEATURES.EXPORT_FULL)) {
      throw new Error('PDF export only available in Premium tier. Upgrade to Premium for full export capabilities.');
    }
    
    // Create mock PDF content
    const pdfContent = this.generatePDFContent(companyIds, user.tier);
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `companies-export-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { 
      success: true,
      downloadUrl: url,
      filename: `companies-export-${Date.now()}.pdf`
    };
  }
  
  async getExportQuota() {
    await this.delay(300);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const limit = getTierLimit(user.tier, TIER_LIMITS.EXPORT_LIMIT);
    
    // Mock usage data
    const used = limit === -1 ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * Math.min(limit, 20));
    
    return {
      data: {
        limit: limit,
        used: used,
        remaining: limit === -1 ? -1 : Math.max(0, limit - used),
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      }
    };
  }
  
  generateCSV(companyIds, userTier) {
    // Basic headers for all tiers
    const headers = ['ID', 'Name', 'Address', 'Type', 'Sectors', 'Verified'];
    
    // Add additional headers based on tier
    if (checkTierAccess(userTier, TIER_FEATURES.COMPANY_ABN)) {
      headers.push('ABN', 'Phone', 'Email');
    }
    
    if (checkTierAccess(userTier, TIER_FEATURES.EXPORT_FULL)) {
      headers.push('Revenue', 'Employees', 'Local Content %', 'Year Established');
    }
    
    const rows = [headers.join(',')];
    
    // Add mock data rows
    companyIds.forEach((id, index) => {
      const row = [
        id,
        `"Company ${id}"`,
        `"${100 + index * 10} Main St, Melbourne VIC 3000"`,
        '"Supplier"',
        '"Manufacturing,Technology"',
        Math.random() > 0.3 ? 'Yes' : 'No'
      ];
      
      if (checkTierAccess(userTier, TIER_FEATURES.COMPANY_ABN)) {
        row.push(
          `"${Math.floor(Math.random() * 90000000000) + 10000000000}"`,
          `"+61 3 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}"`,
          `"info@company${id}.com.au"`
        );
      }
      
      if (checkTierAccess(userTier, TIER_FEATURES.EXPORT_FULL)) {
        row.push(
          `"$${Math.floor(Math.random() * 50000000) + 100000}"`,
          `"${Math.floor(Math.random() * 500) + 10}"`,
          `"${Math.floor(Math.random() * 100)}%"`,
          `"${1990 + Math.floor(Math.random() * 30)}"`
        );
      }
      
      rows.push(row.join(','));
    });
    
    return rows.join('\\n');
  }
  
  generatePDFContent(companyIds, userTier) {
    // This would normally use a PDF library like jsPDF
    // For mock purposes, we'll create a simple text representation
    let content = `Company Export Report\\n`;
    content += `Generated: ${new Date().toLocaleString()}\\n`;
    content += `User Tier: ${userTier.toUpperCase()}\\n`;
    content += `Total Companies: ${companyIds.length}\\n\\n`;
    
    companyIds.forEach((id, index) => {
      content += `Company ${id}\\n`;
      content += `Address: ${100 + index * 10} Main St, Melbourne VIC 3000\\n`;
      content += `Type: Supplier\\n`;
      content += `Sectors: Manufacturing, Technology\\n`;
      content += `Verified: ${Math.random() > 0.3 ? 'Yes' : 'No'}\\n`;
      
      if (checkTierAccess(userTier, TIER_FEATURES.COMPANY_ABN)) {
        content += `ABN: ${Math.floor(Math.random() * 90000000000) + 10000000000}\\n`;
        content += `Phone: +61 3 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}\\n`;
      }
      
      if (checkTierAccess(userTier, TIER_FEATURES.EXPORT_FULL)) {
        content += `Revenue: $${Math.floor(Math.random() * 50000000) + 100000}\\n`;
        content += `Employees: ${Math.floor(Math.random() * 500) + 10}\\n`;
        content += `Local Content: ${Math.floor(Math.random() * 100)}%\\n`;
      }
      
      content += `\\n`;
    });
    
    return content;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockExportService = new MockExportService();
