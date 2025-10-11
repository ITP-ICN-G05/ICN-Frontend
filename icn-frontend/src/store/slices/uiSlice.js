import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Theme
    theme: 'light',
    
    // Modals
    modals: {
      login: false,
      signup: false,
      forgotPassword: false,
      contact: false,
      export: false,
      share: false,
      upgrade: false,
      payment: false,
      filterPresets: false,
    },
    
    // Sidebars & Panels
    sidebarOpen: true,
    filterPanelOpen: false,
    searchPanelOpen: false,
    notificationPanelOpen: false,
    
    // View preferences
    viewMode: 'list', // 'list', 'grid', 'map'
    resultsPerPage: 20,
    sortBy: 'relevance',
    sortOrder: 'desc',
    
    // Map settings
    mapZoom: 10,
    mapCenter: { lat: -37.8136, lng: 144.9631 }, // Melbourne
    mapType: 'roadmap',
    
    // Loading states
    globalLoading: false,
    pageLoading: false,
    
    // Toast notifications
    toasts: [],
    
    // Feature tours
    tourActive: false,
    tourStep: 0,
    toursCompleted: [],
    
    // Responsive
    isMobile: false,
    isTablet: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    
    // User preferences
    preferences: {
      compactView: false,
      showTutorials: true,
      autoplayVideos: false,
      showNotifications: true,
      animationsEnabled: true,
    },
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleFilterPanel: (state) => {
      state.filterPanelOpen = !state.filterPanelOpen;
    },
    toggleSearchPanel: (state) => {
      state.searchPanelOpen = !state.searchPanelOpen;
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setResultsPerPage: (state, action) => {
      state.resultsPerPage = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setMapZoom: (state, action) => {
      state.mapZoom = action.payload;
    },
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    setMapType: (state, action) => {
      state.mapType = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    addToast: (state, action) => {
      const toast = {
        id: Date.now(),
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    startTour: (state) => {
      state.tourActive = true;
      state.tourStep = 0;
    },
    nextTourStep: (state) => {
      state.tourStep += 1;
    },
    endTour: (state) => {
      state.tourActive = false;
      state.tourStep = 0;
    },
    completeTour: (state, action) => {
      state.toursCompleted.push(action.payload);
      state.tourActive = false;
      state.tourStep = 0;
    },
    setScreenSize: (state, action) => {
      state.screenWidth = action.payload.width;
      state.screenHeight = action.payload.height;
      state.isMobile = action.payload.width < 768;
      state.isTablet = action.payload.width >= 768 && action.payload.width < 1024;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetUIState: (state) => {
      Object.assign(state, uiSlice.getInitialState());
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebar,
  toggleFilterPanel,
  toggleSearchPanel,
  toggleNotificationPanel,
  setViewMode,
  setResultsPerPage,
  setSortBy,
  setSortOrder,
  setMapZoom,
  setMapCenter,
  setMapType,
  setGlobalLoading,
  setPageLoading,
  addToast,
  removeToast,
  clearToasts,
  startTour,
  nextTourStep,
  endTour,
  completeTour,
  setScreenSize,
  updatePreferences,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;