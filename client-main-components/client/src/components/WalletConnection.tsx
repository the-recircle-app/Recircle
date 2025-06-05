import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";
import { vechain } from "../lib/vechain";
import ConnectWalletModal from "./ConnectWalletModal";
import ConnectionCelebration from "./ConnectionCelebration";

const WalletConnection = () => {
  const { isConnected, address, tokenBalance, connecting, connect, disconnect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleConnect = async () => {
    // Auto-connect with VeWorld wallet type
    const success = await connect("VeWorld");
    if (success) {
      // Show celebration animation on successful auto-connect
      setShowCelebration(true);
    } else {
      // Only show modal if auto-connect fails
      setIsModalOpen(true);
    }
  };
  
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleWalletSelection = async (walletType: string) => {
    const success = await connect(walletType);
    if (success) {
      setIsModalOpen(false);
      // Show celebration animation on successful connect from modal too
      setShowCelebration(true);
    }
  };

  return (
    <div className="flex items-center">
      {!isConnected ? (
        <div id="wallet-disconnected">
          <Button 
            className="flex items-center bg-primary text-white font-medium hover:bg-indigo-700 transition duration-150"
            onClick={handleConnect}
            disabled={connecting}
          >
            <i className="fa-solid fa-wallet mr-2"></i>
            {connecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      ) : (
        <div id="wallet-connected">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">VeChain Wallet</span>
              <span className="font-semibold text-sm">{tokenBalance.toFixed(2)} B3TR</span>
            </div>
            <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
              <span className="wallet-address text-sm w-20 md:w-32">{vechain.formatAddress(address)}</span>
              <button 
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={handleDisconnect}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSelectWallet={handleWalletSelection}
        connecting={connecting}
      />
      
      {/* Celebration animation */}
      {showCelebration && (
        <ConnectionCelebration
          isVisible={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}
    </div>
  );
};

export default WalletConnection;
