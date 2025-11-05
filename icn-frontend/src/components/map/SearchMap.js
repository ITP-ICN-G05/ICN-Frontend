import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, Circle, MarkerF, OverlayView } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import './SearchMap.css';

// Map configuration
const fallbackCenter = { lat: -37.8136, lng: 144.9631 };
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
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

// Utility: safely fit bounds if LatLngBounds + extend are available
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

// Custom InfoWindow component - Fully implemented using OverlayView
const CustomInfoWindow = ({ position, company, onClose }) => {
  const navigate = useNavigate();
  
  const getCompanyTypeColor = (type) => {
    const colors = {
      'Manufacturing': '#3B82F6',
      'Technology': '#8B5CF6',
      'Healthcare': '#10B981',
      'Finance': '#F59E0B',
      'Education': '#EF4444',
      'Retail': '#EC4899',
      'Construction': '#6B7280',
      'Other': '#9CA3AF'
    };
    return colors[type] || '#9CA3AF';
  };

  const getLocationDisplay = (company) => {
    if (company.address) return company.address;
    if (company.suburb && company.state) return `${company.suburb}, ${company.state}`;
    if (company.suburb) return company.suburb;
    if (company.state) return company.state;
    return 'Location not specified';
  };

  const handleCardClick = () => {
    navigate(`/company/${company.id}`);
  };

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="custom-info-window">
        {/* Close button */}
        <button 
          className="custom-close-button" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Card content */}
        <div className="company-info-card">
          <div className="card-header-section">
            <div className="company-avatar-circle">
              <span className="avatar-letter">{(company.name || '?').charAt(0).toUpperCase()}</span>
            </div>
            <div className="company-info-section">
              <h3 className="company-name-text">{company.name}</h3>
              <p className="company-location">{getLocationDisplay(company)}</p>
            </div>
          </div>

          <div className="badges-section">
            {company.verified && (
              <div className="verified-badge-new">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Verified</span>
              </div>
            )}
            {company.type && (
              <div className="type-badge">
                {company.type}
              </div>
            )}
            {(company.employees || company.employeeCount) && (
              <div className="employees-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>{company.employees || company.employeeCount}</span>
              </div>
            )}

            {company.distanceFromUser !== undefined && (
              <div className="distance-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{company.distanceFromUser.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {(() => {
            const caps = company.icnCapabilities || company.capabilities;
            if (!caps || caps.length === 0) return null;
            return (
              <div className="capabilities-section">
                {caps.slice(0, 2).map((cap, index) => (
                  <span key={index} className="capability-chip">
                    {typeof cap === 'object' ? (cap.itemName || cap.name || cap) : cap}
                  </span>
                ))}
                {caps.length > 2 && (
                  <span className="capability-chip more">
                    +{caps.length - 2} more
                  </span>
                )}
              </div>
            );
          })()}

          {(() => {
            const sectors = company.sectors || company.industry;
            if (!sectors || sectors.length === 0) return null;
            return (
              <div className="sectors-section">
                {sectors.slice(0, 2).map((sector, index) => (
                  <span key={index} className="sector-chip">
                    {typeof sector === 'object' ? (sector.itemName || sector.name || sector) : sector}
                  </span>
                ))}
                {sectors.length > 2 && (
                  <span className="sector-chip more">
                    +{sectors.length - 2} more
                  </span>
                )}
              </div>
            );
          })()}

          <div className="company-footer">
            <button className="view-details-btn" onClick={handleCardClick}>
              View Details
            </button>
          </div>
        </div>

        {/* Pointer tail created with CSS */}
        <div className="custom-tail"></div>
      </div>
    </OverlayView>
  );
};

