"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useUser } from "@clerk/clerk-react"
import Header from "@/components/layout/Header"
import CreditDisplay from "@/components/CreditDisplay"
import BankAccountManager from "@/components/BankAccountManager"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Wallet, Plus } from "lucide-react"
import { useCredits } from "@/hooks/useCredits"
import { toast } from "@/components/ui/use-toast"

const Profile = () => {
  const { user, isLoaded } = useUser()
  const { credits, updateCredits } = useCredits()
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddMoney = async () => {
    if (!amount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount and select a payment method.",
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      })
      return
    }

    if (amountValue > 10000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum amount per transaction is ₹10,000.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create a mock transaction for adding money
      const transaction = {
        id: `add_money_${Date.now()}`,
        amount: amountValue,
        sender: "payment_gateway",
        recipient: user?.id || "user",
        timestamp: Date.now(),
        description: `Added money via ${paymentMethod}`,
        status: "verified" as const,
        signature: `sig_${Math.random().toString(36).substring(2, 15)}`,
      }

      updateCredits(transaction)

      toast({
        title: "Money Added Successfully",
        description: `₹${amountValue.toFixed(2)} has been added to your wallet.`,
      })

      setAmount("")
      setPaymentMethod("")
      setIsAddMoneyOpen(false)
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to add money to your wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account, credits, and bank accounts</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    {user?.profileImageUrl ? (
                      <AvatarImage
                        src={user.profileImageUrl || "/placeholder.svg"}
                        alt={user.fullName || user.username || "User"}
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-1">{user?.fullName || user?.username || "User"}</h2>
                  {user?.emailAddresses && user.emailAddresses.length > 0 && (
                    <p className="text-muted-foreground">{user.emailAddresses[0].emailAddress}</p>
                  )}

                  <div className="mt-6 w-full">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-xl font-bold">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">Member Since</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-xl font-bold">
                          {typeof user?.publicMetadata?.transactionCount === "number"
                            ? user.publicMetadata.transactionCount
                            : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wallet and Add Money */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-6"
          >
            <CreditDisplay />

            {/* Add Money Button */}
            <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Money to Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Add Money to Wallet
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max="10000"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">Minimum: ₹1 | Maximum: ₹10,000</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit Card
                          </div>
                        </SelectItem>
                        <SelectItem value="debit-card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Debit Card
                          </div>
                        </SelectItem>
                        <SelectItem value="upi">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            UPI
                          </div>
                        </SelectItem>
                        <SelectItem value="net-banking">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Net Banking
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddMoneyOpen(false)}
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMoney}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Money
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Bank Account Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-1"
          >
            <BankAccountManager />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile
