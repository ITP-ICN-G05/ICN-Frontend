import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { logger } from './utils/logger';

// Log app initialization
logger.info('ICN Navigator Starting...', {
  environment: process.env.NODE_ENV,
  mockData: process.env.REACT_APP_USE_MOCK === 'true',
  version: process.env.REACT_APP_VERSION || '1.0.0'
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);