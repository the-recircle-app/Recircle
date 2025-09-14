import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, Coins, Leaf, ArrowRight, Car, Bus, Zap, Smartphone, Download, Wallet, DollarSign, CheckCircle } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Hero Section */}
      <div className="px-6 pt-16 pb-16 text-center">
        <div className="max-w-2xl mx-auto">
          {/* ReCircle Mascot */}
          <div className="w-32 h-32 mx-auto mb-8">
            <img 
              src="/mascot.png" 
              alt="ReCircle Mascot" 
              className="w-32 h-32 object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6">
            Drive Change, Earn B3TR
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            Transform your commute into rewards. Earn B3TR tokens for sustainable transportation choices like rideshare, electric rentals, and public transit.
          </p>
        </div>
      </div>

      {/* Why Choose ReCircle - Dark Section */}
      <div className="bg-slate-800 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Why Choose ReCircle?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Earn Real Tokens */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Earn Real Tokens</h3>
              <p className="text-gray-300 leading-relaxed">
                Get rewarded with B3TR tokens for sustainable transportation — ridesharing, electric rentals, and public transit
              </p>
            </div>
            
            {/* Boost Rewards */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Boost Rewards</h3>
              <p className="text-gray-300 leading-relaxed">
                Build daily streaks and unlock multipliers for consistent sustainable transportation choices
              </p>
            </div>
            
            {/* Real Impact */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Real Impact</h3>
              <p className="text-gray-300 leading-relaxed">
                B3TR tokens represent real value, verified on VeChain blockchain for genuine environmental impact
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started - Choose Your Way */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            Getting Started - Choose Your Way
          </h2>
          
          <div className="space-y-12">
            {/* Easy Start: Social Login */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Easy Start: Social Login</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Connect with Google, Apple, or email. We'll create a secure blockchain wallet automatically - no app downloads needed.
              </p>
            </div>
            
            {/* Advanced: VeWorld Wallet */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Advanced: VeWorld Wallet</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Download VeWorld for full control. This gives you complete ownership of tokens and works across all VeChain apps.
              </p>
            </div>
            
            {/* Start Earning B3TR Tokens */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Start Earning B3TR Tokens</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Choose your preferred connection method below and start earning real blockchain tokens for sustainable transportation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Start Earning - Purple Gradient Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Start Earning?
          </h2>
          
          <div className="space-y-4">
            <Link href="/home">
              <Button 
                size="lg" 
                className="w-full max-w-md mx-auto flex items-center justify-center bg-white text-purple-700 hover:bg-gray-100 font-semibold py-4 rounded-xl shadow-lg mb-4"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <p className="text-purple-100 text-lg leading-relaxed max-w-md mx-auto">
              Join thousands earning real blockchain tokens for sustainable transportation choices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}