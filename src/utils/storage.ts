import type { Transaction, StoredTransaction } from "../types"
import { encryptData, decryptData } from "./crypto"

const STORAGE_KEY = "offpay_transactions"
const SECRET_KEY = "demo_secret_key"

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions()

  const encryptedData = encryptData(transaction, SECRET_KEY)

  const storedTransaction: StoredTransaction = {
    ...transaction,
    encryptedData,
  }

  transactions.push(storedTransaction)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export const getTransactions = (): StoredTransaction[] => {
  const storedData = localStorage.getItem(STORAGE_KEY)
  if (!storedData) {
    return []
  }

  try {
    return JSON.parse(storedData)
  } catch (error) {
    console.error("Failed to parse stored transactions", error)
    return []
  }
}

export const getTransactionById = (id: string): Transaction | null => {
  const transactions = getTransactions()
  const transaction = transactions.find((t) => t.id === id)

  if (!transaction) {
    return null
  }

  try {
    return decryptData(transaction.encryptedData, SECRET_KEY)
  } catch (error) {
    console.error(`Failed to decrypt transaction ${id}`, error)
    return null
  }
}

export const updateTransactionStatus = (id: string, status: Transaction["status"]): boolean => {
  const transactions = getTransactions()
  const index = transactions.findIndex((t) => t.id === id)

  if (index === -1) {
    return false
  }

  const transaction = decryptData(transactions[index].encryptedData, SECRET_KEY)

  transaction.status = status

  transactions[index].status = status
  transactions[index].encryptedData = encryptData(transaction, SECRET_KEY)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))

  return true
}

export const clearTransactions = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

// Add a received transaction (for the receiver's perspective)
export const addReceivedTransaction = (originalTransaction: Transaction): void => {
  const receivedTransaction: Transaction = {
    ...originalTransaction,
    // Swap sender and recipient for receiver's perspective
    sender: originalTransaction.sender,
    recipient: originalTransaction.recipient,
    status: "verified", // Mark as verified since payment was completed
    timestamp: Date.now(), // Update timestamp to when payment was received
    description: `Received: ${originalTransaction.description || "Payment"}`,
  }

  const encryptedData = encryptData(receivedTransaction, SECRET_KEY)

  const storedTransaction: StoredTransaction = {
    ...receivedTransaction,
    encryptedData,
  }

  const transactions = getTransactions()
  transactions.push(storedTransaction)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))

  // Dispatch event to notify components about new transaction
  window.dispatchEvent(
    new CustomEvent("transactionAdded", {
      detail: { transaction: receivedTransaction, type: "received" },
    }),
  )
}

// Add a sent transaction with completed status
export const addSentTransaction = (transaction: Transaction): void => {
  const sentTransaction: Transaction = {
    ...transaction,
    status: "verified", // Mark as verified since payment was completed
    timestamp: Date.now(),
    description: `Sent: ${transaction.description || "Payment"}`,
  }

  const encryptedData = encryptData(sentTransaction, SECRET_KEY)

  const storedTransaction: StoredTransaction = {
    ...sentTransaction,
    encryptedData,
  }

  const transactions = getTransactions()
  transactions.push(storedTransaction)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))

  // Dispatch event to notify components about new transaction
  window.dispatchEvent(
    new CustomEvent("transactionAdded", {
      detail: { transaction: sentTransaction, type: "sent" },
    }),
  )
}

// Get transaction statistics
export const getTransactionStats = (): {
  total: number
  pending: number
  completed: number
  totalSent: number
  totalReceived: number
} => {
  const transactions = getTransactions()

  let totalSent = 0
  let totalReceived = 0
  let pending = 0
  let completed = 0

  transactions.forEach((transaction) => {
    if (transaction.status === "pending") {
      pending++
    } else if (transaction.status === "verified") {
      completed++
    }

    // Check if it's a sent or received transaction based on description
    if (transaction.description?.startsWith("Sent:")) {
      totalSent += transaction.amount
    } else if (transaction.description?.startsWith("Received:")) {
      totalReceived += transaction.amount
    }
  })

  return {
    total: transactions.length,
    pending,
    completed,
    totalSent,
    totalReceived,
  }
}
