import React from 'react';
import { VeChainKitWalletConnect } from '../components/VeChainKitWalletConnect';

/**
 * Test page for VeChain Kit wallet connection
 * Use this to test the official VeChain Kit implementation
 */
export default function VeChainKitTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">VeChain Kit Test</h1>
            <p className="text-gray-300">Testing official VeChain Kit wallet connection</p>
          </div>
          
          <VeChainKitWalletConnect />
          
          <div className="mt-6 text-xs text-gray-400 text-center">
            <p>This uses the official VeChain Kit with:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• VeWorld mobile app support</li>
              <li>• Social login capabilities</li>
              <li>• Multi-wallet support</li>
              <li>• Fee delegation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}