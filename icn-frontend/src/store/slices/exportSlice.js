import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exportService } from '../../services/api';

export const exportCompany = createAsyncThunk(
  'export/company',
  async ({ id, format, tier }, { rejectWithValue }) => {
    try {
      const response = await exportService.exportCompany(id, format, tier);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const exportSearchResults = createAsyncThunk(
  'export/searchResults',
  async ({ searchParams, format, tier }, { rejectWithValue }) => {
    try {
      const response = await exportService.exportSearchResults(searchParams, format, tier);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const exportSlice = createSlice({
  name: 'export',
  initialState: {
    // Export configuration
    selectedFormat: 'pdf',
    selectedFields: [],
    availableFields: [],
    templates: [],
    
    // Export history
    exportHistory: [],
    
    // Current export
    currentExport: null,
    exportProgress: 0,
    
    // UI state
    exportModalOpen: false,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedFormat: (state, action) => {
      state.selectedFormat = action.payload;
    },
    setSelectedFields: (state, action) => {
      state.selectedFields = action.payload;
    },
    toggleField: (state, action) => {
      const field = action.payload;
      const index = state.selectedFields.indexOf(field);
      if (index > -1) {
        state.selectedFields.splice(index, 1);
      } else {
        state.selectedFields.push(field);
      }
    },
    setAvailableFields: (state, action) => {
      state.availableFields = action.payload;
    },
    setExportProgress: (state, action) => {
      state.exportProgress = action.payload;
    },
    openExportModal: (state) => {
      state.exportModalOpen = true;
    },
    closeExportModal: (state) => {
      state.exportModalOpen = false;
    },
    addToHistory: (state, action) => {
      state.exportHistory.unshift(action.payload);
      if (state.exportHistory.length > 50) {
        state.exportHistory.pop();
      }
    },
    resetExportState: (state) => {
      Object.assign(state, exportSlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(exportCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExport = action.payload;
        state.exportHistory.unshift({
          id: Date.now(),
          type: 'company',
          format: state.selectedFormat,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(exportCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(exportSearchResults.fulfilled, (state) => {
        state.exportHistory.unshift({
          id: Date.now(),
          type: 'search',
          format: state.selectedFormat,
          timestamp: new Date().toISOString(),
        });
      });
  },
});

export const {
  setSelectedFormat,
  setSelectedFields,
  toggleField,
  setAvailableFields,
  setExportProgress,
  openExportModal,
  closeExportModal,
  addToHistory,
  resetExportState,
} = exportSlice.actions;

export default exportSlice.reducer;