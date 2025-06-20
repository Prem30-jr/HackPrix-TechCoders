"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Transaction, StoredTransaction } from "../types"
import { getTransactions } from "../utils/storage"
import { syncTransactionToBlockchain } from "../utils/blockchain"
import { getNetworkState } from "../utils/network"
import { useCredits } from "@/hooks/useCredits"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { toast } from "./ui/use-toast"
import { CloudOff, CloudUpload, ArrowDownUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([])
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [isOnline, setIsOnline] = useState<boolean>(getNetworkState().isOnline)
  const { updateCredits } = useCredits()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadTransactions()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Listen for new transactions being added
    const handleTransactionAdded = (event: CustomEvent) => {
      console.log("New transaction added:", event.detail)
      loadTransactions() // Refresh the transaction list

      const { transaction, type } = event.detail
      toast({
        title: `Transaction ${type === "sent" ? "Sent" : "Received"}`,
        description: `₹${transaction.amount.toFixed(2)} ${type === "sent" ? "sent to" : "received from"} ${
          type === "sent" ? transaction.recipient : transaction.sender
        }`,
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("transactionAdded", handleTransactionAdded as EventListener)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("transactionAdded", handleTransactionAdded as EventListener)
    }
  }, [])

  const loadTransactions = () => {
    const storedTransactions = getTransactions()
    setTransactions(storedTransactions.sort((a, b) => b.timestamp - a.timestamp))

    // Load transaction statistics
    const { getTransactionStats } = require("../utils/storage")
    setStats(getTransactionStats())
  }

  const handleSyncAll = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync transactions while offline.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)

    try {
      const pendingTransactions = transactions.filter((t) => t.status === "pending")

      if (pendingTransactions.length === 0) {
        toast({
          title: "No pending transactions",
          description: "All transactions are already synced.",
        })
        setIsSyncing(false)
        return
      }

      for (const transaction of pendingTransactions) {
        await syncTransactionToBlockchain(transaction)

        updateCredits(transaction)
      }

      loadTransactions()

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${pendingTransactions.length} transactions.`,
      })
    } catch (error) {
      console.error("Error syncing transactions:", error)
      toast({
        title: "Sync Failed",
        description: "Failed to sync some transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "synced":
        return <CloudUpload className="h-4 w-4 text-blue-500" />
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "synced":
        return "Synced"
      case "verified":
        return "Verified"
      default:
        return "Unknown"
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Transaction History</h2>
            <p className="text-muted-foreground text-sm">
              {transactions.length} total transaction{transactions.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Button onClick={handleSyncAll} disabled={isSyncing || !isOnline} className="flex items-center">
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

        {/* Transaction Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">₹{stats.totalReceived.toFixed(2)}</div>
                <div className="text-sm text-green-700">Total Received</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">₹{stats.totalSent.toFixed(2)}</div>
                <div className="text-sm text-blue-700">Total Sent</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
                <div className="text-sm text-purple-700">Completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-sm text-orange-700">Pending</div>
              </CardContent>
            </Card>
          </div>
        )}
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
                <p className="text-sm text-muted-foreground">Generate or scan a QR code to create a transaction</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="hover-lift"
              >
                <Card
                  className={`bg-card/80 backdrop-blur-xs border-border/60 ${
                    transaction.description?.startsWith("Received:")
                      ? "border-l-4 border-l-green-500"
                      : transaction.description?.startsWith("Sent:")
                        ? "border-l-4 border-l-blue-500"
                        : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.description?.startsWith("Received:")
                              ? "bg-green-100 text-green-600"
                              : transaction.description?.startsWith("Sent:")
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {transaction.description?.startsWith("Received:") ? (
                            <ArrowDownUp className="h-4 w-4 rotate-180" />
                          ) : transaction.description?.startsWith("Sent:") ? (
                            <ArrowDownUp className="h-4 w-4" />
                          ) : (
                            <ArrowDownUp className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <div
                            className={`font-medium text-lg ${
                              transaction.description?.startsWith("Received:")
                                ? "text-green-600"
                                : transaction.description?.startsWith("Sent:")
                                  ? "text-blue-600"
                                  : "text-foreground"
                            }`}
                          >
                            {transaction.description?.startsWith("Received:") ? "+" : "-"}₹
                            {transaction.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {transaction.id.substring(0, 8)}...</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <Badge
                          variant={transaction.status === "verified" ? "default" : "outline"}
                          className="flex items-center mb-2"
                        >
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{getStatusText(transaction.status)}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between text-sm">
                      <div>
                        <div className="text-muted-foreground">
                          {transaction.description?.startsWith("Received:") ? "From" : "To"}
                        </div>
                        <div className="font-mono">
                          {transaction.description?.startsWith("Received:")
                            ? transaction.sender.substring(0, 12) + "..."
                            : transaction.recipient.substring(0, 12) + "..."}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Type</div>
                        <div
                          className={`font-medium ${
                            transaction.description?.startsWith("Received:")
                              ? "text-green-600"
                              : transaction.description?.startsWith("Sent:")
                                ? "text-blue-600"
                                : "text-foreground"
                          }`}
                        >
                          {transaction.description?.startsWith("Received:")
                            ? "Received"
                            : transaction.description?.startsWith("Sent:")
                              ? "Sent"
                              : "Transfer"}
                        </div>
                      </div>
                    </div>

                    {transaction.description &&
                      !transaction.description.startsWith("Sent:") &&
                      !transaction.description.startsWith("Received:") && (
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
  )
}

export default TransactionList
