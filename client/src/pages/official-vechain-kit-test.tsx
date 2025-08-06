import React from 'react';
import { VeChainKitProviderWrapper } from '../utils/VeChainKitProvider';
import VeChainKitWalletButton from '../components/VeChainKitWalletButton';

/**
 * Test page for official VeChain Kit implementation
 * Following VeChain Builders Academy documentation
 */
export default function OfficialVeChainKitTest() {
  return (
    <VeChainKitProviderWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Official VeChain Kit</h1>
              <p className="text-gray-300">Following VeChain Builders Academy</p>
            </div>
            
            <VeChainKitWalletButton />
            
            <div className="mt-6 text-xs text-gray-400 text-center">
              <p>Official VeChain Kit Features:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Social Login (Google, Apple, email)</li>
                <li>• Multi-wallet support</li>
                <li>• Fee delegation</li>
                <li>• Mobile VeWorld app support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </VeChainKitProviderWrapper>
  );
}