import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/context/WalletContext';
import { 
  Award, 
  Leaf, 
  Recycle, 
  TreePine, 
  Car, 
  Store, 
  Zap, 
  Trophy,
  ExternalLink,
  Share2,
  Calendar,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';

interface ImpactBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  txHash?: string;
  category: 'sustainability' | 'milestones' | 'community' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ImpactMetrics {
  totalImpact: number;
  co2Saved: number;
  receiptsScanned: number;
  storesAdded: number;
  tokensEarned: number;
  currentStreak: number;
  badgesEarned: number;
}

export default function ImpactExplorer() {
  const { isConnected } = useWallet();
  const userId = 102; // Use default user ID
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch user transactions for impact calculation
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/users', userId, 'transactions'],
    enabled: !!userId && isConnected,
  });

  // Fetch user data for metrics
  const { data: userData = {} } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId && isConnected,
  });

  // Calculate impact metrics with safe array checks
  const transactionArray = Array.isArray(transactions) ? transactions : [];
  const userDataSafe = userData || {};
  const impactMetrics: ImpactMetrics = {
    totalImpact: (userData as any)?.tokenBalance || 0,
    co2Saved: (((userData as any)?.tokenBalance || 0) * 0.5),
    receiptsScanned: transactionArray.filter((tx: any) => tx.type === 'receipt_verification').length || 0,
    storesAdded: transactionArray.filter((tx: any) => tx.type === 'store_addition').length || 0,
    tokensEarned: (userData as any)?.tokenBalance || 0,
    currentStreak: (userData as any)?.currentStreak || 0,
    badgesEarned: 0 // Will be calculated from earned badges
  };

  // Define all available badges
  const allBadges: ImpactBadge[] = [
    // Sustainability Badges
    {
      id: 'first_receipt',
      name: 'First Steps',
      description: 'Scanned your first sustainable receipt',
      icon: '🌱',
      earned: impactMetrics.receiptsScanned >= 1,
      earnedDate: transactionArray.find((tx: any) => tx.type === 'receipt_verification')?.createdAt,
      txHash: transactionArray.find((tx: any) => tx.type === 'receipt_verification')?.txHash,
      category: 'sustainability',
      rarity: 'common'
    },
    {
      id: 'five_receipts',
      name: 'Eco Warrior',
      description: 'Scanned 5 sustainable receipts',
      icon: '♻️',
      earned: impactMetrics.receiptsScanned >= 5,
      earnedDate: transactionArray.filter((tx: any) => tx.type === 'receipt_verification')[4]?.createdAt,
      txHash: transactionArray.filter((tx: any) => tx.type === 'receipt_verification')[4]?.txHash,
      category: 'sustainability',
      rarity: 'rare'
    },
    {
      id: 'ten_receipts',
      name: 'Green Champion',
      description: 'Scanned 10 sustainable receipts',
      icon: '🏆',
      earned: impactMetrics.receiptsScanned >= 10,
      category: 'sustainability',
      rarity: 'epic'
    },
    {
      id: 'co2_saver',
      name: 'Carbon Reducer',
      description: 'Saved 10kg of CO₂ emissions',
      icon: '🌍',
      earned: impactMetrics.co2Saved >= 10,
      category: 'sustainability',
      rarity: 'rare'
    },
    // Community Badges
    {
      id: 'first_store',
      name: 'Store Scout',
      description: 'Added your first sustainable store',
      icon: '🏪',
      earned: impactMetrics.storesAdded >= 1,
      earnedDate: transactionArray.find((tx: any) => tx.type === 'store_addition')?.createdAt,
      txHash: transactionArray.find((tx: any) => tx.type === 'store_addition')?.txHash,
      category: 'community',
      rarity: 'common'
    },
    {
      id: 'store_contributor',
      name: 'Community Builder',
      description: 'Added 5 sustainable stores',
      icon: '🏘️',
      earned: impactMetrics.storesAdded >= 5,
      category: 'community',
      rarity: 'epic'
    },
    // Milestone Badges
    {
      id: 'token_milestone_10',
      name: 'Token Collector',
      description: 'Earned 10 B3TR tokens',
      icon: '💰',
      earned: impactMetrics.tokensEarned >= 10,
      category: 'milestones',
      rarity: 'common'
    },
    {
      id: 'token_milestone_50',
      name: 'Token Master',
      description: 'Earned 50 B3TR tokens',
      icon: '💎',
      earned: impactMetrics.tokensEarned >= 50,
      category: 'milestones',
      rarity: 'rare'
    },
    // Streak Badges
    {
      id: 'streak_3',
      name: 'Consistent',
      description: 'Maintained a 3-day streak',
      icon: '🔥',
      earned: impactMetrics.currentStreak >= 3,
      category: 'streak',
      rarity: 'common'
    },
    {
      id: 'streak_7',
      name: 'Weekly Warrior',
      description: 'Maintained a 7-day streak',
      icon: '⚡',
      earned: impactMetrics.currentStreak >= 7,
      category: 'streak',
      rarity: 'rare'
    }
  ];

  // Update badges earned count
  const earnedBadges = allBadges.filter(badge => badge.earned);
  impactMetrics.badgesEarned = earnedBadges.length;

  // Filter badges by category
  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : allBadges.filter(badge => badge.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const shareImpact = () => {
    const text = `I've earned ${impactMetrics.badgesEarned} sustainability badges and saved ${impactMetrics.co2Saved.toFixed(1)}kg of CO₂ with @RecircleRewards! 🌱 #Sustainability #VeChain #Web3`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Sustainability Impact',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
      // You could add a toast notification here
    }
  };

  const openVeChainExplorer = (txHash: string) => {
    const url = `https://explore-testnet.vechain.org/transactions/${txHash}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-300 text-gray-900 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Impact Explorer
            </h1>
            <p className="text-gray-600">
              Track your sustainability journey and environmental impact
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for center alignment */}
        </div>

        {/* Impact Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{impactMetrics.badgesEarned}</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{impactMetrics.co2Saved.toFixed(1)}kg</div>
              <div className="text-sm text-gray-600">CO₂ Saved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{impactMetrics.receiptsScanned}</div>
              <div className="text-sm text-gray-600">Receipts Scanned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{impactMetrics.tokensEarned}</div>
              <div className="text-sm text-gray-600">B3TR Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={shareImpact} className="bg-green-600 text-white hover:bg-green-700 border-green-600">
            <Share2 className="h-4 w-4 mr-2" />
            Share Impact
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>

        {/* Badge Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Badge Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
                <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
                <TabsTrigger value="sustainability" className="text-xs md:text-sm">Green</TabsTrigger>
                <TabsTrigger value="community" className="text-xs md:text-sm">Community</TabsTrigger>
                <TabsTrigger value="milestones" className="text-xs md:text-sm">Milestones</TabsTrigger>
                <TabsTrigger value="streak" className="text-xs md:text-sm">Streak</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((badge) => (
                <Card 
                  key={badge.id} 
                  className={`transition-all duration-200 ${
                    badge.earned 
                      ? 'bg-gradient-to-br from-white to-green-50 border-green-200 shadow-md' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{badge.icon}</div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(badge.rarity)}`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                    
                    <h3 className={`font-semibold mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-sm mb-3 ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                      {badge.description}
                    </p>
                    
                    {badge.earned ? (
                      <div className="space-y-2">
                        {badge.earnedDate && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            Earned {new Date(badge.earnedDate).toLocaleDateString()}
                          </div>
                        )}
                        {badge.txHash && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => openVeChainExplorer(badge.txHash!)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View on VeChain
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Not earned yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Progress to Next Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Next receipt milestone */}
            {impactMetrics.receiptsScanned < 10 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Green Champion Badge</span>
                  <span>{impactMetrics.receiptsScanned}/10 receipts</span>
                </div>
                <Progress value={(impactMetrics.receiptsScanned / 10) * 100} />
              </div>
            )}
            
            {/* Next CO2 milestone */}
            {impactMetrics.co2Saved < 10 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Carbon Reducer Badge</span>
                  <span>{impactMetrics.co2Saved.toFixed(1)}/10 kg CO₂</span>
                </div>
                <Progress value={(impactMetrics.co2Saved / 10) * 100} />
              </div>
            )}
            
            {/* Next token milestone */}
            {impactMetrics.tokensEarned < 50 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Token Master Badge</span>
                  <span>{impactMetrics.tokensEarned}/50 B3TR</span>
                </div>
                <Progress value={(impactMetrics.tokensEarned / 50) * 100} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}