import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWallet } from '@/context/WalletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component that ensures the user has connected their wallet
 * before accessing the wrapped content. Redirects to connect wallet
 * page if not connected.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected, isConnecting } = useWallet();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Give a small delay to prevent flash of content during recovery
    const timer = setTimeout(() => {
      if (!isConnecting && !isConnected) {
        navigate('/connect-wallet');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isConnected, isConnecting, navigate]);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <Card className="w-full max-w-md shadow-xl border-gray-700 bg-gray-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="mb-4">
              <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">Checking Wallet Connection</h2>
            <p className="text-gray-400 text-center mb-4">
              Please wait while we verify your wallet connection...
            </p>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto my-4" 
                 aria-label="Loading" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <Card className="w-full max-w-md shadow-xl border-gray-700 bg-gray-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="mb-4">
              <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">Wallet Connection Required</h2>
            <p className="text-gray-400 text-center mb-4">
              You need to connect your wallet to access this feature.
            </p>
            <Button 
              className="mt-2 w-full"
              onClick={() => navigate('/connect-wallet')}
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}