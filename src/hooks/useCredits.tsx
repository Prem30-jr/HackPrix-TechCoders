"use client"

import { useState, useEffect } from "react"
import type { UserCredit, CreditHistory, Transaction } from "@/types"
import { useUser } from "@clerk/clerk-react"
import { toast } from "@/components/ui/use-toast"

const CREDITS_STORAGE_KEY = "offpay_credits"

export const useCredits = () => {
  const { user } = useUser()
  const [credits, setCredits] = useState<UserCredit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCredits()
    }
  }, [user])

  const loadCredits = () => {
    setIsLoading(true)
    try {
      if (!user) {
        setCredits(null)
        return
      }

      const userKey = `${CREDITS_STORAGE_KEY}_${user.id}`
      const storedCredits = localStorage.getItem(userKey)

      if (storedCredits) {
        setCredits(JSON.parse(storedCredits))
      } else {
        const initialCredits: UserCredit = {
          balance: 100,
          history: [],
        }

        localStorage.setItem(userKey, JSON.stringify(initialCredits))
        setCredits(initialCredits)
      }
    } catch (error) {
      console.error("Failed to load credits:", error)
      toast({
        title: "Error",
        description: "Failed to load your credit balance",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateCredits = (transaction: Transaction) => {
    if (!user || !credits) return

    const userKey = `${CREDITS_STORAGE_KEY}_${user.id}`
    let newBalance = credits.balance
    let historyEntry: CreditHistory

    // Check if this is an "add money" transaction
    if (transaction.sender === "payment_gateway") {
      newBalance += transaction.amount
      historyEntry = {
        id: crypto.randomUUID(),
        amount: transaction.amount,
        type: "credit",
        transactionId: transaction.id,
        timestamp: Date.now(),
        description: transaction.description || `Added ₹${transaction.amount} to wallet`,
      }
    }
    // Check if user is sending money
    else if (transaction.sender.includes(user.id)) {
      newBalance -= transaction.amount
      historyEntry = {
        id: crypto.randomUUID(),
        amount: transaction.amount,
        type: "debit",
        transactionId: transaction.id,
        timestamp: Date.now(),
        description: `Sent ₹${transaction.amount} to ${transaction.recipient.substring(0, 8)}...`,
      }
    }
    // Check if user is receiving money
    else if (transaction.recipient.includes(user.id)) {
      newBalance += transaction.amount
      historyEntry = {
        id: crypto.randomUUID(),
        amount: transaction.amount,
        type: "credit",
        transactionId: transaction.id,
        timestamp: Date.now(),
        description: `Received ₹${transaction.amount} from ${transaction.sender.substring(0, 8)}...`,
      }
    } else {
      // Transaction doesn't involve this user
      return
    }

    const updatedCredits: UserCredit = {
      balance: Math.max(0, newBalance), // Ensure balance doesn't go negative
      history: [historyEntry, ...credits.history],
    }

    localStorage.setItem(userKey, JSON.stringify(updatedCredits))
    setCredits(updatedCredits)

    toast({
      title: historyEntry.type === "credit" ? "Credits Added" : "Credits Deducted",
      description: historyEntry.description,
    })
  }

  return {
    credits,
    isLoading,
    updateCredits,
    refreshCredits: loadCredits,
  }
}
