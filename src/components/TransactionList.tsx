import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, StoredTransaction } from '../types';
import { getTransactions } from '../utils/storage';
import { syncTransactionToBlockchain } from '../utils/blockchain';
import { getNetworkState } from '../utils/network';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from './ui/use-toast';
import { 
  CloudOff, 
  CloudUpload, 
  ArrowDownUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(getNetworkState().isOnline);
  const { updateCredits } = useCredits();
  
  useEffect(() => {
    loadTransactions();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const loadTransactions = () => {
    const storedTransactions = getTransactions();
    setTransactions(storedTransactions.sort((a, b) => b.timestamp - a.timestamp));
  };
  
  const handleSyncAll = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync transactions while offline.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const pendingTransactions = transactions.filter(
        t => t.status === 'pending'
      );
      
      if (pendingTransactions.length === 0) {
        toast({
          title: "No pending transactions",
          description: "All transactions are already synced."
        });
        setIsSyncing(false);
        return;
      }
      
      for (const transaction of pendingTransactions) {
        await syncTransactionToBlockchain(transaction);
        
        updateCredits(transaction);
      }
      
      loadTransactions();
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${pendingTransactions.length} transactions.`
      });
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync some transactions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'synced':
        return <CloudUpload className="h-4 w-4 text-blue-500" />;
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'synced':
        return 'Synced';
      case 'verified':
        return 'Verified';
      default:
        return 'Unknown';
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-muted-foreground text-sm">
            {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button
          onClick={handleSyncAll}
          disabled={isSyncing || !isOnline}
          className="flex items-center"
        >
          {isSyncing ? (
            <>
              <CloudUpload className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : isOnline ? (
            <>
              <CloudUpload className="mr-2 h-4 w-4" />
              Sync All
            </>
          ) : (
            <>
              <CloudOff className="mr-2 h-4 w-4" />
              Offline
            </>
          )}
        </Button>
      </div>
      
      <AnimatePresence>
        {transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-muted/30 border-dashed border-muted">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <ArrowDownUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Generate or scan a QR code to create a transaction
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="hover-lift"
              >
                <Card className="bg-card/80 backdrop-blur-xs border-border/60">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {transaction.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {transaction.id.substring(0, 8)}...
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <Badge 
                          variant={transaction.status === 'verified' ? "default" : "outline"}
                          className="flex items-center mb-2"
                        >
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{getStatusText(transaction.status)}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-sm">
                      <div>
                        <div className="text-muted-foreground">From</div>
                        <div className="font-mono">{transaction.sender.substring(0, 8)}...</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">To</div>
                        <div className="font-mono">{transaction.recipient.substring(0, 8)}...</div>
                      </div>
                    </div>
                    
                    {transaction.description && (
                      <div className="mt-4 pt-3 border-t border-border/60">
                        <div className="text-xs text-muted-foreground mb-1">Description</div>
                        <div className="text-sm">{transaction.description}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionList;
