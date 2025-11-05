# ICN Navigator - Web Frontend

A comprehensive supplier discovery platform built for ICN Victoria, connecting buyers with verified Victorian manufacturers, suppliers, and service providers across critical minerals, steel, HVAC, textiles, and more.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Authentication & Authorization](#authentication--authorization)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

ICN Navigator is a React-based web application that provides a modern, user-friendly interface for discovering and connecting with Victorian suppliers. The platform features intelligent search, interactive maps, advanced filtering, and a comprehensive company database with 2,700+ verified companies.

### Key Highlights

- **Intelligent Search**: Advanced search with filters by capability, sector, location, and company attributes
- **Interactive Maps**: Google Maps integration with marker clustering and viewport filtering
- **Tiered Access**: Three subscription levels (Free, Plus, Premium) with progressive feature unlocking
- **Real-time Data**: Live integration with backend Spring Boot API
- **Responsive Design**: Mobile-first approach with dedicated mobile layouts
- **Performance Optimized**: Lazy loading, code splitting, and optimized rendering

---

## ✨ Features

### Core Features

1. **Company Discovery**
   - Browse 2,700+ companies across multiple sectors
   - Advanced filtering by capabilities, sectors, location, and size
   - Bookmark and save favorite companies
   - Export company lists (CSV/PDF)

2. **Interactive Map Navigation**
   - Google Maps integration with custom markers
   - Marker clustering for performance (2000+ companies)
   - Viewport filtering to show only visible companies
   - Real-time location-based search
   - Company detail popups with quick view

3. **Company Profiles**
   - Detailed company information with ICN capabilities
   - Verification status and certification data
   - Contact details and website links
   - ABN and business information (tier-restricted)
   - Company size and employee count
   - Sector and industry classifications

4. **User Management**
   - User registration and authentication
   - Password reset with email verification
   - Profile management with subscription status
   - Bookmarked companies tracking
   - Search history (coming soon)

5. **Subscription Tiers**
   - **Free Tier**: Basic company info, basic export
   - **Plus Tier ($9.99/mo)**: ABN, company summary, ICN chat support
   - **Premium Tier ($19.99/mo)**: Full data access, unlimited export, priority support

6. **Admin Panel**
   - User management and role assignment
   - Company data management
   - Analytics dashboard
   - System monitoring

---

## 🛠 Tech Stack

### Frontend Framework & Libraries

- **React 18.2** - Core framework with hooks and functional components
- **React Router 6.30** - Client-side routing
- **Axios 1.12** - HTTP client for API communication
- **Redux Toolkit 1.9** - State management (optional, minimal usage)

### UI & Styling

- **Material-UI 5.14** - Component library for modern UI
- **Plain CSS** - Custom styling for branding and layout
- **Google Fonts** - DM Serif Display for typography

### Maps & Geolocation

- **@react-google-maps/api 2.20** - Google Maps integration
- **@googlemaps/markerclusterer 2.6** - Marker clustering for performance
- **Geocoding Services** - Location-based search and filtering

### Development Tools

- **ESLint** - Code linting with React rules
- **Prettier** - Code formatting
- **Jest & React Testing Library** - Unit and integration testing
- **Husky & lint-staged** - Pre-commit hooks for code quality
- **Docker & Docker Compose** - Containerized development environment

### Build & Deployment

- **React Scripts 5.0** - Build tooling based on webpack
- **http-proxy-middleware** - API proxy for CORS handling
- **Source Map Explorer** - Bundle size analysis

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended) OR
- **Node.js 16+** and **npm 8+**
- **Git**
- **Google Maps API Key** (for map features)

### Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ITP-ICN-G05/ICN-Frontend.git
cd ICN-Frontend

# Initial setup (one-time only)
make setup

# Start development environment
make dev

# Application will be available at http://localhost:3000
```

### Manual Setup (Without Docker)

```bash
# Clone the repository
git clone https://github.com/ITP-ICN-G05/ICN-Frontend.git
cd ICN-Frontend/icn-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.development.local
# Edit .env.development.local with your configuration

# Start development server
npm start

# Application will be available at http://localhost:3000
```

### Environment Configuration

Create `.env.development.local` in the `icn-frontend/` directory:

```bash
# Google Maps API Key (Required for map features)
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_api_key_here

