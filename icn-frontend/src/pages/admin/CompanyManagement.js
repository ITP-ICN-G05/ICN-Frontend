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
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    verified: false
  });

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

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      type: company.type,
      address: company.address,
      verified: company.verified
    });
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setFormData({
      name: '',
      type: '',
      address: '',
      verified: false
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        // Update existing company
        await adminService.updateCompany?.(editingCompany.id, formData);
        setCompanies(companies.map(c => 
          c.id === editingCompany.id 
            ? { ...c, ...formData } 
            : c
        ));
      } else {
        // Add new company
        const response = await adminService.addCompany?.(formData);
        const newCompany = {
          id: response?.id || Date.now(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setCompanies([...companies, newCompany]);
      }
      handleCloseForm();
    } catch (error) {
      alert('Failed to save company: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCloseForm = () => {
    setEditingCompany(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      type: '',
      address: '',
      verified: false
    });
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').slice(1); // Skip header
      const imported = rows
        .filter(row => row.trim())
        .map((row, index) => {
          const [name, type, address, verified] = row.split(',');
          return {
            id: Date.now() + index,
            name: name?.trim() || '',
            type: type?.trim() || '',
            address: address?.trim() || '',
            verified: verified?.trim().toLowerCase() === 'true',
            createdAt: new Date().toISOString().split('T')[0]
          };
        });
      
      setCompanies([...companies, ...imported]);
      alert(`Successfully imported ${imported.length} companies`);
    } catch (error) {
      alert('Failed to import CSV: ' + (error.message || 'Unknown error'));
    }
  };

  const handleExport = () => {
    try {
      const csv = [
        'Name,Type,Address,Verified,Created',
        ...companies.map(c => 
          `${c.name},${c.type},${c.address},${c.verified},${c.createdAt}`
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'companies.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export: ' + (error.message || 'Unknown error'));
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
          onClick={handleAdd}
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
        <label className="btn-import">
          📥 Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
        <button className="btn-export" onClick={handleExport}>
          📤 Export All
        </button>
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
                    onClick={() => handleEdit(company)}
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

      {(showAddForm || editingCompany) && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCompany ? 'Edit Company' : 'Add Company'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="company-name">Company Name</label>
                <input
                  id="company-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="company-type">Type</label>
                <input
                  id="company-type"
                  type="text"
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="company-address">Address</label>
                <input
                  id="company-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="company-verified">
                  <input
                    id="company-verified"
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => handleFormChange('verified', e.target.checked)}
                  />
                  Verified
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingCompany ? 'Update' : 'Add'}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCloseForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyManagement;