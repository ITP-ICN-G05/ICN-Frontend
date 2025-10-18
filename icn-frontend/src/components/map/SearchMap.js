import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, Circle, MarkerF } from '@react-google-maps/api';
import './SearchMap.css';

// Map configuration
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
  // Add mapId for Advanced Markers (you'll need to create this in Google Cloud Console)
  mapId: process.env.REACT_APP_GOOGLE_MAP_ID || 'YOUR_MAP_ID',
};

function SearchMap({ companies = [], selectedCompany, onCompanySelect }) {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(fallbackCenter);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [userZoomLevel] = useState(13);

  // Create marker icons only when Google Maps is loaded
  const markerIcons = useMemo(() => {
    if (!window.google?.maps) {
      return null;
    }

    const createMarkerIcon = (color) => ({
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 24)
    });

    return {
      verified: createMarkerIcon('#34A853'),
      unverified: createMarkerIcon('#EA4335')
    };
  }, []);

  const toNumber = (v) => (typeof v === 'string' ? parseFloat(v) : v);
  const hasValidCoords = (c) => Number.isFinite(toNumber(c.latitude)) && Number.isFinite(toNumber(c.longitude));

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const companiesWithCoordinates = useMemo(() => {
    if (!companies || companies.length === 0) {
      console.log('❌ No companies provided to map');
      return [];
    }
    
    const validCompanies = companies.filter(hasValidCoords);
    
    console.log(`🗺️ Map received: ${companies.length} companies`);
    console.log(`✅ Valid coordinates: ${validCompanies.length} companies`);
    
    const companiesWithPos = validCompanies.map(company => ({
      ...company,
      position: {
        lat: toNumber(company.latitude),
        lng: toNumber(company.longitude)
      }
    }));

    // If we have user location, sort by distance
    if (userLocation) {
      companiesWithPos.forEach(company => {
        company.distanceFromUser = calculateDistance(
          userLocation.lat, 
          userLocation.lng,
          company.position.lat,
          company.position.lng
        );
      });
      companiesWithPos.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
    }

    return companiesWithPos;
  }, [companies, userLocation]);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('📍 User location obtained:', pos);
          setUserLocation(pos);
          setMapCenter(pos);
          setIsLoadingLocation(false);
          
          // If map is already loaded, center it on user location
          if (map) {
            map.panTo(pos);
            map.setZoom(userZoomLevel);
          }
        },
        (error) => {
          console.error('Location error:', error);
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
  }, [map, userZoomLevel]);

  const onLoad = useCallback((map) => {
    setMap(map);
    console.log('🗺️ Map loaded');
    
    // Priority 1: If we have user location, center on it
    if (userLocation) {
      console.log('📍 Centering map on user location');
      map.setCenter(userLocation);
      map.setZoom(userZoomLevel);
      
      // Optional: Show nearby companies within bounds
      if (companiesWithCoordinates.length > 0) {
        // Find companies within ~10km radius
        const nearbyCompanies = companiesWithCoordinates.filter(
          c => c.distanceFromUser && c.distanceFromUser <= 10
        );
        
        if (nearbyCompanies.length > 0) {
          console.log(`Found ${nearbyCompanies.length} companies within 10km`);
          
          // Adjust zoom to show nearby companies
          setTimeout(() => {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
            
            nearbyCompanies.slice(0, 10).forEach(company => {
              bounds.extend(new window.google.maps.LatLng(
                company.position.lat,
                company.position.lng
              ));
            });
            
            map.fitBounds(bounds);
            
            // Ensure we don't zoom out too much
            const listener = window.google.maps.event.addListener(map, "idle", function() {
              if (map.getZoom() < 11) map.setZoom(11);
              if (map.getZoom() > 15) map.setZoom(14);
              window.google.maps.event.removeListener(listener);
            });
          }, 500);
        }
      }
    } 
    // Priority 2: If no user location but have companies, fit to companies
    else if (companiesWithCoordinates.length > 0) {
      console.log('📍 No user location, fitting to companies');
      const bounds = new window.google.maps.LatLngBounds();
      
      companiesWithCoordinates.slice(0, 20).forEach(company => {
        bounds.extend(new window.google.maps.LatLng(
          company.position.lat,
          company.position.lng
        ));
      });
      
      map.fitBounds(bounds);
      
      const listener = window.google.maps.event.addListener(map, "idle", function() {
        if (map.getZoom() > 15) map.setZoom(13);
        window.google.maps.event.removeListener(listener);
      });
    }
    // Priority 3: Use fallback center
    else {
      console.log('📍 Using fallback center');
      map.setCenter(mapCenter);
      map.setZoom(11);
    }
  }, [companiesWithCoordinates, userLocation, mapCenter, userZoomLevel]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (company) => {
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
            map.setZoom(userZoomLevel);
          }
        },
        (error) => {
          setLocationError(error.message);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(userZoomLevel);
    }
  };

  const handleShowAllCompanies = () => {
    if (map && companiesWithCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      companiesWithCoordinates.forEach(company => {
        bounds.extend(new window.google.maps.LatLng(
          company.position.lat,
          company.position.lng
        ));
      });
      
      map.fitBounds(bounds);
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

  // Function to get the appropriate marker icon
  const getMarkerIcon = (isVerified) => {
    if (!markerIcons) return undefined; // Return undefined if icons aren't ready
    
    if (isVerified) return markerIcons.verified;
    return markerIcons.unverified;
  };

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
              <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'white', borderTopColor: 'transparent' }}></div>
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

      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '60px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {userLocation && (
          <button
            onClick={handleCenterOnUser}
            style={{
              background: 'white',
              border: '2px solid #4285F4',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#4285F4',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Center on my location"
          >
            <span style={{ fontSize: '16px' }}>📍</span>
            My Location
          </button>
        )}
        
        {companiesWithCoordinates.length > 0 && (
          <button
            onClick={handleShowAllCompanies}
            style={{
              background: 'white',
              border: '1px solid #666',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#666',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
            title="Show all companies"
          >
            Show All ({companiesWithCoordinates.length})
          </button>
        )}
      </div>



      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={userZoomLevel}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {console.log(`🎨 Rendering ${companiesWithCoordinates.length} company markers`)}
        
        {/* User Location - Blue dot with circle */}
        {userLocation && (
          <>
            {/* 1km radius circle */}
            <Circle
              center={userLocation}
              radius={1000}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.15,
                strokeColor: '#4285F4',
                strokeOpacity: 0.6,
                strokeWeight: 2,
              }}
            />
            {/* Center dot */}
            <Circle
              center={userLocation}
              radius={50}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeOpacity: 1,
                strokeWeight: 3,
                zIndex: 999
              }}
            />
          </>
        )}

        {/* Company Markers using MarkerF (functional component, no deprecation) */}
        {companiesWithCoordinates.map((company) => {
          const isVerified = company.verified || company.verificationStatus === 'verified';
          
          return (
            <MarkerF
              key={company.id}
              position={company.position}
              onClick={() => handleMarkerClick(company)}
              title={company.name}
              icon={getMarkerIcon(isVerified)}
              zIndex={isVerified ? 200 : 100}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}

export default SearchMap;