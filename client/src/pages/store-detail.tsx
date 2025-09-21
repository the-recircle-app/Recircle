import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import B3trLogo from "@/components/B3trLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { ThriftStore } from "@shared/schema";
import BottomNavigation from "@/components/BottomNavigation";
import { geolocation } from "@/lib/geolocation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function StoreDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [distance, setDistance] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch the store data
  const { data: store, isLoading, error } = useQuery<ThriftStore>({
    queryKey: ['/api/thrift-stores', params.id],
    enabled: !!params.id,
  });

  // Get user location and calculate distance to store
  useEffect(() => {
    if (store) {
      const calculateDistanceToStore = async () => {
        try {
          const position = await geolocation.getCurrentPosition();
          const calculatedDistance = geolocation.calculateDistance(
            position.latitude, 
            position.longitude, 
            store.latitude, 
            store.longitude
          );
          setDistance(calculatedDistance);
        } catch (error) {
          console.error("Error getting user location:", error);
        }
      };
      
      calculateDistanceToStore();
    }
  }, [store]);

  // Function to get a deterministic color for a store
  const getStoreColorClass = (id: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800"
    ];
    return colors[id % colors.length];
  };

  // Function to render the store type badge
  const renderStoreTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      general: "bg-blue-100 text-blue-800",
      clothing: "bg-pink-100 text-pink-800",
      furniture: "bg-amber-100 text-amber-800",
      books: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800"
    };
    
    // Make sure type is not undefined
    const storeType = type || 'other';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColors[storeType] || typeColors.other}`}>
        {storeType.charAt(0).toUpperCase() + storeType.slice(1)}
      </span>
    );
  };

  // Function to generate directions link
  const getDirectionsUrl = (lat: number, lng: number, name?: string) => {
    // In development mode, we're using San Francisco demo data
    // In this case, we should clearly indicate this is a San Francisco location
    if (import.meta.env.DEV) {
      // Return a URL that specifically shows it's in San Francisco and is meant for demo purposes
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=ChIJIQBpAG2ahYAR_6128GcTUEo`;
    }
    
    // In production, we'd use the actual coordinates for directions
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  };

  // Get mock store hours based on store ID
  // This creates predictable "random" hours based on store ID
  const getStoreHours = (storeId: number) => {
    // Create predictable opening and closing times based on store ID
    const openHour = 8 + (storeId % 3); // 8, 9, or 10 AM
    const closeHour = 17 + (storeId % 4); // 5, 6, 7, or 8 PM
    
    const formatTime = (hour: number) => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:00 ${ampm}`;
    };
    
    // Different hours for weekends vs weekdays
    return {
      monday: `${formatTime(openHour)} - ${formatTime(closeHour)}`,
      tuesday: `${formatTime(openHour)} - ${formatTime(closeHour)}`,
      wednesday: `${formatTime(openHour)} - ${formatTime(closeHour)}`,
      thursday: `${formatTime(openHour)} - ${formatTime(closeHour)}`,
      friday: `${formatTime(openHour)} - ${formatTime(closeHour + 1)}`, // Stay open an hour later on Friday
      saturday: `${formatTime(openHour + 1)} - ${formatTime(closeHour - 1)}`, // Different weekend hours
      sunday: storeId % 5 === 0 ? 'Closed' : `${formatTime(openHour + 1)} - ${formatTime(closeHour - 2)}` // Some stores closed on Sunday
    };
  };

  // Handle sharing the store
  const handleShareStore = () => {
    if (!store) return;
    
    const storeName = store.name || 'This transportation service';
    
    // Create share data
    const shareData = {
      title: `${storeName} on ReCircle`,
      text: `Check out ${storeName}, a sustainable transportation service on ReCircle! Use eco-friendly travel and earn B3TR rewards.`,
      url: window.location.href
    };
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Store shared successfully'))
        .catch(err => {
          console.error('Error sharing store:', err);
          toast({
            title: "Couldn't share",
            description: "There was an error sharing this store",
            variant: "destructive"
          });
        });
    } else {
      // Fallback for browsers that don't support share API
      toast({
        title: "Share",
        description: `Copy this link to share: ${window.location.href}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="h-56 bg-gray-200 rounded-lg mb-4">
          <Skeleton className="h-full w-full" />
        </div>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh]">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-red-500">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12" y2="16" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Store Not Found</h2>
        <p className="text-gray-500 mb-4 text-center">
          We couldn't find the store you're looking for.
        </p>
        <Button onClick={() => setLocation("/stores")}>
          Back to Stores
        </Button>
      </div>
    );
  }

  // Get store hours
  const storeHours = getStoreHours(store.id);
  
  // Check if store is currently open
  const isStoreOpen = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    // Map the day name to our store hours keys
    const day = dayName === 'monday' ? 'monday' :
                dayName === 'tuesday' ? 'tuesday' :
                dayName === 'wednesday' ? 'wednesday' :
                dayName === 'thursday' ? 'thursday' :
                dayName === 'friday' ? 'friday' :
                dayName === 'saturday' ? 'saturday' : 'sunday';
                
    const currentHour = now.getHours();
    
    // Get hours for the current day
    const todayHours = storeHours[day as keyof typeof storeHours];
    
    if (todayHours === 'Closed') return false;
    
    // Parse open and close hours
    const [openTime, closeTime] = todayHours.split(' - ');
    const openHour = parseInt(openTime.split(':')[0]) + (openTime.includes('PM') && openTime.split(':')[0] !== "12" ? 12 : 0);
    const closeHour = parseInt(closeTime.split(':')[0]) + (closeTime.includes('PM') && closeTime.split(':')[0] !== "12" ? 12 : 0);
    
    return currentHour >= openHour && currentHour < closeHour;
  };

  return (
    <div className="pb-20">
      {/* Header with store image */}
      <div className="relative h-56">
        <div className={`w-full h-full flex items-center justify-center ${getStoreColorClass(store.id)}`}>
          <span className="text-6xl font-bold">{store.name && store.name.length > 0 ? store.name.charAt(0) : '?'}</span>
        </div>
        <Button 
          variant="ghost" 
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 h-10 w-10" 
          onClick={() => setLocation("/stores")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Button>
        <Button 
          variant="ghost" 
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 h-10 w-10" 
          onClick={handleShareStore}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </Button>
      </div>

      {/* Store details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">{store.name}</h1>
          {renderStoreTypeBadge(store.storeType)}
        </div>
        
        <p className="text-gray-500 mb-2">{store.address}, {store.city}, {store.state}</p>
        
        <div className="flex items-center mb-4">
          {distance !== null && (
            <div className="flex items-center text-blue-600 mr-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{distance.toFixed(1)} miles away</span>
            </div>
          )}
          
          <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${isStoreOpen() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isStoreOpen() ? 'Open Now' : 'Closed'}
          </div>
        </div>
        
        <Tabs defaultValue="details" className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Store Description</h3>
                  <p className="text-gray-600 text-sm">
                    {store.name || 'This store'} is a thrift store located in {store.city || 'the city'}, {store.state || 'the area'}. They offer a wide variety of pre-loved items including clothing, furniture, books, and household goods at affordable prices. Shopping here supports environmental sustainability through recycling and reuse.
                  </p>
                </div>
                
                <div className="mb-3">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Contact Information</h3>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>Call the store for hours and availability</span>
                    </div>
                    <div className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>Contact through website</span>
                    </div>
                  </div>
                  
                  {import.meta.env.DEV && (
                    <div className="mt-3 text-xs text-gray-500 italic">
                      <p>Note: The contact information shown is for demonstration purposes.</p>
                    </div>
                  )}
                </div>
                
                {store.verified && (
                  <div className="flex items-center text-green-600 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Verified Store</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hours">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Store Hours</h3>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monday</span>
                    <span className="font-medium">{storeHours.monday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tuesday</span>
                    <span className="font-medium">{storeHours.tuesday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Wednesday</span>
                    <span className="font-medium">{storeHours.wednesday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thursday</span>
                    <span className="font-medium">{storeHours.thursday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Friday</span>
                    <span className="font-medium">{storeHours.friday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">{storeHours.saturday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sunday</span>
                    <span className={`font-medium ${storeHours.sunday === 'Closed' ? 'text-red-500' : ''}`}>
                      {storeHours.sunday}
                    </span>
                  </div>
                  
                  {import.meta.env.DEV && (
                    <div className="mt-4 text-xs text-gray-500 italic">
                      <p>Note: Store hours are for demonstration purposes only. Please verify actual hours before visiting.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rewards">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">B3TR Token Rewards</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <B3trLogo className="w-6 h-6" color="#38BDF8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Base Reward</h4>
                      <p className="text-xs text-gray-500">8 tokens for each verified receipt</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Purchase Bonus</h4>
                      <p className="text-xs text-gray-500">+0.1 tokens per $10 spent (up to 8 tokens)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Streak Multiplier</h4>
                      <p className="text-xs text-gray-500">Up to 1.5x bonus for maintaining daily activity</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {import.meta.env.DEV && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-amber-800 text-sm">
            <div className="flex items-start">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
              <div>
                <p className="font-medium">Demo Store Notice</p>
                <p className="mt-1">This is a demo thrift store located in San Francisco, CA. When viewing directions, it will show the actual San Francisco location.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            className="bg-blue-600 text-white" 
            onClick={() => window.open(getDirectionsUrl(store.latitude, store.longitude, store.name), '_blank')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            {import.meta.env.DEV ? 'View on Map' : 'Directions'}
          </Button>
          <Button 
            variant="outline" 
            className="border-blue-600 text-blue-600"
            onClick={() => setLocation("/scan")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="8" x2="12" y2="16" />
            </svg>
            Scan Receipt
          </Button>
        </div>
        
        {store.addedBy && (
          <div className="text-xs text-gray-400 mt-4">
            Community contributed store
          </div>
        )}
      </div>
      
      <BottomNavigation isConnected={true} />
    </div>
  );
}