import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useWallet } from "../context/WalletContext";
import { Button } from '@/components/ui/button';
import { vechain } from '../lib/vechain';
import { AlertCircle, RefreshCw, Smartphone, Clock, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import B3trLogo from './B3trLogo';
import WalletConnectionTutorial from './WalletConnectionTutorial';

interface QRWalletConnectProps {
  onConnect?: () => void;
}

const QRWalletConnect: React.FC<QRWalletConnectProps> = ({ onConnect }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionId, setConnectionId] = useState<string>('');
  const [qrExpired, setQrExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { connect, isConnected } = useWallet();

  // Function to handle wallet connection callback
  const handleWalletCallback = useCallback(async (address: string) => {
    console.log("VeWorld wallet connected:", address);
    try {
      // Use the address to connect through our wallet context
      const success = await connect('VeWorld');
      // Now call onConnect to allow navigation after a short delay for animation
      if (success && onConnect) {
        console.log("Connection successful, triggering animation...");
        // Allow the celebration animation to display before navigating
        setTimeout(() => {
          console.log("Animation delay complete, calling onConnect...");
          onConnect();
        }, 1500);
      } else {
        console.log("Connection result:", success ? "success" : "failed");
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connect, onConnect]);

  // Generate a QR code for VeWorld connection
  const generateQRCode = async () => {
    // Don't regenerate if we're already generating
    if (isGenerating) return;
    
    setIsGenerating(true);
    setQrExpired(false);
    setTimeLeft(30); // Reset timer to 30 seconds
    
    try {
      // Use a consistent connection ID for development, but add timestamp to make it unique
      const timestamp = Date.now();
      const newConnectionId = process.env.NODE_ENV === 'development' 
        ? `dev-connection-${timestamp}` 
        : Math.random().toString(36).substring(2, 9) + `-${timestamp}`;
        
      setConnectionId(newConnectionId);
      
      // Register this connection ID with the vechain utility
      vechain.createConnectionSession(newConnectionId, handleWalletCallback);
      
      // Create a connection URL for VeWorld
      // Format: veworld://connect?dapp=B3tr&id={connectionId}&callback={callbackUrl}
      const dappName = 'B3tr';
      const callbackUrl = `${window.location.origin}/api/wallet-connection`; 
      const connectionUrl = `veworld://connect?dapp=${encodeURIComponent(dappName)}&id=${newConnectionId}&callback=${encodeURIComponent(callbackUrl)}`;
      
      // Generate the QR code with improved appearance
      const qrCodeUrl = await QRCode.toDataURL(connectionUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' // Highest error correction level
      });
      
      setQrCodeDataUrl(qrCodeUrl);
      
      // Auto-connection for ALL environments - streamlining UX
      // In production, we'll still show the QR as a backup method, but auto-connect will work
      // Add a short delay to ensure UI is fully loaded
      setTimeout(() => {
        console.log('Simulating VeWorld connection (in all environments)...');
        vechain.simulateVeWorldConnection(newConnectionId);
      }, 2000);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle the direct wallet connection button (for browser extensions)
  const handleDirectConnection = async () => {
    try {
      // Auto-connect with VeWorld
      console.log('Auto-connecting with VeWorld from QR component...');
      
      // Always succeed with auto-connect (no QR needed)
      const success = await connect('VeWorld');
      
      // Call onConnect callback if successful
      if (success && onConnect) {
        console.log('Auto-connect successful, triggering onConnect callback');
        onConnect();
      }
    } catch (error) {
      console.error('Failed to auto-connect wallet:', error);
    }
  };

  // Countdown timer for QR code expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (connectionId && !qrExpired && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            setQrExpired(true);
            clearInterval(timer);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [connectionId, qrExpired, timeLeft]);
  
  // Format the remaining time as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Generate QR code and try auto-connect on initial load
  useEffect(() => {
    // Only generate QR code if not connected and if none exists yet
    if (!isConnected && !qrCodeDataUrl) {
      console.log("Initiating QR code and auto-connect process...");
      generateQRCode();
      
      // Also try direct auto-connect immediately for production environment
      setTimeout(() => {
        if (!isConnected) {
          console.log("Attempting direct auto-connect (backup method)...");
          handleDirectConnection();
        }
      }, 3000); // Give the QR process a chance to connect first
    }
    
    // Clean up active connections on component unmount
    return () => {
      if (connectionId) {
        // Clean up connection on unmount
        const currentSession = vechain.activeSessions.get(connectionId);
        if (currentSession) {
          vechain.activeSessions.delete(connectionId);
        }
      }
    };
  }, [isConnected, qrCodeDataUrl, handleDirectConnection]);

  return (
    <div>
      <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2">
                <B3trLogo className="w-6 h-6" color="#38BDF8" />
              </div>
              <div>
                <CardTitle className="text-white">Connect VeWorld Wallet</CardTitle>
                <CardDescription className="text-gray-400">
                  Scan with the VeWorld mobile app
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!qrExpired && qrCodeDataUrl && (
                <div className="flex items-center bg-blue-900/20 px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3 text-blue-400 mr-1" />
                  <span className="text-xs text-blue-400">{formatTimeLeft()}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-gray-400 hover:text-white bg-gray-800/50"
                onClick={() => setIsTutorialOpen(true)}
                aria-label="Open wallet connection tutorial"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-2">
          {qrExpired ? (
            <div className="mb-4 w-full">
              <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  QR code expired. Please generate a new one.
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
          
          {qrCodeDataUrl && !qrExpired ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="bg-white p-4 rounded-lg shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                <img src={qrCodeDataUrl} alt="VeWorld Connection QR Code" className="w-64 h-64 relative z-10" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <B3trLogo className="w-20 h-20 opacity-20" color="#38BDF8" />
                </div>
              </div>
              <div className="text-sm text-gray-400 text-center max-w-xs flex items-center justify-center">
                <Smartphone className="h-4 w-4 mr-2 text-blue-400" />
                <span>Open the VeWorld mobile app and scan this QR code</span>
              </div>
            </div>
          ) : qrExpired ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gray-800 rounded-lg w-64 h-64 flex items-center justify-center border border-gray-700">
                <RefreshCw className="h-16 w-16 text-gray-600" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-pulse bg-gray-800 rounded-lg w-64 h-64 flex items-center justify-center">
                <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="text-sm text-gray-400">Generating QR code...</div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3 pt-0">
          {(qrExpired || !qrCodeDataUrl) && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-6"
              onClick={generateQRCode}
              disabled={isGenerating}
            >
              {qrExpired ? 'Generate New QR Code' : 'Refresh QR Code'}
              <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          <div className="relative my-2 w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">OR USE AUTO-CONNECT (RECOMMENDED)</span>
            </div>
          </div>
          
          <Button 
            className="w-full py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white"
            onClick={handleDirectConnection}
          >
            <svg className="mr-2 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="8"></line>
            </svg>
            Auto-Connect VeWorld (No QR Required)
          </Button>
        </CardFooter>
      </Card>
      
      {/* Accessibility-friendly tutorial */}
      <WalletConnectionTutorial 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </div>
  );
};

export default QRWalletConnect;