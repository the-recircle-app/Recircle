import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { geolocation } from '../lib/geolocation';

// Import Libraries type from the Google Maps API package
import { Libraries } from '@react-google-maps/api';

interface GoogleMapComponentProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  readonly?: boolean;
  height?: string;
  zoom?: number;
}

// Styles for the map container
const containerStyle = {
  width: '100%',
  borderRadius: '0.375rem',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
};

// Use the Google Maps API key from environment variables
// Make sure we always have a valid API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA2mveV-x9A78s8IlNjpnKtdjVXUFR0WNU';

// Library configuration - specify which Google Maps libraries to load
// IMPORTANT: This must be a static constant, not created on every render 
// to avoid the "LoadScript has been reloaded unintentionally" warning
const libraries = ['places'] as Libraries;

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  latitude,
  longitude,
  onLocationChange,
  readonly = false,
  height = '300px',
  zoom = 15
}) => {
  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA2mveV-x9A78s8IlNjpnKtdjVXUFR0WNU',
    libraries,
    // Force a unique cachebuster parameter to avoid stale cached responses
    version: 'weekly',
    // Prevent fallback to simplified maps
    preventGoogleFontsLoading: false
  });

  // State to store the map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // State to track if info window should be shown
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  // State to store marker position
  const [markerPosition, setMarkerPosition] = useState({
    lat: latitude,
    lng: longitude
  });

  // Update marker position when props change
  useEffect(() => {
    setMarkerPosition({
      lat: latitude,
      lng: longitude
    });
    
    // If we have a map instance, pan to the new position
    if (map) {
      map.panTo({lat: latitude, lng: longitude});
      map.setZoom(zoom);
    }
  }, [latitude, longitude, map, zoom]);

  // Callback when map is loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    // Add controls to the map
    map.setOptions({
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });
    
    // Center on the current position
    map.setCenter({lat: latitude, lng: longitude});
    map.setZoom(zoom);
    
    // Store map reference
    setMap(map);
    
    // Force marker to be visible
    setTimeout(() => {
      map.panTo({lat: latitude, lng: longitude});
    }, 100);
  }, [latitude, longitude, zoom]);

  // Callback when map is unmounted
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker drag end
  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && onLocationChange) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      
      setMarkerPosition({
        lat: newLat,
        lng: newLng
      });
      
      onLocationChange(newLat, newLng);
      
      // Show confirmation InfoWindow
      setShowInfoWindow(true);
      
      // Hide InfoWindow after 2 seconds
      setTimeout(() => {
        setShowInfoWindow(false);
      }, 2000);
    }
  };

  // Set up state for the click animation
  const [clickPosition, setClickPosition] = useState<{lat: number, lng: number} | null>(null);
  const [showClickEffect, setShowClickEffect] = useState(false);
  
  // Handle map click to place marker (if not readonly)
  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!readonly && e.latLng && onLocationChange) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      
      // Debug marker visibility - help with seeing if click is registered
      console.log("🔴 Map clicked - Standard red marker placed at:", {
        lat: newLat,
        lng: newLng
      });
      
      // Update the marker position with a small zoom to ensure visibility
      setMarkerPosition({
        lat: newLat,
        lng: newLng
      });
      
      // Notify parent component
      onLocationChange(newLat, newLng);
      
      // Show confirmation InfoWindow
      setShowInfoWindow(true);
      
      // Force pin to appear by panning and zooming slightly
      if (map) {
        // Pan to center on click location
        map.panTo({lat: newLat, lng: newLng});
        
        // Slight zoom change to force refresh
        const currentZoom = map.getZoom();
        if (currentZoom) {
          setTimeout(() => {
            map.setZoom(currentZoom + 0.01);
            setTimeout(() => {
              map.setZoom(currentZoom);
            }, 150);
          }, 50);
        }
      }
      
      // Hide InfoWindow after a while
      setTimeout(() => {
        setShowInfoWindow(false);
      }, 2000);
    }
  };

  // Log error details to help with debugging
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps load error:', loadError);
      
      // Check if error is related to referer/authorization
      if (loadError.message && loadError.message.includes('RefererNotAllowed')) {
        console.error('This domain is not authorized to use this Google Maps API key.');
        console.error('Please add it to the allowed domains in the Google Cloud Console.');
      }
    }
  }, [loadError]);

  // If API failed to load, show proper error message with details
  if (loadError) {
    console.error("Google Maps failed to load:", loadError);
    
    // If it's a RefererNotAllowed error, show the special auth error component
    // with instructions on how to fix the API key configuration
    if (loadError.message?.includes('RefererNotAllowed')) {
      // Dynamic import to avoid circular dependencies
      const GoogleMapsAuthError = React.lazy(() => import('./GoogleMapsAuthError'));
      
      return (
        <React.Suspense fallback={
          <div style={{ ...containerStyle, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        }>
          <GoogleMapsAuthError 
            height={height} 
            currentDomain={window.location.origin} 
          />
        </React.Suspense>
      );
    }
    
    // For other errors, show a simpler error message
    return (
      <div style={{ ...containerStyle, height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div className="text-red-500 font-medium mb-2">Error loading Google Maps</div>
        <div className="text-sm text-gray-600 text-center max-w-xs">
          Please check your connection and try again.
        </div>
      </div>
    );
  }

  // If API is still loading, show spinner
  if (!isLoaded) {
    return (
      <div style={{ ...containerStyle, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
          <div className="text-sm text-gray-600">Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  // When using the actual Google Maps API in production
  return (
    <div className="relative">
      {/* Location indicator removed as per user request */}
    
      {/* Fallback marker overlay positioned absolutely in the center of the map */}
      {(markerPosition.lat !== 0 && markerPosition.lng !== 0) && (
        <div className="absolute z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-12 h-12 bg-red-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
          </div>
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height }}
        center={markerPosition}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          clickableIcons: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }}
      >
        {/* We'll use the standard marker instead of Circle */}
        
        {/* Add a second marker as a dummy - sometimes helps with rendering */}
        <Marker
          position={{ lat: markerPosition.lat + 0.0001, lng: markerPosition.lng + 0.0001 }}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(1, 1),
            anchor: new google.maps.Point(0, 0)
          }}
          visible={false}
        />
        
        {/* Real marker with extremely large icon */}
        <Marker
          position={markerPosition}
          draggable={!readonly}
          onDragEnd={onMarkerDragEnd}
          animation={google.maps.Animation.DROP}
          zIndex={1000}
          options={{ clickable: true }}
          icon={{
            // Pin that can't be missed
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF0000',
            fillOpacity: 1.0,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 20,
            anchor: new google.maps.Point(0, 0),
          }}
        >
          {showInfoWindow && (
            <InfoWindow
              position={markerPosition}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div className="p-1 text-sm">
                <p className="font-semibold text-green-600">Location updated!</p>
                <p className="text-xs text-gray-600">{geolocation.formatCoordinates(markerPosition.lat, markerPosition.lng).lat}, {geolocation.formatCoordinates(markerPosition.lat, markerPosition.lng).lng}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      </GoogleMap>
      
      {/* Display coordinates at bottom left - small and subtle */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-75 rounded-md px-2 py-1 text-xs font-mono shadow-sm opacity-60 hover:opacity-100 transition-opacity">
        {geolocation.formatCoordinates(markerPosition.lat, markerPosition.lng).lat}, {geolocation.formatCoordinates(markerPosition.lat, markerPosition.lng).lng}
      </div>
      
      {/* Get Directions button */}
      {(!readonly && markerPosition.lat !== 0 && markerPosition.lng !== 0) && (
        <div className="absolute top-2 right-2 z-10">
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${markerPosition.lat},${markerPosition.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-md text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get Directions
          </a>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;