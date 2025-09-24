import { useEffect } from 'react';
import { useLocation } from 'wouter';
import SmartWalletConnect from '@/components/SmartWalletConnect';
import { useWallet } from '@/context/WalletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ConnectWalletPage() {
  const [, setLocation] = useLocation();
  const { isConnected } = useWallet();

  // Auto-redirect to home page if already connected
  useEffect(() => {
    if (isConnected) {
      setLocation('/');
    }
  }, [isConnected, setLocation]);

  // Handle successful connection
  const handleConnected = (address: string) => {
    console.log('[CONNECT-PAGE] Wallet connected:', address);
    // Navigate to home page after connection
    setTimeout(() => {
      setLocation('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header with accent gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Connect Form */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <SmartWalletConnect onConnect={handleConnected} />
          </div>
        </div>
        
        {/* Right side - Hero content */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-950 p-8 md:p-16 flex items-center justify-center">
          <div className="max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">Drive Change, Earn B3TR</span>
            </h1>
            
            <div className="space-y-6 text-gray-300">
              <p className="text-xl">
                Transform your commute into rewards. Earn B3TR tokens for sustainable transportation choices like rideshare, EV rentals, and public transit.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-500/10 rounded-full p-2 mr-4 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Earn Tokens</h3>
                    <p className="text-gray-400">Get rewarded with B3TR tokens for sustainable transportation — ride-sharing with Uber/Lyft/Waymo, electric vehicle rentals, and public transit use</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-500/10 rounded-full p-2 mr-4 mt-1">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Boost Rewards</h3>
                    <p className="text-gray-400">Build daily streaks and unlock multipliers for sustainable transportation — shared mobility, electric vehicle rentals, and public transit trips</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-500/10 rounded-full p-2 mr-4 mt-1">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Real Impact</h3>
                    <p className="text-gray-400">B3TR tokens represent real value — earned through sustainable transportation choices that reduce emissions and support cleaner mobility, all verified on VeChain blockchain</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}