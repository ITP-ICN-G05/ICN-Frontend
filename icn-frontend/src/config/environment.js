export const config = {
    // Data source configuration
    USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK === 'true' || 
                   process.env.NODE_ENV === 'development',
    
    // API configuration
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
    
    // Google Maps configuration
    GOOGLE_MAPS_KEY: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    
    // App configuration
    APP_NAME: process.env.REACT_APP_NAME || 'ICN Navigator',
    APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    
    // Feature flags
    ENABLE_ONBOARDING: process.env.REACT_APP_ENABLE_ONBOARDING !== 'false',
    ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    ENABLE_CHAT: process.env.REACT_APP_ENABLE_CHAT === 'true',
    
    // Cache configuration
    CLEAR_CACHE_ON_LOGOUT: process.env.REACT_APP_CLEAR_CACHE_ON_LOGOUT === 'true',
    CACHE_DURATION: parseInt(process.env.REACT_APP_CACHE_DURATION || '3600000'), // 1 hour default
    
    // Development options
    SHOW_DEV_TOOLS: process.env.REACT_APP_SHOW_DEV_TOOLS === 'true' || 
                    process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
    
    // ICN Data configuration
    ICN_DATA_PATH: process.env.REACT_APP_ICN_DATA_PATH || '/assets/ICN_Navigator.Company.json',
    ICN_DATA_SAMPLING: process.env.REACT_APP_ICN_DATA_SAMPLING === 'true',
    ICN_DATA_SAMPLE_SIZE: parseInt(process.env.REACT_APP_ICN_DATA_SAMPLE_SIZE || '300'),
  };