import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/api';

export const trackEvent = createAsyncThunk(
  'analytics/trackEvent',
  async ({ eventName, eventData }, { rejectWithValue }) => {
    try {
      await analyticsService.trackEvent(eventName, eventData);
      return { eventName, eventData, timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const trackPageView = createAsyncThunk(
  'analytics/trackPageView',
  async ({ page, metadata }, { rejectWithValue }) => {
    try {
      await analyticsService.trackPageView(page, metadata);
      return { page, metadata, timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    events: [],
    pageViews: [],
    sessionStartTime: Date.now(),
    sessionDuration: 0,
    userActions: [],
    dashboardStats: {
      totalCompanies: 0,
      totalSearches: 0,
      activeUsers: 0,
      avgSessionDuration: 0,
    },
    searchMetrics: {
      popularSearches: [],
      searchTrends: [],
      averageResultsPerSearch: 0,
    },
    companyMetrics: {
      topViewedCompanies: [],
      averageViewsPerCompany: 0,
    },
  },
  reducers: {
    updateSessionDuration: (state) => {
      state.sessionDuration = Date.now() - state.sessionStartTime;
    },
    addUserAction: (state, action) => {
      state.userActions.push({
        ...action.payload,
        timestamp: Date.now(),
      });
      if (state.userActions.length > 100) {
        state.userActions.shift();
      }
    },
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload;
    },
    resetAnalyticsState: (state) => {
      Object.assign(state, analyticsSlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
        if (state.events.length > 500) {
          state.events.shift();
        }
      })
      .addCase(trackPageView.fulfilled, (state, action) => {
        state.pageViews.push(action.payload);
        if (state.pageViews.length > 100) {
          state.pageViews.shift();
        }
      });
  },
});

export const {
  updateSessionDuration,
  addUserAction,
  setDashboardStats,
  resetAnalyticsState,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

