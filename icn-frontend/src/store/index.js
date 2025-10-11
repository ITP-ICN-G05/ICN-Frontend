import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import companyReducer from './slices/companySlice';
import searchReducer from './slices/searchSlice';
import filterReducer from './slices/filterSlice';
import bookmarkReducer from './slices/bookmarkSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import analyticsReducer from './slices/analyticsSlice';
import mapReducer from './slices/mapSlice';
import exportReducer from './slices/exportSlice';

// Create the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    company: companyReducer,
    search: searchReducer,
    filter: filterReducer,
    bookmark: bookmarkReducer,
    subscription: subscriptionReducer,
    notification: notificationReducer,
    ui: uiReducer,
    analytics: analyticsReducer,
    map: mapReducer,
    export: exportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/login/fulfilled',
          'company/uploadDocument/fulfilled',
          'export/downloadFile/fulfilled'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

export default store;