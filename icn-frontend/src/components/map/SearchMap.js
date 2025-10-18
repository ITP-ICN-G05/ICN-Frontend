import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import './SearchMap.css';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const fallbackCenter = {
  lat: -37.8136,
  lng: 144.9631
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
};

// Helper functions
const toNumber = (v) => (typeof v === 'string' ? parseFloat(v) : v);
const hasValidCoords = (c) => Number.isFinite(toNumber(c.latitude)) && Number.isFinite(toNumber(c.longitude));

function SearchMap({ companies = [], selectedCompany, onCompanySelect }) {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(fallbackCenter);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const companiesWithCoordinates = useMemo(() => {
    if (!companies || companies.length === 0) {
      console.log('❌ No companies provided to map');
      return [];
    }
    
    const validCompanies = companies.filter(hasValidCoords);
    
    console.log(`🗺️ Map received: ${companies.length} companies`);
    console.log(`✅ Valid coordinates: ${validCompanies.length} companies`);
    
    if (validCompanies.length > 0) {
      console.log('📍 First company:', {
        name: validCompanies.name,
        lat: validCompanies.latitude,
        lng: validCompanies.longitude
      });
    }
    
    return validCompanies.map(company => ({
      ...company,
      position: {
        lat: toNumber(company.latitude),
        lng: toNumber(company.longitude)
      }
    }));
  }, [companies]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('👤 User location obtained:', pos);
          setUserLocation(pos);
          setMapCenter(pos);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          setLocationError(error.message);
          setMapCenter(fallbackCenter);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      setIsLoadingLocation(false);
    }
  }, []);

  const onLoad = useCallback((map) => {
    console.log('🗺️ Map loaded successfully');
    setMap(map);
    
    if (companiesWithCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // Add company positions to bounds
      companiesWithCoordinates.forEach(company => {
        bounds.extend(new window.google.maps.LatLng(
          company.position.lat,
          company.position.lng
        ));
      });
      
      // Only include user location if few companies
      if (userLocation && companiesWithCoordinates.length <= 5) {
        bounds.extend(new window.google.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        ));
      }
      
      map.fitBounds(bounds);
      
      // Adjust zoom after fitting
      const listener = window.google.maps.event.addListener(map, "idle", function() {
        const zoom = map.getZoom();
        console.log(`🔍 Current zoom level: ${zoom}`);
        
        if (zoom > 15) {
          console.log('⚠️ Zoom too close, adjusting to 15');
          map.setZoom(15);
        }
        if (zoom < 8) {
          console.log('⚠️ Zoom too far, adjusting to 8');
          map.setZoom(8);
        }
        
        window.google.maps.event.removeListener(listener);
      });
    } else if (userLocation) {
      console.log('📍 No companies, centering on user location');
      map.setCenter(userLocation);
      map.setZoom(12);
    }
  }, [companiesWithCoordinates, userLocation]);

  const onUnmount = useCallback(() => {
    console.log('🗺️ Map unmounted');
    setMap(null);
  }, []);

  const handleMarkerClick = (company) => {
    console.log('🖱️ Marker clicked:', company.name);
    setActiveMarker(company.id);
    if (onCompanySelect) {
      onCompanySelect(company);
    }
  };

  const handleRetryLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          setMapCenter(pos);
          setIsLoadingLocation(false);
          
          if (map) {
            map.panTo(pos);
            map.setZoom(12);
          }
        },
        (error) => {
          setLocationError(error.message);
          setIsLoadingLocation(false);
        }
      );
    }
  };

  if (!window.google?.maps) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Location Status Banner */}
      {(isLoadingLocation || locationError) && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: locationError ? '#f44336' : '#2196F3',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {isLoadingLocation && (
            <>
              <div className="spinner" style={{ 
                width: '16px', 
                height: '16px', 
                borderColor: 'white', 
                borderTopColor: 'transparent' 
              }}></div>
              <span>Getting your location...</span>
            </>
          )}
          {locationError && (
            <>
              <span>⚠️ Location unavailable: {locationError}</span>
              <button 
                onClick={handleRetryLocation}
                style={{
                  background: 'white',
                  color: '#f44336',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      )}

      {/* User Location Indicator */}
      {userLocation && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#4285F4',
            border: '2px solid white',
            boxShadow: '0 0 0 1px #4285F4'
          }}></div>
          <span style={{ color: '#666' }}>Your Location</span>
        </div>
      )}

      {/* Debug Counter - Bottom Left */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontSize: '12px',
        fontWeight: 'bold',
        color: companiesWithCoordinates.length > 0 ? '#34A853' : '#EA4335'
      }}>
        📍 {companiesWithCoordinates.length} markers on map
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* 
          CRITICAL FIX: Render markers FIRST with HIGH zIndex
          This ensures they appear on top of everything
        */}
        
        {/* Company Markers - HIGH PRIORITY (zIndex 500-1000) */}
        {companiesWithCoordinates.map((company, index) => {
          const isVerified = company.verified || company.verificationStatus === 'verified';
          
          // Log first 3 markers for debugging
          if (index < 3) {
            console.log(`✓ Rendering marker ${index + 1}:`, {
              name: company.name,
              lat: company.position.lat,
              lng: company.position.lng,
              verified: isVerified
            });
          }
          
          return (
            <Marker
              key={company.id}
              position={company.position}
              onClick={() => handleMarkerClick(company)}
              title={company.name}
              // ✅ FIX 1: HIGH zIndex to appear above circles
              zIndex={isVerified ? 1000 : 500}
              // ✅ FIX 2: Explicit marker icon with size
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: isVerified ? '#34A853' : '#EA4335',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
              // ✅ FIX 3: Disable optimization for consistent rendering
              optimized={false}
            >
              {activeMarker === company.id && (
                <InfoWindow
                  onCloseClick={() => setActiveMarker(null)}
                  position={company.position}
                >
                  <div style={{ maxWidth: '220px' }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '15px', 
                      fontWeight: 'bold',
                      color: '#202124'
                    }}>
                      {company.name}
                    </h3>
                    
                    {isVerified && (
                      <span style={{ 
                        background: '#34A853', 
                        padding: '3px 10px', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#fff',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        marginBottom: '10px'
                      }}>
                        ✓ Verified
                      </span>
                    )}
                    
                    <p style={{ 
                      margin: '8px 0', 
                      fontSize: '13px', 
                      color: '#5f6368',
                      lineHeight: '1.4'
                    }}>
                      {company.address}
                    </p>
                    
                    {company.distance && (
                      <p style={{ 
                        margin: '6px 0', 
                        fontSize: '12px', 
                        color: '#80868b',
                        fontWeight: '500'
                      }}>
                        📍 {typeof company.distance === 'number' ? company.distance.toFixed(1) : company.distance} km away
                      </p>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/company/${company.id}`);
                      }}
                      style={{
                        background: '#1a73e8',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        marginTop: '12px',
                        width: '100%',
                        fontWeight: '600',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#1557b0'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#1a73e8'}
                    >
                      View Details →
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}

        {/* User Location Circles - LOW PRIORITY (zIndex 1-2) */}
        {userLocation && (
          <>
            {/* Outer accuracy circle */}
            <Circle
              center={userLocation}
              radius={800}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.08,
                strokeColor: '#4285F4',
                strokeOpacity: 0.3,
                strokeWeight: 1,
                zIndex: 1,  // ✅ FIX 4: LOW zIndex - renders behind markers
                clickable: false  // ✅ FIX 5: Don't intercept clicks
              }}
            />
            {/* Inner location dot */}
            <Circle
              center={userLocation}
              radius={30}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeOpacity: 1,
                strokeWeight: 3,
                zIndex: 2,  // ✅ FIX 4: Still low, just above outer circle
                clickable: false
              }}
            />
          </>
        )}
      </GoogleMap>
    </div>
  );
}

export default SearchMap;
