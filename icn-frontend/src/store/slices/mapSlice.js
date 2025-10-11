import { createSlice } from '@reduxjs/toolkit';

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    // Map configuration
    center: { lat: -37.8136, lng: 144.9631 }, // Melbourne
    zoom: 10,
    bounds: null,
    mapType: 'roadmap', // 'roadmap', 'satellite', 'hybrid', 'terrain'
    
    // Markers
    markers: [],
    selectedMarker: null,
    hoveredMarker: null,
    
    // Clusters
    enableClustering: true,
    clusterRadius: 60,
    
    // Drawing
    drawingMode: null, // null, 'polygon', 'circle', 'rectangle'
    drawnShapes: [],
    
    // Filters
    visibleCategories: [],
    heatmapEnabled: false,
    
    // User location
    userLocation: null,
    trackUserLocation: false,
    
    // Search radius
    searchRadius: 50, // km
    searchCenter: null,
    
    // UI
    mapLoading: false,
    infoWindowOpen: false,
    legendVisible: true,
    
    // Route planning
    directions: null,
    waypoints: [],
  },
  reducers: {
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    setBounds: (state, action) => {
      state.bounds = action.payload;
    },
    setMapType: (state, action) => {
      state.mapType = action.payload;
    },
    setMarkers: (state, action) => {
      state.markers = action.payload;
    },
    addMarker: (state, action) => {
      state.markers.push(action.payload);
    },
    removeMarker: (state, action) => {
      state.markers = state.markers.filter(m => m.id !== action.payload);
    },
    selectMarker: (state, action) => {
      state.selectedMarker = action.payload;
      state.infoWindowOpen = true;
    },
    hoverMarker: (state, action) => {
      state.hoveredMarker = action.payload;
    },
    clearSelection: (state) => {
      state.selectedMarker = null;
      state.infoWindowOpen = false;
    },
    toggleClustering: (state) => {
      state.enableClustering = !state.enableClustering;
    },
    setDrawingMode: (state, action) => {
      state.drawingMode = action.payload;
    },
    addShape: (state, action) => {
      state.drawnShapes.push(action.payload);
    },
    removeShape: (state, action) => {
      state.drawnShapes = state.drawnShapes.filter(s => s.id !== action.payload);
    },
    clearShapes: (state) => {
      state.drawnShapes = [];
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    toggleLocationTracking: (state) => {
      state.trackUserLocation = !state.trackUserLocation;
    },
    setSearchRadius: (state, action) => {
      state.searchRadius = action.payload;
    },
    setSearchCenter: (state, action) => {
      state.searchCenter = action.payload;
    },
    toggleHeatmap: (state) => {
      state.heatmapEnabled = !state.heatmapEnabled;
    },
    toggleLegend: (state) => {
      state.legendVisible = !state.legendVisible;
    },
    setDirections: (state, action) => {
      state.directions = action.payload;
    },
    addWaypoint: (state, action) => {
      state.waypoints.push(action.payload);
    },
    clearRoute: (state) => {
      state.directions = null;
      state.waypoints = [];
    },
    resetMapState: (state) => {
      Object.assign(state, mapSlice.getInitialState());
    },
  },
});

export const {
  setCenter,
  setZoom,
  setBounds,
  setMapType,
  setMarkers,
  addMarker,
  removeMarker,
  selectMarker,
  hoverMarker,
  clearSelection,
  toggleClustering,
  setDrawingMode,
  addShape,
  removeShape,
  clearShapes,
  setUserLocation,
  toggleLocationTracking,
  setSearchRadius,
  setSearchCenter,
  toggleHeatmap,
  toggleLegend,
  setDirections,
  addWaypoint,
  clearRoute,
  resetMapState,
} = mapSlice.actions;

export default mapSlice.reducer;