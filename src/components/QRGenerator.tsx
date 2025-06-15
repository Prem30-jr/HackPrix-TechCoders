"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import type { Transaction, QRData } from "../types"
import { generateId, signTransaction } from "../utils/crypto"
import { saveTransaction } from "../utils/storage"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { toast } from "./ui/use-toast"
import { Badge } from "./ui/badge"
import { ShieldCheck, Clock, QrCode, Sparkles, Copy, Download } from "lucide-react"

const QRGenerator: React.FC = () => {
  const [amount, setAmount] = useState<string>("")
  const [recipient, setRecipient] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(10)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (qrData && !isExpired) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsExpired(true)
            setQrData(null)
            toast({
              title: "QR Code Expired",
              description: "The QR code has expired. Please generate a new one.",
              variant: "destructive",
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [qrData, isExpired])

  const handleGenerate = () => {
    if (!amount || !recipient) {
      toast({
        title: "Missing information",
        description: "Please enter an amount and recipient.",
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setIsExpired(false)
    setTimeLeft(10)

    const sender = "wallet_" + Math.random().toString(36).substring(2, 6)
    const publicKey = "pk_demo"

    const transaction: Transaction = {
      id: generateId(),
      amount: amountValue,
      recipient,
      sender,
      timestamp: Date.now(),
      description: description || "Transfer",
      status: "pending",
    }

    const fakePrivateKey = "sk_demo"

    const signature = signTransaction(transaction, fakePrivateKey)
    transaction.signature = signature

    const newQrData: QRData = {
      transaction,
      publicKey,
    }

    console.log("Generated QR data:", newQrData)
    const qrString = JSON.stringify(newQrData)
    console.log("QR data string length:", qrString.length)
    console.log("QR data as string:", qrString)

    saveTransaction(transaction)

    setTimeout(() => {
      setQrData(newQrData)
      setIsGenerating(false)

      toast({
        title: "QR Code Generated",
        description: "Transaction has been digitally signed and is ready to share. Valid for 10 seconds.",
      })
    }, 500)
  }

  const handleReset = () => {
    setQrData(null)
    setAmount("")
    setRecipient("")
    setDescription("")
    setIsExpired(false)
    setTimeLeft(10)
  }

  const handleCopyQR = () => {
    if (qrData) {
      navigator.clipboard.writeText(JSON.stringify(qrData))
      toast({
        title: "Copied to clipboard",
        description: "QR code data has been copied to your clipboard.",
      })
    }
  }

  const handleDownloadQR = () => {
    // Implementation for downloading QR code as image
    toast({
      title: "Download started",
      description: "QR code image will be downloaded shortly.",
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!qrData ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center text-xl">
                <QrCode className="h-6 w-6 mr-3" />
                Generate Payment QR
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold">
                    Amount *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8 border-2 border-border/60 focus:border-primary/50 bg-background/50 text-lg font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-sm font-semibold">
                    Recipient *
                  </Label>
                  <Input
                    id="recipient"
                    placeholder="Enter recipient name or address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="border-2 border-border/60 focus:border-primary/50 bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What is this payment for? (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none border-2 border-border/60 focus:border-primary/50 bg-background/50"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-6">
              <Button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    Generate Secure QR Code
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-6"
        >
          <Card className="bg-white shadow-2xl border-0 w-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-6">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-white/20 rounded-full p-3">
                  <ShieldCheck className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">Payment QR Generated</CardTitle>
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-0 font-mono text-xs">
                  ID: {qrData.transaction.signature?.substring(4, 14)}...
                </Badge>
                <div className="flex items-center text-sm bg-white/20 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 mr-1" />
                  {timeLeft}s
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center pt-8 pb-6">
              <div className="relative mb-6">
                <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-gray-100">
                  <QRCodeSVG value={JSON.stringify(qrData)} size={220} level="H" includeMargin className="mx-auto" />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-2">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="text-center w-full">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-3xl font-bold mb-2">
                  ₹{qrData.transaction.amount.toFixed(2)}
                </div>
                <div className="text-muted-foreground mb-1">To</div>
                <div className="font-semibold text-lg mb-4">{qrData.transaction.recipient}</div>
                {qrData.transaction.description && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <div className="text-sm font-medium">{qrData.transaction.description}</div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="bg-muted/30 flex flex-col space-y-3 pt-6">
              <div className="flex space-x-3 w-full">
                <Button variant="outline" onClick={handleCopyQR} className="flex-1 border-2 hover:bg-accent/50">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" onClick={handleDownloadQR} className="flex-1 border-2 hover:bg-accent/50">
                  <Download className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
              <Button
                onClick={handleReset}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                Generate Another QR Code
              </Button>
            </CardFooter>
          </Card>

          <div className="text-xs text-muted-foreground text-center max-w-xs bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <ShieldCheck className="h-4 w-4 inline mr-1 text-green-500" />
            This QR code contains a cryptographically signed transaction and will expire in {timeLeft} seconds. When
            scanned, the recipient's credits will be automatically updated.
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default QRGenerator
