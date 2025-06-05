import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useWallet } from '@/context/WalletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component that ensures the user has administrative privileges
 * before accessing the wrapped content. Redirects to home page if not an admin.
 */
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isConnected, isConnecting, address } = useWallet();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First check if user is connected, otherwise wait for connection process
    if (isConnecting) {
      return;
    }

    if (!isConnected) {
      toast({
        title: "Access Denied",
        description: "You need to connect your wallet first.",
        variant: "destructive"
      });
      navigate('/connect-wallet');
      return;
    }

    // Check admin status
    const checkAdminStatus = async () => {
      setIsLoading(true);
      try {
        // Pass wallet address as query parameter for admin check
        const response = await apiRequest('GET', `/api/user/admin-status?walletAddress=${address}`);
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          
          if (!data.isAdmin) {
            toast({
              title: "Access Denied",
              description: "You don't have administrative privileges.",
              variant: "destructive"
            });
            navigate('/');
          }
        } else {
          // Error checking admin status
          console.error('Failed to check admin status');
          toast({
            title: "Error",
            description: "Could not verify your admin privileges. Please try again later.",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Server Error",
          description: "There was a problem connecting to the server.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isConnected, isConnecting, navigate, toast, address]);

  if (isConnecting || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <Card className="w-full max-w-md shadow-xl border-gray-700 bg-gray-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="mb-4">
              <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">Verifying Admin Access</h2>
            <p className="text-gray-400 text-center mb-4">
              Please wait while we verify your administrative credentials...
            </p>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto my-4" 
                 aria-label="Loading" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <Card className="w-full max-w-md shadow-xl border-gray-700 bg-gray-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="mb-4">
              <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">Access Denied</h2>
            <p className="text-gray-400 text-center mb-4">
              You don't have administrative privileges to access this area.
            </p>
            <Button 
              className="mt-2 w-full"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}