import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchService } from '../../services/api';

export const performSearch = createAsyncThunk(
  'search/perform',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const response = await searchService.search(query, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const performAdvancedSearch = createAsyncThunk(
  'search/advanced',
  async (criteria, { rejectWithValue }) => {
    try {
      const response = await searchService.advancedSearch(criteria);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  'search/suggestions',
  async (query, { rejectWithValue }) => {
    try {
      const response = await searchService.getSuggestions(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const saveSearch = createAsyncThunk(
  'search/save',
  async (searchData, { rejectWithValue }) => {
    try {
      const response = await searchService.saveSearch(searchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchSavedSearches = createAsyncThunk(
  'search/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.getSavedSearches();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteSavedSearch = createAsyncThunk(
  'search/deleteSaved',
  async (id, { rejectWithValue }) => {
    try {
      await searchService.deleteSavedSearch(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchSearchHistory = createAsyncThunk(
  'search/fetchHistory',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await searchService.getSearchHistory(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    suggestions: [],
    savedSearches: [],
    searchHistory: [],
    totalResults: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: null,
    lastSearch: null,
    searchMode: 'basic', // 'basic' or 'advanced'
    advancedCriteria: {},
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setSearchMode: (state, action) => {
      state.searchMode = action.payload;
    },
    setAdvancedCriteria: (state, action) => {
      state.advancedCriteria = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.totalResults = 0;
      state.page = 1;
    },
    setSearchPage: (state, action) => {
      state.page = action.payload;
    },
    addToHistory: (state, action) => {
      const exists = state.searchHistory.find(item => item.query === action.payload.query);
      if (!exists) {
        state.searchHistory.unshift(action.payload);
        if (state.searchHistory.length > 20) {
          state.searchHistory.pop();
        }
      }
    },
    clearHistory: (state) => {
      state.searchHistory = [];
    },
    resetSearchState: (state) => {
      Object.assign(state, searchSlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      // Perform Search
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.totalResults = action.payload.total;
        state.page = action.payload.page;
        state.lastSearch = Date.now();
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.results = [];
      })
      // Advanced Search
      .addCase(performAdvancedSearch.fulfilled, (state, action) => {
        state.results = action.payload.data;
        state.totalResults = action.payload.total;
      })
      // Suggestions
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      // Saved Searches
      .addCase(fetchSavedSearches.fulfilled, (state, action) => {
        state.savedSearches = action.payload;
      })
      .addCase(saveSearch.fulfilled, (state, action) => {
        state.savedSearches.unshift(action.payload);
      })
      .addCase(deleteSavedSearch.fulfilled, (state, action) => {
        state.savedSearches = state.savedSearches.filter(s => s.id !== action.payload);
      })
      // History
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.searchHistory = action.payload;
      });
  },
});

export const {
  setQuery,
  setSearchMode,
  setAdvancedCriteria,
  clearSearch,
  setSearchPage,
  addToHistory,
  clearHistory,
  resetSearchState,
} = searchSlice.actions;

export default searchSlice.reducer;