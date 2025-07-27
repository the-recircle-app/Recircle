'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    useWallet,
    useBuildTransaction,
    useTransactionModal,
    useTransactionToast,
    TransactionModal,
    TransactionToast,
    getConfig,
} from '@vechain/vechain-kit';
import { IB3TR__factory } from '@vechain/vechain-kit/contracts';
import { humanAddress } from '@vechain/vechain-kit/utils';
import { useCallback } from 'react';
import { CheckCircle2, Coins } from 'lucide-react';

interface VeChainKitB3TRTransferProps {
  recipientAddress: string;
  amount: string;
  onSuccess?: (txReceipt: any) => void;
  onError?: (error: Error) => void;
  description?: string;
  showModal?: boolean;
  showToast?: boolean;
}

export function VeChainKitB3TRTransfer({ 
  recipientAddress, 
  amount, 
  onSuccess, 
  onError,
  description,
  showModal = true,
  showToast = false
}: VeChainKitB3TRTransferProps) {
  const { account } = useWallet();
  const network = 'test'; // Using testnet
  
  // Get B3TR contract address from VeChain Kit config
  const b3trContractAddress = getConfig(network)?.b3trContractAddress;

  const {
    sendTransaction,
    status,
    txReceipt,
    isTransactionPending,
    error,
    resetStatus,
  } = useBuildTransaction({
    clauseBuilder: () => {
      if (!account?.address || !recipientAddress || !amount || !b3trContractAddress) return [];

      return [
        {
          to: b3trContractAddress,
          value: '0x0',
          data: IB3TR__factory.createInterface().encodeFunctionData('transfer', [
            recipientAddress,
            amount // Amount should be in wei format
          ]),
          comment: description || `Transfer ${amount} B3TR to ${humanAddress(recipientAddress)}`,
        },
      ];
    },
    refetchQueryKeys: [], // Add any query keys you want to refetch after success
    onSuccess: () => {
      console.log('✅ VeChain Kit B3TR Transfer Success');
      if (onSuccess && txReceipt) {
        onSuccess(txReceipt);
      }
    },
    onFailure: () => {
      console.error('❌ VeChain Kit B3TR Transfer Failed');
      if (onError && error) {
        onError(new Error(String(error)));
      }
    },
    suggestedMaxGas: undefined,
  });

  const {
    open: openTransactionModal,
    close: closeTransactionModal,
    isOpen: isTransactionModalOpen,
  } = useTransactionModal();

  const {
    open: openTransactionToast,
    close: closeTransactionToast,
    isOpen: isTransactionToastOpen,
  } = useTransactionToast();

  const handleTransactionWithModal = useCallback(async () => {
    if (!account?.address) {
      console.error('No wallet connected');
      return;
    }
    
    openTransactionModal();
    await sendTransaction({});
  }, [sendTransaction, openTransactionModal, account]);

  const handleTransactionWithToast = useCallback(async () => {
    if (!account?.address) {
      console.error('No wallet connected');
      return;
    }
    
    openTransactionToast();
    await sendTransaction({});
  }, [sendTransaction, openTransactionToast, account]);

  const handleTryAgain = useCallback(async () => {
    resetStatus();
    await sendTransaction({});
  }, [sendTransaction, resetStatus]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  if (!account?.address) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please connect your VeWorld wallet to send B3TR tokens
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Send B3TR Tokens
          </CardTitle>
          <CardDescription>
            {description || `Transfer ${amount} B3TR to ${humanAddress(recipientAddress)}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {showModal && (
            <Button
              onClick={handleTransactionWithModal}
              disabled={isTransactionPending || !b3trContractAddress}
              className="w-full"
              size="lg"
            >
              {isTransactionPending ? 'Processing Transaction...' : 'Send with Modal'}
            </Button>
          )}
          
          {showToast && (
            <Button
              onClick={handleTransactionWithToast}
              disabled={isTransactionPending || !b3trContractAddress}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isTransactionPending ? 'Processing Transaction...' : 'Send with Toast'}
            </Button>
          )}

          {!showModal && !showToast && (
            <Button
              onClick={handleTransactionWithModal}
              disabled={isTransactionPending || !b3trContractAddress}
              className="w-full"
              size="lg"
            >
              {isTransactionPending ? 'Processing Transaction...' : 'Send B3TR'}
            </Button>
          )}

          {status === 'success' && txReceipt && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">
                ✅ Transaction Successful!
              </p>
              <p className="text-xs text-green-600 mt-1">
                TX ID: {txReceipt.meta?.txID || 'Unknown'}
              </p>
            </div>
          )}

          {status === 'error' && error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                ❌ Transaction Failed
              </p>
              <p className="text-xs text-red-600 mt-1">
                {String(error)}
              </p>
            </div>
          )}

          {status && (
            <Button
              onClick={resetStatus}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Reset Status
            </Button>
          )}
        </CardContent>
      </Card>

      {/* VeChain Kit Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        status={status}
        txReceipt={txReceipt}
        txError={error}
        onTryAgain={handleTryAgain}
        uiConfig={{
          title: 'B3TR Token Transfer',
          description: description || `Transfer ${amount} B3TR to ${humanAddress(recipientAddress)}`,
          showShareOnSocials: true,
          showExplorerButton: true,
          isClosable: true,
        }}
      />

      {/* VeChain Kit Transaction Toast */}
      <TransactionToast
        isOpen={isTransactionToastOpen}
        onClose={closeTransactionToast}
        status={status}
        txError={error}
        txReceipt={txReceipt}
        onTryAgain={handleTryAgain}
        description={description || `Transfer ${amount} B3TR to ${humanAddress(recipientAddress)}`}
      />
    </>
  );
}

// Hook to convert B3TR amount to wei format
export function useB3TRToWei(amount: number): string {
  // B3TR has 18 decimals like ETH
  const amountInWei = (amount * Math.pow(10, 18)).toString();
  return amountInWei;
}

// Simplified component for redeem functionality
export function VeChainKitRedeemButton({ 
  userAddress, 
  rewardAmount,
  onSuccess
}: { 
  userAddress: string; 
  rewardAmount: number;
  onSuccess?: () => void;
}) {
  const amountInWei = useB3TRToWei(rewardAmount);
  
  return (
    <VeChainKitB3TRTransfer
      recipientAddress={userAddress}
      amount={amountInWei}
      description={`Redeem ${rewardAmount} B3TR reward tokens`}
      onSuccess={onSuccess}
      showModal={true}
      showToast={false}
    />
  );
}