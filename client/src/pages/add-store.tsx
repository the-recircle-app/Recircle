import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import MapSelector from "@/components/MapSelector";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useWallet } from "../context/WalletContext";
import { useAchievements } from "../context/AchievementContext";
import { useToast } from "@/hooks/use-toast";
import { geolocation } from "../lib/geolocation";

// Maximum number of rewarded actions per day (consistent with server value)
const MAX_DAILY_ACTIONS = 3;

enum AddStoreStep {
  FORM = "form",
  SUCCESS = "success"
}

const storeFormSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  latitude: z.number(),
  longitude: z.number(),
  storeType: z.string().min(1, "Please select a store type"),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

const AddStore = () => {
  const [, setLocation] = useLocation();
  const { userId, isConnected, refreshTokenBalance } = useWallet();
  const { checkForNewAchievements } = useAchievements();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<AddStoreStep>(AddStoreStep.FORM);
  const [baseReward, setBaseReward] = useState(5); // Base reward before multiplier
  // For testing purposes - let's simulate a streak multiplier of 1.2x and set reward accordingly
  const [streakMultiplier, setStreakMultiplier] = useState(1.2); // Track user's streak multiplier
  const [rewardAmount, setRewardAmount] = useState(baseReward * streakMultiplier); // Total reward with multiplier
  const [dailyActionLimitReached, setDailyActionLimitReached] = useState(false);
  
  // Get user's transactions to check for daily action limit
  const { data: transactions } = useQuery({
    queryKey: [userId ? `/api/users/${userId}/transactions` : null],
    enabled: !!userId && isConnected,
  });
  
  // Check daily action limit (receipts + store additions)
  useEffect(() => {
    if (transactions && Array.isArray(transactions)) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Count actions created today that count against daily limit
      // Include both receipt_verification and store_addition types
      const todayActions = transactions.filter(tx => {
        // Only count these types toward the daily limit
        if (tx.type !== 'receipt_verification' && tx.type !== 'store_addition') {
          return false;
        }
        
        // Check if transaction was created today
        if (!tx.createdAt) return false;
        const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
        return txDate === today;
      });
      
      const actionCount = todayActions.length;
      console.log(`Today's actions (store page): ${actionCount}/${MAX_DAILY_ACTIONS}`);
      
      // Set limit reached flag if we've hit or exceeded the daily limit
      setDailyActionLimitReached(actionCount >= MAX_DAILY_ACTIONS);
    }
  }, [transactions]);
  
  // Set up form
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      latitude: 0,
      longitude: 0,
      storeType: "general",
    }
  });

  // Handle getting current location with loading state
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      // Clear any previously cached position first
      try {
        sessionStorage.removeItem('lastKnownPosition');
        console.log("Cleared cached position to get fresh location");
      } catch (e) {
        console.error("Failed to clear cached position:", e);
      }
      
      // Use the enhanced geolocation service with fallbacks
      const position = await geolocation.getCurrentPosition();
      
      // Update form with the new coordinates
      form.setValue("latitude", position.latitude);
      form.setValue("longitude", position.longitude);
      
      // Force map to update by causing multiple re-renders 
      // to ensure the pin moves properly and is visible
      const updateMapPin = () => {
        const mapUpdateEvent = new CustomEvent('mapUpdateNeeded');
        window.dispatchEvent(mapUpdateEvent);
      };
      
      // Update immediately and then again after delay to ensure rendering
      updateMapPin();
      setTimeout(updateMapPin, 100);
      setTimeout(updateMapPin, 500);
      
      // Show success message with the location name if available
      const locationName = position.name ? position.name : "current location";
      toast({
        title: "Location Updated",
        description: `Using ${locationName} (${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)})`,
      });
    } catch (error) {
      // Show error message with clear instructions
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Failed to get location. Please try again or set location manually on the map.",
        variant: "destructive"
      });
      
      // If we have no coordinates at all, set Phoenix as default
      if (form.watch("latitude") === 0 && form.watch("longitude") === 0) {
        form.setValue("latitude", 33.4484); // Phoenix, Arizona
        form.setValue("longitude", -112.0740);
        
        toast({
          title: "Default Location Set",
          description: "Using Phoenix, Arizona as starting point. You can adjust by clicking on the map.",
        });
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Set up mutation for submitting store
  const submitStoreMutation = useMutation({
    mutationFn: async (data: StoreFormValues) => {
      if (!isConnected || !userId) {
        throw new Error("User not connected");
      }
      
      const storeData = {
        ...data,
        addedBy: userId
      };

      return apiRequest("POST", "/api/thrift-stores", storeData);
    },
    onSuccess: async (response) => {
      const json = await response.json();
      const finalReward = json.tokenReward || 5;
      setRewardAmount(finalReward);
      
      // Extract and store the base reward and streak multiplier if available
      if (json.rewardDetails) {
        setBaseReward(json.rewardDetails.baseReward || finalReward);
        setStreakMultiplier(json.rewardDetails.streakMultiplier || 1);
      } else {
        // If detailed reward info is not available, make a reasonable estimate
        setBaseReward(5);
        setStreakMultiplier(finalReward / 5);
      }
      
      // Refresh token balance to ensure UI displays the latest token amount
      if (refreshTokenBalance) {
        console.log("Refreshing token balance after store addition");
        await refreshTokenBalance();
      }
      
      setCurrentStep(AddStoreStep.SUCCESS);
      
      toast({
        title: "Store Added",
        description: "The thrift store has been added successfully",
      });
      
      // Invalidate any queries that rely on user data
      if (userId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/users/${userId}`] 
        });
        
        // Invalidate user receipts
        queryClient.invalidateQueries({ 
          queryKey: [`/api/users/${userId}/receipts`] 
        });
        
        // Invalidate user transactions
        queryClient.invalidateQueries({ 
          queryKey: [`/api/users/${userId}/transactions`] 
        });
        
        console.log("Forcing user data refresh after store addition");
        
        // Explicitly check for achievements after successful store addition
        // This triggers the "first_store" achievement notification when appropriate
        setTimeout(() => {
          checkForNewAchievements();
          console.log("Checking for achievements after store addition");
        }, 500); // Short delay to allow transaction data to be updated
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add store",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: StoreFormValues) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add stores",
        variant: "destructive"
      });
      return;
    }
    
    // Check if the user has reached daily action limit
    if (dailyActionLimitReached && isConnected) {
      toast({
        title: "Daily Action Limit Reached",
        description: `You've reached your limit of ${MAX_DAILY_ACTIONS} actions for today. This includes both receipt scans and store additions. Please come back tomorrow!`,
        variant: "destructive"
      });
      return;
    }
    
    submitStoreMutation.mutate(data);
  };

  // Handle cancel button
  const handleCancel = () => {
    setLocation("/home");
  };

  // Handle return to dashboard button
  const handleReturnToDashboard = () => {
    setLocation("/home");
  };

  // Format coordinates for display
  const formattedCoordinates = geolocation.formatCoordinates(
    form.watch("latitude"), 
    form.watch("longitude")
  );

  return (
    <div>
      {/* Store Form */}
      {currentStep === AddStoreStep.FORM && (
        <Card className="bg-white rounded-lg shadow mb-6">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <span>Add New Transportation Partner</span>
              {/* Daily action limit indicator */}
              {isConnected && (
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 flex items-center">
                  <span className="mr-1">Daily actions:</span>
                  {transactions && Array.isArray(transactions) ? (
                    <span className={dailyActionLimitReached ? "text-red-500 font-bold" : ""}>
                      {Math.min(
                        transactions.filter(tx => {
                          // Only count receipt_verification and store_addition actions
                          if (tx.type !== 'receipt_verification' && tx.type !== 'store_addition') {
                            return false;
                          }
                          // Check if transaction was created today
                          if (!tx.createdAt) return false;
                          const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
                          return txDate === new Date().toISOString().split('T')[0];
                        }).length, 
                        MAX_DAILY_ACTIONS
                      )}/{MAX_DAILY_ACTIONS}
                    </span>
                  ) : (
                    <span>0/{MAX_DAILY_ACTIONS}</span>
                  )}
                </div>
              )}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Earn ReWardrobe tokens by adding verified thrift store locations
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4">

            
            {/* Daily action limit warning */}
            {dailyActionLimitReached && isConnected && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500 mr-2">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Daily Action Limit Reached
                </AlertTitle>
                <AlertDescription className="text-sm">
                  You've used all {MAX_DAILY_ACTIONS} of your daily actions (receipt scans and store additions combined). 
                  This limit helps maintain the quality and authenticity of our rewards program. 
                  Please come back tomorrow for more actions!
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Store Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter store name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Street address" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">State</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="State" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel className="text-sm font-medium text-gray-700">Store Location</FormLabel>
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm"
                      className="text-xs text-primary font-medium h-auto p-0"
                      onClick={handleGetCurrentLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full mr-1"></div>
                          Locating...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-location-crosshairs mr-1"></i>
                          Use Current Location
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Interactive location map */}
                  <div className="mb-3 relative">
                    <MapSelector 
                      latitude={form.watch("latitude")} 
                      longitude={form.watch("longitude")} 
                      onLocationChange={(lat: number, lng: number) => {
                        form.setValue("latitude", lat);
                        form.setValue("longitude", lng);
                      }}
                      height="170px"
                    />
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm z-20 pointer-events-none">
                      Click anywhere to set location
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormLabel className="block text-xs text-gray-500 mb-1">Latitude</FormLabel>
                      <Input 
                        type="text" 
                        value={formattedCoordinates.lat}
                        readOnly 
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-sm" 
                      />
                      <Input 
                        type="hidden" 
                        {...form.register("latitude", { valueAsNumber: true })} 
                      />
                    </div>
                    <div>
                      <FormLabel className="block text-xs text-gray-500 mb-1">Longitude</FormLabel>
                      <Input 
                        type="text" 
                        value={formattedCoordinates.lng}
                        readOnly 
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-sm" 
                      />
                      <Input 
                        type="hidden" 
                        {...form.register("longitude", { valueAsNumber: true })} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Store Photo</FormLabel>
                  <div className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition duration-150">
                    <i className="fa-solid fa-camera text-gray-400 text-xl mb-2"></i>
                    <p className="text-sm text-gray-500 mb-1">Take a photo or upload an image</p>
                    <p className="text-xs text-gray-400">Store front should be clearly visible</p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="storeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Store Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Thrift Store</SelectItem>
                          <SelectItem value="clothing">Clothing Thrift Store</SelectItem>
                          <SelectItem value="furniture">Furniture Thrift Store</SelectItem>
                          <SelectItem value="books">Book Thrift Store</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary" 
                    disabled={submitStoreMutation.isPending}
                  >
                    {submitStoreMutation.isPending ? "Submitting..." : "Verify & Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Success Message */}
      {currentStep === AddStoreStep.SUCCESS && (
        <Card className="bg-white rounded-lg shadow overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <i className="fa-solid fa-check text-green-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Store Added Successfully!</h3>
            <p className="text-sm text-gray-600 mb-2">
              This location has been recorded on the VeChain Thor blockchain.
            </p>
            
            {/* Streak multiplier notification with animation - only show when active */}
            {streakMultiplier > 1 && (
              <div className="w-full max-w-xs mx-auto mb-5">
                <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-white p-3 rounded-md text-center shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    {[...Array(12)].map((_, i) => (
                      <span 
                        key={i}
                        className="absolute"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `pulse ${2 + Math.random()}s infinite`
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="font-bold text-lg mr-1">Streak bonus included!</span>
                    <span className="text-lg animate-spin-slow inline-block">
                      ✨
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-white/90">
                    Your ×{streakMultiplier.toFixed(1)} multiplier increased your reward!
                  </div>
                </div>
              </div>
            )}
            {/* Reward breakdown card showing base reward and multiplier */}
            <div className="bg-slate-50 rounded-lg p-3 w-full max-w-xs border border-slate-200 mx-auto mb-4">
              <div className="text-sm font-medium text-slate-700 mb-2">Reward Breakdown:</div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-600">Base reward:</span>
                <div className="flex items-center">
                  <span className="font-medium">{baseReward.toFixed(1)}</span>
                  <span className="ml-1 text-xs text-slate-500">B3TR</span>
                </div>
              </div>
              
              {streakMultiplier > 1 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">Streak multiplier:</span>
                  <span className="font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-transparent bg-clip-text">×{streakMultiplier.toFixed(1)}</span>
                </div>
              )}
              
              <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Total reward:</span>
                <div className="flex items-center">
                  <span className="font-bold text-primary">{rewardAmount.toFixed(1)}</span>
                  <span className="ml-1 text-xs text-slate-500">B3TR</span>
                </div>
              </div>
            </div>
            
            {/* Main reward indicator - special styling when multiplier is applied */}
            <div className={`${streakMultiplier > 1 ? 'bg-gradient-to-r from-green-50 to-primary/10 border border-green-100' : 'bg-primary/10'} 
                  rounded-full px-5 py-3 inline-flex items-center justify-center mt-2 mb-4
                  ${streakMultiplier > 1 ? 'shadow-md transform transition-all duration-500' : ''}`}>
              <span className="font-bold text-2xl text-primary mr-2">{rewardAmount.toFixed(1)}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-700">B3TR tokens</span>
                {streakMultiplier > 1 && (
                  <span className="text-xs text-green-600 font-medium">Streak bonus included!</span>
                )}
              </div>
            </div>
            <Button 
              onClick={handleReturnToDashboard}
              className="w-full bg-primary"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddStore;
