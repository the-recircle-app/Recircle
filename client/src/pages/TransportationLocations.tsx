import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Car, Zap, Train, Plus } from 'lucide-react';
import TransportationMap from '../components/TransportationMap';

interface Location {
  id: number;
  name: string;
  type: 'rideshare' | 'ev_rental' | 'public_transit';
  address: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

const TransportationLocations: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });

  const mockLocations: Location[] = [
    {
      id: 1,
      name: 'Downtown Tesla Rental',
      type: 'ev_rental',
      address: '123 Main St, San Francisco, CA',
      latitude: 37.7849,
      longitude: -122.4094,
      verified: true,
    },
    {
      id: 2,
      name: 'Metro Station Central',
      type: 'public_transit',
      address: '456 Transit Ave, San Francisco, CA',
      latitude: 37.7649,
      longitude: -122.4294,
      verified: true,
    },
    {
      id: 3,
      name: 'Rideshare Hub',
      type: 'rideshare',
      address: '789 Uber St, San Francisco, CA',
      latitude: 37.7549,
      longitude: -122.4394,
      verified: false,
    },
  ];

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'ev_rental': return <Zap className="h-5 w-5 text-green-400" />;
      case 'public_transit': return <Train className="h-5 w-5 text-purple-400" />;
      case 'rideshare': return <Car className="h-5 w-5 text-blue-400" />;
      default: return <MapPin className="h-5 w-5 text-gray-400" />;
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'ev_rental': return 'Electric Vehicle Rental';
      case 'public_transit': return 'Public Transit';
      case 'rideshare': return 'Rideshare Service';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Transportation Locations</h1>
          <p className="text-gray-300 text-lg">Find sustainable transportation options near you</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Nearby Locations</h2>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            <div className="space-y-3">
              {mockLocations.map((location) => (
                <Card 
                  key={location.id}
                  className={`bg-gray-800/50 border-gray-700 cursor-pointer transition-all hover:border-green-500/50 ${
                    selectedLocation?.id === location.id ? 'ring-2 ring-green-500/30' : ''
                  }`}
                  onClick={() => {
                    setSelectedLocation(location);
                    setMapCenter({ lat: location.latitude, lng: location.longitude });
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      {getLocationIcon(location.type)}
                      <div className="flex-1">
                        <CardTitle className="text-white text-sm">{location.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-xs">
                          {getLocationTypeLabel(location.type)}
                        </CardDescription>
                      </div>
                      {location.verified && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-400 text-xs">{location.address}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Location Map</CardTitle>
                <CardDescription className="text-gray-400">
                  Interactive map showing sustainable transportation options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransportationMap
                  latitude={mapCenter.lat}
                  longitude={mapCenter.lng}
                  readonly={true}
                  height="500px"
                  zoom={13}
                  transportationType={selectedLocation?.type || 'rideshare'}
                />
              </CardContent>
            </Card>

            {selectedLocation && (
              <Card className="bg-gray-800/50 border-gray-700 mt-4">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {getLocationIcon(selectedLocation.type)}
                    <div>
                      <CardTitle className="text-white">{selectedLocation.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {getLocationTypeLabel(selectedLocation.type)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-300">{selectedLocation.address}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedLocation.verified 
                          ? 'bg-green-900/50 text-green-400' 
                          : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {selectedLocation.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationLocations;