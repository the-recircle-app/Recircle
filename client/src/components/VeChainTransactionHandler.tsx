'use client';

import { useSendTransaction, useWallet, getConfig } from '@vechain/vechain-kit';
import { IB3TR__factory } from '@vechain/vechain-kit/contracts';
import { humanAddress } from '@vechain/vechain-kit/utils';
import { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TransactionHandlerProps {
  recipientAddress: string;
  amount: string;
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
}

export function VeChainTransactionHandler({ 
  recipientAddress, 
  amount, 
  onSuccess, 
  onError 
}: TransactionHandlerProps) {
  const { account } = useWallet();
  const network = 'test'; // Using testnet for now
  const b3trContractAddress = getConfig(network).b3trContractAddress;

  const clauses = useMemo(() => {
    if (!account?.address || !recipientAddress || !amount) return [];

    const B3TRInterface = IB3TR__factory.createInterface();
    
    const clausesArray: any[] = [];
    clausesArray.push({
      to: b3trContractAddress,
      value: '0x0',
      data: B3TRInterface.encodeFunctionData('transfer', [
        recipientAddress,
        amount, // Amount in wei
      ]),
      comment: `Transfer ${amount} B3TR to ${humanAddress(recipientAddress)}`,
      abi: B3TRInterface.getFunction('transfer'),
    });

    return clausesArray;
  }, [account?.address, recipientAddress, amount, b3trContractAddress]);

  const {
    sendTransaction,
    status,
    txReceipt,
    resetStatus,
    isTransactionPending,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? '',
  });

  const handleTransaction = useCallback(async () => {
    if (!clauses.length) return;

    try {
      await sendTransaction(clauses);
      // Success handling will be done through the status state
    } catch (err) {
      console.error('Transaction failed:', err);
      if (onError) {
        onError(err as Error);
      }
    }
  }, [sendTransaction, clauses, onError]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Send B3TR Transaction
          {getStatusDisplay()}
        </CardTitle>
        <CardDescription>
          Transfer {amount} B3TR to {humanAddress(recipientAddress)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleTransaction}
          disabled={isTransactionPending || !clauses.length || !account}
          className="w-full"
        >
          {isTransactionPending ? 'Processing...' : 'Send Transaction'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Transaction failed: {String(error)}
            </p>
          </div>
        )}

        {txReceipt && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Transaction successful! TX ID: {txReceipt.meta?.txID || 'Unknown'}
            </p>
          </div>
        )}

        {status && (
          <Button
            onClick={resetStatus}
            variant="outline"
            className="w-full"
          >
            Reset
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for B3TR balance reading using VeChain Kit
export function useB3TRBalance(address?: string) {
  // This would use the official useGetB3trBalance hook from VeChain Kit
  // For now, we'll create a placeholder that can be easily replaced
  return {
    data: { formatted: '0', original: '0', scaled: '0' },
    isLoading: false,
    isError: false,
  };
}

// Component for displaying B3TR balance
export function B3TRBalanceDisplay({ address }: { address?: string }) {
  const { data: balance, isLoading, isError } = useB3TRBalance(address);

  if (isLoading) {
    return <Badge variant="outline">Loading...</Badge>;
  }

  if (isError) {
    return <Badge variant="destructive">Error loading balance</Badge>;
  }

  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
      {balance?.formatted || '0'} B3TR
    </Badge>
  );
}