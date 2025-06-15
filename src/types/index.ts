
export interface Transaction {
  id: string;
  amount: number;
  recipient: string;
  sender: string;
  timestamp: number;
  description: string;
  status: 'pending' | 'synced' | 'verified';
  signature?: string;
}

export interface QRData {
  transaction: Transaction;
  publicKey: string;
}

export interface StoredTransaction extends Transaction {
  encryptedData: string;
}

export interface NetworkState {
  isOnline: boolean;
  lastSynced: number | null;
}

export interface UserCredit {
  balance: number;
  history: CreditHistory[];
}

export interface CreditHistory {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  transactionId: string;
  timestamp: number;
  description: string;
}
