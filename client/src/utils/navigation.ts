/**
 * Smart navigation utilities that route based on wallet connection status
 */
import { useWallet } from '../context/WalletContext';
import { useLocation } from 'wouter';

/**
 * Hook that provides smart navigation - routes to home if wallet connected, welcome if not
 */
export function useSmartNavigation() {
  const { isConnected } = useWallet();
  const [, setLocation] = useLocation();

  const goHome = () => {
    if (isConnected) {
      setLocation('/home');
    } else {
      setLocation('/');
    }
  };

  return { goHome };
}

/**
 * Utility function to get the correct home route based on wallet connection
 * @param isConnected - Whether wallet is connected
 * @returns '/home' if connected, '/' if not connected
 */
export function getHomeRoute(isConnected: boolean): string {
  return isConnected ? '/home' : '/';
}