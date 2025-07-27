interface GeolocationPosition {
  latitude: number;
  longitude: number;
  name?: string;          // Optional location name for better user feedback
  isActualLocation?: boolean;  // Flag indicating if this is the user's real location (versus a fallback)
}

// Default locations used as fallbacks
// These constants help us ensure consistent fallback coordinates throughout the app
const DEFAULT_LOCATIONS = {
  // New York City coordinates
  NEW_YORK: {
    latitude: 40.7128,
    longitude: -74.0060,
    name: "New York City",
    isActualLocation: false // Flag to indicate this is NOT the user's actual location
  },
  // San Francisco coordinates
  SAN_FRANCISCO: {
    latitude: 37.7749,
    longitude: -122.4194,
    name: "San Francisco",
    isActualLocation: false // Flag to indicate this is NOT the user's actual location
  },
  // Phoenix, Arizona coordinates
  PHOENIX: {
    latitude: 33.4484,
    longitude: -112.0740,
    name: "Phoenix, Arizona",
    isActualLocation: false // Flag to indicate this is NOT the user's actual location
  }
};

// Default location to use when geolocation fails or isn't available
const DEFAULT_LOCATION = DEFAULT_LOCATIONS.PHOENIX;

export const geolocation = {
  // Get current position using browser's Geolocation API
  async getCurrentPosition(forceFresh: boolean = false): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser");
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      // In iframes or insecure contexts, geolocation might be blocked
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn("Geolocation may be blocked in non-HTTPS contexts");
      }
      
      // Clear any existing cached position if forceFresh is true
      if (forceFresh) {
        console.log("Cleared cached position to get fresh location");
        sessionStorage.removeItem('lastKnownPosition');
      }
      
      // Try to get cached position if we're not forcing a fresh lookup
      const cachedPosition = !forceFresh ? sessionStorage.getItem('lastKnownPosition') : null;
      if (cachedPosition) {
        try {
          const position = JSON.parse(cachedPosition);
          if (position && typeof position.latitude === 'number' && typeof position.longitude === 'number') {
            console.log("Using cached position:", position);
            return resolve(position);
          }
        } catch (e) {
          console.error("Error parsing cached position:", e);
        }
      }
      
      // Request user permission for location
      console.log("Requesting user location...");
      
      const geoOptions = {
        enableHighAccuracy: false,  // Use less accurate but faster position
        timeout: 5000,              // Shorter timeout to avoid long waits
        maximumAge: 300000          // Allow using cached position up to 5 minutes old
      };
      
      // Set a timeout in case the geolocation request hangs
      const timeoutId = setTimeout(() => {
        console.warn("Geolocation request timed out");
        
        // In Replit preview, use default location since geolocation often fails
        const defaultPos = DEFAULT_LOCATIONS.PHOENIX;
        console.log(`Using default location: ${defaultPos.name}`);
        
        // Cache this position for future use
        try {
          sessionStorage.setItem('lastKnownPosition', JSON.stringify(defaultPos));
        } catch (e) {
          console.error("Failed to cache default position:", e);
        }
        
        resolve(defaultPos);
      }, 4000); // Shorter timeout for better user experience
      
      // Request the actual position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Clear the timeout since we got a response
          clearTimeout(timeoutId);
          
          // Format and log the successful position
          const { latitude, longitude } = position.coords;
          console.log("Got user position:", latitude, longitude);
          
          // Verify that coordinates are valid numbers
          if (isNaN(latitude) || isNaN(longitude)) {
            console.error("Invalid coordinates received from geolocation API");
            
            // Use default location
            const defaultPos = DEFAULT_LOCATIONS.PHOENIX;
            console.log(`Using default location: ${defaultPos.name}`);
            resolve(defaultPos);
            return;
          }
          
          // Create position object with detailed information
          const positionObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: "Your Location", // Add a friendly name for user feedback
            isActualLocation: true // Flag to indicate this is the user's actual location
          };
          
          // Cache this successful position
          try {
            sessionStorage.setItem('lastKnownPosition', JSON.stringify(positionObj));
          } catch (e) {
            console.error("Failed to cache position:", e);
          }
          
          // Return the valid position
          resolve(positionObj);
        },
        (error) => {
          // Clear the timeout since we got an error response
          clearTimeout(timeoutId);
          
          // Create a helpful error message based on the error code
          let errorMessage = "Unknown geolocation error";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location services in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Your location could not be determined. Please try again.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please check your connection and try again.";
              break;
          }
          
          console.error("Geolocation error:", errorMessage, error);
          
          // Use default location for Replit environment for demonstration purposes
          const defaultPos = DEFAULT_LOCATIONS.PHOENIX;
          console.log(`Using default location: ${defaultPos.name}`);
          
          // Cache this position for future use
          try {
            sessionStorage.setItem('lastKnownPosition', JSON.stringify(defaultPos));
          } catch (e) {
            console.error("Failed to cache default position:", e);
          }
          
          resolve(defaultPos);
        },
        geoOptions
      );
    });
  },

  // Calculate distance between two points in kilometers (using Haversine formula)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  },

  // Convert degrees to radians
  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  // Format coordinates for display
  formatCoordinates(latitude: number, longitude: number): { lat: string; lng: string } {
    const latDirection = latitude >= 0 ? "N" : "S";
    const lngDirection = longitude >= 0 ? "E" : "W";
    
    return {
      lat: `${Math.abs(latitude).toFixed(4)}° ${latDirection}`,
      lng: `${Math.abs(longitude).toFixed(4)}° ${lngDirection}`
    };
  }
};
