import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '../context/WalletContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Share2, Award, Heart, TreePine, Zap, Droplets, Wind, Leaf, RefreshCw } from 'lucide-react';

// Eco-impact metrics
interface EcoImpact {
  co2Saved: number; // in kg
  waterSaved: number; // in liters
  energySaved: number; // in kWh
  treeEquivalent: number; // number of trees planted equivalent
  wasteReduced: number; // in kg
}

// Visual impact levels
const IMPACT_LEVELS = [
  { min: 0, max: 10, label: "Seedling", icon: "🌱", description: "You're just getting started! Keep shopping sustainably to see your impact grow." },
  { min: 10, max: 50, label: "Sapling", icon: "🌿", description: "Your eco-habits are taking root! See how much good you're doing for the planet." },
  { min: 50, max: 100, label: "Young Tree", icon: "🌳", description: "Look at you grow! Your sustainable choices are making a real difference." },
  { min: 100, max: 200, label: "Mighty Oak", icon: "🌲", description: "Impressive! Your commitment to sustainability is creating a significant impact." },
  { min: 200, max: 500, label: "Forest Guardian", icon: "🌳🌳", description: "Amazing work! You're becoming a true champion for the environment." },
  { min: 500, max: 1000, label: "Earth Hero", icon: "🌍", description: "Incredible! Your sustainable shopping habits are helping protect our planet." },
  { min: 1000, max: Infinity, label: "Climate Warrior", icon: "⚡🌍", description: "Extraordinary! You're a true sustainability leader making waves of positive change." },
];

