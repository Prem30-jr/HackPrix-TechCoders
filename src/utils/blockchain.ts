import * as CryptoJS from 'crypto-js';
import { getTransactions, updateTransactionStatus } from './storage';
import { verifySignature } from './crypto';

const BLOCKCHAIN_STORAGE_KEY = 'offpay_blockchain';
interface Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
}

class Blockchain {
  private chain: Block[];
  private difficulty: number;

  constructor() {
    const storedChain = localStorage.getItem(BLOCKCHAIN_STORAGE_KEY);
    if (storedChain) {
      try {
        this.chain = JSON.parse(storedChain);
        if (!this.isChainValid()) {
          console.error('Loaded blockchain is invalid, creating new chain');
          this.chain = [this.createGenesisBlock()];
        }
      } catch (error) {
        console.error('Failed to load blockchain:', error);
        this.chain = [this.createGenesisBlock()];
      }
    } else {
      this.chain = [this.createGenesisBlock()];
    }
    this.difficulty = 2; 
  }
  private saveChain(): void {
    try {
      localStorage.setItem(BLOCKCHAIN_STORAGE_KEY, JSON.stringify(this.chain));
    } catch (error) {
      console.error('Failed to save blockchain:', error);
    }
  }
  private createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: Date.now(),
      data: "Genesis Block",
      previousHash: "0".repeat(64),
      hash: this.calculateHash(0, Date.now(), "Genesis Block", "0".repeat(64), 0),
      nonce: 0
    };
  }
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
  private calculateHash(index: number, timestamp: number, data: any, previousHash: string, nonce: number): string {
    return CryptoJS.SHA256(
      index + timestamp + JSON.stringify(data) + previousHash + nonce
    ).toString();
  }
  mineBlock(data: any): Block {
    try {
      const previousBlock = this.getLatestBlock();
      const newIndex = previousBlock.index + 1;
      const timestamp = Date.now();
      let nonce = 0;
      let hash: string;

      // Proof of work
      do {
        nonce++;
        hash = this.calculateHash(newIndex, timestamp, data, previousBlock.hash, nonce);
      } while (!hash.startsWith('0'.repeat(this.difficulty)));
      const newBlock: Block = {
        index: newIndex,
        timestamp,
        data,
        previousHash: previousBlock.hash,
        hash,
        nonce
      };

      this.chain.push(newBlock);
      this.saveChain(); 
      return newBlock;
    } catch (error) {
      console.error('Mining failed:', error);
      throw new Error('Failed to mine block');
    }
  }

  // Validation
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      //Verify 
      const calculatedHash = this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
        currentBlock.nonce
      );

      if (currentBlock.hash !== calculatedHash) {
        console.log('Invalid hash in block:', currentBlock.index);
        return false;
      }
      //Verify chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log('Invalid previous hash in block:', currentBlock.index);
        return false;
      }
    }
    return true;
  }
  getChain(): Block[] {
    return this.chain;
  }

  //Add a new transaction to the blockchain(mining)
  addTransaction(transaction: any): Block {
    if (!transaction || !transaction.id) {
      throw new Error('Invalid transaction data');
    }
    const existingTransaction = this.chain.some(block => 
      block.data && block.data.id === transaction.id
    );
    
    if (existingTransaction) {
      throw new Error('Transaction already exists in blockchain');
    }
    
    return this.mineBlock(transaction);
  }
}
export const blockchain = new Blockchain();
export const syncTransactionToBlockchain = async (transaction: any): Promise<boolean> => {
  try {
    console.log(`Syncing transaction ${transaction.id} to blockchain...`);
    const newBlock = blockchain.addTransaction(transaction);
    const isValid = blockchain.isChainValid();
    if (!isValid) {
      throw new Error('Blockchain validation failed after adding transaction');
    }
    console.log(`Transaction ${transaction.id} successfully synced to block ${newBlock.index}`);
    return true;
  } catch (error) {
    console.error(`Failed to sync transaction ${transaction.id}:`, error);
    return false;
  }
};
export const syncPendingTransactions = async (): Promise<{
  success: number;
  failed: number;
}> => {
  console.log('Syncing all pending transactions...');
  const transactions = getTransactions();
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  let success = 0;
  let failed = 0;  
  for (const transaction of pendingTransactions) {
    try {
      const synced = await syncTransactionToBlockchain(transaction);
      if (synced) {
        success++;
        updateTransactionStatus(transaction.id, 'synced');
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Error syncing transaction:', error);
      failed++;
    }
  }
  
  return { success, failed };
};
export const verifyTransaction = async (
  transaction: any,
  signature: string,
  publicKey: string
): Promise<boolean> => {
  try {
    console.log(`Verifying transaction ${transaction.id}...`);
    const isSignatureValid = verifySignature(transaction, signature, publicKey);
    if (!isSignatureValid) {
      return false;
    }
    const chain = blockchain.getChain();
    const transactionExists = chain.some(block => 
      block.data && block.data.id === transaction.id
    );
    
    if (transactionExists) {
      updateTransactionStatus(transaction.id, 'verified');
      console.log(`Transaction ${transaction.id} verified successfully`);
      return true;
    }
    
    console.error(`Transaction ${transaction.id} not found in blockchain`);
    return false;
  } catch (error) {
    console.error(`Transaction ${transaction.id} verification failed:`, error);
    return false;
  }
};