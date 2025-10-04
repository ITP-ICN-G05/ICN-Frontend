#!/bin/bash

# Fix React Dependencies Script
echo "🔧 Fixing React dependencies..."

# Enter the container and fix dependencies
docker-compose exec icn-web-dev bash -c '
cd icn-frontend

echo "📦 Creating proper package.json..."
cat > package.json << '\''EOF'\''
{
  "name": "icn-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.0",
    "@mui/material": "^5.14.0",
    "@reduxjs/toolkit": "^1.9.5",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/lodash": "^4.14.195",
    "@types/node": "^16.18.38",
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.6",
    "@types/react-router-dom": "^5.3.3",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.1",
    "react-redux": "^8.1.1",
    "react-router-dom": "^6.14.1",
    "react-scripts": "5.0.1",
    "recharts": "^2.7.2",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{js,jsx,ts,tsx}",
    "lint:fix": "eslint src/**/*.{js,jsx,ts,tsx} --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "validate": "npm run lint && npm run format:check && npm test -- --watchAll=false",
    "analyze": "source-map-explorer \"build/static/js/*.js\""
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
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.60.1",
    "@typescript-eslint/parser": "^5.60.1",
    "eslint": "^8.43.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^4.2.1",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3",
    "prettier": "^2.8.8",
    "source-map-explorer": "^2.5.3"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
EOF

echo "📦 Installing dependencies (this may take a moment)..."
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "Testing if react-scripts is available..."
npx react-scripts --version && echo "✅ react-scripts is working!" || echo "❌ react-scripts still not found"
'

echo ""
echo "🎉 Fix completed! Now try: make start"