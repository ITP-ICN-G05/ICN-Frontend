# ICN Navigator Web Frontend

This is the **web frontend** for the ICN Navigator project, built with [React](https://react.dev/) using JavaScript, HTML, and CSS.  
It connects to the Spring Boot backend via REST APIs.

## ✨ Features

**Docker Development Environment**
- 🔧 **Containerized Setup**: Consistent development environment across all machines
- 📦 **Smart Dependency Management**: Automatic detection and skip-if-exists logic
- 🌐 **Docker Isolation**: No system pollution, everything runs in containers
- 🔍 **Comprehensive Diagnostics**: Built-in troubleshooting commands
- 💻 **Cross-Platform**: Works on Windows, Mac, and Linux
- ⚡ **Hot Reload**: Instant feedback during development

**Tech Stack**
- **React 18** - Modern React with hooks and functional components
- **JavaScript** - Plain JavaScript (no TypeScript complexity)
- **HTML5 & CSS3** - Standard web technologies
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Redux Toolkit** - State management (optional, can be removed if not needed)

---

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Installation
```bash
# Clone repository
git clone git@github.com:ITP-ICN-G05/ICN-Frontend.git
cd ICN-Frontend

# Initial setup (one-time only)
make setup

# If you encounter issues
make fix-deps
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
* Hot reload is enabled for instant updates
* Backend API is expected at http://localhost:8080

## 🔌 API Configuration

### Setup Environment Variables
```bash
# Enter container shell
make shell

# Navigate to React project
cd icn-frontend

# Create environment file
cp .env.example .env.development.local
# Edit .env.development.local with your configuration
```

### Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8080

# Feature Flags (optional)
REACT_APP_ENV=development
```

## 📁 Project Structure
```
ICN-Frontend/
├── README.md                # Documentation
├── Dockerfile               # Docker container configuration
├── docker-compose.yml       # Container orchestration
├── Makefile                 # Development commands
├── setup.sh                 # Automated setup script
└── icn-frontend/            # React project
    ├── src/                 # Source code
    │   ├── components/      # Reusable React components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── styles/          # CSS files
    │   ├── utils/           # Utility functions
    │   ├── App.js           # Main app component
    │   ├── App.css          # App styles
    │   ├── index.js         # Entry point
    │   └── index.css        # Global styles
    ├── public/              # Static files
    │   ├── index.html       # HTML template
    │   └── favicon.ico      # Site icon
    └── package.json         # Dependencies

```

## 🛠 Development Commands

### Most Used Commands
```bash
make start       # Start React dev server
make stop        # Stop all containers
make shell       # Enter container shell
make logs        # View container logs
```

### Setup & Installation
```bash
make setup       # Initial setup (run once)
make rebuild     # Force rebuild Docker images
make install     # Install dependencies
make reinstall   # Force reinstall dependencies
make fix-deps    # Fix dependency issues
```

### Development
```bash
make dev         # Start development environment
make start       # Start React dev server
make build-app   # Build production bundle
make up          # Start containers in background
make down        # Stop containers
```

### Code Quality
```bash
make lint        # Run ESLint
make lint-fix    # Fix ESLint issues
make format      # Format code with Prettier
make test        # Run tests
```

### Troubleshooting
```bash
make diagnose    # Run diagnostics
make status      # Check container status
make fix         # Fix common issues
make clean       # Clean up Docker resources
make reset       # Complete environment reset
```

## 🧪 Development Workflow

### Daily Development
1. **Start the environment**
   ```bash
   make start
   ```

2. **Make changes** to your code in `icn-frontend/src/`
   - Components go in `src/components/`
   - Pages go in `src/pages/`
   - CSS files go in `src/styles/`

3. **See changes instantly** with hot reload

4. **Check code quality**
   ```bash
   make lint
   make format
   ```

5. **Build for production**
   ```bash
   make build-app
   ```

### Creating Components

Create simple React components with JavaScript:

```javascript
// src/components/CompanyCard.js
import React from 'react';
import './CompanyCard.css';

function CompanyCard({ company }) {
  return (
    <div className="company-card">
      <h3>{company.name}</h3>
      <p>{company.description}</p>
      <a href={company.website}>Visit Website</a>
    </div>
  );
}

export default CompanyCard;
```

```css
/* src/components/CompanyCard.css */
.company-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.company-card h3 {
  color: #333;
  margin-top: 0;
}
```

### API Integration

Simple API calls with Axios:

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

```javascript
// src/services/companyService.js
import api from './api';

export const companyService = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};
```

## 🎨 Styling Approach

We use plain CSS for styling to keep things simple:

1. **Global styles** in `src/index.css`
2. **Component styles** in individual CSS files next to components
3. **Page styles** in the pages directory
4. **Utility classes** in `src/styles/utilities.css`

Example structure:
```
src/
├── components/
│   ├── Header.js
│   ├── Header.css
│   ├── CompanyCard.js
│   └── CompanyCard.css
├── pages/
│   ├── Dashboard.js
│   └── Dashboard.css
└── styles/
    ├── variables.css    # CSS variables for colors, spacing
    └── utilities.css    # Reusable utility classes
```

## 🚀 Build & Deployment

### Development Build
```bash
# Build for development
make build-app
```

### Production Build
```bash
# Inside container
make shell
cd icn-frontend
npm run build

# Build artifacts will be in icn-frontend/build/
```

### Serve Production Build Locally
```bash
make serve-build
# Visit http://localhost:3000
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Port 3000 Already in Use
```bash
# Stop any process using port 3000
lsof -i :3000
kill -9 <PID>

# Restart containers
make down
make up
make start
```

#### Dependencies Not Installing
```bash
# Fix dependencies
make fix-deps

# Or manually inside container
make shell
cd icn-frontend
rm -rf node_modules package-lock.json
npm install
```

#### Container Not Starting
```bash
# Check Docker status
docker ps

# Reset everything
make reset
```

#### Hot Reload Not Working
```bash
# Restart the development server
make down
make start
```

### Getting Help
```bash
# Check system status
make status

# Run diagnostics
make diagnose

# View logs
make logs

# Enter container for debugging
make shell
```

## 🤝 Contributing

### Development Process
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Start development: `make dev`
3. Make your changes
4. Test your changes: `make test`
5. Format code: `make format`
6. Commit changes: `git commit -m "feat: add new feature"`
7. Push to GitHub: `git push origin feature/your-feature`
8. Create a Pull Request

### Code Style Guidelines
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic
- Organize imports (React first, then external libs, then local files)
- Keep CSS simple and maintainable

### Example Component Structure
```javascript
// Good component example
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyComponent.css';

function MyComponent({ prop1, prop2 }) {
  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // Methods
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/data');
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="my-component">
      <h2>{prop1}</h2>
      <p>{prop2}</p>
      {data && <div>{data.content}</div>}
    </div>
  );
}

export default MyComponent;
```

## 📚 Resources

### Learning Resources
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [CSS Tricks](https://css-tricks.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Project Links
- Backend API: http://localhost:8080
- Frontend App: http://localhost:3000
- API Documentation: http://localhost:8080/swagger-ui.html

## 📈 Performance Tips

1. **Keep components simple** - Break down complex components
2. **Use React.memo** for expensive components
3. **Lazy load routes** with React.lazy()
4. **Optimize images** - Use appropriate formats and sizes
5. **Minimize CSS** - Remove unused styles
6. **Use production build** for deployment

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Store sensitive data in environment variables
- Validate user input on both frontend and backend
- Use HTTPS in production
- Implement proper authentication and authorization

