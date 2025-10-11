import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyService } from '../../services/api';

export const fetchCompanies = createAsyncThunk(
  'company/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await companyService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCompanyById = createAsyncThunk(
  'company/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await companyService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCompanyCapabilities = createAsyncThunk(
  'company/fetchCapabilities',
  async (id, { rejectWithValue }) => {
    try {
      const response = await companyService.getCapabilities(id);
      return { id, capabilities: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCompanyCertifications = createAsyncThunk(
  'company/fetchCertifications',
  async (id, { rejectWithValue }) => {
    try {
      const response = await companyService.getCertifications(id);
      return { id, certifications: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCompanyProducts = createAsyncThunk(
  'company/fetchProducts',
  async (id, { rejectWithValue }) => {
    try {
      const response = await companyService.getProducts(id);
      return { id, products: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchSimilarCompanies = createAsyncThunk(
  'company/fetchSimilar',
  async ({ id, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await companyService.getSimilarCompanies(id, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const contactCompany = createAsyncThunk(
  'company/contact',
  async ({ id, message }, { rejectWithValue }) => {
    try {
      const response = await companyService.contactCompany(id, message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState: {
    companies: [],
    currentCompany: null,
    similarCompanies: [],
    totalCount: 0,
    page: 1,
    limit: 20,
    loading: false,
    detailLoading: false,
    error: null,
    filters: {
      sectors: [],
      capabilities: [],
      size: null,
      ownership: [],
      verified: false,
      distance: 50,
    },
    cache: {},
    lastFetch: null,
  },
  reducers: {
    setCompanies: (state, action) => {
      state.companies = action.payload;
    },
    setCurrentCompany: (state, action) => {
      state.currentCompany = action.payload;
    },
    updateCompanyFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCompanyFilters: (state) => {
      state.filters = {
        sectors: [],
        capabilities: [],
        size: null,
        ownership: [],
        verified: false,
        distance: 50,
      };
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    addToCache: (state, action) => {
      const { id, data } = action.payload;
      state.cache[id] = {
        data,
        timestamp: Date.now(),
      };
    },
    clearCache: (state) => {
      state.cache = {};
    },
    resetCompanyState: (state) => {
      Object.assign(state, companySlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.data;
        state.totalCount = action.payload.total;
        state.page = action.payload.page;
        state.lastFetch = Date.now();
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Company By ID
      .addCase(fetchCompanyById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentCompany = action.payload;
        state.cache[action.payload.id] = {
          data: action.payload,
          timestamp: Date.now(),
        };
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // Fetch Capabilities
      .addCase(fetchCompanyCapabilities.fulfilled, (state, action) => {
        if (state.currentCompany && state.currentCompany.id === action.payload.id) {
          state.currentCompany.capabilities = action.payload.capabilities;
        }
      })
      // Fetch Certifications
      .addCase(fetchCompanyCertifications.fulfilled, (state, action) => {
        if (state.currentCompany && state.currentCompany.id === action.payload.id) {
          state.currentCompany.certifications = action.payload.certifications;
        }
      })
      // Fetch Products
      .addCase(fetchCompanyProducts.fulfilled, (state, action) => {
        if (state.currentCompany && state.currentCompany.id === action.payload.id) {
          state.currentCompany.products = action.payload.products;
        }
      })
      // Fetch Similar Companies
      .addCase(fetchSimilarCompanies.fulfilled, (state, action) => {
        state.similarCompanies = action.payload;
      })
      // Contact Company
      .addCase(contactCompany.fulfilled, (state) => {
        // Could show success notification
      });
  },
});

export const {
  setCompanies,
  setCurrentCompany,
  updateCompanyFilters,
  clearCompanyFilters,
  setPage,
  setLimit,
  addToCache,
  clearCache,
  resetCompanyState,
} = companySlice.actions;

export default companySlice.reducer;