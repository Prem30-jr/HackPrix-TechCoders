
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRScanner from '@/components/QRScanner';
import Header from '@/components/layout/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Camera } from 'lucide-react';

const Scan = () => {
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  
  
  useEffect(() => {
    checkCameraPermission();
  }, []);
  
  const checkCameraPermission = async () => {
    try {
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        stream.getTracks().forEach(track => track.stop());
        setShowPermissionHelp(false);
      }
    } catch (err) {
      console.error('Camera permission check failed:', err);
      setShowPermissionHelp(true);
    }
  };
  
  const handleError = () => {
    setShowPermissionHelp(true);
  };
  
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
          <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
          <p className="text-muted-foreground">
            Scan a QR code to securely receive a transaction
          </p>
        </motion.div>
        
        {showPermissionHelp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 max-w-md mx-auto"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Camera Permission Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to scan QR codes.
                Look for the camera icon in your address bar to manage permissions.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <QRScanner />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 max-w-2xl mx-auto text-center"
        >
          <h3 className="text-lg font-medium mb-4">About QR Code Scanning</h3>
          <p className="text-muted-foreground text-sm mb-4">
            When you scan a QR code, the transaction data is verified using a simplified
            signature process. This makes scanning faster while still ensuring data integrity.
          </p>
          <p className="text-muted-foreground text-sm">
            The transaction is securely stored locally and will be synchronized with 
            the blockchain when your device is online.
          </p>
          
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <Camera className="h-5 w-5 mr-2 text-muted-foreground" />
              <h4 className="text-md font-medium">Camera Permissions</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              This app requires camera access to scan QR codes. If prompted, please allow camera permissions. 
              You can always change these settings in your browser or device settings later.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Scan;
