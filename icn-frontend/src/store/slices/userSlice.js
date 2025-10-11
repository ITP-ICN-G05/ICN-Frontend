import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/api';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUsageStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchMonthlyViews = createAsyncThunk(
  'user/fetchMonthlyViews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getMonthlyViews();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userService.updatePreferences(preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    preferences: {
      theme: 'light',
      language: 'en',
      emailNotifications: true,
      pushNotifications: false,
      searchRadius: 50,
      defaultView: 'list',
      resultsPerPage: 20,
    },
    stats: {
      monthlyViews: 0,
      totalBookmarks: 0,
      savedSearches: 0,
      totalExports: 0,
    },
    monthlyViewsHistory: [],
    activityLog: [],
    loading: false,
    error: null,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    incrementMonthlyViews: (state) => {
      state.stats.monthlyViews += 1;
    },
    addActivity: (state, action) => {
      state.activityLog.unshift(action.payload);
      if (state.activityLog.length > 100) {
        state.activityLog.pop();
      }
    },
    resetUserState: (state) => {
      Object.assign(state, userSlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Fetch Stats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Fetch Monthly Views
      .addCase(fetchMonthlyViews.fulfilled, (state, action) => {
        state.monthlyViewsHistory = action.payload;
        state.stats.monthlyViews = action.payload.currentMonth || 0;
      })
      // Update Preferences
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const {
  setProfile,
  updateProfile,
  setPreferences,
  incrementMonthlyViews,
  addActivity,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;