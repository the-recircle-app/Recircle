import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "../context/WalletContext";
import { geolocation } from "../lib/geolocation";
import type { ThriftStore } from "../types";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

const FeaturedStores = () => {
  const { isConnected } = useWallet();

  const { data: stores, isLoading } = useQuery<ThriftStore[]>({
    queryKey: ["/api/thrift-stores"],
  });

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Featured Transportation Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Featured Transportation Partners</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores?.map((store: ThriftStore) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
};

interface StoreCardProps {
  store: ThriftStore;
}

const StoreCard = ({ store }: StoreCardProps) => {
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [, setLocation] = useLocation();

  // Get current position once
  useEffect(() => {
    const getPosition = async () => {
      try {
        const position = await geolocation.getCurrentPosition();
        setCurrentPosition(position);
      } catch (error) {
        console.error("Error getting position:", error);
      }
    };

    getPosition();
  }, []);

  // Calculate distance if we have current position
  const distance = useMemo(() => {
    if (!currentPosition) return null;
    return geolocation.calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      store.latitude,
      store.longitude
    );
  }, [currentPosition, store]);

  // Function to get a deterministic color for each store
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

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gray-200 relative">
        {/* We use a placeholder with store initial instead of actual images */}
        <div className={`w-full h-full flex items-center justify-center ${getStoreColorClass(store.id)}`}>
          <span className="text-4xl font-bold">{store.name.charAt(0)}</span>
        </div>
        
        {distance !== null && (
          <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
            {distance.toFixed(1)} mi away
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-1">{store.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{store.address}, {store.city}, {store.state}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <i className="fa-solid fa-star text-yellow-400 mr-1 text-sm"></i>
            <span className="text-sm font-medium">4.8</span>
            <span className="text-sm text-gray-500 ml-1">(42)</span>
          </div>
          <button 
            className="text-primary text-sm font-medium"
            onClick={() => setLocation(`/stores/${store.id}`)}
          >
            View Details
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedStores;
