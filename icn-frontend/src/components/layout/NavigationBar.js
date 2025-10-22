import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../../assets/logo/ICN-logo-little.png';
import './NavigationBar.css';

function NavigationBar({ user, onLogout }) {  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setShowUserMenu(false);
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
      setShowUserMenu(false);
    }
  };

  // Check if current path matches nav link
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        {/* Logo Section */}
        <a href="/" className="nav-logo">
          <img src={logoImage} alt="ICN Logo" className="logo-image" />
          <div className="logo-text">
            <span className="logo-main">Navigator</span>
            <span className="logo-sub">by ICN</span>
          </div>
        </a>

        {/* Navigation Links */}
        <div className="nav-links">
          <a href="/" className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}>
            Home
          </a>
          <a href="/navigation" className={`nav-link ${isActiveLink('/navigation') ? 'active' : ''}`}>
            Navigation
          </a>
          <a href="/mobile-designs" className={`nav-link ${isActiveLink('/mobile-designs') ? 'active' : ''}`}>
            Mobile designs
          </a>
          <a href="/illustrations" className={`nav-link ${isActiveLink('/illustrations') ? 'active' : ''}`}>
            Illustrations
          </a>
        </div>

        {/* Search Section */}
        <form className="nav-search" onSubmit={handleSearch}>
          <div className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* User Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-avatar" 
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={`Logged in as ${user.name}`}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
              
              {showUserMenu && (
                <>
                  <div 
                    className="dropdown-backdrop" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{user.name}</div>
                    <div className="dropdown-user-email">{user.email}</div>
                    {isAdmin && <div className="dropdown-user-role">Admin</div>}
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleProfileClick}>
                    <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Profile
                  </button>
                  <button className="dropdown-item" onClick={() => {navigate('/companies'); setShowUserMenu(false);}}>
                    <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-4"/>
                    </svg>
                    Companies
                  </button>
                  
                  {/* Admin Menu Item - Only shown for admins */}
                  {isAdmin && (
                    <>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item dropdown-item-admin" onClick={handleAdminClick}>
                        <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                        </svg>
                        Admin Dashboard
                      </button>
                    </>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogoutClick}>
                    <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Log out
                  </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button 
                className={`nav-btn nav-btn-login ${isActiveLink('/login') || isActiveLink('/forgot-password') ? 'active' : ''}`} 
                onClick={handleLogin}
              >
                Log in
              </button>
              <button 
                className={`nav-btn nav-btn-signup ${isActiveLink('/signup') ? 'active' : ''}`} 
                onClick={handleSignUp}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;