# Backend API URL (default: http://localhost:8080)
REACT_APP_API_URL=http://localhost:8080

# Feature Flags
REACT_APP_USE_MOCK=false           # Use mock data instead of real API
REACT_APP_SHOW_DEV_TOOLS=true      # Show developer tools
REACT_APP_ENV=development          # Environment name
```

---

## 📁 Project Structure

```
ICN-Frontend/
├── README.md                       # This file
├── Dockerfile                      # Docker container configuration
├── docker-compose.yml              # Container orchestration
├── Makefile                        # Development commands
├── setup.sh                        # Automated setup script
│
└── icn-frontend/                   # React application root
    ├── public/                     # Static assets
    │   ├── index.html              # HTML template
    │   ├── favicon.ico             # Site icon
    │   └── assets/                 # Images and media
    │
    ├── src/                        # Source code
    │   ├── App.js                  # Main application component
    │   ├── App.css                 # Global app styles
    │   ├── index.js                # Application entry point
    │   ├── index.css               # Global CSS styles
    │   ├── setupProxy.js           # API proxy configuration
    │   │
    │   ├── components/             # Reusable UI components
    │   │   ├── layout/             # Layout components
    │   │   │   └── NavigationBar.js    # Main navigation bar
    │   │   ├── map/                # Map-related components
    │   │   │   └── SearchMap.js        # Google Maps component
    │   │   ├── common/             # Common UI elements
    │   │   ├── admin/              # Admin-specific components
    │   │   ├── onboarding/         # User onboarding
    │   │   └── company/            # Company-related components
    │   │
    │   ├── pages/                  # Page components
    │   │   ├── home/               # Landing page
    │   │   │   ├── HomePage.js
    │   │   │   └── HomePage.css
    │   │   ├── auth/               # Authentication pages
    │   │   │   ├── LoginPage.js
    │   │   │   ├── SignUpPage.js
    │   │   │   └── ForgotPasswordPage.js
    │   │   ├── companies/          # Company listing
    │   │   │   ├── CompaniesPage.js
    │   │   │   └── CompaniesPage.css
    │   │   ├── company/            # Company detail
    │   │   │   ├── CompanyDetailPage.js
    │   │   │   └── CompanyDetailPage.css
    │   │   ├── navigation/         # Map navigation page
    │   │   │   ├── NavigationPage.js
    │   │   │   └── NavigationPage.css
    │   │   ├── profile/            # User profile
    │   │   ├── pricing/            # Pricing and subscriptions
    │   │   ├── admin/              # Admin dashboard
    │   │   ├── search/             # Search functionality
    │   │   ├── mobile/             # Mobile designs showcase
    │   │   └── illustrations/      # Design illustrations
    │   │
    │   ├── services/               # API and business logic
    │   │   ├── api.js              # Axios configuration
    │   │   ├── serviceFactory.js   # Service selection (mock/real)
    │   │   ├── authService.js      # Authentication API
    │   │   ├── companyService.js   # Company data API
    │   │   ├── bookmarkService.js  # Bookmark management
    │   │   ├── subscriptionService.js  # Subscription API
    │   │   ├── exportService.js    # Data export API
    │   │   ├── geocodingService.js # Geocoding and maps
    │   │   ├── icnDataService.js   # ICN capability data
    │   │   └── mock*.js            # Mock services for development
    │   │
    │   ├── contexts/               # React contexts
    │   │   └── BookmarkContext.js  # Bookmark state management
    │   │
    │   ├── hooks/                  # Custom React hooks
    │   │   └── useAuth.js          # Authentication hook
    │   │
    │   ├── utils/                  # Utility functions
    │   │   ├── tierConfig.js       # Subscription tier configuration
    │   │   └── helpers.js          # Helper functions
    │   │
    │   ├── config/                 # Configuration files
    │   │   └── constants.js        # Application constants
    │   │
    │   └── assets/                 # Images, icons, and media
    │
    ├── package.json                # Dependencies and scripts
    ├── .env.example                # Environment variables template
    └── .env.development.local      # Local environment config (gitignored)
