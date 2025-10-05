import { useMemo, useEffect, useState } from 'react';
import { useWallet, useSendTransaction } from '@vechain/vechain-kit';
import { Interface } from '@ethersproject/abi';
import { parseUnits } from '@ethersproject/units';

const B3TR_CONTRACT_ADDRESS = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';

const VIP180_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  }
];

interface B3TRTransferProps {
  recipientAddress: string;
  amount: string;
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
  children: (props: {
    sendTransfer: () => Promise<void>;
    isPending: boolean;
    error: Error | null;
    txReceipt: any;
  }) => React.ReactNode;
}

export function B3TRTransfer({ 
  recipientAddress, 
  amount, 
  onSuccess, 
  onError,
  children 
}: B3TRTransferProps) {
  const { account } = useWallet();
  const [vthoBalance, setVthoBalance] = useState<string | null>(null);
  
  useEffect(() => {
    async function checkVTHOBalance() {
      if (!account?.address) return;
      
      try {
        const response = await fetch(`/api/vtho-balance/${account.address}`);
        if (response.ok) {
          const data = await response.json();
          setVthoBalance(data.vtho);
          
          console.log('[FEE-DELEGATION] VTHO Balance Check:', {
            address: account.address,
            vthoBalance: data.vtho,
            willUseDelegation: parseFloat(data.vtho) < 10 ? 'YES - VeChain Energy VIP-191' : 'NO - User pays own gas',
            threshold: '10 VTHO'
          });
        }
      } catch (error) {
        console.error('[FEE-DELEGATION] Failed to fetch VTHO balance:', error);
      }
    }
    
    checkVTHOBalance();
  }, [account?.address]);
  
  const clauses = useMemo(() => {
    if (!recipientAddress || !amount) return [];
    
    const b3trInterface = new Interface(VIP180_ABI);
    
    const amountInWei = parseUnits(amount, 18).toString();
    
    return [{
      to: B3TR_CONTRACT_ADDRESS,
      value: '0x0',
      data: b3trInterface.encodeFunctionData('transfer', [
        recipientAddress,
        amountInWei,
      ]),
      comment: `Transfer ${amount} B3TR tokens`,
    }];
  }, [recipientAddress, amount]);
  
  const { 
    sendTransaction, 
    status, 
    txReceipt, 
    isTransactionPending, 
    error 
  } = useSendTransaction({
    signerAccountAddress: account?.address,
  });
  
  useEffect(() => {
    if (txReceipt?.meta?.txID && onSuccess) {
      onSuccess(txReceipt.meta.txID);
    }
  }, [txReceipt, onSuccess]);
  
  useEffect(() => {
    if (error && onError) {
      console.error('[B3TR-TRANSFER] Transaction failed:', error);
      onError(error as unknown as Error);
    }
  }, [error, onError]);
  
  const sendTransfer = async () => {
    if (!account?.address) {
      const noAccountError = new Error('No wallet connected');
      console.error('[B3TR-TRANSFER]', noAccountError);
      if (onError) onError(noAccountError);
      return;
    }
    
    if (clauses.length === 0) {
      const invalidParamsError = new Error('Invalid transfer parameters');
      console.error('[B3TR-TRANSFER]', invalidParamsError);
      if (onError) onError(invalidParamsError);
      return;
    }
    
    const willDelegate = vthoBalance && parseFloat(vthoBalance) < 10;
    
    console.log('[B3TR-TRANSFER] 🚀 Initiating VIP-191 Transfer:', {
      from: account.address,
      to: recipientAddress,
      amount,
      vthoBalance: vthoBalance || 'checking...',
      feeDelegation: willDelegate ? '✅ ENABLED - VeChain Energy will sponsor' : '❌ DISABLED - User pays own gas',
      clauses
    });
    
    try {
      const txResult = await sendTransaction(clauses);
      console.log('[B3TR-TRANSFER] ✅ Transaction submitted successfully!', {
        result: txResult,
        feeDelegation: willDelegate ? 'SPONSORED by VeChain Energy' : 'SELF-PAID by user'
      });
    } catch (err) {
      console.error('[B3TR-TRANSFER] ❌ Transaction failed:', err);
      if (onError) onError(err as Error);
    }
  };
  
  return children({
    sendTransfer,
    isPending: isTransactionPending,
    error: error as unknown as Error | null,
    txReceipt
  });
}
