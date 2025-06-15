
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getNetworkState, registerNetworkListeners } from '../utils/network';
import { cn } from '@/lib/utils';
import { WifiIcon, WifiOffIcon } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [networkState, setNetworkState] = useState(getNetworkState());
  
  useEffect(() => {
    
    setNetworkState(getNetworkState());
    
   
    const cleanup = registerNetworkListeners(
      
      () => {
        setNetworkState({ ...getNetworkState(), isOnline: true });
      },
      // Offline callback
      () => {
        setNetworkState({ ...getNetworkState(), isOnline: false });
      }
    );
    
    return cleanup;
  }, []);
  
  
  const formatLastSynced = () => {
    if (!networkState.lastSynced) return 'Never synced';
    
    const date = new Date(networkState.lastSynced);
    return `Last sync: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-2"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          transition: { repeat: networkState.isOnline ? 0 : Infinity, duration: 2 }
        }}
      >
        {networkState.isOnline ? (
          <WifiIcon className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOffIcon className="h-4 w-4 text-orange-500" />
        )}
      </motion.div>
      
      <div className="flex flex-col">
        <span className={cn(
          "text-xs font-medium",
          networkState.isOnline ? "text-green-500" : "text-orange-500"
        )}>
          {networkState.isOnline ? "Online" : "Offline"}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatLastSynced()}
        </span>
      </div>
    </motion.div>
  );
};

export default NetworkStatus;
