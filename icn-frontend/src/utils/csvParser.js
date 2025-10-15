export const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return { headers, data };
  };
  
  export const validateCompanyData = (data) => {
    const required = ['name', 'type', 'address'];
    const errors = [];
    
    data.forEach((row, index) => {
      required.forEach(field => {
        if (!row[field]) {
          errors.push(`Row ${index + 2}: Missing required field "${field}"`);
        }
      });
    });
    
    return errors;
  };
  
  export const transformCompanyData = (rawData) => {
    return rawData.map(row => ({
      name: row.name || row.Name || row.company_name,
      type: row.type || row.Type || 'Supplier',
      address: row.address || row.Address || row.location,
      sectors: (row.sectors || row.Sectors || '').split(';').filter(Boolean),
      capabilities: (row.capabilities || row.Capabilities || '').split(';').filter(Boolean),
      size: row.size || row.Size || 'Small',
      employees: row.employees || row.Employees || '1-10',
      verified: row.verified === 'true' || row.verified === '1',
      abn: row.abn || row.ABN || '',
      website: row.website || row.Website || '',
      phone: row.phone || row.Phone || '',
      email: row.email || row.Email || '',
      description: row.description || row.Description || ''
    }));
  };