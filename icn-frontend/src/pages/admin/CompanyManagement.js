import React, { useState, useEffect } from 'react';
import { getAdminService } from '../../services/serviceFactory';
import './CompanyManagement.css';

function CompanyManagement() {
  const adminService = getAdminService(); 
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCompany, setEditingCompany] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllCompanies();
      const data = response.data || response;
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading companies:', error);
      // Keep existing mock data as fallback
      setCompanies([
        {
          id: 1,
          name: 'TechCorp Industries',
          type: 'Manufacturer',
          address: '123 Smith St, Melbourne',
          verified: true,
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'Global Supply Co',
          type: 'Supplier',
          address: '456 Queen Rd, Melbourne',
          verified: true,
          createdAt: '2024-01-20'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await adminService.deleteCompany?.(id);
        setCompanies(companies.filter(c => c.id !== id));
      } catch (error) {
        alert('Failed to delete company: ' + (error.message || 'Unknown error'));
      }
    }
  };
  

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="company-management">
      <div className="management-header">
        <h1>Company Management</h1>
        <button 
          className="btn-add"
          onClick={() => setShowAddForm(true)}
        >
          + Add Company
        </button>
      </div>

      <div className="management-controls">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="btn-import">📥 Import CSV</button>
        <button className="btn-export">📤 Export All</button>
      </div>

      <div className="companies-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Type</th>
              <th>Address</th>
              <th>Verified</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => (
              <tr key={company.id}>
                <td>{company.id}</td>
                <td>{company.name}</td>
                <td>{company.type}</td>
                <td>{company.address}</td>
                <td>
                  <span className={`status ${company.verified ? 'verified' : ''}`}>
                    {company.verified ? '✓' : '✗'}
                  </span>
                </td>
                <td>{company.createdAt}</td>
                <td>
                  <button 
                    className="btn-edit"
                    onClick={() => setEditingCompany(company)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(company.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompanyManagement;