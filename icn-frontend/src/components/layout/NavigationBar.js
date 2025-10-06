import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';

function NavigationBar({ user, onLogout }) {  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out?')) {
                    onLogout();  
                  }
                }}
                title={`Logged in as ${user.name}`}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
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