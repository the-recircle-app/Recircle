import { useMemo, useEffect } from 'react';
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
    
    console.log('[B3TR-TRANSFER] Initiating transfer:', {
      from: account.address,
      to: recipientAddress,
      amount,
      clauses
    });
    
    try {
      await sendTransaction(clauses);
    } catch (err) {
      console.error('[B3TR-TRANSFER] Send failed:', err);
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
