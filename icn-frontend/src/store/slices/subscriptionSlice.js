import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionService } from '../../services/api';

export const fetchSubscriptionPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getPlans();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getCurrentSubscription();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const subscribe = createAsyncThunk(
  'subscription/subscribe',
  async ({ planId, paymentMethod, billingCycle }, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.subscribe(planId, paymentMethod, billingCycle);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/update',
  async ({ planId, billingCycle }, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.updateSubscription(planId, billingCycle);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (reason, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.cancelSubscription(reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUsageLimits = createAsyncThunk(
  'subscription/fetchLimits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getUsageLimits();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCurrentUsage = createAsyncThunk(
  'subscription/fetchUsage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getCurrentUsage();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    plans: [],
    currentSubscription: null,
    tier: 'free',
    billingCycle: 'monthly',
    status: 'inactive',
    nextBillingDate: null,
    usageLimits: {
      monthlyViews: 5,
      savedSearches: 0,
      bookmarkFolders: 1,
      exportFormats: ['basic'],
      apiCalls: 0,
    },
    currentUsage: {
      monthlyViews: 0,
      savedSearches: 0,
      bookmarkFolders: 0,
      apiCalls: 0,
    },
    paymentMethods: [],
    billingHistory: [],
    loading: false,
    error: null,
  },
  reducers: {
    setTier: (state, action) => {
      state.tier = action.payload;
    },
    setBillingCycle: (state, action) => {
      state.billingCycle = action.payload;
    },
    incrementUsage: (state, action) => {
      const { type, amount = 1 } = action.payload;
      if (state.currentUsage[type] !== undefined) {
        state.currentUsage[type] += amount;
      }
    },
    resetMonthlyUsage: (state) => {
      state.currentUsage.monthlyViews = 0;
    },
    resetSubscriptionState: (state) => {
      Object.assign(state, subscriptionSlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
      })
      // Current Subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        state.tier = action.payload.tier || 'free';
        state.status = action.payload.status;
        state.nextBillingDate = action.payload.nextBillingDate;
      })
      .addCase(fetchCurrentSubscription.rejected, (state) => {
        state.loading = false;
        state.tier = 'free';
      })
      // Subscribe
      .addCase(subscribe.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
        state.tier = action.payload.tier;
        state.status = 'active';
      })
      // Update Subscription
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
        state.tier = action.payload.tier;
      })
      // Cancel Subscription
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.status = 'cancelled';
      })
      // Usage Limits
      .addCase(fetchUsageLimits.fulfilled, (state, action) => {
        state.usageLimits = action.payload;
      })
      // Current Usage
      .addCase(fetchCurrentUsage.fulfilled, (state, action) => {
        state.currentUsage = action.payload;
      });
  },
});

export const {
  setTier,
  setBillingCycle,
  incrementUsage,
  resetMonthlyUsage,
  resetSubscriptionState,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;