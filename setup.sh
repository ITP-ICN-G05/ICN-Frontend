#!/bin/bash

# ICN Navigator Web Frontend Setup Script
# This script initializes the React web project according to Sprint 2 specifications

echo "🚀 ICN Navigator Web Frontend Setup Starting..."

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
print_header "Setting up React project..."
if [ ! -d "icn-frontend" ]; then
    print_status "Creating project directory..."
    mkdir -p icn-frontend
    cd icn-frontend
    
    # Initialize package.json
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
    "typescript": "^5.0.0",
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
    @types/react \
    @types/react-dom \
    @types/react-router-dom \
    axios \
    @reduxjs/toolkit \
    react-redux \
    @mui/material \
    @emotion/react \
    @emotion/styled \
    @mui/icons-material \
    react-hook-form \
    recharts \
    date-fns \
    lodash \
    @types/lodash

# Step 3: Install development dependencies
print_header "Installing development dependencies..."
npm install --save-dev \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser \
    eslint-config-prettier \
    eslint-plugin-prettier \
    prettier \
    husky \
    lint-staged \
    @testing-library/react \
    @testing-library/jest-dom \
    @testing-library/user-event \
    @types/jest \
    source-map-explorer \
    cross-env

# Step 4: Create project structure
print_header "Creating project directory structure..."
mkdir -p src/{components,pages,services,hooks,store,utils,styles,assets,types}
mkdir -p src/components/{common,forms,layout,charts}
mkdir -p src/pages/{auth,dashboard,companies,search,profile,settings}
mkdir -p src/store/{slices,middleware}
mkdir -p src/assets/{images,icons,fonts}
mkdir -p src/styles/{themes,components}
mkdir -p public/{images,icons}
mkdir -p docs/{architecture,api,components}

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

# Create src/index.tsx if it doesn't exist
if [ ! -f "src/index.tsx" ]; then
    print_status "Creating src/index.tsx..."
    cat > src/index.tsx << 'INDEX'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
INDEX
fi

# Create src/index.css if it doesn't exist
if [ ! -f "src/index.css" ]; then
    print_status "Creating src/index.css..."
    cat > src/index.css << 'CSS'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
CSS
fi

# Step 5: Create configuration files
print_header "Creating configuration files..."

