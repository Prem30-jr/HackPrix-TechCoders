// Notification utility functions
import type { NotificationAction } from "./types" // Import NotificationAction from types file

export class NotificationService {
  private static instance: NotificationService
  private audioContext: AudioContext | null = null
  private notificationPermission: NotificationPermission = "default"

  private constructor() {
    this.initializeAudio()
    this.requestNotificationPermission()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn("Audio context not supported:", error)
    }
  }

  private async requestNotificationPermission() {
    if ("Notification" in window) {
      this.notificationPermission = await Notification.requestPermission()
    }
  }

  // Play success sound
  public playSuccessSound() {
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Success sound: ascending notes
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
      let time = this.audioContext.currentTime

      frequencies.forEach((freq, index) => {
        const osc = this.audioContext!.createOscillator()
        const gain = this.audioContext!.createGain()

        osc.connect(gain)
        gain.connect(this.audioContext!.destination)

        osc.frequency.setValueAtTime(freq, time)
        osc.type = "sine"

        gain.gain.setValueAtTime(0, time)
        gain.gain.linearRampToValueAtTime(0.1, time + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3)

        osc.start(time)
        osc.stop(time + 0.3)

        time += 0.15
      })
    } catch (error) {
      console.warn("Failed to play success sound:", error)
    }
  }

  // Play notification sound
  public playNotificationSound() {
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn("Failed to play notification sound:", error)
    }
  }

  // Show push notification
  public showNotification(
    title: string,
    options: {
      body?: string
      icon?: string
      badge?: string
      tag?: string
      requireInteraction?: boolean
      actions?: NotificationAction[]
    } = {},
  ) {
    if (this.notificationPermission !== "granted") {
      console.warn("Notification permission not granted")
      return null
    }

    try {
      const notification = new Notification(title, {
        body: options.body,
        icon: options.icon || "/favicon.svg",
        badge: options.badge || "/favicon.svg",
        tag: options.tag || "offpay-notification",
        requireInteraction: options.requireInteraction || false,
        silent: false,
        ...options,
      })

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.warn("Failed to show notification:", error)
      return null
    }
  }

  // Payment received notification
  public notifyPaymentReceived(amount: number, sender: string) {
    this.playSuccessSound()

    this.showNotification("💰 Payment Received!", {
      body: `You received ₹${amount.toFixed(2)} from ${sender.substring(0, 8)}...`,
      tag: "payment-received",
      requireInteraction: true,
      actions: [
        { action: "view", title: "View Details" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })

    // Vibrate if supported
    if ("vibrator" in navigator || "vibrate" in navigator) {
      navigator.vibrate?.([200, 100, 200])
    }
  }

  // Payment sent notification
  public notifyPaymentSent(amount: number, recipient: string) {
    this.playSuccessSound()

    this.showNotification("✅ Payment Sent!", {
      body: `Successfully sent ₹${amount.toFixed(2)} to ${recipient.substring(0, 8)}...`,
      tag: "payment-sent",
      requireInteraction: false,
      actions: [
        { action: "view", title: "View Receipt" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })

    // Vibrate if supported
    if ("vibrator" in navigator || "vibrate" in navigator) {
      navigator.vibrate?.([100, 50, 100])
    }
  }

  // QR code generated notification
  public notifyQRGenerated(amount: number) {
    this.playNotificationSound()

    this.showNotification("📱 QR Code Ready", {
      body: `QR code for ₹${amount.toFixed(2)} is ready to share`,
      tag: "qr-generated",
      requireInteraction: false,
    })
  }

  // Error notification
  public notifyError(message: string) {
    if (!this.audioContext) return

    try {
      // Error sound: descending tone
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2)
      oscillator.type = "sawtooth"

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.4)
    } catch (error) {
      console.warn("Failed to play error sound:", error)
    }

    this.showNotification("❌ Payment Error", {
      body: message,
      tag: "payment-error",
      requireInteraction: true,
    })

    // Error vibration pattern
    if ("vibrator" in navigator || "vibrate" in navigator) {
      navigator.vibrate?.([300, 100, 300, 100, 300])
    }
  }

  // Check if notifications are supported
  public isNotificationSupported(): boolean {
    return "Notification" in window
  }

  // Check if audio is supported
  public isAudioSupported(): boolean {
    return this.audioContext !== null
  }

  // Get notification permission status
  public getNotificationPermission(): NotificationPermission {
    return this.notificationPermission
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()
