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
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <div>Login Page</div>}
        />
        <Route
          path="/"
          element={isAuthenticated ? <div>Dashboard</div> : <Navigate to="/login" />}
        />
        <Route
          path="/companies"
          element={isAuthenticated ? <div>Companies</div> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={isAuthenticated ? <div>Search</div> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <div>Profile</div> : <Navigate to="/login" />}
        />
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
