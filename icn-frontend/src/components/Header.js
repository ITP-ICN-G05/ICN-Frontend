import React from 'react';
import './Header.css';

function Header({ title, user }) {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">{title || 'ICN Navigator'}</h1>
        <nav className="header-nav">
          <a href="/">Dashboard</a>
          <a href="/companies">Companies</a>
          <a href="/search">Search</a>
          <a href="/profile">Profile</a>
        </nav>
        {user && (
          <div className="header-user">
            Welcome, {user.name}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
