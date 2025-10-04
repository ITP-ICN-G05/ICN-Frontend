# ICN Navigator Web Frontend

This is the **web frontend** for the ICN Navigator project, built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/).  
It connects to the Spring Boot backend via REST APIs.

## ✨ Latest Improvements

**Smart Development Environment (v2.0)**
- 🔧 **Idempotent Setup**: `make setup` can be run multiple times safely
- 📦 **Smart Dependency Management**: Automatic detection and skip-if-exists logic
- 🌐 **Docker Containerization**: Consistent development environment across teams
- 🔍 **Comprehensive Diagnostics**: New `make diagnose` command for troubleshooting
- 💻 **Cross-Platform**: Windows line ending fixes and enhanced compatibility
- ⚡ **Performance**: Hot reload, fast refresh, and optimized builds
- 🎨 **Material-UI Integration**: Professional UI components out of the box

---

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Git
- Google OAuth Client ID (for authentication)

### Installation
```bash
# Clone repository
git clone git@github.com:ITP-ICN-G05/ICN-Frontend.git
cd ICN-Frontend

# Initial setup (smart setup - idempotent)
make setup

# Alternative setup commands
make rebuild     # Force rebuild Docker images
make reinstall   # Force reinstall dependencies
make audit-fix   # Fix npm audit issues
```

### Running the Application
```bash
# Start development environment
make dev

# Or run in background and start React server
make up
make start
```
* The app runs at http://localhost:3000
* Hot reload is enabled for instant feedback
* Backend API is configured at http://localhost:8080

## 🔌 API Configuration

### Setup Environment Variables
```bash
# Enter container shell
make shell

# Navigate to React project and set up environment
cd icn-frontend
cp .env.example .env.development.local
# Edit .env.development.local with your actual configuration
```

### Required Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8080

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# LinkedIn OAuth Configuration  
REACT_APP_LINKEDIN_CLIENT_ID=your_linkedin_client_id

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_MOCK_DATA=false
```

### Backend Integration
* API client is located in `src/services/api.ts`
* Axios interceptors handle authentication automatically
* Error responses are handled globally
* Backend runs in Docker container, accessible from web development container

## 📁 Project Structure
```
ICN-Frontend/
├── README.md                # Documentation
├── LICENSE                  # MIT LICENSE
├── DEV_GUIDELINES.md        # Developer guidelines
├── Dockerfile               # Docker container configuration
├── docker-compose.yml       # Container orchestration
├── Makefile                 # Development commands
├── setup.sh                 # Automated setup script
└── icn-frontend/            # React project
    ├── src/                 # Source code
    │   ├── components/      # Reusable UI components
    │   │   ├── common/      # Generic components
    │   │   ├── forms/       # Form components
    │   │   ├── layout/      # Layout components
    │   │   └── charts/      # Data visualization
    │   ├── pages/           # Page components
    │   │   ├── auth/        # Authentication pages
    │   │   ├── dashboard/   # Dashboard views
    │   │   ├── companies/   # Company management
    │   │   ├── search/      # Search functionality
    │   │   └── profile/     # User profile
    │   ├── services/        # API and external services
    │   ├── store/           # Redux store configuration
    │   │   ├── slices/      # Redux slices
    │   │   └── middleware/  # Custom middleware
    │   ├── hooks/           # Custom React hooks
    │   ├── utils/           # Utility functions
    │   ├── styles/          # Styles and themes
    │   ├── types/           # TypeScript definitions
    │   └── assets/          # Static assets
    ├── public/              # Public assets
    ├── docs/                # Documentation
    ├── package.json         # Dependencies and scripts
    ├── tsconfig.json        # TypeScript configuration
    ├── .eslintrc.json       # ESLint configuration
    ├── .prettierrc          # Prettier configuration
    └── .env.example         # Environment template
