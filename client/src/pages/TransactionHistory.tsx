import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';
import { Transaction } from '../types';

const TransactionHistory: React.FC = () => {
  const mockTransactions: Transaction[] = [
    {
      id: 1,
      userId: 102,
      type: 'receipt_verification',
      amount: 8,
      description: 'Tesla Model 3 rental receipt verified',
      txHash: '0x1234...5678',
      referenceId: 101,
      createdAt: new Date('2025-01-05T10:30:00Z'),
    },
    {
      id: 2,
      userId: 102,
      type: 'receipt_verification',
      amount: 3,
      description: 'Uber rideshare trip verified',
      txHash: '0xabcd...efgh',
      referenceId: 102,
      createdAt: new Date('2025-01-04T15:45:00Z'),
    },
    {
      id: 3,
      userId: 102,
      type: 'receipt_verification',
      amount: 5,
      description: 'Metro transit card verified',
      txHash: '0x9876...5432',
      referenceId: 103,
      createdAt: new Date('2025-01-03T09:15:00Z'),
    },
  ];

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-400" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const totalEarned = mockTransactions.reduce((sum, tx) => sum + Math.max(0, tx.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Transaction History</h1>
          <p className="text-gray-300 text-lg">Track your B3TR token earnings and transactions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Earned</CardTitle>
              <ArrowUpRight className="h-4 w-4 ml-auto text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalEarned} B3TR</div>
              <p className="text-xs text-gray-400 mt-1">From {mockTransactions.length} transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Latest Transaction</CardTitle>
              <Clock className="h-4 w-4 ml-auto text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {mockTransactions[0]?.amount || 0} B3TR
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {mockTransactions[0] ? formatDate(mockTransactions[0].createdAt) : 'No transactions'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-400">
              Your B3TR token transaction history on VeChain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center space-x-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    {getTransactionIcon(transaction.type, transaction.amount)}
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-white font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </span>
                      {transaction.txHash && (
                        <>
                          <span className="text-gray-600">•</span>
                          <a 
                            href={`https://explore-testnet.vechain.org/transactions/${transaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            {transaction.txHash.slice(0, 10)}...
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} B3TR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory;