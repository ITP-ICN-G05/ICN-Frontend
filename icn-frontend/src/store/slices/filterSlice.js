import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchService } from '../../services/api';

export const fetchAvailableFilters = createAsyncThunk(
  'filter/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.getAvailableFilters();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchSectors = createAsyncThunk(
  'filter/fetchSectors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.getSectors();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCapabilities = createAsyncThunk(
  'filter/fetchCapabilities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.getCapabilities();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    // Active filters
    activeFilters: {
      sectors: [],
      capabilities: [],
      size: null,
      ownership: [],
      certifications: [],
      verified: false,
      distance: 50,
      location: null,
      revenue: null,
      employees: null,
      yearEstablished: null,
      localContent: null,
      exportReady: false,
    },
    // Available filter options
    availableFilters: {
      sectors: [],
      capabilities: [],
      sizes: ['Small', 'Medium', 'Large'],
      ownership: ['Female-owned', 'First Nations-owned', 'Social Enterprise', 'Australian Disability Enterprise'],
      certifications: [],
      revenueRanges: [],
      employeeRanges: [],
    },
    // UI state
    filterPanelOpen: false,
    loading: false,
    error: null,
    // Saved filter presets
    presets: [],
  },
  reducers: {
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    setSectorFilter: (state, action) => {
      state.activeFilters.sectors = action.payload;
    },
    setCapabilityFilter: (state, action) => {
      state.activeFilters.capabilities = action.payload;
    },
    setSizeFilter: (state, action) => {
      state.activeFilters.size = action.payload;
    },
    setOwnershipFilter: (state, action) => {
      state.activeFilters.ownership = action.payload;
    },
    setDistanceFilter: (state, action) => {
      state.activeFilters.distance = action.payload;
    },
    setLocationFilter: (state, action) => {
      state.activeFilters.location = action.payload;
    },
    toggleVerifiedFilter: (state) => {
      state.activeFilters.verified = !state.activeFilters.verified;
    },
    toggleExportReadyFilter: (state) => {
      state.activeFilters.exportReady = !state.activeFilters.exportReady;
    },
    clearAllFilters: (state) => {
      state.activeFilters = {
        sectors: [],
        capabilities: [],
        size: null,
        ownership: [],
        certifications: [],
        verified: false,
        distance: 50,
        location: null,
        revenue: null,
        employees: null,
        yearEstablished: null,
        localContent: null,
        exportReady: false,
      };
    },
    toggleFilterPanel: (state) => {
      state.filterPanelOpen = !state.filterPanelOpen;
    },
    setFilterPanel: (state, action) => {
      state.filterPanelOpen = action.payload;
    },
    saveFilterPreset: (state, action) => {
      state.presets.push({
        id: Date.now(),
        name: action.payload.name,
        filters: action.payload.filters || state.activeFilters,
        createdAt: new Date().toISOString(),
      });
    },
    deleteFilterPreset: (state, action) => {
      state.presets = state.presets.filter(p => p.id !== action.payload);
    },
    applyFilterPreset: (state, action) => {
      const preset = state.presets.find(p => p.id === action.payload);
      if (preset) {
        state.activeFilters = preset.filters;
      }
    },
    resetFilterState: (state) => {
      Object.assign(state, filterSlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      // Available Filters
      .addCase(fetchAvailableFilters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.availableFilters = { ...state.availableFilters, ...action.payload };
      })
      .addCase(fetchAvailableFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sectors
      .addCase(fetchSectors.fulfilled, (state, action) => {
        state.availableFilters.sectors = action.payload;
      })
      // Capabilities
      .addCase(fetchCapabilities.fulfilled, (state, action) => {
        state.availableFilters.capabilities = action.payload;
      });
  },
});

export const {
  setActiveFilters,
  setSectorFilter,
  setCapabilityFilter,
  setSizeFilter,
  setOwnershipFilter,
  setDistanceFilter,
  setLocationFilter,
  toggleVerifiedFilter,
  toggleExportReadyFilter,
  clearAllFilters,
  toggleFilterPanel,
  setFilterPanel,
  saveFilterPreset,
  deleteFilterPreset,
  applyFilterPreset,
  resetFilterState,
} = filterSlice.actions;

export default filterSlice.reducer;