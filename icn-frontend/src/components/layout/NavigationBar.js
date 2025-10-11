import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';

function NavigationBar({ user, onLogout }) {  
  const navigate = useNavigate();
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

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <a href="/" className="nav-logo">
          <div className="logo-icon">
            <div className="logo-shape logo-shape-1"></div>
            <div className="logo-shape logo-shape-2"></div>
          </div>
          <span className="logo-text">
            ICN <span className="logo-subtitle">Victoria</span>
          </span>
        </a>

        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/navigation" className="nav-link">Navigation</a>
          <a href="/mobile-designs" className="nav-link">Mobile designs</a>
          <a href="/illustrations" className="nav-link">Illustrations</a>
        </div>

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="nav-search-btn">
            🔍
          </button>
        </form>

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
                  <button className="dropdown-item" onClick={() => {navigate('/search'); setShowUserMenu(false);}}>
                    🔍 Search
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
              <button className="nav-btn nav-btn-login" onClick={handleLogin}>
                Log in
              </button>
              <button className="nav-btn nav-btn-signup" onClick={handleSignUp}>
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