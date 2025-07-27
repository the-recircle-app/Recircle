import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertTriangle } from 'lucide-react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onConnect, 
  onDisconnect 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check for existing VeWorld connection on component mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      // Check if VeWorld is available in the browser
      if (typeof window !== 'undefined' && (window as any).vechain) {
        const accounts = await (window as any).vechain.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          setConnectionStatus('connected');
          onConnect?.(accounts[0]);
        }
      }
    } catch (error) {
      console.log('No existing wallet connection found');
    }
  };

  const connectWallet = async () => {
    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      // Check if VeWorld wallet is installed
      if (typeof window === 'undefined' || !(window as any).vechain) {
        throw new Error('VeWorld wallet not detected. Please install VeWorld browser extension.');
      }

      // Request wallet connection
      const accounts = await (window as any).vechain.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        setConnectionStatus('connected');
        onConnect?.(address);
      } else {
        throw new Error('No accounts found');
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setConnectionStatus('idle');
    setErrorMessage('');
    onDisconnect?.();
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Wallet Connected</p>
          <p className="text-xs text-green-600">{formatAddress(walletAddress)}</p>
        </div>
        <button
          onClick={disconnectWallet}
          className="text-xs text-green-700 hover:text-green-900 font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={connectWallet}
        disabled={connectionStatus === 'connecting'}
        className={`
          w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors
          ${connectionStatus === 'connecting' 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 text-white'
          }
        `}
      >
        {getStatusIcon()}
        <span>
          {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Mobile Wallet'}
        </span>
      </button>

      {connectionStatus === 'error' && (
        <div className="flex items-start space-x-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Connection Failed</p>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            {errorMessage.includes('not detected') && (
              <a
                href="https://www.veworld.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-700 hover:text-red-900 underline mt-1 inline-block"
              >
                Download VeWorld Wallet
              </a>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        <p>Connect your VeWorld wallet to start earning B3TR tokens</p>
        <p className="mt-1">Powered by VeChain Thor blockchain</p>
      </div>
    </div>
  );
};

export default WalletConnect;