export default function EcoImpactDashboard() {
  const { toast } = useToast();
  const { isConnected, userId } = useWallet();
  const [impact, setImpact] = useState<EcoImpact>({
    co2Saved: 0,
    waterSaved: 0,
    energySaved: 0,
    treeEquivalent: 0,
    wasteReduced: 0
  });
  const [currentLevel, setCurrentLevel] = useState(IMPACT_LEVELS[0]);
  const [nextLevel, setNextLevel] = useState(IMPACT_LEVELS[1]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user transactions
  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['/api/users', userId, 'transactions'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/users/${userId}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!userId && isConnected,
  });

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    enabled: !!userId && isConnected,
  });

  // Calculate environmental impact based on user's transactions
  useEffect(() => {
    if (!transactions || !userData) return;
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Get relevant transaction types (receipts and store additions)
      const sustainableTransactions = transactions.filter(
        (tx: any) => tx.type === 'receipt_verification' || tx.type === 'store_addition'
      );
      
      // Calculate total tokens earned from sustainable activities
      const totalTokens = sustainableTransactions.reduce(
        (sum: number, tx: any) => sum + tx.amount, 0
      );
      
      // Calculate environmental metrics using conversion factors:
      // These are approximate conversion factors for demonstration:
      // - Each token represents roughly 0.5kg CO2 saved (from not buying new)
      // - Each token represents ~10L water saved in production
      // - Each token represents ~0.7 kWh energy saved
      // - Each 20 tokens ~ 1 tree worth of CO2 absorption
      // - Each token represents ~0.2kg waste reduced
      const calculatedImpact: EcoImpact = {
        co2Saved: totalTokens * 0.5,
        waterSaved: totalTokens * 10,
        energySaved: totalTokens * 0.7,
        treeEquivalent: totalTokens / 20,
        wasteReduced: totalTokens * 0.2
      };
      
      setImpact(calculatedImpact);
      
      // Determine current impact level based on total CO2 saved
      const co2Impact = calculatedImpact.co2Saved;
      const currentLevel = IMPACT_LEVELS.find(
        level => co2Impact >= level.min && co2Impact < level.max
      ) || IMPACT_LEVELS[0];
      
      // Find next level
      const currentIndex = IMPACT_LEVELS.indexOf(currentLevel);
      const nextLevel = IMPACT_LEVELS[Math.min(currentIndex + 1, IMPACT_LEVELS.length - 1)];
      
      // Calculate progress to next level
      const levelRange = nextLevel.min - currentLevel.min;
      const userProgress = co2Impact - currentLevel.min;
      const progressPercentage = Math.min(Math.round((userProgress / levelRange) * 100), 100);
      
      setCurrentLevel(currentLevel);
      setNextLevel(nextLevel);
      setProgress(progressPercentage);
      
    } catch (error) {
      console.error("Error calculating eco impact:", error);
      toast({
        title: "Calculation Error",
        description: "There was an error calculating your environmental impact",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [transactions, userData, toast]);

  const handleRefresh = () => {
    setIsLoading(true);
    refetchTransactions().finally(() => {
      setIsLoading(false);
      toast({
        title: "Dashboard Refreshed",
        description: "Your eco-impact data has been updated!",
      });
    });
  };

  // Utility function to format numbers with commas and fixed decimal places
  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to view your personalized eco-impact dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Eco-Impact Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            See how your sustainable shopping choices are helping the planet.
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="mt-4 md:mt-0"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {isLoading ? 'Updating...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Impact Level Card */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Impact Level: {currentLevel.label}</CardTitle>
          <CardDescription>
            {currentLevel.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl md:text-8xl">
              {currentLevel.icon}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{currentLevel.label}</span>
              <span>{nextLevel.label} {nextLevel.icon}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {progress}% progress to next level
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              Total CO₂ saved: <span className="font-medium">{formatNumber(impact.co2Saved)} kg</span>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* CO2 Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wind className="h-5 w-5 mr-2 text-green-600" />
              CO₂ Emissions Avoided
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <span className="text-3xl font-bold mb-1">{formatNumber(impact.co2Saved)} kg</span>
              <span className="text-muted-foreground text-sm text-center">
                Equivalent to driving {formatNumber(impact.co2Saved * 4)} fewer km in a car
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Water Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Water Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <span className="text-3xl font-bold mb-1">{formatNumber(impact.waterSaved)} L</span>
              <span className="text-muted-foreground text-sm text-center">
                That's {formatNumber(impact.waterSaved / 150)} days of personal water use
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Energy Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Energy Conserved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <span className="text-3xl font-bold mb-1">{formatNumber(impact.energySaved)} kWh</span>
              <span className="text-muted-foreground text-sm text-center">
                Could power a home for {formatNumber(impact.energySaved / 30)} days
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Tree Equivalent Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TreePine className="h-5 w-5 mr-2 text-emerald-600" />
              Tree Equivalent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <span className="text-3xl font-bold mb-1">{formatNumber(impact.treeEquivalent, 1)} trees</span>
              <span className="text-muted-foreground text-sm text-center">
                Your impact is like planting these trees!
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Waste Reduced Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Leaf className="h-5 w-5 mr-2 text-green-500" />
              Waste Reduced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <span className="text-3xl font-bold mb-1">{formatNumber(impact.wasteReduced)} kg</span>
              <span className="text-muted-foreground text-sm text-center">
                That's {formatNumber(impact.wasteReduced / 0.1)} fewer items in landfills
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Contributions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <span className="text-3xl font-bold mb-1">
                {transactions ? transactions.filter((tx: any) => 
                  tx.type === 'receipt_verification' || tx.type === 'store_addition'
                ).length : 0}
              </span>
              <span className="text-muted-foreground text-sm text-center">
                Sustainable shopping actions
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-600" />
            Boost Your Impact
          </CardTitle>
          <CardDescription>
            Here are some ways to increase your positive environmental impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                <TreePine className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-medium">Add more transportation services to the map</span>
                <p className="text-sm text-muted-foreground">
                  Help others discover great sustainable transportation options
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                <Share2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-medium">Invite friends to join</span>
                <p className="text-sm text-muted-foreground">
                  Amplify your impact by getting your friends to use sustainable transportation too
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-medium">Maintain your streak</span>
                <p className="text-sm text-muted-foreground">
                  Use sustainable transportation regularly to earn streak bonuses
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}