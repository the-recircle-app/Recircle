import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import VeWorldWalletConnect from "@/components/VeWorldWalletConnect";
import { useWallet } from "@/context/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowRight } from "lucide-react";
import ConnectionCelebration from "@/components/ConnectionCelebration";

export default function DAOWalletConnectPage() {
  const [, setLocation] = useLocation();
  const { isConnected, address, disconnect, tokenBalance } = useWallet();
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  // Handle successful connection
  const handleConnected = () => {
    console.log('Connection success in DAO wallet connect page');
    setConnectionSuccess(true);
    
    // Show celebration animation for connection
    setShowCelebration(true);
    
    // Show success toast
    toast({
      title: "Wallet Connected Successfully",
      description: "You'll be redirected to the home page in a moment",
      duration: 3000,
    });
    
    // Set redirecting status after 1 second
    setTimeout(() => {
      setRedirecting(true);
    }, 1000);
    
    // Automatically navigate to home page after 3 seconds
    setTimeout(() => {
      console.log('Redirecting to home page after connection');
      setLocation('/home');
    }, 3000);
  };

  // Reset connection success when disconnected
  useEffect(() => {
    if (!isConnected) {
      setConnectionSuccess(false);
    }
  }, [isConnected]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        DAO Wallet Connection
      </h1>
      
      <div className="mb-6 text-center">
        <p className="text-muted-foreground">
          Production-ready VeWorld wallet connection for DAO applications
        </p>
      </div>
      
      {/* Celebration animation for successful connection */}
      {showCelebration && (
        <ConnectionCelebration 
          isVisible={showCelebration} 
          onComplete={() => setShowCelebration(false)} 
        />
      )}
      
      {connectionSuccess && isConnected ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Connected</CardTitle>
            <CardDescription>Your VeChain wallet is successfully connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wallet Address:</p>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Token Balance:</p>
                <p className="font-semibold">{tokenBalance} B3TR</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Button 
                    className="flex-1"
                    variant="outline"
                    onClick={() => setLocation('/')}
                  >
                    Go Home
                  </Button>
                  <Button 
                    className="flex-1"
                    variant="destructive"
                    onClick={disconnect}
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          
          {redirecting && (
            <CardFooter className="flex flex-col items-center text-center pt-0">
              <div className="bg-primary/10 w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2">
                <p className="text-sm text-primary">Redirecting to Home</p>
                <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
              </div>
            </CardFooter>
          )}
        </Card>
      ) : (
        <VeWorldWalletConnect onConnect={handleConnected} />
      )}
    </div>
  );
}