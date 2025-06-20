// Payment event management system
export class PaymentEventManager {
  private static instance: PaymentEventManager
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map()

  private constructor() {}

  public static getInstance(): PaymentEventManager {
    if (!PaymentEventManager.instance) {
      PaymentEventManager.instance = new PaymentEventManager()
    }
    return PaymentEventManager.instance
  }

  // Subscribe to payment events
  public subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }
    
    this.eventListeners.get(eventType)!.add(callback)
    
    return () => {
      this.eventListeners.get(eventType)?.delete(callback)
    }
  }

  public emit(eventType: string, data: any): void {
    console.log(`Emitting event: ${eventType}`, data)
    
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error)
        }
      })
    }

    const customEvent = new CustomEvent(eventType, { detail: data })
    window.dispatchEvent(customEvent)

    const eventData = {
      type: eventType,
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(`payment_event_${eventType}_${data.transactionId || Date.now()}`, JSON.stringify(eventData))
    
    setTimeout(() => {
      localStorage.removeItem(`payment_event_${eventType}_${data.transactionId || Date.now()}`)
    }, 30000)
  }

  public initCrossTabCommunication(): void {
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('payment_event_') && event.newValue) {
        try {
          const eventData = JSON.parse(event.newValue)
          const eventType = eventData.type
          
          // Re-emit the event locally
          const listeners = this.eventListeners.get(eventType)
          if (listeners) {
            listeners.forEach(callback => {
              try {
                callback(eventData.data)
              } catch (error) {
                console.error(`Error in cross-tab event listener for ${eventType}:`, error)
              }
            })
          }
        } catch (error) {
          console.error('Error parsing cross-tab event:', error)
        }
      }
    })
  }

  // Payment specific events
  public emitPaymentSent(transactionId: string, amount: number, recipient: string, sender: string): void {
    this.emit('paymentSent', {
      transactionId,
      amount,
      recipient,
      sender,
      timestamp: Date.now()
    })
  }

  public emitPaymentReceived(transactionId: string, amount: number, recipient: string, sender: string): void {
    this.emit('paymentReceived', {
      transactionId,
      amount,
      recipient,
      sender,
      timestamp: Date.now()
    })
  }

  public emitQRExpired(transactionId: string): void {
    this.emit('qrExpired', {
      transactionId,
      timestamp: Date.now()
    })
  }
}

// Export singleton instance
export const paymentEventManager = PaymentEventManager.getInstance()

// Initialize cross-tab communication
paymentEventManager.initCrossTabCommunication()
