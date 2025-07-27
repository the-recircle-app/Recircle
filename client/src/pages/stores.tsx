import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useWallet } from '../context/WalletContext';
import { ThriftStore } from '@shared/schema';
import { geolocation } from '../lib/geolocation';
import BottomNavigation from '../components/BottomNavigation';
import B3trLogo from '../components/B3trLogo';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface StoreWithDistance extends ThriftStore {
  distance: number;
}

const Stores = () => {
  const [, setLocation] = useLocation();
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyStores, setNearbyStores] = useState<StoreWithDistance[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get all sustainable transportation partners
  const { data: stores = [], isLoading } = useQuery<ThriftStore[]>({
    queryKey: ['/api/thrift-stores'],
  });

  // Get user location
  const getUserLocation = async () => {
    try {
      // Show loading state
      setIsLoadingLocation(true);
      
      // Force a fresh location lookup instead of using cached value
      const position = await geolocation.getCurrentPosition(true);
      setUserLocation({
        lat: position.latitude,
        lng: position.longitude
      });
      
      // Sort stores by distance
      sortStoresByDistance(position.latitude, position.longitude);
      
      // Success notification
      toast({
        title: "Location updated",
        description: "Showing sustainable stores nearest to you",
      });
    } catch (error) {
      console.error("Failed to get user location:", error);
      
      // Error notification
      toast({
        title: "Location error",
        description: "Could not access your location. Please check permissions.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  // Sort stores by distance from user
  const sortStoresByDistance = (userLat: number, userLng: number) => {
    // Only sort if we have stores
    if (!stores || stores.length === 0) return;
    
    // Create a copy of stores array with distance calculated
    const storesWithDistance = stores.map(store => ({
      ...store,
      distance: geolocation.calculateDistance(
        userLat,
        userLng,
        store.latitude,
        store.longitude
      )
    }));
    
    // Sort by distance
    storesWithDistance.sort((a, b) => a.distance - b.distance);
    
    // This will cause the component to re-render with sorted stores
    setNearbyStores(storesWithDistance);
  };

  // Calculate distance between user and store
  const calculateDistance = (storeLat: number, storeLng: number) => {
    if (!userLocation) return null;
    
    return geolocation.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      storeLat,
      storeLng
    );
  };

  // Add effect to sort stores when they load
  useEffect(() => {
    if (stores.length > 0 && userLocation) {
      sortStoresByDistance(userLocation.lat, userLocation.lng);
    }
  }, [stores]);
  
  // Determine which stores to display
  const getDisplayedStores = () => {
    // If we have nearby stores sorted by distance, use those
    const storeList = nearbyStores.length > 0 ? nearbyStores : stores;
    
    // Then apply search filtering
    if (!searchQuery) return storeList;
    
    const query = searchQuery.toLowerCase();
    return storeList.filter(store => 
      store.name.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query) ||
      store.state.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query)
    );
  };
  
  // Get the stores to display
  const filteredStores = getDisplayedStores();

  // Handle add store button click
  const handleAddStore = () => {
    setLocation('/add-store');
  };

  // Handle store card click
  const handleStoreClick = (storeId: number) => {
    setLocation(`/stores/${storeId}`);
  };

  // Render store type badge
  const renderStoreTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      general: "bg-blue-100 text-blue-800",
      clothing: "bg-pink-100 text-pink-800",
      furniture: "bg-amber-100 text-amber-800",
      books: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || typeColors.other}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Sustainable Stores</h1>
        <p className="text-blue-100 text-sm mb-4">
          Find and add verified sustainable stores to earn rewards
        </p>
        
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search by name, city, or address..."
            className="w-full px-4 py-2 rounded-full border-none text-black font-medium stores-search-input"
            style={{ color: 'black', caretColor: 'black' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              className="text-sm h-9 bg-white text-blue-600 hover:bg-blue-50" 
              onClick={getUserLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Locating...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Use My Location
                </>
              )}
            </Button>
          </div>
          
          {import.meta.env.DEV && (
            <div className="text-xs text-white bg-blue-800/30 rounded p-1 text-center">
              <p>Note: Development mode uses San Francisco location data.</p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="text-sm h-9 bg-transparent border-white text-white hover:bg-blue-700"
            onClick={handleAddStore}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Store
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {!isLoading && !searchQuery && import.meta.env.DEV && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-amber-800 text-sm">
            <div className="flex items-start">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
              <div>
                <p className="font-medium">Demo Location Notice</p>
                <p className="mt-1">This demo is using San Francisco store locations. In the production app, you would see stores near your actual location.</p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          // No stores found
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Stores Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No stores match "${searchQuery}"` 
                : "There are no sustainable stores in the database yet."}
            </p>
            <Button onClick={handleAddStore}>
              Add a Sustainable Store
            </Button>
          </div>
        ) : (
          // Store list
          <div className="space-y-4">
            {filteredStores.map((store) => (
              <Card key={store.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200" onClick={() => handleStoreClick(store.id)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900">{store.name}</CardTitle>
                    {renderStoreTypeBadge(store.storeType)}
                  </div>
                  <CardDescription className="text-gray-500">
                    {store.address}, {store.city}, {store.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-blue-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {userLocation ? (
                        `${calculateDistance(store.latitude, store.longitude)?.toFixed(1) || '?'} miles away`
                      ) : (
                        "Get distance"
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <B3trLogo className="w-3 h-3 mr-1" color="#1E40AF" />
                        <span>5-10 tokens</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation isConnected={isConnected} />
    </div>
  );
};

export default Stores;