```

---

## 🧩 Key Components

### Navigation Bar (`NavigationBar.js`)
- Responsive navigation with mobile menu
- User authentication state display
- Dynamic menu items based on user role
- Search integration
- Notification indicators

### Search Map (`SearchMap.js`)
- Google Maps integration with custom markers
- **Performance Optimizations:**
  - Marker clustering for 50+ companies (gridSize: 50)
  - Viewport filtering for 200+ companies (80-90% DOM reduction)
  - Custom InfoWindow with OverlayView
  - Haversine distance calculations
- User location detection
- Company marker popups with quick actions
- Fullscreen mode support

### Companies Page (`CompaniesPage.js`)
- Grid/List view toggle
- Advanced filtering sidebar
- Pagination with 12 items per page
- Bookmark toggle functionality
- Export to CSV/PDF based on tier
- Responsive card design

### Company Detail Page (`CompanyDetailPage.js`)
- Comprehensive company information
- Tier-based information access control
- Contact information and website links
- ICN capabilities and sectors display
- Verification status and certification
- Bookmark functionality

### Profile Page (`ProfilePage.js`)
- User information management
- Subscription status display
- Bookmarked companies list
- Account settings
- Password change functionality

### Pricing Page (`PricingPage.js`)
- Three-tier pricing display (Free, Plus, Premium)
- Monthly/Yearly billing toggle
- Feature comparison matrix
- Upgrade/downgrade functionality
- Stripe payment integration

### Admin Dashboard (`AdminDashboard.js`)
- User management with role assignment
- Company data management
- System analytics and metrics
- Activity monitoring

---

## 🔌 API Integration

### API Architecture

The application uses a service factory pattern to switch between mock and real APIs:

```javascript
// services/serviceFactory.js
import { USE_MOCK } from './config';

export const getCompanyService = () => {
  return USE_MOCK ? mockCompanyService : companyService;
};
```

### Base API Configuration

```javascript
// services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Services

#### Company Service (`companyService.js`)
```javascript
// Get all companies with filters
getAll({ sectors, capabilities, search, limit, offset })

// Get company by ID
getById(id)

// Search companies
search({ query, filters })

// Get nearby companies
getNearby({ latitude, longitude, radius })
```

#### Authentication Service (`authService.js`)
```javascript
// User login
login(email, password)

// User registration
register(userData)

// Password reset
sendValidationCode(email)
resetPassword(email, code, newPassword)

// Get current user
getCurrentUser()

// Logout
logout()
```

#### Bookmark Service (`bookmarkService.js`)
```javascript
// Get user bookmarks
getUserBookmarks()

// Add bookmark
addBookmark(companyId)

// Remove bookmark
removeBookmark(companyId)

// Check if bookmarked
isBookmarked(companyId)
```

#### Subscription Service (`subscriptionService.js`)
```javascript
// Get pricing plans
getPricingPlans()

// Subscribe to plan
subscribe(planId, paymentInfo)

// Cancel subscription
cancelSubscription()

// Get subscription status
getSubscriptionStatus()
```

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/send-code` - Send verification code
- `POST /api/auth/reset-password` - Reset password

**Companies:**
- `GET /api/companies` - Get all companies (with filters)
- `GET /api/companies/:id` - Get company details
- `GET /api/companies/search` - Search companies
- `GET /api/companies/nearby` - Get nearby companies

**User:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/bookmarks` - Get user bookmarks
- `POST /api/user/bookmarks/:id` - Add bookmark
- `DELETE /api/user/bookmarks/:id` - Remove bookmark

**Subscriptions:**
- `GET /api/subscriptions/plans` - Get pricing plans
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/status` - Get subscription status

**Export:**
- `POST /api/export/csv` - Export to CSV
- `POST /api/export/pdf` - Export to PDF

**Admin:**
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/companies` - Get all companies (admin view)
- `PUT /api/admin/companies/:id` - Update company
- `GET /api/admin/analytics` - Get analytics data

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User Registration:**
   - User submits registration form
   - Backend creates account with hashed password
   - User is redirected to login

2. **User Login:**
   - User submits credentials
   - Backend validates and returns JWT token
   - Token stored in localStorage
   - User object stored in localStorage and React state

3. **Password Reset:**
   - User requests reset code via email
   - Backend sends 6-digit verification code
   - User enters code and new password
   - Backend validates code and updates password

### Protected Routes

