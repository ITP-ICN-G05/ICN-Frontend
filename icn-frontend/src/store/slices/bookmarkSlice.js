import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookmarkService } from '../../services/api';

export const fetchBookmarks = createAsyncThunk(
  'bookmark/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await bookmarkService.getBookmarks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addBookmark = createAsyncThunk(
  'bookmark/add',
  async ({ companyId, folderId }, { rejectWithValue }) => {
    try {
      const response = await bookmarkService.addBookmark(companyId, folderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeBookmark = createAsyncThunk(
  'bookmark/remove',
  async (id, { rejectWithValue }) => {
    try {
      await bookmarkService.removeBookmark(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchFolders = createAsyncThunk(
  'bookmark/fetchFolders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookmarkService.getFolders();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createFolder = createAsyncThunk(
  'bookmark/createFolder',
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const response = await bookmarkService.createFolder(name, description);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState: {
    bookmarks: [],
    folders: [],
    bookmarkedCompanyIds: [],
    currentFolder: null,
    totalCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    },
    toggleBookmark: (state, action) => {
      const companyId = action.payload;
      const index = state.bookmarkedCompanyIds.indexOf(companyId);
      if (index > -1) {
        state.bookmarkedCompanyIds.splice(index, 1);
      } else {
        state.bookmarkedCompanyIds.push(companyId);
      }
    },
    resetBookmarkState: (state) => {
      Object.assign(state, bookmarkSlice.getInitialState());
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = action.payload.bookmarks;
        state.bookmarkedCompanyIds = action.payload.bookmarks.map(b => b.companyId);
        state.totalCount = action.payload.total;
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Bookmark
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.bookmarks.push(action.payload);
        state.bookmarkedCompanyIds.push(action.payload.companyId);
      })
      // Remove Bookmark
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.bookmarks = state.bookmarks.filter(b => b.id !== action.payload);
        const bookmark = state.bookmarks.find(b => b.id === action.payload);
        if (bookmark) {
          const index = state.bookmarkedCompanyIds.indexOf(bookmark.companyId);
          if (index > -1) {
            state.bookmarkedCompanyIds.splice(index, 1);
          }
        }
      })
      // Folders
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
      });
  },
});

export const {
  setCurrentFolder,
  toggleBookmark,
  resetBookmarkState,
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;