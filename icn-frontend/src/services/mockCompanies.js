export const mockCompanies = [
    {
      id: '1',
      name: 'ABC Construction Ltd',
      address: '123 Smith Street, Melbourne, VIC 3000',
      verificationStatus: 'verified',
      verificationDate: '2025-01-07',
      keySectors: ['Construction', 'Manufacturing'],
      latitude: -37.8136,
      longitude: 144.9631,
      companyType: 'supplier',
      phoneNumber: '+61 3 1234 5678',
      email: 'info@abcconstruction.com.au',
      website: 'www.abcconstruction.com.au',
      distance: 2.5,
      employees: '50-200',
      ownership: ['Australian-owned'],
    },
    {
      id: '2',
      name: 'XYZ Engineering',
      address: '456 Collins Street, Melbourne, VIC 3000',
      verificationStatus: 'unverified',
      keySectors: ['Engineering', 'Consulting'],
      latitude: -37.8140,
      longitude: 144.9633,
      companyType: 'consultant',
      phoneNumber: '+61 3 9876 5432',
      distance: 3.1,
      employees: '10-50',
      ownership: [],
    },
    {
      id: '3',
      name: 'Global Manufacturing Co',
      address: '789 Bourke Street, Melbourne, VIC 3000',
      verificationStatus: 'verified',
      verificationDate: '2024-12-15',
      keySectors: ['Manufacturing', 'Supply Chain'],
      latitude: -37.8125,
      longitude: 144.9635,
      companyType: 'manufacturer',
      email: 'contact@globalmanufacturing.com',
      website: 'www.globalmanufacturing.com',
      distance: 1.8,
      employees: '200-500',
      ownership: ['Female-owned', 'Australian Disability Enterprise'],
    },
    {
      id: '4',
      name: 'Tech Solutions Pty Ltd',
      address: '321 Swanston Street, Melbourne, VIC 3000',
      verificationStatus: 'verified',
      verificationDate: '2025-01-02',
      keySectors: ['Technology', 'Services'],
      latitude: -37.8150,
      longitude: 144.9640,
      companyType: 'service',
      website: 'www.techsolutions.com.au',
      distance: 4.2,
      employees: '10-50',
      ownership: ['First Nations-owned'],
    },
    {
      id: '5',
      name: 'BuildRight Construction',
      address: '555 Elizabeth Street, Melbourne, VIC 3000',
      verificationStatus: 'unverified',
      keySectors: ['Construction', 'Infrastructure'],
      latitude: -37.8110,
      longitude: 144.9620,
      companyType: 'both',
      distance: 5.5,
      employees: '100-200',
      ownership: ['Social Enterprise'],
    },
  ];
  
  export function generateMockCompanies(count = 100) {
    const sectors = ['Construction', 'Manufacturing', 'Engineering', 'Technology', 'Consulting', 'Retail', 'Logistics', 'Services', 'Infrastructure', 'Environment'];
    const streets = ['King Street', 'Queen Street', 'Flinders Street', 'Spencer Street', 'William Street', 'Russell Street', 'Exhibition Street'];
    const cities = ['Melbourne', 'Sydney', 'Brisbane', 'Adelaide', 'Perth', 'Hobart'];
    const states = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS'];
    const types = ['supplier', 'manufacturer', 'service', 'consultant', 'both'];
    const ownership = ['Female-owned', 'First Nations-owned', 'Social Enterprise', 'Australian Disability Enterprise', 'Australian-owned'];
    const employeeRanges = ['1-10', '10-50', '50-200', '200-500', '500+'];
    
    const additionalCompanies = [];
    
    for (let i = 6; i <= count; i++) {
      const cityIndex = Math.floor(Math.random() * cities.length);
      additionalCompanies.push({
        id: i.toString(),
        name: `Company ${i}`,
        address: `${i * 10} ${streets[i % streets.length]}, ${cities[cityIndex]}, ${states[cityIndex]} ${3000 + Math.floor(Math.random() * 200)}`,
        verificationStatus: Math.random() > 0.5 ? 'verified' : 'unverified',
        verificationDate: Math.random() > 0.5 ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] : undefined,
        keySectors: [sectors[i % sectors.length], sectors[(i + 1) % sectors.length]],
        latitude: -37.8136 + (Math.random() - 0.5) * 0.1,
        longitude: 144.9631 + (Math.random() - 0.5) * 0.1,
        companyType: types[i % types.length],
        distance: Math.random() * 20,
        employees: employeeRanges[Math.floor(Math.random() * employeeRanges.length)],
        ownership: Math.random() > 0.7 ? [ownership[Math.floor(Math.random() * ownership.length)]] : [],
        phoneNumber: Math.random() > 0.5 ? `+61 3 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}` : undefined,
        email: Math.random() > 0.5 ? `info@company${i}.com.au` : undefined,
        website: Math.random() > 0.5 ? `www.company${i}.com.au` : undefined,
        capabilities: ['Manufacturing', 'Supply Chain', 'Design', 'Assembly', 'Distribution'].slice(0, Math.floor(Math.random() * 4) + 1),
      });
    }
    
    return [...mockCompanies, ...additionalCompanies];
  }