```javascript
// App.js
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Usage
<Route 
  path="/profile" 
  element={
    <ProtectedRoute user={user}>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

### Admin Routes

```javascript
// components/admin/AdminRoute.js
function AdminRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
```

### Tier-Based Access Control

```javascript
// utils/tierConfig.js
export const TIER_CONFIG = {
  free: {
    features: ['basic_info', 'basic_export'],
    exportLimit: 10,
    bookmarkLimit: 5
  },
  plus: {
    features: ['basic_info', 'abn', 'company_summary', 'basic_export'],
    exportLimit: 50,
    bookmarkLimit: 20
  },
  premium: {
    features: ['all'],
    exportLimit: -1,  // unlimited
    bookmarkLimit: -1  // unlimited
  }
};

// Usage in components
const canViewABN = user?.tier === 'plus' || user?.tier === 'premium';
const canExport = TIER_CONFIG[user?.tier]?.features.includes('export');
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm start              # Start dev server at http://localhost:3000
npm start:mock         # Start with mock data
npm start:dev          # Start with dev tools enabled

# Build
npm run build          # Production build
npm run build:mock     # Build with mock data
npm run build:prod     # Production build with prod API

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format with Prettier
npm run format:check   # Check formatting
npm run validate       # Run lint + format + test

# Testing
npm test               # Run tests in watch mode
npm test -- --coverage # Run tests with coverage

# Analysis
npm run analyze        # Analyze bundle size
```

### Docker Commands (Makefile)

```bash
# Setup & Installation
make setup             # Initial project setup
make install           # Install dependencies
make reinstall         # Force reinstall dependencies
make rebuild           # Rebuild Docker images

# Development
make dev               # Start dev environment (foreground)
make up                # Start containers (background)
make down              # Stop containers
make start             # Start React dev server
make stop              # Stop all services

# Debugging
make shell             # Enter container shell
make logs              # View container logs
make status            # Check container status
make diagnose          # Run diagnostics

# Maintenance
make clean             # Clean Docker resources
make reset             # Complete environment reset
make fix               # Fix common issues
make fix-deps          # Fix dependency issues
```

### Development Workflow

1. **Start Development:**
   ```bash
   make dev
   # or
   npm start
   ```

2. **Make Changes:**
   - Edit files in `src/`
   - Hot reload will automatically update the browser

3. **Check Code Quality:**
   ```bash
   npm run lint:fix
   npm run format
   ```

4. **Run Tests:**
   ```bash
   npm test
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

### Code Style Guidelines

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable/function names
- Add JSDoc comments for complex functions
- Keep components small and focused (< 300 lines)
- Extract reusable logic into custom hooks
- Use CSS modules or scoped CSS for styling
- Organize imports: React → External → Internal

---

## 🧪 Testing

### Testing Stack

- **Jest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- SearchMap.test.js

# Run tests in CI mode
npm test -- --watchAll=false
```

### Writing Tests

```javascript
// components/CompanyCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyCard from './CompanyCard';

describe('CompanyCard', () => {
  const mockCompany = {
    id: 1,
    name: 'Test Company',
    type: 'Manufacturer',
    verified: true
  };

  it('renders company information', () => {
    render(<CompanyCard company={mockCompany} />);
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer')).toBeInTheDocument();
  });

  it('handles bookmark click', () => {
    const handleBookmark = jest.fn();
    render(
      <CompanyCard 
        company={mockCompany} 
        onBookmark={handleBookmark} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /bookmark/i }));
    expect(handleBookmark).toHaveBeenCalledWith(mockCompany.id);
  });
});
```

---

## 🚢 Deployment

### Production Build

```bash
# Build for production
npm run build:prod

# Output will be in build/ directory
# Files are minified and optimized for production
```

### Environment-Specific Builds

```bash
# Development build with mock data
npm run build:mock

# Production build with specific API
REACT_APP_API_URL=https://api.icnvictoria.com npm run build
```

### Deployment Options

#### 1. Static Hosting (Recommended)

Deploy the `build/` folder to:
- **Netlify**: Drag & drop or Git integration
- **Vercel**: Automatic Git deployment
- **GitHub Pages**: Static site hosting
- **AWS S3 + CloudFront**: Scalable CDN hosting

#### 2. Docker Deployment

```bash
# Build production Docker image
docker build -t icn-frontend:prod .

# Run container
docker run -p 80:80 icn-frontend:prod
```

#### 3. Traditional Server

```bash
# Install serve globally
npm install -g serve

