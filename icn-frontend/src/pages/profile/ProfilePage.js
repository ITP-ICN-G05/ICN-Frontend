import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    location: '',
    industry: ''
  });

  useEffect(() => {
    loadUserData();
    loadBookmarks();
    loadSavedSearches();
    loadRecentActivity();
  }, []);

  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      company: userData.company || '',
      phone: userData.phone || '',
      location: userData.location || 'Melbourne, VIC',
      industry: userData.industry || ''
    });
  };

  const loadBookmarks = () => {
    // Mock bookmarked companies
    const mockBookmarks = [
      {
        id: 1,
        name: 'TechCorp Industries',
        type: 'Manufacturer',
        verified: true,
        bookmarkedDate: '2024-12-10'
      },
      {
        id: 2,
        name: 'Global Supply Co',
        type: 'Item Supplier',
        verified: true,
        bookmarkedDate: '2024-12-08'
      }
    ];
    setBookmarkedCompanies(mockBookmarks);
  };

  const loadSavedSearches = () => {
    // Mock saved searches
    const mockSearches = [
      {
        id: 1,
        query: 'Electronic manufacturers',
        filters: { sectors: ['Technology'], distance: 50 },
        savedDate: '2024-12-09',
        resultsCount: 23
      },
      {
        id: 2,
        query: 'Female-owned suppliers',
        filters: { ownership: ['Female-owned'], verified: true },
        savedDate: '2024-12-07',
        resultsCount: 15
      }
    ];
    setSavedSearches(mockSearches);
  };

  const loadRecentActivity = () => {
    // Mock recent activity
    const mockActivity = [
      {
        id: 1,
        type: 'view',
        company: 'TechCorp Industries',
        date: '2024-12-15',
        time: '14:30'
      },
      {
        id: 2,
        type: 'search',
        query: 'Manufacturing services',
        date: '2024-12-15',
        time: '10:15'
      },
      {
        id: 3,
        type: 'bookmark',
        company: 'Global Supply Co',
        date: '2024-12-14',
        time: '16:45'
      }
    ];
    setRecentActivity(mockActivity);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      ...formData
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      company: user.company || '',
      phone: user.phone || '',
      location: user.location || 'Melbourne, VIC',
      industry: user.industry || ''
    });
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const removeBookmark = (companyId) => {
    setBookmarkedCompanies(bookmarkedCompanies.filter(c => c.id !== companyId));
  };

  const deleteSavedSearch = (searchId) => {
    setSavedSearches(savedSearches.filter(s => s.id !== searchId));
  };

  const runSavedSearch = (search) => {
    navigate(`/search?q=${encodeURIComponent(search.query)}`);
  };

  const getSubscriptionBadge = () => {
    const tier = user?.tier || 'free';
    const badges = {
      free: { label: 'Free', color: 'tier-free' },
      plus: { label: 'Plus', color: 'tier-plus' },
      premium: { label: 'Premium', color: 'tier-premium' }
    };
    return badges[tier] || badges.free;
  };

  const getActivityIcon = (type) => {
    const icons = {
      view: '👁️',
      search: '🔍',
      bookmark: '⭐',
      export: '📥',
      contact: '📧'
    };
    return icons[type] || '📌';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const subscription = getSubscriptionBadge();

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="container">
          <div className="profile-header-content">
            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <div className="profile-meta">
                {user.company && <span className="meta-item">🏢 {user.company}</span>}
                <span className="meta-item">📍 {formData.location}</span>
                <span className={`subscription-badge ${subscription.color}`}>
                  {subscription.label} Account
                </span>
              </div>
            </div>
            <div className="profile-actions">
              {!editMode ? (
                <button className="btn-primary" onClick={handleEditProfile}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn-primary" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                  <button className="btn-secondary" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Tabs */}
      <section className="profile-tabs">
        <div className="container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarked Companies ({bookmarkedCompanies.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'searches' ? 'active' : ''}`}
              onClick={() => setActiveTab('searches')}
            >
              Saved Searches ({savedSearches.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Recent Activity
            </button>
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="profile-content">
        <div className="container">
          {activeTab === 'overview' && (
            <div className="content-grid">
              {/* Profile Form */}
              <div className="content-card">
                <h2>Profile Information</h2>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="Your company name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    >
                      <option value="">Select Industry</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Technology">Technology</option>
                      <option value="Services">Services</option>
                      <option value="Construction">Construction</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="sidebar">
                <div className="content-card">
                  <h3>Subscription Status</h3>
                  <div className="subscription-info">
                    <div className={`plan-badge ${subscription.color}`}>
                      {subscription.label} Plan
                    </div>
                    <div className="plan-features">
                      {user.tier === 'free' ? (
                        <>
                          <p>✓ Basic search</p>
                          <p>✓ View 5 companies/month</p>
                          <p>✓ Standard filters</p>
                        </>
                      ) : user.tier === 'plus' ? (
                        <>
                          <p>✓ Advanced search filters</p>
                          <p>✓ Unlimited company views</p>
                          <p>✓ Saved searches</p>
                          <p>✓ Export capabilities</p>
                        </>
                      ) : (
                        <>
                          <p>✓ All Plus features</p>
                          <p>✓ Premium filters</p>
                          <p>✓ API access</p>
                          <p>✓ Priority support</p>
                        </>
                      )}
                    </div>
                    {user.tier === 'premium' ? (
                      <button 
                        className="btn-manage"
                        onClick={() => navigate('/pricing')}
                      >
                        Manage Subscription
                      </button>
                    ) : (
                      <button 
                        className="btn-upgrade"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade Plan
                      </button>
                    )}
                  </div>
                </div>

                <div className="content-card">
                  <h3>Quick Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{bookmarkedCompanies.length}</span>
                      <span className="stat-label">Bookmarks</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{savedSearches.length}</span>
                      <span className="stat-label">Saved Searches</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">47</span>
                      <span className="stat-label">Views This Month</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">3</span>
                      <span className="stat-label">Exports</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="bookmarks-grid">
              {bookmarkedCompanies.length > 0 ? (
                bookmarkedCompanies.map(company => (
                  <div key={company.id} className="bookmark-card">
                    <div className="bookmark-header">
                      <h3>{company.name}</h3>
                      {company.verified && <span className="verified-badge">✓</span>}
                    </div>
                    <p className="bookmark-type">{company.type}</p>
                    <p className="bookmark-date">Saved on {company.bookmarkedDate}</p>
                    <div className="bookmark-actions">
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/company/${company.id}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-remove"
                        onClick={() => removeBookmark(company.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No bookmarked companies</h3>
                  <p>Start bookmarking companies to save them here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'searches' && (
            <div className="searches-list">
              {savedSearches.length > 0 ? (
                savedSearches.map(search => (
                  <div key={search.id} className="search-card">
                    <div className="search-header">
                      <h3>{search.query}</h3>
                      <span className="results-count">{search.resultsCount} results</span>
                    </div>
                    <div className="search-filters">
                      {search.filters.sectors && (
                        <span className="filter-tag">Sectors: {search.filters.sectors.join(', ')}</span>
                      )}
                      {search.filters.distance && (
                        <span className="filter-tag">Within {search.filters.distance}km</span>
                      )}
                      {search.filters.ownership && (
                        <span className="filter-tag">{search.filters.ownership.join(', ')}</span>
                      )}
                    </div>
                    <p className="search-date">Saved on {search.savedDate}</p>
                    <div className="search-actions">
                      <button 
                        className="btn-run"
                        onClick={() => runSavedSearch(search)}
                      >
                        Run Search
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteSavedSearch(search.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No saved searches</h3>
                  <p>Save your searches to quickly access them later</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-timeline">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                  <div className="activity-content">
                    <p className="activity-description">
                      {activity.type === 'view' && `Viewed ${activity.company}`}
                      {activity.type === 'search' && `Searched for "${activity.query}"`}
                      {activity.type === 'bookmark' && `Bookmarked ${activity.company}`}
                    </p>
                    <span className="activity-time">
                      {activity.date} at {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-grid">
              <div className="content-card">
                <h2>Account Settings</h2>
                <div className="settings-section">
                  <h3>Email Notifications</h3>
                  <label className="toggle-setting">
                    <input type="checkbox" defaultChecked />
                    <span>New company matches</span>
                  </label>
                  <label className="toggle-setting">
                    <input type="checkbox" defaultChecked />
                    <span>Saved search alerts</span>
                  </label>
                  <label className="toggle-setting">
                    <input type="checkbox" />
                    <span>Weekly digest</span>
                  </label>
                </div>
                <div className="settings-section">
                  <h3>Privacy</h3>
                  <label className="toggle-setting">
                    <input type="checkbox" defaultChecked />
                    <span>Profile visible to companies</span>
                  </label>
                  <label className="toggle-setting">
                    <input type="checkbox" />
                    <span>Share activity data</span>
                  </label>
                </div>
                <div className="settings-section">
                  <h3>Account Actions</h3>
                  <button className="btn-secondary">Change Password</button>
                  <button className="btn-secondary">Export Data</button>
                  <button className="btn-danger">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;