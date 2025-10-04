import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Company, CompanyState, SearchFilters } from '../../types';

const initialState: CompanyState = {
  companies: [],
  selectedCompany: null,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params: { page?: number; pageSize?: number; filters?: SearchFilters }) => {
    const response = await api.get('/companies', { params });
    return response.data;
  }
);

export const fetchCompanyById = createAsyncThunk(
  'companies/fetchCompanyById',
  async (id: string) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  }
);

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.selectedCompany = action.payload.data;
      });
  },
});

export const { setSearchQuery, setFilters, setSelectedCompany, clearError } = companySlice.actions;
export default companySlice.reducer;