# Create TypeScript configuration (only if it doesn't exist or update it)
print_status "Creating/Updating tsconfig.json..."
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/services/*": ["services/*"],
      "@/store/*": ["store/*"],
      "@/hooks/*": ["hooks/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/styles/*": ["styles/*"],
      "@/assets/*": ["assets/*"]
    }
  },
  "include": [
    "src"
  ]
}
EOL

# Create ESLint configuration
if [ ! -f ".eslintrc.json" ]; then
    print_status "Creating .eslintrc.json..."
    cat > .eslintrc.json << EOL
{
  "env": {
    "browser": true,
    "es2021": true,
    "jest": true
  },
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
EOL
else
    print_warning ".eslintrc.json already exists, skipping creation..."
fi

# Create Prettier configuration
if [ ! -f ".prettierrc" ]; then
    print_status "Creating .prettierrc..."
    cat > .prettierrc << EOL
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
EOL
else
    print_warning ".prettierrc already exists, skipping creation..."
fi

# Create .prettierignore
if [ ! -f ".prettierignore" ]; then
    print_status "Creating .prettierignore..."
    cat > .prettierignore << EOL
node_modules
build
coverage
public
*.min.js
*.min.css
EOL
else
    print_warning ".prettierignore already exists, skipping creation..."
fi

# Step 6: Create initial source files
print_header "Creating initial source files..."

# Create API service configuration
if [ ! -f "src/services/api.ts" ]; then
    print_status "Creating API service..."
    cat > src/services/api.ts << 'EOL'
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
EOL
else
    print_warning "API service already exists, skipping creation..."
fi

# Create types file
if [ ! -f "src/types/index.ts" ]; then
    print_status "Creating types file..."
    cat > src/types/index.ts << 'EOL'
export interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  website?: string;
  email?: string;
  phone?: string;
  employees?: number;
  revenue?: number;
  foundedYear?: number;
  tags?: string[];
  logo?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'premium';
  tier: 'basic' | 'premium' | 'enterprise';
  company?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
  };
  language: string;
  timezone: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  searchQuery: string;
  filters: SearchFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface SearchFilters {
  industry?: string[];
  size?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number;
  };
  employees?: {
    min?: number;
    max?: number;
  };
  revenue?: {
    min?: number;
    max?: number;
  };
  foundedYear?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
EOL
else
    print_warning "Types file already exists, skipping creation..."
fi

# Create Redux store setup
if [ ! -f "src/store/index.ts" ]; then
    print_status "Creating Redux store..."
    cat > src/store/index.ts << 'EOL'
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import companyReducer from './slices/companySlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companyReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOL
else
    print_warning "Redux store already exists, skipping creation..."
fi

# Create auth slice
if [ ! -f "src/store/slices/authSlice.ts" ]; then
    print_status "Creating auth slice..."
    mkdir -p src/store/slices
    cat > src/store/slices/authSlice.ts << 'EOL'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { User, AuthState } from '../../types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
EOL
else
    print_warning "Auth slice already exists, skipping creation..."
fi

# Create company slice
if [ ! -f "src/store/slices/companySlice.ts" ]; then
    print_status "Creating company slice..."
    cat > src/store/slices/companySlice.ts << 'EOL'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Company, CompanyState, SearchFilters } from '../../types';

const initialState: CompanyState = {
  companies: [],
  selectedCompany: null,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params: { page?: number; pageSize?: number; filters?: SearchFilters }) => {
    const response = await api.get('/companies', { params });
    return response.data;
  }
);

export const fetchCompanyById = createAsyncThunk(
  'companies/fetchCompanyById',
  async (id: string) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  }
);

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.selectedCompany = action.payload.data;
      });
  },
});

export const { setSearchQuery, setFilters, setSelectedCompany, clearError } = companySlice.actions;
export default companySlice.reducer;
EOL
else
    print_warning "Company slice already exists, skipping creation..."
fi

# Create UI slice
if [ ! -f "src/store/slices/uiSlice.ts" ]; then
    print_status "Creating UI slice..."
    cat > src/store/slices/uiSlice.ts << 'EOL'
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as UIState['theme']) || 'system',
  sidebarOpen: true,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; severity?: UIState['snackbar']['severity'] }>
    ) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const { setTheme, toggleSidebar, showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
EOL
else
    print_warning "UI slice already exists, skipping creation..."
fi

# Create App.tsx
if [ ! -f "src/App.tsx" ]; then
    print_status "Creating App.tsx..."
    cat > src/App.tsx << 'EOL'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import { useAppSelector } from './hooks/redux';
import { createAppTheme } from './styles/theme';

// Import pages when created
// import Login from './pages/auth/Login';
// import Dashboard from './pages/dashboard/Dashboard';
// import Companies from './pages/companies/Companies';

function AppContent() {
  const theme = useAppSelector((state) => state.ui.theme);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const appTheme = createAppTheme(theme);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <div>Login Page</div>} />
        <Route path="/" element={isAuthenticated ? <div>Dashboard</div> : <Navigate to="/login" />} />
        <Route path="/companies" element={isAuthenticated ? <div>Companies</div> : <Navigate to="/login" />} />
        <Route path="/search" element={isAuthenticated ? <div>Search</div> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <div>Profile</div> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
EOL
else
    print_warning "App.tsx already exists, skipping creation..."
fi

# Create hooks for Redux
if [ ! -f "src/hooks/redux.ts" ]; then
    print_status "Creating Redux hooks..."
    mkdir -p src/hooks
    cat > src/hooks/redux.ts << 'EOL'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
EOL
else
    print_warning "Redux hooks already exist, skipping creation..."
fi

# Create theme configuration
if [ ! -f "src/styles/theme.ts" ]; then
    print_status "Creating theme configuration..."
    mkdir -p src/styles
    cat > src/styles/theme.ts << 'EOL'
import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark' | 'system') => {
  const systemMode = mode === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  return createTheme({
    palette: {
      mode: systemMode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#dc004e',
        light: '#f50057',
        dark: '#c51162',
      },
      background: {
        default: systemMode === 'light' ? '#f5f5f5' : '#121212',
        paper: systemMode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
};
EOL
else
    print_warning "Theme configuration already exists, skipping creation..."
fi

# Create environment template
print_header "Creating environment template..."
if [ ! -f ".env.example" ]; then
    print_status "Creating .env.example template..."
    cat > .env.example << EOL
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
EOL
else
    print_warning ".env.example already exists, skipping creation..."
fi

# Copy .env.example to .env if .env doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env from template..."
    cp .env.example .env.development.local
    print_warning "⚠️  Please edit .env.development.local and add your actual API configuration!"
else
    print_warning ".env already exists, skipping creation..."
fi

# Update package.json scripts
print_header "Updating package.json scripts..."
print_status "Adding npm scripts to package.json..."

# Create a temporary file with the updated scripts
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'start': 'react-scripts start',
  'build': 'react-scripts build',
  'test': 'react-scripts test',
  'eject': 'react-scripts eject',
  'lint': 'eslint src/**/*.{js,jsx,ts,tsx}',
  'lint:fix': 'eslint src/**/*.{js,jsx,ts,tsx} --fix',
  'format': 'prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"',
  'format:check': 'prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"',
  'validate': 'npm run lint && npm run format:check && npm test -- --watchAll=false',
  'analyze': 'source-map-explorer \"build/static/js/*.js\"',
  'pre-commit': 'lint-staged',
  'prepare': 'husky install'
};

packageJson['lint-staged'] = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,css,md}': [
    'prettier --write'
  ]
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Initialize git hooks with husky
print_header "Setting up Git hooks..."
if [ ! -d ".husky" ]; then
    npx husky install
    npx husky add .husky/pre-commit "npm run pre-commit"
else
    print_warning "Husky already configured, skipping..."
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    print_status "Creating .gitignore..."
    cat > .gitignore << EOL
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

# Environment
.env
EOL
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
print_status "  npm run validate   - Run all checks"
print_status "  npm run analyze    - Analyze bundle size"
print_status ""
print_status "🌐 Project structure created according to Sprint 2 specifications"
print_status "🎯 Ready for Week 1 development tasks!"

cd ..
print_status "Setup completed! Navigate to icn-frontend directory to start development."