```

## 🛠 Development Commands

### Setup Commands
```bash
make setup       # Smart initial setup (skips if already built)
make rebuild     # Force rebuild Docker images
make install     # Smart dependency install (skips if exists)
make reinstall   # Force reinstall dependencies
make audit-fix   # Fix npm audit issues
```

### Core Development
```bash
make dev         # Start development environment
make start       # Start React dev server
make build-app   # Build production bundle
make serve-build # Serve production build
make up          # Start containers in background
make down        # Stop containers
```

### Code Quality
```bash
make lint        # Run ESLint
make lint-fix    # Fix ESLint issues
make format      # Format code with Prettier
make format-check # Check code formatting
make test        # Run tests
make test-watch  # Run tests in watch mode
make coverage    # Generate test coverage report
make validate    # Run all checks (lint, format, test)
```

### Analysis & Diagnostics
```bash
make analyze     # Analyze bundle size
make check-updates # Check for dependency updates
make diagnose    # Run comprehensive diagnostics
make status      # Check environment status
make info        # Show project information
```

### Utility Commands
```bash
make shell       # Open container shell
make logs        # View container logs
make clean       # Clean up Docker resources
make clean-all   # Deep clean Docker resources
make clean-cache # Clean npm cache
```

### CI/CD Commands
```bash
make ci-test     # Run tests in CI mode
make ci-build    # Run production build in CI mode
```

### Quick Actions
```bash
make quick-start # Build + install + start (one command)
make reset       # Emergency reset of environment
```

## 🧪 Testing
* **Unit Testing**: Jest + React Testing Library
* **Component Testing**: UI components and interactions
* **Integration Testing**: API connectivity and Redux flows
* **E2E Testing**: User workflows (planned)

```bash
make test        # Run all tests
make test-watch  # Run tests in watch mode
make coverage    # Generate coverage report
make shell       # Enter container for advanced testing
```

## 🎨 UI Framework

### Technology Stack
* **UI Library**: Material-UI (MUI) v5
* **Theming**: Custom theme with light/dark mode support
* **Icons**: MUI Icons + custom SVGs
* **Forms**: React Hook Form for form management
* **Charts**: Recharts for data visualization
* **Date Handling**: date-fns for date operations

### Design System
* Consistent spacing and typography scales
* Responsive design for desktop and tablet
* Accessibility-first approach (WCAG 2.1 AA)
* Professional color palette with theme variants

## 🔄 State Management

### Redux Toolkit Architecture
* **Auth Slice**: User authentication and session management
* **Company Slice**: Company data and search functionality
* **UI Slice**: Theme, sidebar, and notification management
* Custom middleware for API integration
* Redux DevTools enabled in development

## 🤝 Contributing
1. Create a feature branch: `git checkout -b feature/xyz`
2. Start development environment: `make dev`
3. Write tests for new functionality
4. Ensure code passes all checks: `make validate`
5. Test thoroughly: `make test`
6. Commit changes: `git commit -m "feat: add xyz"`
7. Push branch: `git push origin feature/xyz`
8. Open a Pull Request with clear description

### Code Standards
* Use TypeScript for type safety
* Follow ESLint and Prettier configurations
* Write unit tests for components and utilities
* Use functional components with React hooks
* Implement responsive designs with MUI breakpoints
* Follow atomic design principles for components

## 🚀 Build & Deployment

### Development Environment
```bash
make build       # Build Docker images
make up          # Start containers in background
make down        # Stop containers
make build-app   # Build production bundle
```

### Production Build
```bash
# Build for production
make build-app

# Serve production build locally
make serve-build

# Build artifacts are in icn-frontend/build/
```

### Environment-Specific Builds
* Development: `.env.development.local`
* Staging: `.env.staging.local`
* Production: `.env.production.local`

## 🏗 Architecture

### Technology Stack
* **Framework**: React 18 with TypeScript
* **Routing**: React Router v6
* **State Management**: Redux Toolkit
* **UI Components**: Material-UI (MUI) v5
* **API Client**: Axios with interceptors
* **Form Handling**: React Hook Form
* **Data Visualization**: Recharts
* **Testing**: Jest + React Testing Library
* **Code Quality**: ESLint + Prettier + Husky

### Key Features
* Single Page Application (SPA) architecture
* JWT-based authentication with refresh tokens
* Real-time search with debouncing
* Responsive design for multiple screen sizes
* Progressive Web App capabilities (planned)
* Docker containerized development environment
* Comprehensive error handling and logging

## 🐛 Troubleshooting

### Smart Setup Features
The development environment includes intelligent setup detection:
- **Idempotent setup**: `make setup` can be run multiple times safely
- **Smart detection**: Skips Docker builds and dependency installs if already completed
- **Configuration preservation**: Existing config files are not overwritten
- **Cross-platform support**: Automatic line ending conversion for Windows

### Common Issues & Solutions

#### Environment Setup Issues
```bash
make diagnose    # Run comprehensive diagnostics
make status      # Check container and system status
make reinstall   # Force reinstall dependencies
make audit-fix   # Fix npm vulnerabilities
```

#### Dependency Conflicts
```bash
make reinstall   # Force clean reinstall
make clean-cache # Clear npm cache
make reset       # Complete environment reset
```

#### Development Server Issues
```bash
make logs        # View detailed container logs
make shell       # Debug inside container
make rebuild     # Force rebuild Docker images
```

#### Build Issues
```bash
make clean-all   # Deep clean everything
make setup       # Fresh setup
make ci-build    # Test production build
```

### Development Environment Diagnosis
```bash
# Check overall system status
make status

# Run comprehensive diagnostics
make diagnose

# View container logs
make logs

# Enter container for manual debugging
make shell
```

### Performance Optimization
- React.memo for expensive components
- Code splitting with React.lazy
- Bundle size analysis with source-map-explorer
- Image optimization and lazy loading
- Virtual scrolling for large lists

## 📚 Documentation
* **Architecture Guide**: System design and patterns
* **API Integration**: Backend connectivity and data flow
* **Component Library**: Reusable UI components
* **Style Guide**: Design system and theming
* **Testing Guide**: Unit and integration testing practices
* **Deployment Guide**: Production deployment strategies

## 🛠 Tools
* Docker containerized development environment
* Material-UI component library
* Redux DevTools for state debugging
* React Developer Tools
* Source Map Explorer for bundle analysis
* Make commands for streamlined workflow

## 📈 Performance Metrics
* Initial load time: < 3 seconds
* Time to interactive: < 5 seconds  
* Lighthouse score: > 90
* Bundle size: < 500KB gzipped
* Test coverage: > 80%