#!/bin/bash

# ICN Navigator Web Frontend Setup Script (JavaScript Version)
# This script initializes the React web project with plain JavaScript

echo "🚀 ICN Navigator Web Frontend Setup Starting (JavaScript)..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found. Please run this script from the project root directory."
    exit 1
fi

# Step 1: Create or navigate to React project
print_header "Setting up React project with JavaScript..."
if [ ! -d "icn-frontend" ]; then
    print_status "Creating project directory..."
    mkdir -p icn-frontend
    cd icn-frontend
    
    # Initialize package.json for JavaScript React
    print_status "Initializing package.json..."
    cat > package.json << 'PACKAGE_JSON'
{
  "name": "icn-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^3.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
PACKAGE_JSON
else
    print_warning "Project directory already exists. Navigating to icn-frontend..."
    cd icn-frontend
fi

# Step 2: Install core dependencies
print_header "Installing dependencies..."
print_status "Installing React and core dependencies..."
npm install

print_header "Installing additional dependencies..."
npm install --save \
    react-router-dom \
    axios \
    @reduxjs/toolkit \
    react-redux \
    lodash \
    date-fns

# Step 3: Install development dependencies
print_header "Installing development dependencies..."
npm install --save-dev \
    eslint \
    prettier \
    eslint-config-prettier \
    eslint-plugin-prettier \
    eslint-plugin-react \
    eslint-plugin-react-hooks \
    @testing-library/react \
    @testing-library/jest-dom \
    @testing-library/user-event

# Step 4: Create project structure
print_header "Creating project directory structure..."
mkdir -p src/{components,pages,services,utils,styles,assets}
mkdir -p src/components/{common,layout,forms}
mkdir -p src/pages/{auth,dashboard,companies,search,profile}
mkdir -p src/assets/{images,icons}
mkdir -p public/{images,icons}
mkdir -p docs

# Create public/index.html if it doesn't exist
if [ ! -f "public/index.html" ]; then
    print_status "Creating public/index.html..."
    cat > public/index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="ICN Navigator - Find and connect with companies"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>ICN Navigator</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
HTML
fi

# Create src/index.js
if [ ! -f "src/index.js" ]; then
    print_status "Creating src/index.js..."
    cat > src/index.js << 'INDEX'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
INDEX
fi

# Create src/index.css
if [ ! -f "src/index.css" ]; then
    print_status "Creating src/index.css..."
    cat > src/index.css << 'CSS'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

a {
  color: #1976d2;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
CSS
fi

# Create ESLint configuration for JavaScript
if [ ! -f ".eslintrc.json" ]; then
    print_status "Creating .eslintrc.json..."
    cat > .eslintrc.json << 'ESLINT'
{
  "env": {
    "browser": true,
    "es2021": true,
    "jest": true
  },
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
ESLINT
else
    print_warning ".eslintrc.json already exists, skipping creation..."
fi

# Create Prettier configuration
if [ ! -f ".prettierrc" ]; then
    print_status "Creating .prettierrc..."
    cat > .prettierrc << 'PRETTIER'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
PRETTIER
else
    print_warning ".prettierrc already exists, skipping creation..."
fi

# Create API service
if [ ! -f "src/services/api.js" ]; then
    print_status "Creating API service..."
    cat > src/services/api.js << 'API'
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
API
else
    print_warning "API service already exists, skipping creation..."
fi

# Create company service
if [ ! -f "src/services/companyService.js" ]; then
    print_status "Creating company service..."
    cat > src/services/companyService.js << 'COMPANY_SERVICE'
import api from './api';

export const companyService = {
  // Get all companies with optional filters
  getAll: (params = {}) => api.get('/companies', { params }),
  
  // Get a single company by ID
  getById: (id) => api.get(`/companies/${id}`),
  
  // Create a new company
  create: (data) => api.post('/companies', data),
  
  // Update an existing company
  update: (id, data) => api.put(`/companies/${id}`, data),
  
  // Delete a company
  delete: (id) => api.delete(`/companies/${id}`),
  
  // Search companies
  search: (query) => api.get(`/companies/search?q=${query}`),
};
COMPANY_SERVICE
else
    print_warning "Company service already exists, skipping creation..."
fi

# Create main App.js
if [ ! -f "src/App.js" ]; then
    print_status "Creating App.js..."
    cat > src/App.js << 'APP'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages when created
// import Login from './pages/auth/Login';
// import Dashboard from './pages/dashboard/Dashboard';
// import Companies from './pages/companies/Companies';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" /> : <div>Login Page</div>
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <div>Dashboard</div> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/companies" 
            element={
              isAuthenticated ? <div>Companies</div> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/search" 
            element={
              isAuthenticated ? <div>Search</div> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? <div>Profile</div> : <Navigate to="/login" />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
APP
else
    print_warning "App.js already exists, skipping creation..."
fi

# Create App.css
if [ ! -f "src/App.css" ]; then
    print_status "Creating App.css..."
    cat > src/App.css << 'APP_CSS'
.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page {
  flex: 1;
  padding: 20px 0;
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 32px; }

.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 32px; }

.p-1 { padding: 8px; }
.p-2 { padding: 16px; }
.p-3 { padding: 24px; }
.p-4 { padding: 32px; }
APP_CSS
else
    print_warning "App.css already exists, skipping creation..."
fi

# Create a sample component
if [ ! -f "src/components/Header.js" ]; then
    print_status "Creating sample Header component..."
    mkdir -p src/components
    cat > src/components/Header.js << 'HEADER'
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
HEADER
fi

if [ ! -f "src/components/Header.css" ]; then
    cat > src/components/Header.css << 'HEADER_CSS'
.header {
  background-color: #1976d2;
  color: white;
  padding: 16px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 24px;
  margin: 0;
}

.header-nav {
  display: flex;
  gap: 20px;
}

.header-nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.header-nav a:hover {
  text-decoration: underline;
}

.header-user {
  font-size: 14px;
}
HEADER_CSS
fi

# Create environment template
print_header "Creating environment template..."
if [ ! -f ".env.example" ]; then
    print_status "Creating .env.example template..."
    cat > .env.example << 'ENV'
# API Configuration
REACT_APP_API_URL=http://localhost:8080

# Environment
REACT_APP_ENV=development

# Feature Flags (optional)
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_MOCK_DATA=false
ENV
else
    print_warning ".env.example already exists, skipping creation..."
fi

# Copy .env.example to .env if .env doesn't exist
if [ ! -f ".env.development.local" ]; then
    print_status "Creating .env.development.local from template..."
    cp .env.example .env.development.local
    print_warning "⚠️  Please edit .env.development.local and add your actual API configuration!"
else
    print_warning ".env.development.local already exists, skipping creation..."
fi

# Update package.json scripts
print_header "Updating package.json scripts..."
print_status "Adding npm scripts to package.json..."

node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'start': 'react-scripts start',
  'build': 'react-scripts build',
  'test': 'react-scripts test',
  'eject': 'react-scripts eject',
  'lint': 'eslint src/**/*.{js,jsx}',
  'lint:fix': 'eslint src/**/*.{js,jsx} --fix',
  'format': 'prettier --write \"src/**/*.{js,jsx,json,css,md}\"',
  'format:check': 'prettier --check \"src/**/*.{js,jsx,json,css,md}\"'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    print_status "Creating .gitignore..."
    cat > .gitignore << 'GITIGNORE'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea
.vscode
*.swp
*.swo
GITIGNORE
else
    print_warning ".gitignore already exists, skipping creation..."
fi

print_status "✅ ICN Navigator Web Frontend setup completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Review and update .env.development.local with your API configuration"
print_status "2. Run 'npm start' to start the development server"
print_status "3. Access the application at http://localhost:3000"
print_status ""
print_status "🔧 Available commands:"
print_status "  npm start          - Start development server"
print_status "  npm run build      - Build production bundle"
print_status "  npm test           - Run tests"
print_status "  npm run lint       - Run ESLint"
print_status "  npm run format     - Format code with Prettier"
print_status ""
print_status "🌐 Project structure created with plain JavaScript"
print_status "🎯 Ready for development!"

cd ..
print_status "Setup completed! Navigate to icn-frontend directory to start development."