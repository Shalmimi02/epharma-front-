// src/utils/cryptoService.js
import CryptoJS from 'crypto-js'

class CryptoService {
  constructor() {
    this.secretKey = 'epharma-secret-key-2024'
  }

  async getClientIP() {
    try {
      // Try to get IP from multiple sources
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      // Fallback to local IP detection
      try {
        const response = await fetch('https://httpbin.org/ip')
        const data = await response.json()
        return data.origin
      } catch (fallbackError) {
        // Ultimate fallback - use a machine identifier
        return navigator.userAgent + navigator.language + screen.width + screen.height
      }
    }
  }

  async encryptToken(token) {
    const ip = await this.getClientIP()
    const combinedKey = this.secretKey + ip
    const encrypted = CryptoJS.AES.encrypt(token, combinedKey).toString()
    return encrypted
  }

  async decryptToken(encryptedToken) {
    const ip = await this.getClientIP()
    const combinedKey = this.secretKey + ip
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, combinedKey)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      return decrypted
    } catch (error) {
      throw new Error('Token decryption failed - possible IP mismatch')
    }
  }
}

export default new CryptoService()