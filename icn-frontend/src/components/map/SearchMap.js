import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, Circle, MarkerF } from '@react-google-maps/api';
import './SearchMap.css';

// Map configuration
const containerStyle = { width: '100%', height: '600px' };
const fallbackCenter = { lat: -37.8136, lng: 144.9631 };
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  mapId: process.env.REACT_APP_GOOGLE_MAP_ID || 'YOUR_MAP_ID',
};

// Get google.maps from window (real app) or node global (tests)
const getGMaps = () => {
  if (typeof window !== 'undefined' && window.google?.maps) return window.google.maps;
  let root;
  try {
    // eslint-disable-next-line no-new-func
    root = Function('return this')();
  } catch {
    root = undefined;
  }
  return root?.google?.maps ?? null;
};

// Utility: centroid of lat/lng points
const centroid = (pts) => {
  if (!pts?.length) return null;
  const sum = pts.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
  return { lat: sum.lat / pts.length, lng: sum.lng / pts.length };
};

// Utility: safely fit bounds if LatLngBounds + extend are available;
// returns true if we fit bounds, false if we fell back.
const makeSafeFitBounds = (gmaps) => (map, points) => {
  try {
    if (!gmaps?.LatLngBounds || typeof gmaps.LatLng !== 'function') return false;
    const bounds = new gmaps.LatLngBounds();
    if (typeof bounds?.extend !== 'function') return false;
    points.forEach((p) => bounds.extend(new gmaps.LatLng(p.lat, p.lng)));
    map.fitBounds?.(bounds);
    return true;
  } catch {
    return false;
  }
};

