"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser"
import type { QRData } from "../types"
import { addSentTransaction } from "../utils/storage"
import { syncTransactionToBlockchain } from "../utils/blockchain"
import { verifySignature } from "../utils/crypto"
import { getNetworkState } from "../utils/network"
import { notificationService } from "../utils/notifications"
import { paymentEventManager } from "../utils/paymentEvents"
import { useCredits } from "@/hooks/useCredits"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { toast } from "./ui/use-toast"
import { Loader2, AlertCircle, QrCode, Lock, Volume2, VolumeX, CheckCircle, RefreshCw } from "lucide-react"

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true)
  const [scannedData, setScannedData] = useState<QRData | null>(null)
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "verifying" | "storing" | "syncing" | "complete" | "error" | "password_required"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [password, setPassword] = useState<string>("")
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)

  const { updateCredits } = useCredits()

  useEffect(() => {
    checkCameraPermission()
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (scanning && videoRef.current && cameraPermission) {
      startScanning()
    }
  }, [scanning, cameraPermission])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      setCameraPermission(true)
    } catch (err) {
      console.error("Camera permission error:", err)
      setCameraPermission(false)
      setErrorMessage("Camera access denied. Please check your browser settings.")
      if (soundEnabled) {
        notificationService.notifyError("Camera access denied. Please check your browser settings.")
      }
    }
  }

  const startScanning = async () => {
    if (!videoRef.current || !cameraPermission) return

    try {
      const codeReader = new BrowserQRCodeReader()
      controlsRef.current = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          handleScan(result.getText())
        }
        if (error && error.message !== "No MultiFormat Readers were able to detect the code.") {
          console.error("QR scan error:", error)
        }
      })
    } catch (err) {
      console.error("Error starting QR scanner:", err)
      setErrorMessage("Failed to start QR scanner. Please try again.")
      setProcessingStatus("error")
      if (soundEnabled) {
        notificationService.notifyError("Failed to start QR scanner. Please try again.")
      }
    }
  }

  const handleScan = (data: string | null) => {
    if (!data) return

    try {
      console.log("QR scan successful, raw data:", data)

      let parsedData: QRData
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        console.error("Failed to parse QR data:", e)
        if (soundEnabled) {
          notificationService.notifyError("The QR code doesn't contain valid transaction data.")
        }
        toast({
          title: "Invalid QR Code",
          description: "The QR code doesn't contain valid transaction data.",
          variant: "destructive",
        })
        throw new Error("Invalid QR data format: not valid JSON")
      }

      console.log("Parsed QR data:", parsedData)

      if (!parsedData.transaction || !parsedData.publicKey) {
        throw new Error("Invalid QR data format: missing transaction or publicKey")
      }

      if (
        !parsedData.transaction.id ||
        typeof parsedData.transaction.amount !== "number" ||
        !parsedData.transaction.sender ||
        !parsedData.transaction.recipient
      ) {
        throw new Error("Invalid transaction data structure")
      }

      // Stop camera
      if (controlsRef.current) {
        controlsRef.current.stop()
      }

      setScannedData(parsedData)
      setScanning(false)
      setProcessingStatus("password_required")

      // Play scan success sound
      if (soundEnabled) {
        notificationService.playNotificationSound()
      }
    } catch (error) {
      console.error("Error parsing QR code data:", error)
      setErrorMessage("Invalid QR code format. Please try again.")
      setProcessingStatus("error")
      setScanning(false)
    }
  }

  const handlePasswordSubmit = () => {
    if (password === "2239") {
      setProcessingStatus("verifying")
      if (scannedData) {
        processTransaction(scannedData)
      }
    } else {
      setErrorMessage("Invalid password. Please try again.")
      setProcessingStatus("error")
      if (soundEnabled) {
        notificationService.notifyError("The password you entered is incorrect. Please try again.")
      }
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect. Please try again.",
        variant: "destructive",
      })
    }
  }

  const processTransaction = async (data: QRData) => {
    if (!data) return

    try {
      console.log("Processing transaction:", data)

      setProcessingStatus("verifying")
      await new Promise((resolve) => setTimeout(resolve, 500))

      const isValid = verifySignature(data.transaction, data.transaction.signature || "", data.publicKey)

      if (!isValid) {
        console.error("Invalid signature detected")
        setProcessingStatus("error")
        setErrorMessage("Invalid signature. Transaction may be tampered with.")
        if (soundEnabled) {
          notificationService.notifyError("Invalid signature. Transaction may be tampered with.")
        }
        return
      }

      // Store locally
      setProcessingStatus("storing")
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("Updating credits with transaction:", data.transaction)
      updateCredits(data.transaction)

      // Add sent transaction to history
      addSentTransaction(data.transaction)

      // Sync to blockchain
      const { isOnline } = getNetworkState()
      if (isOnline) {
        setProcessingStatus("syncing")
        await syncTransactionToBlockchain(data.transaction)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setProcessingStatus("complete")
      setPaymentComplete(true)
      setPaymentDetails({
        amount: data.transaction.amount,
        recipient: data.transaction.recipient,
        sender: data.transaction.sender,
        timestamp: Date.now(),
        transactionId: data.transaction.id,
      })

      // Emit payment events to notify receiver
      console.log("Emitting payment received event for transaction:", data.transaction.id)
      paymentEventManager.emitPaymentReceived(
        data.transaction.id,
        data.transaction.amount,
        data.transaction.recipient,
        data.transaction.sender,
      )

      // Also emit payment sent event
      paymentEventManager.emitPaymentSent(
        data.transaction.id,
        data.transaction.amount,
        data.transaction.recipient,
        data.transaction.sender,
      )

      // Play success sound and show notification
      if (soundEnabled) {
        notificationService.notifyPaymentSent(data.transaction.amount, data.transaction.recipient)
      }

      toast({
        title: "Payment Sent Successfully!",
        description: `₹${data.transaction.amount.toFixed(2)} sent to ${data.transaction.recipient}. Transaction added to history.`,
      })
    } catch (error) {
      console.error("Error processing transaction:", error)
      setProcessingStatus("error")
      setErrorMessage("An error occurred while processing the transaction.")

      if (soundEnabled) {
        notificationService.notifyError("Failed to process the transaction. Please try again.")
      }

      toast({
        title: "Error",
        description: "Failed to process the transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetScanner = () => {
    setScannedData(null)
    setProcessingStatus("idle")
    setErrorMessage(null)
    setPaymentComplete(false)
    setPaymentDetails(null)
    setPassword("")
    setScanning(true)
    setCameraPermission(null)
    checkCameraPermission()
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    if (!soundEnabled) {
      notificationService.playNotificationSound()
    }
    toast({
      title: soundEnabled ? "Sound Disabled" : "Sound Enabled",
      description: soundEnabled ? "Notifications will be silent" : "Sound notifications enabled",
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Sound Toggle Button */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={toggleSound} className="flex items-center gap-2">
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {soundEnabled ? "Sound On" : "Sound Off"}
        </Button>
      </div>

      <Card className="bg-white shadow-lg border-border/50">
        <CardContent className="pt-6">
          {scanning ? (
            <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-muted">
              {cameraPermission === false ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                  <p className="text-center text-sm px-4">Camera access denied. Please check your browser settings.</p>
                </div>
              ) : (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground opacity-20" />
                  </div>
                  {scanning && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                        ease: "linear",
                      }}
                      className="absolute left-0 right-0 h-0.5 bg-primary z-10"
                    />
                  )}
                </>
              )}
            </div>
          ) : processingStatus === "password_required" ? (
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Enter Password</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please enter the password to verify and process the transaction
              </p>

              {scannedData && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4 w-full">
                  <div className="text-sm font-medium mb-2">Transaction Details</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">₹{scannedData.transaction.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-mono">{scannedData.transaction.recipient.substring(0, 12)}...</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full max-w-xs mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password (2239)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordSubmit()
                    }
                  }}
                />
              </div>
              <Button onClick={handlePasswordSubmit} className="w-full max-w-xs">
                Verify & Process Payment
              </Button>
            </div>
          ) : paymentComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-6 mb-6">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.5 }}>
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </motion.div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 w-full mb-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">Payment Sent Successfully!</div>
                  <div className="text-lg text-green-700 mb-4">
                    ₹{paymentDetails?.amount?.toFixed(2)} sent to {paymentDetails?.recipient}
                  </div>
                  <div className="text-sm text-green-600">
                    Your transaction has been processed and the recipient has been notified.
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 w-full mb-4">
                  <div className="text-sm font-medium mb-3">Transaction Summary</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono">{paymentDetails?.transactionId?.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{new Date(paymentDetails?.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-600 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center text-center">
                {processingStatus === "error" ? (
                  <div className="rounded-full bg-red-100 p-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                ) : (
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-2">
                  {processingStatus === "error" ? "Processing Failed" : "Processing Transaction..."}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {processingStatus === "error"
                    ? errorMessage
                    : processingStatus === "verifying"
                      ? "Verifying transaction signature..."
                      : processingStatus === "storing"
                        ? "Storing transaction securely..."
                        : processingStatus === "syncing"
                          ? "Syncing to blockchain..."
                          : "Please wait while we process the transaction"}
                </p>

                {scannedData && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="text-sm font-bold text-primary">
                        ₹{scannedData.transaction.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">To:</span>
                      <span className="text-sm font-mono">{scannedData.transaction.recipient.substring(0, 12)}...</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">From:</span>
                      <span className="text-sm font-mono">{scannedData.transaction.sender.substring(0, 12)}...</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={resetScanner}
            className="w-full"
            variant={paymentComplete || processingStatus === "error" ? "default" : "outline"}
            disabled={
              processingStatus === "verifying" || processingStatus === "storing" || processingStatus === "syncing"
            }
          >
            {paymentComplete || processingStatus === "complete" || processingStatus === "error" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan Another QR Code
              </>
            ) : (
              "Processing..."
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default QRScanner
