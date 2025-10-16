import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../../assets/logo/ICN-logo-little.png';
import './NavigationBar.css';

function NavigationBar({ user, onLogout }) {  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

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
        <div className="nav-brand">
          <a href="/" className="nav-logo">
            <img src={logoImage} alt="ICN Victoria Logo" className="logo-image" />
            <div className="logo-text">
              <span className="logo-main">Navigator</span>
              <span className="logo-sub">by ICN Victoria</span>
            </div>
          </a>
        </div>

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
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{user.name}</div>
                    <div className="dropdown-user-email">{user.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleProfileClick}>
                    👤 My Profile
                  </button>
                  <button className="dropdown-item" onClick={() => {navigate('/companies'); setShowUserMenu(false);}}>
                    🏢 Companies
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogoutClick}>
                    🚪 Log out
                  </button>
                </div>
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