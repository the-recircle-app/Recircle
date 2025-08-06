import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, Coins, Leaf, ArrowRight, Car, Bus, Zap, Smartphone, Download, Wallet } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Hero Section */}
      <div className="px-6 pt-12 pb-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-64 h-64 flex items-center justify-center mx-auto mb-0">
            <img 
              src="/mascot.png" 
              alt="ReCircle Mascot" 
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4 -mt-4">
            ReCircle
          </h1>
          <p className="text-xl font-semibold text-foreground mb-2">
            Turn Your Rides Into Rewards
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Earn real blockchain tokens for every sustainable transportation choice. 
            Scan your receipts, make an impact, get rewarded.
          </p>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
          Getting Started
        </h2>
        <div className="grid gap-4 max-w-lg mx-auto">
          <Card className="border-2 border-blue-200 bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">1. Download VeWorld Wallet</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Get the free VeWorld app from your phone's app store. This is a blockchain wallet (different from Apple/Google Pay).
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">2. Create Your Wallet</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Follow VeWorld's setup to create your secure blockchain wallet. Save your backup phrase safely.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scan className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">3. Start Earning</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Connect your VeWorld wallet to ReCircle and start earning tokens for your ride receipts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
          How Earning Works
        </h2>
        <div className="grid gap-4 max-w-lg mx-auto">
          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">1. Upload Your Receipt</h3>
              <p className="text-sm text-muted-foreground">
                Take a screenshot of your Uber, Lyft, Waymo, or public transit receipt
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">2. Make an Impact</h3>
              <p className="text-sm text-muted-foreground">
                Your sustainable choices reduce emissions and support clean transportation
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-foreground">3. Earn B3TR Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Get real blockchain tokens you can trade, spend, or hold for the future
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Supported Transportation */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-center mb-4 text-foreground">
          Supported Transportation
        </h2>
        <div className="flex justify-center gap-8 flex-wrap max-w-md mx-auto">
          <div className="flex flex-col items-center text-center min-w-[90px]">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mb-2 mx-auto">
              <Car className="w-6 h-6 text-green-800" />
            </div>
            <p className="text-sm font-medium text-foreground">Rideshare</p>
          </div>
          <div className="flex flex-col items-center text-center min-w-[90px]">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mb-2 mx-auto">
              <Bus className="w-6 h-6 text-blue-800" />
            </div>
            <p className="text-sm font-medium text-foreground">Public Transit</p>
          </div>
          <div className="flex flex-col items-center text-center min-w-[90px]">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-2 mx-auto">
              <Zap className="w-6 h-6 text-purple-800" />
            </div>
            <p className="text-sm font-medium text-foreground">Electric Vehicles</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-6 mb-8">
        <div className="bg-card rounded-2xl p-6 max-w-md mx-auto shadow-lg border border-border">
          <h2 className="text-xl font-bold text-center mb-4 text-foreground">
            Why ReCircle?
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></div>
              <span className="font-medium text-foreground">Earn up to 18 B3TR tokens per receipt</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex-shrink-0"></div>
              <span className="font-medium text-foreground">Real blockchain tokens with actual value</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-purple-600 rounded-full flex-shrink-0"></div>
              <span className="font-medium text-foreground">Support sustainable transportation</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0"></div>
              <span className="font-medium text-foreground">Track your environmental impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started Button */}
      <div className="px-6">
        <Link href="/home">
          <Button 
            size="lg" 
            className="w-full max-w-md mx-auto flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        
        <p className="text-center text-sm text-muted-foreground font-medium mt-4 max-w-sm mx-auto">
          Ready to connect your VeWorld wallet and start earning rewards?
        </p>
      </div>
    </div>
  );
}