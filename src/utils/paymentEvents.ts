// Payment event management system
export class PaymentEventManager {
  private static instance: PaymentEventManager
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map()

  private constructor() {
    // Initialize cross-tab communication immediately
    this.initCrossTabCommunication()
  }

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

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(eventType)?.delete(callback)
    }
  }

  // Emit payment events with multiple delivery methods
  public emit(eventType: string, data: any): void {
    console.log(`🚀 Emitting event: ${eventType}`, data)

    // Method 1: Emit to local listeners immediately
    this.emitToLocalListeners(eventType, data)

    // Method 2: Emit as DOM event
    this.emitDOMEvent(eventType, data)

    // Method 3: Store in localStorage for cross-tab communication
    this.emitToLocalStorage(eventType, data)

    // Method 4: Use BroadcastChannel API if available
    this.emitToBroadcastChannel(eventType, data)

    // Method 5: Use sessionStorage as backup
    this.emitToSessionStorage(eventType, data)
  }

  private emitToLocalListeners(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners && listeners.size > 0) {
      console.log(`📡 Emitting to ${listeners.size} local listeners for ${eventType}`)
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`❌ Error in local listener for ${eventType}:`, error)
        }
      })
    } else {
      console.log(`⚠️ No local listeners found for ${eventType}`)
    }
  }

  private emitDOMEvent(eventType: string, data: any): void {
    try {
      const customEvent = new CustomEvent(eventType, {
        detail: data,
        bubbles: true,
        cancelable: true,
      })
      window.dispatchEvent(customEvent)
      document.dispatchEvent(customEvent)
      console.log(`📢 DOM event emitted for ${eventType}`)
    } catch (error) {
      console.error(`❌ Error emitting DOM event for ${eventType}:`, error)
    }
  }

  private emitToLocalStorage(eventType: string, data: any): void {
    try {
      const eventData = {
        type: eventType,
        data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substring(2, 15),
      }

      const storageKey = `payment_event_${eventType}_${data.transactionId || eventData.id}`
      localStorage.setItem(storageKey, JSON.stringify(eventData))
      console.log(`💾 Event stored in localStorage: ${storageKey}`)

      // Clean up after 60 seconds
      setTimeout(() => {
        localStorage.removeItem(storageKey)
      }, 60000)
    } catch (error) {
      console.error(`❌ Error storing event in localStorage:`, error)
    }
  }

  private emitToBroadcastChannel(eventType: string, data: any): void {
    try {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("payment-events")
        channel.postMessage({
          type: eventType,
          data,
          timestamp: Date.now(),
        })
        console.log(`📻 Event sent via BroadcastChannel for ${eventType}`)
        channel.close()
      }
    } catch (error) {
      console.error(`❌ Error using BroadcastChannel:`, error)
    }
  }

  private emitToSessionStorage(eventType: string, data: any): void {
    try {
      const eventData = {
        type: eventType,
        data,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(`payment_event_latest_${eventType}`, JSON.stringify(eventData))
      console.log(`🗂️ Event stored in sessionStorage for ${eventType}`)
    } catch (error) {
      console.error(`❌ Error storing event in sessionStorage:`, error)
    }
  }

  // Listen for various communication channels
  public initCrossTabCommunication(): void {
    // localStorage events
    window.addEventListener("storage", (event) => {
      if (event.key?.startsWith("payment_event_") && event.newValue) {
        try {
          const eventData = JSON.parse(event.newValue)
          console.log(`📥 Received localStorage event: ${eventData.type}`, eventData.data)
          this.emitToLocalListeners(eventData.type, eventData.data)
        } catch (error) {
          console.error("❌ Error parsing localStorage event:", error)
        }
      }
    })

    // BroadcastChannel events
    if ("BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("payment-events")
        channel.addEventListener("message", (event) => {
          console.log(`📥 Received BroadcastChannel event: ${event.data.type}`, event.data.data)
          this.emitToLocalListeners(event.data.type, event.data.data)
        })
      } catch (error) {
        console.error("❌ Error setting up BroadcastChannel:", error)
      }
    }

    // DOM events
    window.addEventListener("paymentReceived", (event: any) => {
      console.log(`📥 Received DOM paymentReceived event:`, event.detail)
      this.emitToLocalListeners("paymentReceived", event.detail)
    })

    window.addEventListener("paymentSent", (event: any) => {
      console.log(`📥 Received DOM paymentSent event:`, event.detail)
      this.emitToLocalListeners("paymentSent", event.detail)
    })

    console.log("🔄 Cross-tab communication initialized")
  }

  // Payment specific events with enhanced logging
  public emitPaymentSent(transactionId: string, amount: number, recipient: string, sender: string): void {
    console.log(`💸 Emitting payment sent event for transaction: ${transactionId}`)
    this.emit("paymentSent", {
      transactionId,
      amount,
      recipient,
      sender,
      timestamp: Date.now(),
    })
  }

  public emitPaymentReceived(transactionId: string, amount: number, recipient: string, sender: string): void {
    console.log(`💰 Emitting payment received event for transaction: ${transactionId}`)
    this.emit("paymentReceived", {
      transactionId,
      amount,
      recipient,
      sender,
      timestamp: Date.now(),
    })
  }

  public emitQRExpired(transactionId: string): void {
    console.log(`⏰ Emitting QR expired event for transaction: ${transactionId}`)
    this.emit("qrExpired", {
      transactionId,
      timestamp: Date.now(),
    })
  }

  // Debug method to check active listeners
  public getActiveListeners(): Map<string, number> {
    const counts = new Map<string, number>()
    this.eventListeners.forEach((listeners, eventType) => {
      counts.set(eventType, listeners.size)
    })
    return counts
  }
}

// Export singleton instance
export const paymentEventManager = PaymentEventManager.getInstance()

// Global debug helper
if (typeof window !== "undefined") {
  ;(window as any).paymentEventManager = paymentEventManager
}
