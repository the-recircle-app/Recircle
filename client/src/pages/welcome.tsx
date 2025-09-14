import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, Coins, Leaf, ArrowRight, Car, Bus, Zap, Smartphone, Download, Wallet, DollarSign, CheckCircle } from "lucide-react";
import SmartWalletConnect from "@/components/SmartWalletConnect";
import { VeChainKitProviderWrapper } from "@/utils/VeChainKitProvider";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Hero Section */}
      <div className="px-6 pt-16 pb-16 text-center">
        <div className="max-w-2xl mx-auto">
          {/* ReCircle Mascot */}
          <div className="w-48 h-48 mx-auto mb-8">
            <img 
              src="/mascot.png" 
              alt="ReCircle Mascot" 
              className="w-48 h-48 object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight py-2">
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-50">
            Why Choose ReCircle?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Earn Real Tokens */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-500">
                <DollarSign className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-50 mb-4">Earn Real Tokens</h3>
              <p className="text-gray-300 leading-relaxed">
                Get rewarded with B3TR tokens for sustainable transportation — ridesharing, electric rentals, and public transit
              </p>
            </div>
            
            {/* Boost Rewards */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-indigo-500">
                <Zap className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-50 mb-4">Boost Rewards</h3>
              <p className="text-gray-300 leading-relaxed">
                Build daily streaks and unlock multipliers for consistent sustainable transportation choices
              </p>
            </div>
            
            {/* Real Impact */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-purple-600">
                <CheckCircle className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-50 mb-4">Real Impact</h3>
              <p className="text-gray-300 leading-relaxed">
                B3TR tokens represent real value, verified on VeChain blockchain for genuine environmental impact
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started - Choose Your Way */}
      <div className="py-16 px-6 bg-gray-100">
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
                Connect with Google or email. We'll create a secure blockchain wallet automatically - no app downloads needed.
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-50 mb-8">
            Ready to Start Earning?
          </h2>
          
          <div className="space-y-6 max-w-md mx-auto">
            {/* Wallet Connection Options */}
            <VeChainKitProviderWrapper>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-50 mb-4">Choose Your Connection Method</h3>
                  <SmartWalletConnect 
                    onConnect={(address) => {
                      // Navigate to home after connection
                      window.location.href = '/home';
                    }}
                  />
                </div>
                
                <p className="text-purple-100 text-lg leading-relaxed">
                  Join thousands earning real blockchain tokens for sustainable transportation choices.
                </p>
              </div>
            </VeChainKitProviderWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}