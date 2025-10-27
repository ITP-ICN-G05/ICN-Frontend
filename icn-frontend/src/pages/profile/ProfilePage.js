import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarkService, getSavedSearchService, getAuthService } from '../../services/serviceFactory';
import api from '../../services/api';
import './ProfilePage.css';
import defaultAvatar from '../../assets/use_image/user.jpg';

function ProfilePage() {
  const navigate = useNavigate();
  const bookmarkService = getBookmarkService(); 
  const savedSearchService = getSavedSearchService();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', location: '', industry: '' });

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      await loadUserData();
      await loadBookmarks();
      await loadSavedSearches();
    loadRecentActivity();
      // Simulate minimum loading time for smooth animation
      setTimeout(() => setLoading(false), 600);
    };
    initializePage();
  }, []);

  // Add page focus listeners to automatically refresh bookmark list when user returns to Profile page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh bookmark list when page becomes visible
        loadBookmarks();
      }
    };

    const handleFocus = () => {
      // Refresh bookmark list when window gains focus
      loadBookmarks();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    setUser(userData);
    setFormData({
      name: userData.name || '', email: userData.email || '', company: userData.company || '',
      phone: userData.phone || '', location: userData.location || 'Melbourne, VIC', industry: userData.industry || ''
    });
  };

  const loadBookmarks = async () => {
    try {
      // Fix: Get latest user data directly from backend instead of relying on localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const hashedPassword = localStorage.getItem('user_password_hash');
      
      if (!user.email || !hashedPassword) {
        console.log('User not logged in or missing authentication info');
        setBookmarkedCompanies([]);
        return;
      }
      
      // Get latest user data directly from backend
      const loginResponse = await api.post(`/user?email=${encodeURIComponent(user.email)}&password=${encodeURIComponent(hashedPassword)}`);
      const latestUserData = loginResponse.data;
      
      if (latestUserData && latestUserData.organisationCards) {
        // Use latest user data to get bookmarks
        const organisationIds = latestUserData.organisationCards
          .map(card => card.id)
          .filter(id => id && id.trim() !== '');
        
        if (organisationIds.length > 0) {
          const queryParams = new URLSearchParams();
          organisationIds.forEach(id => {
            queryParams.append('ids', id);
          });
          
          const response = await api.get(`/organisation/generalByIds?${queryParams.toString()}`);
          const data = response.data || [];
          
          if (Array.isArray(data) && data.length > 0) {
            setBookmarkedCompanies(data.map(b => ({ 
              id: b.id || b.companyId, 
              name: b.name || b.companyName, 
              type: b.type || b.companyType || 'Company', 
              verified: b.verified || b.verificationStatus === 'verified', 
              bookmarkedDate: b.bookmarkedDate || b.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              address: b.address || 'Address not available',
              sectors: b.sectors || b.keySectors || []
            })));
          } else {
            setBookmarkedCompanies([]);
          }
        } else {
          setBookmarkedCompanies([]);
        }
      } else {
        setBookmarkedCompanies([]);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarkedCompanies([]);
    }
  };  

  const loadSavedSearches = async () => {
    try {
      const response = await savedSearchService.getSavedSearches();
      const data = response.data || response;
      if (Array.isArray(data) && data.length > 0) {
        setSavedSearches(data.map(s => ({ id: s.id, query: s.name || s.query, filters: s.filters || {}, savedDate: s.createdAt?.split('T')[0] || s.savedDate || '2024-12-09', resultsCount: s.resultCount || s.resultsCount || 0 })));
      } else {
        setSavedSearches([{ id: 1, query: 'Electronic manufacturers', filters: { sectors: ['Technology'], distance: 50 }, savedDate: '2024-12-09', resultsCount: 23 }]);
      }
    } catch { setSavedSearches([]);  }
  };  

  const loadRecentActivity = () => {
    setRecentActivity([
      { id: 1, type: 'view', company: 'TechCorp Industries', date: '2024-12-15', time: '14:30' },
      { id: 2, type: 'search', query: 'Manufacturing services', date: '2024-12-15', time: '10:15' },
      { id: 3, type: 'bookmark', company: 'Global Supply Co', date: '2024-12-14', time: '16:45' }
    ]);
  };

  const handleEditProfile = () => setEditMode(true);
  const handleSaveProfile = async () => {
    try {
      // Get current user data and password hash
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const hashedPassword = localStorage.getItem('user_password_hash');
      
      if (!hashedPassword) {
        alert('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Prepare update data for backend API
      const updateData = {
        id: currentUser.id,
        email: currentUser.email, // Keep original email, don't allow changes
        name: formData.name, // Only update name
        password: hashedPassword, // Current password for authentication
        organisationIds: currentUser.organisationIds || [],
        premium: currentUser.premium || 0,
        subscribeDueDate: currentUser.subscribeDueDate || ''
      };
      
      console.log('📤 Updating profile via backend API...');
      
      // Call backend API to update user information
      const response = await api.put('/user', updateData);
      
      if (response.status === 200) {
        console.log('✅ Profile updated successfully!');
        
        // Update local storage with new data
        const updatedUser = { ...currentUser, name: formData.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditMode(false);
        
        // Show success message
        alert('Profile updated successfully!');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 400) {
        alert('Invalid data. Please check your information and try again.');
      } else if (error.response?.status === 404) {
        alert('Update failed. Please try again or contact support.');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    }
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
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const removeBookmark = async (id) => { 
    try { 
      await bookmarkService.removeBookmark(id); 
      // Reload bookmark list after successful deletion
      await loadBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      // Remove from local state even if API call fails
      setBookmarkedCompanies(bookmarkedCompanies.filter(c => c.id !== id)); 
    }
  };
  const deleteSavedSearch = async (id) => { try { await savedSearchService.deleteSavedSearch(id); } catch {} setSavedSearches(savedSearches.filter(s => s.id !== id)); };
  const runSavedSearch = (search) => navigate(`/search?q=${encodeURIComponent(search.query)}`);
  const viewCompany = (id) => navigate(`/company/${id}`);
  const handleChangePassword = () => alert('Change password functionality');
  const handleExportData = () => { if (window.confirm('Export your data?')) alert('Data export initiated.'); };
  const handlePrivacyPolicy = () => window.open('https://icn.org.au/icn_vic/', '_blank');
  const handleTermsOfService = () => window.open('https://icn.org.au/icn_vic/', '_blank');
  const handleDeleteAccount = () => { if (window.confirm('Delete account? Cannot be undone.')) { const pw = prompt('Enter password:'); if (pw) { localStorage.removeItem('user'); navigate('/login'); } } };
  const handleContactSupport = () => window.open('mailto:research@icn.vic.gov.au', '_blank');
  const handleHelpCenter = () => window.open('mailto:research@icn.vic.gov.au', '_blank');
  const handleAboutICN = () => window.open('https://icn.org.au/icn_vic/about/', '_blank');
  const handleWebsite = () => window.open('https://icn.org.au/icn_vic/', '_blank');
  const handleSignOut = () => { if (window.confirm('Sign out?')) { localStorage.removeItem('user'); navigate('/login'); } };
  
  const renderSettingIcon = (iconName) => {
    const icons = {
      'mail': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      'phone': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      'key': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
      'star': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      'bell': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      'map-pin': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      'moon': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
      'refresh': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
      'download': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
      'shield': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      'trash': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
      'help': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
      'book': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
      'external-link': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
      'bookmark-check': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
      'search': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
      'activity': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    };
    return icons[iconName] || icons['help'];
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      view: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
      search: renderSettingIcon('search'),
      bookmark: renderSettingIcon('star'),
      export: renderSettingIcon('download'),
      contact: renderSettingIcon('mail')
    };
    return iconMap[type] || <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>;
  };
  const getTierInfo = () => ({ free: { name: 'Free', icon: renderSettingIcon('star'), features: ['10 saved companies', '100 searches/month', '2 exports/month'] }, plus: { name: 'Plus', icon: renderSettingIcon('star'), features: ['50 saved companies', '500 searches/month', '50 exports/month'] }, premium: { name: 'Premium', icon: renderSettingIcon('star'), features: ['Unlimited saved companies', 'Unlimited searches', 'Unlimited exports', 'API access', 'Priority support'] } }[user?.tier || 'free']);

  if (!user || loading) return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-empty-state">
          <div className="profile-loading-spinner"></div>
          <div className="profile-empty-title">Loading Profile...</div>
        </div>
      </div>
    </div>
  );

  const tierInfo = getTierInfo();
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'person-outline' },
    { id: 'profile', label: 'Profile Information', icon: 'create-outline' },
    { id: 'bookmarks', label: `Bookmarks (${bookmarkedCompanies.length})`, icon: 'bookmark-outline' },
    { id: 'searches', label: `Saved Searches (${savedSearches.length})`, icon: 'search-outline' },
    { id: 'activity', label: 'Recent Activity', icon: 'time-outline' },
    { id: 'account', label: 'Account', icon: 'settings-outline' },
    { id: 'preferences', label: 'Preferences', icon: 'options-outline' },
    { id: 'dataPrivacy', label: 'Data & Privacy', icon: 'shield-checkmark-outline' },
    { id: 'support', label: 'Support', icon: 'chatbubble-ellipses-outline' },
    { id: 'about', label: 'About', icon: 'document-text-outline' },
  ];

  const renderIcon = (iconName) => {
    const icons = {
      'person-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      'create-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      'bookmark-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
      'search-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
      'time-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      'settings-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"/></svg>,
      'options-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="2" y1="5" x2="6" y2="5"/><line x1="18" y1="5" x2="22" y2="5"/><line x1="2" y1="19" x2="6" y2="19"/><line x1="18" y1="19" x2="22" y2="19"/></svg>,
      'shield-checkmark-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
      'chatbubble-ellipses-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="0.5" fill="currentColor"/><circle cx="12" cy="10" r="0.5" fill="currentColor"/><circle cx="15" cy="10" r="0.5" fill="currentColor"/></svg>,
      'document-text-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      'information-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
      'help-circle-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
      'information-circle-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
      'log-out-outline': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    };
    return icons[iconName] || icons['person-outline'];
  };

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-content">
            <div className="profile-sidebar-user">
              <div className="profile-sidebar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-sidebar-user-info">
                <div className="profile-sidebar-name">{user.name}</div>
                <div className="profile-sidebar-tier">{tierInfo.icon} {tierInfo.name}</div>
              </div>
            </div>
            <nav className="profile-nav-menu">
              {menuItems.map(item => (
                <button key={item.id} className={`profile-nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => {
                  setActiveSection(item.id);
                  // Smooth scroll to top of main content
                  document.querySelector('.profile-main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <span className="profile-nav-icon">{renderIcon(item.icon)}</span>
                  <span className="profile-nav-label">{item.label}</span>
                </button>
              ))}
            </nav>
            <button className="profile-signout-sidebar" onClick={handleSignOut}>
              <span className="profile-nav-icon">{renderIcon('log-out-outline')}</span>
              <span className="profile-nav-label">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <main className="profile-main-content">
          {activeSection === 'overview' && (
            <div className="profile-content-wrapper">
              <div className="profile-header-card profile-overview-card">
                {/* Header Section with Banner */}
                <div className="profile-header-row">
                  <div className="profile-user-avatar">
                    <img 
                      src={defaultAvatar} 
                      alt={user.name}
                      className="avatar-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'avatar-text';
                        fallback.textContent = user.name?.charAt(0).toUpperCase();
                        e.target.parentNode.appendChild(fallback);
                      }}
                    />
                  </div>
                  <div className="profile-user-info-section">
                    <div className="profile-user-info-header">
                      <div className="profile-user-text-container">
                        <h1 className="profile-user-name-title">{user.name}</h1>
                        {user.role && user.company && (
                          <p className="profile-user-role">{user.role} at {user.company}</p>
                        )}
                      </div>
                    </div>
                    <p className="profile-user-email">{user.email}</p>
                    <div className="profile-user-meta">
                      {formData.location && (
                        <span className="profile-meta-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {formData.location}
                        </span>
                      )}
                      <span className={`profile-tier-badge ${user.tier || 'free'}`}>{tierInfo.icon} {tierInfo.name} Member</span>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="profile-stats">
                  <div className="profile-stat-item"><div className="profile-stat-number">{bookmarkedCompanies.length}</div><div className="profile-stat-label">Bookmarks</div></div>
                  <div className="profile-stat-divider"></div>
                  <div className="profile-stat-item"><div className="profile-stat-number">{savedSearches.length}</div><div className="profile-stat-label">Searches</div></div>
                  <div className="profile-stat-divider"></div>
                  <div className="profile-stat-item"><div className="profile-stat-number">{recentActivity.length}</div><div className="profile-stat-label">Activities</div></div>
                  <div className="profile-stat-divider"></div>
                  <div className="profile-stat-item"><div className="profile-stat-number">{user.memberSince || '2024'}</div><div className="profile-stat-label">Member Since</div></div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className="profile-subscription-card">
                <div className="profile-subscription-header">
                  <div className="profile-subscription-plan">{tierInfo.name} Plan</div>
                  {user.tier !== 'premium' && (
                    <button className="profile-btn profile-btn-primary" onClick={() => navigate('/pricing')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="19" x2="12" y2="5"/>
                        <polyline points="5 12 12 5 19 12"/>
                      </svg>
                      Upgrade
                    </button>
                  )}
                </div>
                <div className="profile-subscription-features">
                  {tierInfo.features.map((f, i) => <div key={i} className="profile-subscription-feature">{f}</div>)}
                </div>
                {user.tier && user.tier !== 'free' ? (
                  <button className="profile-subscription-btn" onClick={() => navigate('/pricing')}>Manage Subscription</button>
                ) : (
                  <button className="profile-subscription-btn" onClick={() => navigate('/pricing')}>Upgrade Plan</button>
                )}
              </div>
                  </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <h2 className="profile-section-title">Profile Information</h2>
                  {!editMode && (
                    <button className="profile-btn profile-btn-primary" onClick={handleEditProfile}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit Name
                    </button>
                  )}
                  </div>
                <div className="profile-section-content">
                  <div className="profile-form-grid">
                    {/* Name field - editable */}
                    <div className="profile-form-group">
                      <label className="profile-form-label">Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        className="profile-form-input" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        disabled={!editMode}
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    {/* Email field - locked/read-only */}
                    <div className="profile-form-group">
                      <label className="profile-form-label">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        className="profile-form-input" 
                        value={formData.email} 
                        disabled={true}
                        style={{ 
                          backgroundColor: '#f5f5f5', 
                          color: '#666',
                          cursor: 'not-allowed'
                        }}
                        title="Email cannot be changed"
                      />
                      <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Email cannot be changed for security reasons
                      </small>
                    </div>
                    
                    {/* Other fields - display only, not editable */}
                    <div className="profile-form-group">
                      <label className="profile-form-label">Company</label>
                      <input 
                        type="text" 
                        name="company" 
                        className="profile-form-input" 
                        value={formData.company || 'Not set'} 
                        disabled={true}
                        style={{ 
                          backgroundColor: '#f5f5f5', 
                          color: '#666',
                          cursor: 'not-allowed'
                        }}
                        title="Company information is not editable"
                      />
                    </div>
                    
                    <div className="profile-form-group">
                      <label className="profile-form-label">Phone</label>
                      <input 
                        type="text" 
                        name="phone" 
                        className="profile-form-input" 
                        value={formData.phone || 'Not set'} 
                        disabled={true}
                        style={{ 
                          backgroundColor: '#f5f5f5', 
                          color: '#666',
                          cursor: 'not-allowed'
                        }}
                        title="Phone information is not editable"
                      />
                    </div>
                    
                    <div className="profile-form-group">
                      <label className="profile-form-label">Location</label>
                      <input 
                        type="text" 
                        name="location" 
                        className="profile-form-input" 
                        value={formData.location || 'Not set'} 
                        disabled={true}
                        style={{ 
                          backgroundColor: '#f5f5f5', 
                          color: '#666',
                          cursor: 'not-allowed'
                        }}
                        title="Location information is not editable"
                      />
                    </div>
                    
                    <div className="profile-form-group">
                      <label className="profile-form-label">Industry</label>
                      <select 
                        name="industry" 
                        className="profile-form-input" 
                        value={formData.industry || ''} 
                        disabled={true}
                        style={{ 
                          backgroundColor: '#f5f5f5', 
                          color: '#666',
                          cursor: 'not-allowed'
                        }}
                        title="Industry information is not editable"
                      >
                        <option value="">Not set</option>
                        {['Technology', 'Manufacturing', 'Services', 'Logistics', 'Environment', 'Automotive'].map(i => 
                          <option key={i} value={i}>{i}</option>
                        )}
                      </select>
                    </div>
                  </div>
                  {editMode && (
                    <div style={{marginTop: '20px', display: 'flex', gap: '12px'}}>
                      <button className="profile-btn profile-btn-primary" onClick={handleSaveProfile}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Save Name
                      </button>
                      <button className="profile-btn" onClick={handleCancelEdit}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'bookmarks' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">Bookmarked Companies ({bookmarkedCompanies.length})</h2></div>
                <div className="profile-section-content">
                  {bookmarkedCompanies.length > 0 ? (
                    <div className="profile-bookmarks-grid">
                      {bookmarkedCompanies.map(c => (
                        <div key={c.id} className="profile-bookmark-card">
                          <div className="profile-bookmark-header">
                            <div><h3 className="profile-bookmark-name">{c.name}</h3><p className="profile-bookmark-type">{c.type}</p></div>
                            {c.verified && <span className="profile-bookmark-verified">✓ Verified</span>}
                          </div>
                          <p className="profile-bookmark-date">Saved on {new Date(c.bookmarkedDate).toLocaleDateString()}</p>
                          <div className="profile-bookmark-actions">
                            <button className="profile-bookmark-btn profile-bookmark-btn-view" onClick={() => viewCompany(c.id)}>View Details</button>
                            <button className="profile-bookmark-btn profile-bookmark-btn-remove" onClick={() => removeBookmark(c.id)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profile-empty-state"><div className="profile-empty-icon">{renderSettingIcon('bookmark-check')}</div><div className="profile-empty-title">No Bookmarks Yet</div><p className="profile-empty-text">Companies you bookmark will appear here</p></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'searches' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">Saved Searches ({savedSearches.length})</h2></div>
                <div className="profile-section-content">
                  {savedSearches.length > 0 ? (
                    <div className="profile-searches-list">
                      {savedSearches.map(s => (
                        <div key={s.id} className="profile-search-card">
                          <div className="profile-search-header"><h3 className="profile-search-query">{s.query}</h3><span className="profile-search-count">{s.resultsCount} results</span></div>
                          {s.filters && Object.keys(s.filters).length > 0 && (
                            <div className="profile-search-filters">{Object.entries(s.filters).map(([k, v]) => <span key={k} className="profile-filter-tag">{k}: {Array.isArray(v) ? v.join(', ') : v}</span>)}</div>
                          )}
                          <p className="profile-search-date">Saved on {new Date(s.savedDate).toLocaleDateString()}</p>
                          <div className="profile-search-actions">
                            <button className="profile-search-btn profile-search-btn-run" onClick={() => runSavedSearch(s)}>Run Search</button>
                            <button className="profile-search-btn profile-search-btn-delete" onClick={() => deleteSavedSearch(s.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    ) : (
                     <div className="profile-empty-state"><div className="profile-empty-icon">{renderSettingIcon('search')}</div><div className="profile-empty-title">No Saved Searches</div><p className="profile-empty-text">Your saved searches will appear here</p></div>
                    )}
                  </div>
                </div>
            </div>
          )}

          {activeSection === 'activity' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">Recent Activity</h2></div>
                <div className="profile-section-content">
                  {recentActivity.length > 0 ? (
                    <div className="profile-activity-list">
                      {recentActivity.map(a => (
                        <div key={a.id} className="profile-activity-item">
                          <div className="profile-activity-icon">{getActivityIcon(a.type)}</div>
                          <div className="profile-activity-content">
                            <div className="profile-activity-desc">
                              {a.type === 'view' && `Viewed ${a.company}`}
                              {a.type === 'search' && `Searched "${a.query}"`}
                              {a.type === 'bookmark' && `Bookmarked ${a.company}`}
                            </div>
                            <div className="profile-activity-time">{new Date(a.date).toLocaleDateString()} at {a.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    ) : (
                     <div className="profile-empty-state"><div className="profile-empty-icon">{renderSettingIcon('activity')}</div><div className="profile-empty-title">No Activity</div></div>
                   )}
                    </div>
                    </div>
                    </div>
          )}

          {activeSection === 'account' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">Account</h2></div>
                <div className="profile-section-content">
                  <div className="profile-settings-list">
                    <div className="profile-setting-item"><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('mail')}</div><div className="profile-setting-label">Email</div></div><div className="profile-setting-right"><span style={{fontSize: '14px', color: 'rgba(0,0,0,0.6)'}}>{user.email}</span></div></div>
                    <div className="profile-setting-item"><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('phone')}</div><div className="profile-setting-label">Phone</div></div><div className="profile-setting-right"><span style={{fontSize: '14px', color: 'rgba(0,0,0,0.6)'}}>{formData.phone || 'Not set'}</span></div></div>
                    <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleChangePassword}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('key')}</div><div className="profile-setting-label">Change Password</div></div><div className="profile-setting-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                    <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={() => navigate('/pricing')}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('star')}</div><div className="profile-setting-label">Subscription</div></div><div className="profile-setting-right"><span className="profile-tier-badge">{tierInfo.name}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">Preferences</h2></div>
                  <div className="profile-section-content">
                    <div className="profile-settings-list">
                     {[{icon:'bell', label:'Email Notifications', checked:true}, {icon:'map-pin', label:'Location Services', checked:true}, {icon:'moon', label:'Dark Mode', checked:false}, {icon:'refresh', label:'Auto-Sync Data', checked:true}].map((s, i) => (
                       <div key={i} className="profile-setting-item"><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon(s.icon)}</div><div className="profile-setting-label">{s.label}</div></div><div className="profile-setting-right"><label className="profile-toggle"><input type="checkbox" defaultChecked={s.checked} /><span className="profile-toggle-slider"></span></label></div></div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'dataPrivacy' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">Data & Privacy</h2></div>
                  <div className="profile-section-content">
                    <div className="profile-settings-list">
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleExportData}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('download')}</div><div className="profile-setting-label">Export My Data</div></div><div className="profile-setting-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handlePrivacyPolicy}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('shield')}</div><div className="profile-setting-label">Privacy Policy</div></div><div className="profile-setting-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleTermsOfService}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('book')}</div><div className="profile-setting-label">Terms of Service</div></div><div className="profile-setting-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleDeleteAccount}><div className="profile-setting-left"><div className="profile-setting-icon" style={{color: '#DC2626'}}>{renderSettingIcon('trash')}</div><div className="profile-setting-label" style={{color: '#DC2626'}}>Delete Account</div></div></div>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">Support</h2></div>
                  <div className="profile-section-content">
                    <div className="profile-settings-list">
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleHelpCenter}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('help')}</div><div className="profile-setting-label">Help Center</div></div><div className="profile-setting-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleContactSupport}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('mail')}</div><div className="profile-setting-label">Contact Support</div></div><div className="profile-setting-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="profile-content-wrapper">
              <div className="profile-section-card">
                <div className="profile-section-header"><h2 className="profile-section-title">About</h2></div>
                  <div className="profile-section-content">
                    <div className="profile-settings-list">
                     <div className="profile-setting-item"><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('book')}</div><div className="profile-setting-label">App Version</div></div><div className="profile-setting-right"><span style={{fontSize: '14px', color: 'rgba(0,0,0,0.6)'}}>1.0.0</span></div></div>
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleAboutICN}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('help')}</div><div className="profile-setting-label">About ICN</div></div><div className="profile-setting-right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                     <div className="profile-setting-item" style={{cursor: 'pointer'}} onClick={handleWebsite}><div className="profile-setting-left"><div className="profile-setting-icon">{renderSettingIcon('external-link')}</div><div className="profile-setting-label">Website</div></div><div className="profile-setting-right"><span style={{fontSize: '14px', color: 'rgba(0,0,0,0.6)'}}>icnvictoria.com</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
                </div>
                </div>
              </div>
            </div>
          )}

          <div style={{textAlign: 'center', padding: '32px 0', color: 'rgba(0,0,0,0.4)'}}>
            <p style={{fontSize: '13px', marginBottom: '4px'}}>ICN Navigator v1.0.0</p>
            <p style={{fontSize: '12px'}}>© 2025 ICN Victoria</p>
          </div>
        </main>
        </div>
    </div>
  );
}

export default ProfilePage;

