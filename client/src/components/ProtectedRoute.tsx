import React from 'react';
import { useWallet } from '../context/WalletContext';
import ConnectWallet from '../pages/ConnectWallet';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { wallet } = useWallet();

  if (!wallet.isConnected) {
    return <ConnectWallet />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;