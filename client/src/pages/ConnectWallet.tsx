import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Wallet, Shield, Zap, CheckCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const ConnectWallet: React.FC = () => {
  const [, navigate] = useLocation();
  const { connectWallet, walletAddress, isConnecting } = useWallet();
  const [connectionStep, setConnectionStep] = useState(0);

  useEffect(() => {
    if (walletAddress) {
      navigate('/profile');
    }
  }, [walletAddress, navigate]);

  const handleConnect = async () => {
    setConnectionStep(1);
    try {
      await connectWallet();
      setConnectionStep(2);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setConnectionStep(0);
      console.error('Connection failed:', error);
    }
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-green-400" />,
      title: "Secure Connection",
      description: "Your wallet remains secure with VeChain's trusted connection protocol"
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-400" />,
      title: "Instant Rewards",
      description: "Receive B3TR tokens immediately upon receipt verification"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-purple-400" />,
      title: "Verified Transactions",
      description: "All transactions are verified on the VeChain blockchain"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Connect Your VeChain Wallet
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Start earning B3TR tokens for sustainable transportation choices
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connection Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-white text-2xl">Connect Wallet</CardTitle>
              <CardDescription className="text-gray-300">
                Use VeWorld or any VeChain-compatible wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {connectionStep === 0 && (
                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isConnecting ? 'Connecting...' : 'Connect VeChain Wallet'}
                </Button>
              )}

              {connectionStep === 1 && (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-300">Connecting to your wallet...</p>
                </div>
              )}

              {connectionStep === 2 && (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-green-400 font-semibold">Successfully Connected!</p>
                  <p className="text-gray-300 text-sm mt-2">Redirecting to your profile...</p>
                </div>
              )}

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Don't have a VeChain wallet?{' '}
                  <a 
                    href="https://www.veworld.net/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    Download VeWorld
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">Why Connect?</CardTitle>
              <CardDescription className="text-gray-300">
                Benefits of connecting your VeChain wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-300 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-green-900/20 rounded-lg border border-green-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Earn B3TR Tokens</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Upload receipts from rideshare services, electric vehicle rentals, and public transit 
                  to earn B3TR tokens automatically distributed to your wallet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            By connecting your wallet, you agree to our{' '}
            <span className="text-green-400">Terms of Service</span> and{' '}
            <span className="text-green-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;