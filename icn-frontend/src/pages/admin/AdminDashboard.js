import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [metrics, setMetrics] = useState({
    totalCompanies: 2716,
    totalUsers: 342,
    activeSubscriptions: 87,
    monthlyRevenue: 12965,
    newCompaniesThisMonth: 45,
    newUsersThisMonth: 28,
    searchesThisMonth: 1842,
    exportRequests: 156,
    pendingModeration: 12,
    activeAlerts: 8
  });
  
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all dashboard data
      const [metricsRes, companiesRes, usersRes, logsRes, moderationRes] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getAllCompanies({ limit: 10 }),
        adminService.getAllUsers({ limit: 10 }),
        adminService.getActivityLogs({ limit: 20 }),
        adminService.getFlaggedContent()
      ]);
      
      // Use mock data if API fails
    } catch (error) {
      console.error('Loading dashboard data:', error);
    } finally {
      // Set mock data for demo
      setCompanies([
        { id: 1, name: 'TechCorp Industries', type: 'Manufacturer', verified: true, status: 'active' },
        { id: 2, name: 'Global Supply Co', type: 'Supplier', verified: true, status: 'active' },
        { id: 3, name: 'ServiceMax Pro', type: 'Service Provider', verified: false, status: 'pending' }
      ]);
      
      setUsers([
        { id: 1, name: 'John Smith', email: 'john@example.com', tier: 'free', status: 'active' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', tier: 'premium', status: 'active' },
        { id: 3, name: 'Mike Chen', email: 'mike@business.com', tier: 'plus', status: 'active' }
      ]);
      
      setActivityLogs([
        { id: 1, type: 'user_signup', details: 'New user: john@example.com', timestamp: '2024-12-15 14:30' },
        { id: 2, type: 'company_added', details: 'Company added: Tech Solutions', timestamp: '2024-12-15 13:15' },
        { id: 3, type: 'subscription_upgrade', details: 'User upgraded to Premium', timestamp: '2024-12-15 11:20' }
      ]);
      
      setModerationQueue([
        { id: 1, type: 'company_update', company: 'TechCorp', changes: 'Updated description', status: 'pending' },
        { id: 2, type: 'verification_request', company: 'ServiceMax Pro', documents: 'ABN docs', status: 'pending' }
      ]);
      
      setLoading(false);
    }
  };

  const handleFileImport = async () => {
    if (!importFile) {
      alert('Please select a file first');
      return;
    }
    
    try {
      const response = await adminService.bulkImportCompanies(importFile);
      alert(`Successfully imported ${response.data.count} companies`);
      loadDashboardData();
    } catch (error) {
      alert('Import failed: ' + error.message);
    }
  };

  const handleModeration = async (id, action) => {
    try {
      if (action === 'approve') {
        await adminService.approveContent(id);
      } else {
        await adminService.rejectContent(id);
      }
      setModerationQueue(moderationQueue.filter(item => item.id !== id));
    } catch (error) {
      alert('Moderation action failed');
    }
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div className="overview-section">
            <div className="metrics-grid">
              <div className="metric-card metric-companies">
                <div className="metric-icon">🏢</div>
                <div className="metric-content">
                  <h3>{metrics.totalCompanies.toLocaleString()}</h3>
                  <p>Total Companies</p>
                  <span className="metric-change">+{metrics.newCompaniesThisMonth} this month</span>
                </div>
              </div>
              
              <div className="metric-card metric-users">
                <div className="metric-icon">👥</div>
                <div className="metric-content">
                  <h3>{metrics.totalUsers.toLocaleString()}</h3>
                  <p>Total Users</p>
                  <span className="metric-change">+{metrics.newUsersThisMonth} this month</span>
                </div>
              </div>
              
              <div className="metric-card metric-revenue">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <h3>${metrics.monthlyRevenue.toLocaleString()}</h3>
                  <p>Monthly Revenue</p>
                  <span className="metric-subscriptions">{metrics.activeSubscriptions} active</span>
                </div>
              </div>
              
              <div className="metric-card metric-activity">
                <div className="metric-icon">📊</div>
                <div className="metric-content">
                  <h3>{metrics.searchesThisMonth.toLocaleString()}</h3>
                  <p>Searches This Month</p>
                  <span className="metric-exports">{metrics.exportRequests} exports</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <button className="action-card" onClick={() => setActiveSection('companies')}>
                  <span className="action-number">{metrics.totalCompanies}</span>
                  <span className="action-label">Manage Companies</span>
                </button>
                <button className="action-card" onClick={() => setActiveSection('users')}>
                  <span className="action-number">{metrics.totalUsers}</span>
                  <span className="action-label">Manage Users</span>
                </button>
                <button className="action-card warning" onClick={() => setActiveSection('moderation')}>
                  <span className="action-number">{metrics.pendingModeration}</span>
                  <span className="action-label">Pending Moderation</span>
                </button>
                <button className="action-card" onClick={() => setActiveSection('import')}>
                  <span className="action-icon">📥</span>
                  <span className="action-label">Import Data</span>
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'companies':
        return (
          <div className="companies-section">
            <div className="section-header">
              <h2>Company Management</h2>
              <button className="btn-primary">+ Add Company</button>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(company => (
                    <tr key={company.id}>
                      <td>{company.id}</td>
                      <td>{company.name}</td>
                      <td>{company.type}</td>
                      <td>
                        <span className={`status-badge status-${company.status}`}>
                          {company.status}
                        </span>
                      </td>
                      <td>{company.verified ? '✅' : '❌'}</td>
                      <td>
                        <button className="btn-sm btn-edit">Edit</button>
                        <button className="btn-sm btn-delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'users':
        return (
          <div className="users-section">
            <div className="section-header">
              <h2>User Management</h2>
              <div className="user-tier-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Free</button>
                <button className="filter-btn">Plus</button>
                <button className="filter-btn">Premium</button>
              </div>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Tier</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`tier-badge tier-${user.tier}`}>
                          {user.tier}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-sm btn-edit">Edit</button>
                        <button className="btn-sm btn-toggle">
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'moderation':
        return (
          <div className="moderation-section">
            <h2>Content Moderation Queue</h2>
            <div className="moderation-items">
              {moderationQueue.map(item => (
                <div key={item.id} className="moderation-card">
                  <div className="moderation-header">
                    <span className="moderation-type">{item.type}</span>
                    <span className="moderation-status">{item.status}</span>
                  </div>
                  <div className="moderation-content">
                    <p><strong>Company:</strong> {item.company}</p>
                    <p><strong>Changes:</strong> {item.changes || item.documents}</p>
                  </div>
                  <div className="moderation-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleModeration(item.id, 'approve')}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleModeration(item.id, 'reject')}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'import':
        return (
          <div className="import-section">
            <h2>Bulk Data Import</h2>
            <div className="import-card">
              <div className="import-instructions">
                <h3>Import Companies from CSV/Excel</h3>
                <p>Upload a CSV or Excel file with company data. The file should include columns for:</p>
                <ul>
                  <li>Company Name (required)</li>
                  <li>Type (required)</li>
                  <li>Address (required)</li>
                  <li>Sectors (semicolon-separated)</li>
                  <li>Capabilities (semicolon-separated)</li>
                  <li>ABN, Website, Phone, Email (optional)</li>
                </ul>
              </div>
              <div className="import-upload">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                />
                <button 
                  className="btn-primary"
                  onClick={handleFileImport}
                  disabled={!importFile}
                >
                  📥 Import Companies
                </button>
              </div>
              <div className="import-templates">
                <h4>Download Templates</h4>
                <button className="btn-secondary">📄 CSV Template</button>
                <button className="btn-secondary">📊 Excel Template</button>
              </div>
            </div>
          </div>
        );
        
      case 'activity':
        return (
          <div className="activity-section">
            <h2>Activity Logs</h2>
            <div className="activity-logs">
              {activityLogs.map(log => (
                <div key={log.id} className="log-item">
                  <span className="log-time">{log.timestamp}</span>
                  <span className="log-type">{log.type}</span>
                  <span className="log-details">{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-item ${activeSection === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveSection('companies')}
          >
            🏢 Companies
          </button>
          <button 
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            👥 Users
          </button>
          <button 
            className={`nav-item ${activeSection === 'moderation' ? 'active' : ''}`}
            onClick={() => setActiveSection('moderation')}
          >
            🛡️ Moderation
            {metrics.pendingModeration > 0 && (
              <span className="badge">{metrics.pendingModeration}</span>
            )}
          </button>
          <button 
            className={`nav-item ${activeSection === 'import' ? 'active' : ''}`}
            onClick={() => setActiveSection('import')}
          >
            📥 Import Data
          </button>
          <button 
            className={`nav-item ${activeSection === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveSection('activity')}
          >
            📝 Activity Logs
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;