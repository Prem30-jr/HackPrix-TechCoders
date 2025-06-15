
import React from 'react';
import { motion } from 'framer-motion';
import TransactionList from '@/components/TransactionList';
import Header from '@/components/layout/Header';

const Transactions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage your transaction history
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <TransactionList />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 max-w-2xl mx-auto text-center"
        >
          <h3 className="text-lg font-medium mb-4">About Transaction Syncing</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Transactions are stored securely on your device and will automatically 
            sync with the blockchain when you're online. Synced transactions are 
            verified and protected against double-spending.
          </p>
          <p className="text-muted-foreground text-sm">
            The blockchain provides a permanent, tamper-proof record of all transactions, 
            ensuring that your transaction history is always accurate and secure.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Transactions;
