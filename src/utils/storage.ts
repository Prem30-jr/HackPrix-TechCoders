import { Transaction, StoredTransaction } from '../types';
import { encryptData, decryptData } from './crypto';

const STORAGE_KEY = 'offpay_transactions';
const SECRET_KEY = 'demo_secret_key'; 


export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  
  
  const encryptedData = encryptData(transaction, SECRET_KEY);
  
  const storedTransaction: StoredTransaction = {
    ...transaction,
    encryptedData
  };
  
  transactions.push(storedTransaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};


export const getTransactions = (): StoredTransaction[] => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    return [];
  }
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Failed to parse stored transactions', error);
    return [];
  }
};


export const getTransactionById = (id: string): Transaction | null => {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    return null;
  }
  
  
  try {
    return decryptData(transaction.encryptedData, SECRET_KEY);
  } catch (error) {
    console.error(`Failed to decrypt transaction ${id}`, error);
    return null;
  }
};


export const updateTransactionStatus = (id: string, status: Transaction['status']): boolean => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index === -1) {
    return false;
  }
  
  
  const transaction = decryptData(transactions[index].encryptedData, SECRET_KEY);
  
  
  transaction.status = status;
  
  
  transactions[index].status = status;
  transactions[index].encryptedData = encryptData(transaction, SECRET_KEY);
  
 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  
  return true;
};


export const clearTransactions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
