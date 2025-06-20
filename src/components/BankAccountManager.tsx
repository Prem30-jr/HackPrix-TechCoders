"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Building2, Plus, CreditCard, CheckCircle, Clock, Star, Trash2, Shield } from "lucide-react"
import { useBankAccounts } from "@/hooks/useBankAccounts"
import { toast } from "@/components/ui/use-toast"

const BankAccountManager = () => {
  const { bankAccounts, isLoading, addBankAccount, setPrimaryAccount, removeBankAccount } = useBankAccounts()
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolderName: "",
    accountType: "" as "savings" | "current" | "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (
      !formData.accountNumber ||
      !formData.confirmAccountNumber ||
      !formData.ifscCode ||
      !formData.bankName ||
      !formData.accountHolderName ||
      !formData.accountType
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return false
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast({
        title: "Account Numbers Don't Match",
        description: "Please ensure both account numbers are identical.",
        variant: "destructive",
      })
      return false
    }

    if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
      toast({
        title: "Invalid Account Number",
        description: "Account number must be between 9 and 18 digits.",
        variant: "destructive",
      })
      return false
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      toast({
        title: "Invalid IFSC Code",
        description: "Please enter a valid IFSC code (e.g., SBIN0001234).",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleAddAccount = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const success = await addBankAccount({
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        accountType: formData.accountType as "savings" | "current",
      })

      if (success) {
        setFormData({
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          bankName: "",
          accountHolderName: "",
          accountType: "",
        })
        setIsAddAccountOpen(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBankIcon = (bankName: string) => {
    // You could expand this to show actual bank logos
    return <Building2 className="h-6 w-6" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Linked Bank Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {bankAccounts?.accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">{getBankIcon(account.bankName)}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{account.bankName}</h4>
                          {account.isPrimary && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.accountHolderName}</p>
                        <p className="text-sm font-mono">
                          ****{account.accountNumber.slice(-4)} • {account.ifscCode}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.isVerified ? "default" : "secondary"} className="text-xs">
                            {account.isVerified ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {account.accountType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!account.isPrimary && account.isVerified && (
                        <Button variant="outline" size="sm" onClick={() => setPrimaryAccount(account.id)}>
                          Set Primary
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Bank Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this bank account? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeBankAccount(account.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {bankAccounts?.accounts.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Bank Accounts Linked</h3>
            <p className="text-muted-foreground mb-4">
              Link your bank account for seamless transactions and withdrawals.
            </p>
          </div>
        )}

        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Add Bank Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  placeholder="Enter full name as per bank records"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
                <Input
                  id="confirmAccountNumber"
                  placeholder="Re-enter account number"
                  value={formData.confirmAccountNumber}
                  onChange={(e) => handleInputChange("confirmAccountNumber", e.target.value)}
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code *</Label>
                <Input
                  id="ifscCode"
                  placeholder="e.g., SBIN0001234"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange("ifscCode", e.target.value.toUpperCase())}
                  maxLength={11}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Security Notice:</p>
                    <p>
                      Your bank details are encrypted and stored securely. We use bank-grade security to protect your
                      information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAccount} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default BankAccountManager