function SearchMap({ companies = [], selectedCompany, onCompanySelect }) {
  const gmaps = getGMaps();
  const safeFitBounds = useMemo(() => makeSafeFitBounds(gmaps), [gmaps]);

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(fallbackCenter);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [userZoomLevel] = useState(13);

  // Marker icons
  const markerIcons = useMemo(() => {
    if (!gmaps || typeof gmaps.Point !== 'function') return null;
    const createMarkerIcon = (color) => ({
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.5,
      anchor: new gmaps.Point(12, 24),
    });
    return {
      verified: createMarkerIcon('#34A853'),
      unverified: createMarkerIcon('#EA4335'),
    };
  }, [gmaps]);

  const toNumber = (v) => (typeof v === 'string' && v.trim() !== '' ? parseFloat(v) : v);
  const hasValidCoords = (c) =>
    c && Number.isFinite(toNumber(c.latitude)) && Number.isFinite(toNumber(c.longitude));

  // Haversine (km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const companiesWithCoordinates = useMemo(() => {
    if (!companies?.length) {
      // eslint-disable-next-line no-console
      console.log('❌ No companies provided to map');
      return [];
    }

    const validCompanies = companies.filter(hasValidCoords);
    // eslint-disable-next-line no-console
    console.log(`🗺️ Map received: ${companies.length} companies`);
    // eslint-disable-next-line no-console
    console.log(`✅ Valid coordinates: ${validCompanies.length} companies`);

    const list = validCompanies.map((company) => ({
      ...company,
      position: { lat: toNumber(company.latitude), lng: toNumber(company.longitude) },
    }));

    if (userLocation) {
      list.forEach((c) => {
        c.distanceFromUser = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          c.position.lat,
          c.position.lng
        );
      });
      list.sort((a, b) => (a.distanceFromUser || 0) - (b.distanceFromUser || 0));
    }

    return list;
  }, [companies, userLocation]);

  // Get user location on mount
  useEffect(() => {
    if (!navigator?.geolocation) {
      setLocationError('Geolocation not supported');
      setIsLoadingLocation(false);
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        // eslint-disable-next-line no-console
        console.log('📍 User location obtained:', pos);
        setUserLocation(pos);
        setMapCenter(pos);
        setIsLoadingLocation(false);

        if (map) {
          map.panTo?.(pos);
          map.setZoom?.(userZoomLevel);
        }
      },
      (error) => {
        if (process.env.NODE_ENV !== 'test') {
          // eslint-disable-next-line no-console
          console.error('Location error:', error);
        }
        setLocationError(error?.message || 'Unknown error');
        setMapCenter(fallbackCenter);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [map, userZoomLevel]);

  // Center on selectedCompany when provided
  useEffect(() => {
    if (!selectedCompany || !map || !hasValidCoords(selectedCompany)) return;
    const pos = {
      lat: toNumber(selectedCompany.latitude),
      lng: toNumber(selectedCompany.longitude),
    };
    map.panTo?.(pos);
    map.setZoom?.(15);
  }, [selectedCompany, map]);

  const onLoad = useCallback(
    (m) => {
      setMap(m);
      // eslint-disable-next-line no-console
      console.log('🗺️ Map loaded');

      if (userLocation) {
        m.setCenter?.(userLocation);
        m.setZoom?.(userZoomLevel);

        if (companiesWithCoordinates.length > 0) {
          const nearby = companiesWithCoordinates.filter(
            (c) => c.distanceFromUser != null && c.distanceFromUser <= 10
          );
          if (nearby.length) {
            setTimeout(() => {
              // Prefer bounds; fall back to centroid
              const points = [
                userLocation,
                ...nearby.slice(0, 10).map((c) => c.position),
              ];
              const ok = safeFitBounds(m, points);
              if (!ok) {
                const center = centroid(points);
                if (center) {
                  m.setCenter?.(center);
                  const z = m.getZoom?.();
                  if (!z || z < 11 || z > 15) m.setZoom?.(13);
                }
              }

              if (gmaps?.event) {
                const listener = gmaps.event.addListener(m, 'idle', function () {
                  if (m.getZoom?.() < 11) m.setZoom?.(11);
                  if (m.getZoom?.() > 15) m.setZoom?.(14);
                  gmaps.event.removeListener(listener);
                });
              }
            }, 0);
          }
        }
      } else if (companiesWithCoordinates.length > 0) {
        // No user loc; fit to all companies (safe)
        const points = companiesWithCoordinates.slice(0, 20).map((c) => c.position);
        const ok = safeFitBounds(m, points);
        if (!ok) {
          const center = centroid(points);
          if (center) {
            m.setCenter?.(center);
            if (m.getZoom?.() > 15) m.setZoom?.(13);
          }
        }
      } else {
        // Fallback center
        m.setCenter?.(mapCenter);
        m.setZoom?.(11);
      }
    },
    [companiesWithCoordinates, userLocation, mapCenter, userZoomLevel, gmaps, safeFitBounds]
  );

  const onUnmount = useCallback(() => setMap(null), []);

  const handleMarkerClick = (company) => onCompanySelect?.(company);

  const handleRetryLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    if (!navigator?.geolocation) {
      setLocationError('Geolocation not supported');
      setIsLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(pos);
        setMapCenter(pos);
        setIsLoadingLocation(false);
        if (map) {
          map.panTo?.(pos);
          map.setZoom?.(userZoomLevel);
        }
      },
      (error) => {
        setLocationError(error?.message || 'Unknown error');
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCenterOnUser = () => {
    if (userLocation && map) {
      map.panTo?.(userLocation);
      map.setZoom?.(userZoomLevel);
    }
  };

  const handleShowAllCompanies = () => {
    if (!map || companiesWithCoordinates.length === 0) return;
    const points = companiesWithCoordinates.map((c) => c.position);
    const ok = safeFitBounds(map, points);
    if (!ok) {
      const center = centroid(points);
      if (center) {
        map.setCenter?.(center);
      }
    }
  };

  // If Google Maps isn't loaded, render a placeholder container + message
  if (!gmaps) {
    return (
      <div
        style={{
          width: '100%',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  const getMarkerIcon = (isVerified) => {
    if (!markerIcons) return undefined;
    return isVerified ? markerIcons.verified : markerIcons.unverified;
  };

  const canRenderCircle = !!gmaps.Circle; // guards for tests
  const canRenderMarker = !!gmaps.Marker; // guards for tests

  return (
    <div style={{ position: 'relative' }}>
      {(isLoadingLocation || locationError) && (
        <div
          style={{
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
            gap: '10px',
          }}
        >
          {isLoadingLocation && (
            <>
              <div
                className="spinner"
                style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }}
              />
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
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {userLocation && (
          <button
            onClick={handleCenterOnUser}
            style={{
              background: 'white',
              border: '2px solid #4285F4',
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
              color: '#4285F4',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Center on my location"
          >
            <span style={{ fontSize: 16 }}>📍</span>
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
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
              color: '#666',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
            title="Show all companies"
          >
            Show All ({companiesWithCoordinates.length})
          </button>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        defaultCenter={mapCenter}
        defaultZoom={userZoomLevel}
        onLoad={onLoad}
        onUnmount={() => setMap(null)}
        options={mapOptions}
      >
        {console.log(`🎨 Rendering ${companiesWithCoordinates.length} company markers`)}

        {userLocation && canRenderCircle && (
          <>
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
            <Circle
              center={userLocation}
              radius={50}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeOpacity: 1,
                strokeWeight: 3,
                zIndex: 999,
              }}
            />
          </>
        )}

        {canRenderMarker &&
          companiesWithCoordinates.map((company) => {
            const isVerified = company.verified || company.verificationStatus === 'verified';
            return (
              <MarkerF
                key={company.id}
                position={company.position}
                onClick={() => onCompanySelect?.(company)}
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
