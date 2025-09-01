# Developer Guidelines – Web Front-End (React)

These guidelines describe how to structure, build and maintain the React web front-end for the ICN Navigator project. They adapt the principles from the Israeli Tech Radar Developer Guidelines article to a modern JavaScript/TypeScript React application.

## Purpose and Audience

These recommendations are aimed at front-end developers building the React web application. Following them will help you produce clean, consistent and maintainable code and collaborate effectively with back-end and mobile teams.

## Repository Structure

### Current Structure
Based on the README, the ICN-Frontend currently has:
```
ICN-Frontend/
├── README.md                        # Project documentation
├── .gitignore                       # Git ignore file
└── icn-frontend/
    ├── src/                         # React source code
    ├── public/                      # Static assets
    └── package.json                 # Dependencies and scripts
```

### Recommended Structure Additions
To align with best practices, add the following to your repository:

```
ICN-Frontend/
├── .github/
│   └── workflows/                   # ADD: GitHub Actions for CI/CD
│       ├── build.yml
│       ├── test.yml
│       └── deploy.yml
└── icn-frontend/
    ├── .pre-commit-config.yaml      # ADD: Pre-commit hooks
    ├── .eslintrc.json               # ADD: ESLint configuration
    ├── .prettierrc                  # ADD: Prettier configuration
    ├── src/
    │   ├── components/              # ORGANIZE: Reusable UI components
    │   ├── pages/                   # ORGANIZE: Page components
    │   ├── services/                # ADD: API client layer
    │   │   └── api.js               # Axios configuration
    │   ├── hooks/                   # ADD: Custom React hooks
    │   ├── utils/                   # ADD: Utility functions
    │   ├── styles/                  # ORGANIZE: Global styles
    │   └── tests/                   # ADD: Test files
    ├── docs/                        # ADD: Project documentation
    │   ├── architecture.md
    │   ├── api-integration.md
    │   └── contributing.md
    └── .env.development             # ADD: Environment variables
```

The `ADD` tags indicate new folders/files to create, while `ORGANIZE` suggests restructuring existing code for better maintainability.

## README.md

Every project must include a README that explains:
- What the app does (ICN Navigator web interface)
- Prerequisites (Node.js LTS, npm)
- Installation steps (`npm install`)
- How to run locally (`npm start` - runs at http://localhost:3000)
- How to build for production (`npm run build`)
- API configuration (`REACT_APP_API_URL` environment variable)
- Available scripts and their purposes
- Contributing guidelines

Keep the README up to date whenever you change setup or scripts.

### Implementation Priority
When adopting these guidelines, prioritize in this order:
1. **Immediate**: Add .gitignore, ESLint, Prettier
2. **Week 1**: Set up pre-commit hooks, organize src/ folders
3. **Week 2**: Add GitHub Actions CI/CD
4. **Week 3**: Create documentation, add tests
5. **Ongoing**: Maintain and improve as you develop

## Documentation

Store documentation under `docs/` as shown above. At minimum include:

- **Getting Started guide**: overview, prerequisites (Node, npm), installation steps (`npm install`), and how to run the dev server (`npm start`)
- **Architecture and design decisions**: explain how components are organised, state management choices (Context API, Redux, etc.), and any shared libraries
- **API integration**: describe endpoints, parameters, and response formats; reference the backend Swagger docs
- **Style guide**: document your design system, colour palette and how to use UI components
- **Testing and debugging**: show how to run unit/integration tests and debugging tools

Use a documentation generator like MkDocs or Storybook for UI components to publish docs.

## Build & Scripts

React projects use npm scripts to define common tasks. In your `package.json` include:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "lint": "eslint src/**/*.{js,jsx}",
    "format": "prettier --write src/**/*.{js,jsx,json,css}",
    "validate": "npm run lint && npm run format && npm test -- --watchAll=false",
    "eject": "react-scripts eject"
  }
}
```

| Script | Purpose |
|--------|---------|
| `npm start` | Start the development server with hot reload at http://localhost:3000 |
| `npm run build` | Build the production bundle |
| `npm test` | Run unit and integration tests |
| `npm run lint` | Run ESLint to enforce coding standards |
| `npm run format` | Run Prettier to format code |
| `npm run validate` | Run all checks (lint, format, test) |

## .gitignore

Generate your `.gitignore` using gitignore.io with the presets for Node, React, and your IDE. Essential entries:

```gitignore
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
```

## Pre-Commit Hooks

Use pre-commit with a `.pre-commit-config.yaml` file to run automated checks before each commit:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: detect-private-key
      
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.36.0
    hooks:
      - id: eslint
        files: \.(js|jsx)$
        args: ['--fix']
        
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v2.7.1
    hooks:
      - id: prettier
        files: \.(js|jsx|json|css|md)$
```