# Serve build folder
serve -s build -l 3000
```

### Environment Variables for Production

Create `.env.production`:

```bash
# Production API URL
REACT_APP_API_URL=https://api.icnvictoria.com

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_KEY=your_production_key

# Feature Flags
REACT_APP_USE_MOCK=false
REACT_APP_SHOW_DEV_TOOLS=false
REACT_APP_ENV=production
```

### Performance Optimizations

- Code splitting with React.lazy()
- Image optimization (WebP format, lazy loading)
- Gzip compression
- CDN for static assets
- Service Worker for caching (coming soon)
- Bundle size monitoring with source-map-explorer

---

## ⚙️ Configuration

### Proxy Configuration (`setupProxy.js`)

```javascript
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
};
```

### Google Maps Configuration

```javascript
// App.js
const libraries = ['places', 'geometry'];

<LoadScript 
  googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
  libraries={libraries}
>
  {/* Map components */}
</LoadScript>
```

### Tier Configuration (`utils/tierConfig.js`)

```javascript
export const TIER_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    features: ['basic_info', 'basic_export'],
    limits: {
      export: 10,
      bookmarks: 5
    }
  },
  plus: {
    name: 'Plus',
    price: 9.99,
    features: ['basic_info', 'abn', 'company_summary'],
    limits: {
      export: 50,
      bookmarks: 20
    }
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    features: ['all'],
    limits: {
      export: -1,  // unlimited
      bookmarks: -1
    }
  }
};
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### 2. Dependencies Not Installing

```bash
# With Docker
make fix-deps

# Without Docker
rm -rf node_modules package-lock.json
npm install
```

#### 3. Maps Not Loading

```bash
# Check if REACT_APP_GOOGLE_MAPS_KEY is set
echo $REACT_APP_GOOGLE_MAPS_KEY

# Verify API key has required services enabled:
# - Maps JavaScript API
# - Geocoding API
# - Places API
```

#### 4. API Connection Failed

```bash
# Check if backend is running
curl http://localhost:8080/api/health

# Check proxy configuration in setupProxy.js
# Verify REACT_APP_API_URL in .env file
```

#### 5. Build Fails

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build

# Check for TypeScript errors
npm run lint
```

### Debug Mode

Enable detailed logging:

```bash
# Start with debug logging
REACT_APP_LOG_LEVEL=debug npm start

# Check browser console for detailed logs
```

### Getting Help

1. Check browser console for error messages
2. Run diagnostics: `make diagnose`
3. View logs: `make logs`
4. Check network tab for API calls
5. Verify environment variables are set correctly

---

## 📞 Support & Resources

### Documentation
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Material-UI](https://mui.com/)
- [Google Maps API](https://developers.google.com/maps/documentation)

### API Documentation
- Backend API: `http://localhost:8080/swagger-ui.html`
- API Spec: `/api-docs`

### Project Links
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- GitHub: `https://github.com/ITP-ICN-G05/ICN-Frontend`

---

## 📝 Notes for Handover

### Important Files to Review

1. **`src/App.js`** - Main application structure and routing
2. **`src/services/serviceFactory.js`** - Mock/Real API switching
3. **`src/setupProxy.js`** - API proxy configuration
4. **`src/utils/tierConfig.js`** - Subscription tier rules
5. **`.env.development.local`** - Local environment configuration

### Known Limitations

- Google Maps requires API key with billing enabled
- Mock data is used when `REACT_APP_USE_MOCK=true`
- Some admin features are UI-only (backend not implemented)
- Export limits are enforced on frontend only
- Mobile app is reference design only (not implemented)

### Future Improvements

- Implement service worker for offline support
- Add unit tests for all components
- Implement saved search functionality
- Add real-time notifications
- Optimize bundle size further
- Implement advanced analytics
- Add internationalization (i18n)

### Environment Setup Checklist

- [ ] Google Maps API key configured
- [ ] Backend API URL set correctly
- [ ] Environment variables in `.env.development.local`
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server running
- [ ] Database populated with test data
- [ ] Admin user created

---

**Last Updated:** 2025-01-05  
**Version:** 1.0.0  
**Maintained by:** ICN Victoria Development Team

For questions or issues, please contact the development team or create an issue on GitHub.