function SearchMap({ companies = [], selectedCompany, onCompanySelect, height = 'calc(100vh - 70px)', center, zoom }) {
  const gmaps = getGMaps();
  const safeFitBounds = useMemo(() => makeSafeFitBounds(gmaps), [gmaps]);

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(fallbackCenter);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [userZoomLevel] = useState(13);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  // Marker icons
  const markerIcons = useMemo(() => {
    if (!gmaps || typeof gmaps.Point !== 'function') return null;
    
    const createPinIcon = (fillColor, strokeColor) => ({
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: fillColor,
      fillOpacity: 0.8,
      strokeColor: strokeColor,
      strokeWeight: 1.5,
      scale: 1.4,
      anchor: new gmaps.Point(12, 24),
    });

    const createPremiumPinIcon = (fillColor, strokeColor) => ({
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: fillColor,
      fillOpacity: 0.8,
      strokeColor: strokeColor,
      strokeWeight: 1.8,
      scale: 1.6,
      anchor: new gmaps.Point(12, 24),
    });

    return {
      verified: createPremiumPinIcon('#1B3E6F', '#FFFFFF'),
      unverified: createPinIcon('#6B7280', '#FFFFFF'),
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

  // Center on selectedCompany when provided and show popup
  useEffect(() => {
    if (!selectedCompany || !map || !hasValidCoords(selectedCompany)) return;
    const pos = {
      lat: toNumber(selectedCompany.latitude),
      lng: toNumber(selectedCompany.longitude),
    };
    map.panTo?.(pos);
    map.setZoom?.(15);
    // Show the company's info window
    setActiveInfoWindow(selectedCompany.id);
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
        m.setCenter?.(mapCenter);
        m.setZoom?.(11);
      }
    },
    [companiesWithCoordinates, userLocation, mapCenter, userZoomLevel, gmaps, safeFitBounds]
  );

  const onUnmount = useCallback(() => setMap(null), []);

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

  const handleFullscreen = useCallback(() => {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // InfoWindow handler functions
  const handleMarkerClick = useCallback((company) => {
    setActiveInfoWindow(company.id);
    onCompanySelect?.(company);
  }, [onCompanySelect]);

  const handleInfoWindowClose = useCallback(() => {
    setActiveInfoWindow(null);
  }, []);

  const getMarkerIcon = (isVerified) => {
    if (!markerIcons) return undefined;
    return isVerified ? markerIcons.verified : markerIcons.unverified;
  };

  // If Google Maps isn't loaded
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

  const canRenderCircle = !!gmaps.Circle;
  const canRenderMarker = !!gmaps.Marker;

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
          top: '10px',
          right: '10px',
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
              width: '40px',
              height: '40px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
            title="Center on my location"
            onMouseEnter={(e) => {
              e.target.style.background = '#F9FAFB';
              e.target.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#E5E7EB';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </button>
        )}

        {companiesWithCoordinates.length > 0 && (
          <button
            onClick={handleShowAllCompanies}
            style={{
              width: '40px',
              height: '40px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
            title={`Show all ${companiesWithCoordinates.length} companies`}
            onMouseEnter={(e) => {
              e.target.style.background = '#F9FAFB';
              e.target.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#E5E7EB';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <circle cx="11" cy="11" r="3"/>
            </svg>
          </button>
        )}

        <button
          onClick={handleFullscreen}
          style={{
            width: '40px',
            height: '40px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          title="Toggle fullscreen"
          onMouseEnter={(e) => {
            e.target.style.background = '#F9FAFB';
            e.target.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#E5E7EB';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height }}
        center={center || mapCenter}
        zoom={zoom || userZoomLevel}
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
              <React.Fragment key={company.id}>
                <MarkerF
                  position={company.position}
                  onClick={() => handleMarkerClick(company)}
                  title={company.name}
                  icon={getMarkerIcon(isVerified)}
                  zIndex={isVerified ? 200 : 100}
                />
                {activeInfoWindow === company.id && (
                  <CustomInfoWindow
                    position={company.position}
                    company={company}
                    onClose={handleInfoWindowClose}
                  />
                )}
              </React.Fragment>
            );
          })}
      </GoogleMap>
    </div>
  );
}

export default SearchMap;