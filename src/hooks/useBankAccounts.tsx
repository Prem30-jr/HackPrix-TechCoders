"use client"

import { useState, useEffect } from "react"
import type { BankAccount, LinkedBankAccounts } from "@/types"
import { useUser } from "@clerk/clerk-react"
import { toast } from "@/components/ui/use-toast"

const BANK_ACCOUNTS_STORAGE_KEY = "offpay_bank_accounts"

export const useBankAccounts = () => {
  const { user } = useUser()
  const [bankAccounts, setBankAccounts] = useState<LinkedBankAccounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBankAccounts()
    }
  }, [user])

  const loadBankAccounts = () => {
    setIsLoading(true)
    try {
      if (!user) {
        setBankAccounts(null)
        return
      }

      const userKey = `${BANK_ACCOUNTS_STORAGE_KEY}_${user.id}`
      const storedAccounts = localStorage.getItem(userKey)

      if (storedAccounts) {
        setBankAccounts(JSON.parse(storedAccounts))
      } else {
        const initialAccounts: LinkedBankAccounts = {
          accounts: [],
        }
        localStorage.setItem(userKey, JSON.stringify(initialAccounts))
        setBankAccounts(initialAccounts)
      }
    } catch (error) {
      console.error("Failed to load bank accounts:", error)
      toast({
        title: "Error",
        description: "Failed to load your bank accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addBankAccount = async (accountData: Omit<BankAccount, "id" | "isVerified" | "isPrimary" | "addedAt">) => {
    if (!user || !bankAccounts) return false

    try {
      // Check if account already exists
      const existingAccount = bankAccounts.accounts.find(
        (acc) => acc.accountNumber === accountData.accountNumber && acc.ifscCode === accountData.ifscCode,
      )

      if (existingAccount) {
        toast({
          title: "Account Already Exists",
          description: "This bank account is already linked to your profile.",
          variant: "destructive",
        })
        return false
      }

      const newAccount: BankAccount = {
        ...accountData,
        id: crypto.randomUUID(),
        isVerified: false,
        isPrimary: bankAccounts.accounts.length === 0, // First account becomes primary
        addedAt: Date.now(),
      }

      const updatedAccounts: LinkedBankAccounts = {
        accounts: [...bankAccounts.accounts, newAccount],
      }

      const userKey = `${BANK_ACCOUNTS_STORAGE_KEY}_${user.id}`
      localStorage.setItem(userKey, JSON.stringify(updatedAccounts))
      setBankAccounts(updatedAccounts)

      toast({
        title: "Bank Account Added",
        description: "Your bank account has been added successfully. Verification is pending.",
      })

      // Simulate verification process
      setTimeout(() => {
        verifyBankAccount(newAccount.id)
      }, 3000)

      return true
    } catch (error) {
      console.error("Failed to add bank account:", error)
      toast({
        title: "Error",
        description: "Failed to add bank account. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const verifyBankAccount = (accountId: string) => {
    if (!user || !bankAccounts) return

    const updatedAccounts: LinkedBankAccounts = {
      accounts: bankAccounts.accounts.map((acc) => (acc.id === accountId ? { ...acc, isVerified: true } : acc)),
    }

    const userKey = `${BANK_ACCOUNTS_STORAGE_KEY}_${user.id}`
    localStorage.setItem(userKey, JSON.stringify(updatedAccounts))
    setBankAccounts(updatedAccounts)

    toast({
      title: "Account Verified",
      description: "Your bank account has been successfully verified!",
    })
  }

  const setPrimaryAccount = (accountId: string) => {
    if (!user || !bankAccounts) return

    const updatedAccounts: LinkedBankAccounts = {
      accounts: bankAccounts.accounts.map((acc) => ({
        ...acc,
        isPrimary: acc.id === accountId,
      })),
    }

    const userKey = `${BANK_ACCOUNTS_STORAGE_KEY}_${user.id}`
    localStorage.setItem(userKey, JSON.stringify(updatedAccounts))
    setBankAccounts(updatedAccounts)

    toast({
      title: "Primary Account Updated",
      description: "Your primary bank account has been updated.",
    })
  }

  const removeBankAccount = (accountId: string) => {
    if (!user || !bankAccounts) return

    const accountToRemove = bankAccounts.accounts.find((acc) => acc.id === accountId)
    if (!accountToRemove) return

    const updatedAccounts: LinkedBankAccounts = {
      accounts: bankAccounts.accounts.filter((acc) => acc.id !== accountId),
    }

    // If removed account was primary, make the first remaining account primary
    if (accountToRemove.isPrimary && updatedAccounts.accounts.length > 0) {
      updatedAccounts.accounts[0].isPrimary = true
    }

    const userKey = `${BANK_ACCOUNTS_STORAGE_KEY}_${user.id}`
    localStorage.setItem(userKey, JSON.stringify(updatedAccounts))
    setBankAccounts(updatedAccounts)

    toast({
      title: "Account Removed",
      description: "Bank account has been removed from your profile.",
    })
  }

  return {
    bankAccounts,
    isLoading,
    addBankAccount,
    verifyBankAccount,
    setPrimaryAccount,
    removeBankAccount,
    refreshBankAccounts: loadBankAccounts,
  }
}