For improved developer experience, integrate Husky and lint-staged to run these checks only on staged files.

## Coding Standards

### Language
- Use JavaScript with PropTypes for type checking (or migrate to TypeScript)
- Use functional React components and React hooks instead of class components
- Keep component files focused; separate presentation (`components/`) from page logic (`pages/`)
- Use consistent naming (PascalCase for components, camelCase for variables/functions)

### Style & Formatting
- Configure ESLint with React recommended rules
- Use Prettier with a `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```
- Organise imports: external modules first, then internal modules, then styles
- Document exported functions/components with JSDoc comments

### Testing
- Write unit tests using Jest and React Testing Library
- Maintain test coverage above 80%
- Run tests locally using `npm test` and in CI

## Continuous Integration (CI)

Automate build and tests with GitHub Actions. Create workflows under `.github/workflows`:

### build.yml
```yaml
name: Build and Lint
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run validate
      - run: npm run build
```

### test.yml
```yaml
name: Test
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### deploy.yml
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to hosting provider
        run: |
          # Deploy to Netlify, Vercel, or your chosen platform
          echo "Deploy the build folder"
```

## Development Strategy

Follow a feature branch workflow to ensure stable mainline development:

1. **Start with a clear goal**: Review user stories or requirements
2. **Create a feature branch**: Name it descriptively (e.g., `feature/user-authentication`)
3. **Write descriptive commit messages**: Use conventional commits format
4. **Update frequently**: Rebase or merge the latest changes from main to avoid conflicts
5. **Write tests**: Cover your changes with unit and integration tests
6. **Open a Pull Request**: Assign reviewers; respond to feedback and improve the code
7. **Merge after approval**: Only after CI passes and reviewers approve
8. **Update documentation and release notes** as needed

## REST API Integration

The frontend connects to the Spring Boot backend:

- **API Configuration**: Store API base URL in environment variables
  ```bash
  # .env.development
  REACT_APP_API_URL=http://localhost:8080
  
  # .env.production
  REACT_APP_API_URL=https://api.icn-navigator.com
  ```

- **API Client Layer**: Centralise Axios calls in `src/services/api.js`:
  ```javascript
  import axios from 'axios';
  
  const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    timeout: 10000,
  });
  
  // Add request/response interceptors for auth and error handling
  API.interceptors.response.use(
    response => response,
    error => {
      // Handle errors globally
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );
  
  export default API;
  ```

- **Error Handling**: Display user-friendly error messages and handle network failures gracefully
- **Loading States**: Show spinners or skeletons during API calls
- **Caching**: Consider using React Query or SWR for API state management

## Deployment & Versioning

### Versioning
Use Calendar Versioning (CalVer) to tag releases:
- Format: `YYYY.MM.INC` (e.g., `2025.01.1`)
- Increment resets each month
- Tag releases using GitHub Actions

### Artifacts
- The production build (`build/` directory) is your deployable artifact
- Host on static hosting (Netlify, Vercel) or containerise with Docker
- Use environment-specific builds for dev/staging/production

### Development Isolation
- Configure environment variables per environment
- Use preview deployments on PRs to test features
- Maintain separate API endpoints for dev/staging/prod

## Summary

Adhering to these guidelines will help you build a high-quality, consistent React front-end for the ICN Navigator. A clean repository structure, proper tooling (linters, pre-commit hooks, CI), thorough documentation and a disciplined development process enable collaboration and maintainability. These practices ensure the codebase remains aligned with the broader ICN project goals while delivering a performant, easy-to-maintain web application.