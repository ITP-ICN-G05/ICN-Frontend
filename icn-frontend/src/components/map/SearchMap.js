import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import './SearchMap.css';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: -37.8136, // Melbourne
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
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

function SearchMap({ companies = [], selectedCompany, onCompanySelect }) {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Generate coordinates for companies
  const companiesWithCoordinates = useMemo(() => {
    if (!companies || companies.length === 0) {
      console.log('No companies to display on map');
      return [];
    }
    
    return companies.map((company, index) => ({
      ...company,
      position: company.position || {
        lat: -37.8136 + (Math.random() - 0.5) * 0.2,
        lng: 144.9631 + (Math.random() - 0.5) * 0.3
      }
    }));
  }, [companies]);

  const onLoad = useCallback((map) => {
    setMap(map);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          map.setCenter(pos);
        },
        () => {
          console.log("Location access denied");
        }
      );
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerIcon = (company) => {
    const baseIcon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
    };

    if (company.verified) {
      return { ...baseIcon, fillColor: '#B6D289', fillOpacity: 1 };
    } else {
      return { ...baseIcon, fillColor: '#F99F1C', fillOpacity: 0.8 };
    }
  };

  const handleMarkerClick = (company) => {
    setActiveMarker(company.id);
    if (onCompanySelect) {
      onCompanySelect(company);
    }
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  const handleViewDetails = (companyId) => {
    navigate(`/company/${companyId}`);
  };

  const clusterOptions = {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    gridSize: 60,
    maxZoom: 15,
    minimumClusterSize: 2
  };

  // Check if API key exists
  if (!process.env.REACT_APP_GOOGLE_MAPS_KEY) {
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
          <h3>Map Configuration Required</h3>
          <p>Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            }}
            title="Your location"
          />
        )}

        {/* Company markers with clustering */}
        {companiesWithCoordinates.length > 0 ? (
          <MarkerClusterer options={clusterOptions}>
            {(clusterer) =>
              companiesWithCoordinates.map((company) => (
                <Marker
                  key={company.id}
                  position={company.position}
                  onClick={() => handleMarkerClick(company)}
                  icon={getMarkerIcon(company)}
                  title={company.name}
                  clusterer={clusterer}
                >
                  {activeMarker === company.id && (
                    <InfoWindow
                      onCloseClick={handleInfoWindowClose}
                      position={company.position}
                    >
                      <div className="map-info-window">
                        <h3>{company.name}</h3>
                        {company.verified && (
                          <span className="verified-badge">✓ Verified</span>
                        )}
                        <p className="company-type">{company.type}</p>
                        <p className="company-distance">📍 {company.distance} km</p>
                        <div className="info-sectors">
                          {company.sectors.slice(0, 2).map(sector => (
                            <span key={sector} className="sector-tag">{sector}</span>
                          ))}
                        </div>
                        <button 
                          className="btn-view-details"
                          onClick={() => handleViewDetails(company.id)}
                        >
                          View Details
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))
            }
          </MarkerClusterer>
        ) : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            No companies to display
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default SearchMap;