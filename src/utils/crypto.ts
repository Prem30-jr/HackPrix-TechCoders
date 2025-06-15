

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};


export const encryptData = (data: any, secretKey: string): string => {
  
  const jsonString = JSON.stringify(data);
  return btoa(jsonString);
};


export const decryptData = (encryptedData: string, secretKey: string): any => {
  try {
    const jsonString = atob(encryptedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    return null;
  }
};


export const signTransaction = (transaction: any, privateKey: string): string => {
 
  const dataToSign = `${transaction.id}-${transaction.amount}-${transaction.sender}-${transaction.recipient}`;
  

  let signature = btoa(dataToSign).substring(0, 20);
  return `sig_${signature}`;
};


export const verifySignature = (transaction: any, signature: string, publicKey: string): boolean => {
  console.log("Verifying signature:", { transaction, signature });
  
 
  if (!signature || !signature.startsWith('sig_')) {
    console.warn('Invalid signature format:', signature);
    return false;
  }
  
  if (!transaction.id || 
      typeof transaction.amount !== 'number' || 
      !transaction.sender || 
      !transaction.recipient) {
    console.warn('Invalid transaction format', transaction);
    return false;
  }
  
 
  return true;
};
