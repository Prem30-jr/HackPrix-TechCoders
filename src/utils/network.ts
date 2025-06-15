

import { NetworkState } from '../types';


export const getNetworkState = (): NetworkState => {
  const isOnline = navigator.onLine;
  
  
  const lastSyncedStr = localStorage.getItem('last_synced');
  const lastSynced = lastSyncedStr ? parseInt(lastSyncedStr, 10) : null;
  
  return {
    isOnline,
    lastSynced
  };
};


export const updateLastSynced = (): void => {
  const now = Date.now();
  localStorage.setItem('last_synced', now.toString());
};


export const registerNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
 
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
