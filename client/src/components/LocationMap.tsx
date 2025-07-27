import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { geolocation } from '../lib/geolocation';
import MapSelector from './MapSelector';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  readonly?: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  latitude, 
  longitude, 
  onLocationChange,
  readonly = false
}) => {
  const [coords, setCoords] = useState({
    lat: latitude,
    lng: longitude
  });
  const { toast } = useToast();
  
  useEffect(() => {
    // Update local state when props change
    setCoords({
      lat: latitude,
      lng: longitude
    });
  }, [latitude, longitude]);

  // Handle location change from map component
  const handleLocationChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };
  
  return (
    <div className="w-full space-y-2">
      <div className="relative rounded-md overflow-hidden shadow-md">
        {/* Use MapSelector to automatically choose between SimpleMap in development and GoogleMapComponent in production */}
        <MapSelector 
          latitude={coords.lat} 
          longitude={coords.lng} 
          onLocationChange={handleLocationChange}
          readonly={readonly}
          height="260px" // Slightly larger map for better visibility
          zoom={15} // Default zoom level
        />
      </div>
      
      {!readonly && (
        <div className="mt-2 text-center text-xs text-gray-500">
          <span className="inline-block px-2 py-1 bg-white/80 rounded text-blue-600 font-medium">
            Click on map or drag pin to set location
          </span>
        </div>
      )}
      
      {!readonly && (
        <button
          type="button"
          onClick={() => {
            geolocation.getCurrentPosition()
              .then(position => {
                handleLocationChange(position.latitude, position.longitude);
                toast({
                  title: "Location updated",
                  description: "Using your current location",
                  variant: "default",
                });
              })
              .catch(error => {
                console.error('Failed to get current position:', error);
                toast({
                  title: "Location error",
                  description: "Could not access your location. Please check your browser permissions.",
                  variant: "destructive",
                });
              });
          }}
          className="w-full mt-2 py-2 px-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Current Location
        </button>
      )}
    </div>
  );
};

export default LocationMap;