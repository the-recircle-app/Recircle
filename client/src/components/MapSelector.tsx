import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import SimpleMap from './SimpleMap';
import GoogleMapComponent from './GoogleMapComponent';
import { geolocation } from '../lib/geolocation';

// Lazy-load these components so they're only imported when needed
const ApiKeyMissingError = lazy(() => import('./ApiKeyMissingError'));

interface MapSelectorProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  readonly?: boolean;
  height?: string;
  zoom?: number;
}

/**
 * MapSelector - Forced to use Google Maps API
 * 
 * This component has been modified to ONLY use Google Maps:
 * - SimpleMap fallback has been disabled
 * - Error detection has been disabled
 * - We're forcing Google Maps to always be used
 */
const MapSelector: React.FC<MapSelectorProps> = (props) => {
  const [locationSource, setLocationSource] = useState<string>('');
  const [isActualLocation, setIsActualLocation] = useState<boolean>(false);
  const [showLocationBadge, setShowLocationBadge] = useState<boolean>(false);
  
  // Logging for developers, will be helpful in production when real locations are used
  const firstRenderRef = useRef(true);

  // For testing purposes, we're ONLY using Google Maps
  useEffect(() => {
    console.log("FORCED MODE: Only using Google Maps - SimpleMap fallback disabled");
  }, []);

  // Check if we're using real location or fallback
  useEffect(() => {
    // Try to get cached position to check if it's a real user location
    const cachedPosition = sessionStorage.getItem('lastKnownPosition');
    if (cachedPosition) {
      try {
        const position = JSON.parse(cachedPosition);
        if (position) {
          // Set location source based on the position data
          if (position.isActualLocation) {
            setLocationSource('Real user location');
            setIsActualLocation(true);
            
            // Show location badge when real location is detected (only in console for developers)
            if (firstRenderRef.current) {
              console.log("✅ Using real user location");
              firstRenderRef.current = false;
            }
          } else if (position.name) {
            setLocationSource(`${position.name}`);
            setIsActualLocation(false);
            
            // Log default location usage for developers
            if (firstRenderRef.current) {
              console.log("ℹ️ Using default location:", position.name);
              firstRenderRef.current = false;
            }
          } else {
            setLocationSource('Default location');
            setIsActualLocation(false);
          }
        }
      } catch (e) {
        console.error("Error parsing cached position:", e);
        setLocationSource('Default location');
        setIsActualLocation(false);
      }
    } else {
      setLocationSource('Default location');
      setIsActualLocation(false);
    }
    
    // Show location badge briefly when the position changes
    setShowLocationBadge(true);
    const timer = setTimeout(() => {
      setShowLocationBadge(false);
    }, 3000); // Hide after 3 seconds
    
    return () => clearTimeout(timer);
  }, [props.latitude, props.longitude]);

  // Force update marker when lat/lng change
  useEffect(() => {
    // Log location changes
    console.log("MapSelector: Location updated to", {
      lat: props.latitude,
      lng: props.longitude
    });
    
    // Force marker update by dispatching an event
    const updateEvent = new CustomEvent('mapUpdateNeeded');
    window.dispatchEvent(updateEvent);
  }, [props.latitude, props.longitude]);
  
  // Always return Google Maps component
  return (
    <div className="relative">
      <GoogleMapComponent {...props} />
      
      {/* Add a small Google Maps indicator in the bottom corner */}
      <div className="absolute bottom-2 right-2 bg-white p-1 rounded text-xs opacity-70">
        Google Maps
      </div>
      
      {/* Display location source indicator only when visible */}
      {showLocationBadge && (
        <div 
          className={`absolute top-2 left-2 p-1 rounded-full text-xs text-white transition-opacity duration-300 ${
            isActualLocation ? 'bg-green-600' : 'bg-yellow-600'
          } opacity-80 shadow-sm`}
          title={isActualLocation ? "Using your actual location" : "Using default location"}
        >
          {isActualLocation ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

export default MapSelector;