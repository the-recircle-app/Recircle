"use client";
import React, { useEffect, useState } from "react";
import { 
  WalletButton, 
  useWallet as useVeChainKitWallet,
  useLoginWithOAuth,
  useLoginWithPasskey,
  useLoginWithVeChain 
} from "@vechain/vechain-kit";
import { useWallet } from "../context/WalletContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type OAuthProvider = 'google' | 'twitter' | 'apple' | 'discord';

export default function VeChainKitWalletButton() {
  const { account: kitAccount } = useVeChainKitWallet();
  const { connect: appConnect, address: appAddress } = useWallet();
  const [, setLocation] = useLocation();
  const [showIndividualOptions, setShowIndividualOptions] = useState(false);

  // VeChain Kit login hooks
  const { initOAuth } = useLoginWithOAuth();
  const { loginWithPasskey } = useLoginWithPasskey();
  const { login: loginWithVeChainWallet } = useLoginWithVeChain();

  useEffect(() => {
    // When VeChain Kit connects, sync with our app's wallet context and navigate
    if (kitAccount && kitAccount.address && kitAccount.address !== appAddress) {
      console.log('[VECHAIN-KIT] Syncing connection to app context:', kitAccount.address);
      appConnect('vechain-kit', kitAccount.address, { skipCelebration: true }).then((success) => {
        if (success) {
          console.log('[VECHAIN-KIT] Connection successful, navigating to home');
          setLocation('/home');
        }
      });
    }
  }, [kitAccount, appAddress, appConnect, setLocation]);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      console.log(`[VECHAIN-KIT] Initiating ${provider} OAuth login...`);
      await initOAuth({ provider });
      console.log(`${provider} OAuth login initiated successfully`);
    } catch (error) {
      console.error(`[VECHAIN-KIT] ${provider} OAuth login failed:`, error);
    }
  };

  const handlePasskeyLogin = async () => {
    try {
      console.log('[VECHAIN-KIT] Initiating passkey login...');
      await loginWithPasskey();
      console.log('Passkey login initiated successfully');
    } catch (error) {
      console.error('[VECHAIN-KIT] Passkey login failed:', error);
    }
  };

  const handleVeChainWalletLogin = async () => {
    try {
      console.log('[VECHAIN-KIT] Initiating VeChain wallet login...');
      await loginWithVeChainWallet();
      console.log('VeChain wallet login initiated successfully');
    } catch (error) {
      console.error('[VECHAIN-KIT] VeChain wallet login failed:', error);
    }
  };

  if (showIndividualOptions) {
    return (
      <div className="space-y-4 w-full max-w-md">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Choose Your Login Method</h3>
          <p className="text-sm text-gray-600">Select how you'd like to sign in</p>
        </div>

        {/* Social Login Options */}
        <div className="space-y-3">
          <Button 
            onClick={() => handleOAuthLogin('google')} 
            variant="outline" 
            className="w-full"
          >
            🔍 Continue with Google
          </Button>
          
          <Button 
            onClick={() => handleOAuthLogin('apple')} 
            variant="outline" 
            className="w-full"
          >
            🍎 Continue with Apple
          </Button>
          
          <Button 
            onClick={() => handleOAuthLogin('twitter')} 
            variant="outline" 
            className="w-full"
          >
            🐦 Continue with X (Twitter)
          </Button>
          
          <Button 
            onClick={() => handleOAuthLogin('discord')} 
            variant="outline" 
            className="w-full"
          >
            🎮 Continue with Discord
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Alternative Login Methods */}
        <div className="space-y-3">
          <Button 
            onClick={handlePasskeyLogin} 
            variant="outline" 
            className="w-full"
          >
            🔐 Continue with Passkey
          </Button>
          
          <Button 
            onClick={handleVeChainWalletLogin} 
            variant="outline" 
            className="w-full"
          >
            ⛓️ Continue with VeChain Wallet
          </Button>
        </div>

        <Button 
          onClick={() => setShowIndividualOptions(false)} 
          variant="ghost" 
          className="w-full mt-4"
        >
          ← Back to simple login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-md">
      {/* Default VeChain Kit WalletButton */}
      <WalletButton />
      
      <div className="text-center">
        <Button 
          onClick={() => setShowIndividualOptions(true)} 
          variant="link" 
          className="text-sm"
        >
          Or choose specific login method →
        </Button>
      </div>
    </div>
  );
}