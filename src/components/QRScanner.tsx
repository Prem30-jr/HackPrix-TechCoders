import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { QRData, Transaction } from '../types';
import { saveTransaction } from '../utils/storage';
import { syncTransactionToBlockchain } from '../utils/blockchain';
import { verifySignature } from '../utils/crypto';
import { getNetworkState } from '../utils/network';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { Loader2, Check, AlertCircle, Camera, QrCode, Lock } from 'lucide-react';

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<
    'idle' | 'verifying' | 'storing' | 'syncing' | 'complete' | 'error' | 'password_required'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [password, setPassword] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  
  const { updateCredits } = useCredits();

  useEffect(() => {
    checkCameraPermission();
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (scanning && videoRef.current && cameraPermission) {
      startScanning();
    }
  }, [scanning, cameraPermission]);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
    } catch (err) {
      console.error('Camera permission error:', err);
      setCameraPermission(false);
      setErrorMessage('Camera access denied. Please check your browser settings.');
    }
  };

  const startScanning = async () => {
    if (!videoRef.current || !cameraPermission) return;

    try {
      const codeReader = new BrowserQRCodeReader();
      controlsRef.current = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScan(result.getText());
          }
          if (error && error.message !== 'No MultiFormat Readers were able to detect the code.') {
            console.error('QR scan error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setErrorMessage('Failed to start QR scanner. Please try again.');
      setProcessingStatus('error');
    }
  };
  
  const handleScan = (data: string | null) => {
    if (!data) return;
    
    try {
      console.log("QR scan successful, raw data:", data);
      
      let parsedData: QRData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse QR data:", e);
        toast({
          title: "Invalid QR Code",
          description: "The QR code doesn't contain valid transaction data.",
          variant: "destructive"
        });
        throw new Error("Invalid QR data format: not valid JSON");
      }
      
      console.log("Parsed QR data:", parsedData);
      
      if (!parsedData.transaction || !parsedData.publicKey) {
        throw new Error("Invalid QR data format: missing transaction or publicKey");
      }
      
      if (!parsedData.transaction.id || 
          typeof parsedData.transaction.amount !== 'number' || 
          !parsedData.transaction.sender || 
          !parsedData.transaction.recipient) {
        throw new Error("Invalid transaction data structure");
      }
      
      setScannedData(parsedData);
      setScanning(false);
      setProcessingStatus('password_required');
      
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      setErrorMessage('Invalid QR code format. Please try again.');
      setProcessingStatus('error');
      setScanning(false);
    }
  };
  
  const handleError = (err: Error) => {
    console.error('QR Scanner error:', err);
    setErrorMessage('Failed to access camera. Please check your permissions and try again.');
    setProcessingStatus('error');
    setCameraPermission(false);
    setScanning(false);
    
    toast({
      title: "Camera Error",
      description: "Failed to access your camera. Please check your camera permissions.",
      variant: "destructive"
    });
  };
  
  const handleUpload = () => {
    // Implementation for uploading image
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation for handling file change
  };
  
  const handlePasswordSubmit = () => {
    if (password === '2239') {
      setProcessingStatus('verifying');
      if (scannedData) {
        processTransaction(scannedData);
      }
    } else {
      setErrorMessage('Invalid password. Please try again.');
      setProcessingStatus('error');
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const processTransaction = async (data: QRData) => {
    if (!data) return;
    
    try {
      console.log("Processing transaction:", data);
      
      
      setProcessingStatus('verifying');
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      const isValid = verifySignature(
        data.transaction, 
        data.transaction.signature || '', 
        data.publicKey
      );
      
      if (!isValid) {
        console.error("Invalid signature detected");
        setProcessingStatus('error');
        setErrorMessage('Invalid signature. Transaction may be tampered with.');
        return;
      }
      
      // Store locally
      setProcessingStatus('storing');
      await new Promise(resolve => setTimeout(resolve, 300)); 
      saveTransaction(data.transaction);
      
      console.log("Updating credits with transaction:", data.transaction);
     
      updateCredits(data.transaction);
      
      
      const { isOnline } = getNetworkState();
      if (isOnline) {
        setProcessingStatus('syncing');
        await syncTransactionToBlockchain(data.transaction);
      }
      
      setProcessingStatus('complete');
      toast({
        title: "Transaction Processed",
        description: `${data.transaction.amount.toFixed(2)} credits received. ${isOnline 
          ? "Transaction has been verified and synced." 
          : "Transaction will sync when online."}`,
      });
      
    } catch (error) {
      console.error('Error processing transaction:', error);
      setProcessingStatus('error');
      setErrorMessage('An error occurred while processing the transaction.');
      
      toast({
        title: "Error",
        description: "Failed to process the transaction. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const resetScanner = () => {
    setScannedData(null);
    setProcessingStatus('idle');
    setErrorMessage(null);
    startScanning();
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
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
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground opacity-20" />
                  </div>
                  {scanning && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: '100%' }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        ease: "linear"
                      }}
                      className="absolute left-0 right-0 h-0.5 bg-primary z-10"
                    />
                  )}
                </>
              )}
            </div>
          ) : processingStatus === 'password_required' ? (
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Enter Password</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please enter the password to verify and process the transaction
              </p>
              <div className="w-full max-w-xs mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handlePasswordSubmit}
                className="w-full max-w-xs"
              >
                Verify & Process
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white shadow-lg border-border/50">
                <CardContent className="pt-6 pb-4">
                  <div className="flex flex-col items-center text-center">
                    {processingStatus === 'error' ? (
                      <div className="rounded-full bg-red-100 p-3 mb-4">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                    ) : processingStatus === 'complete' ? (
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-green-100 p-4 mb-4 animate-bounce">
                          <Check className="h-10 w-10 text-green-500" />
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 w-full mb-4">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            Payment Received!
                          </div>
                          <div className="text-sm text-green-700">
                            Your transaction has been successfully processed and verified.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-full bg-primary/10 p-3 mb-4">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    )}
                    
                    <h3 className="text-xl font-semibold mb-2">
                      {processingStatus === 'error' ? 'Processing Failed' :
                       processingStatus === 'complete' ? 'Transaction Complete' :
                       'Processing Transaction...'}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {processingStatus === 'error' ? errorMessage :
                       processingStatus === 'verifying' ? 'Verifying transaction signature...' :
                       processingStatus === 'storing' ? 'Storing transaction securely...' :
                       processingStatus === 'syncing' ? 'Syncing to blockchain...' :
                       processingStatus === 'complete' ? 'Your credits have been updated' :
                       'Please wait while we process the transaction'}
                    </p>

                    {processingStatus === 'complete' && scannedData && (
                      <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Amount:</span>
                          <span className="text-sm font-bold text-green-600">
                            {scannedData.transaction.amount.toFixed(2)} credits
                          </span>
                        </div>
                        
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">From:</span>
                          <span className="text-sm font-mono">
                            {scannedData.transaction.sender.substring(0, 6)}...
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">To:</span>
                          <span className="text-sm font-mono">
                            {scannedData.transaction.recipient.substring(0, 6)}...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={resetScanner} 
                    className="w-full"
                    variant={processingStatus === 'complete' || processingStatus === 'error' ? 'default' : 'outline'}
                    disabled={!['complete', 'error'].includes(processingStatus)}
                  >
                    {processingStatus === 'complete' || processingStatus === 'error' ? 'Scan Another' : 'Processing...'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
