// Secure storage utility using Web Crypto API
export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'opencode_encryption_key';
  
  // Generate a session-based encryption key
  private static async getEncryptionKey(): Promise<CryptoKey> {
    const sessionKey = sessionStorage.getItem(this.ENCRYPTION_KEY);
    let keyMaterial: ArrayBuffer;
    
    if (sessionKey) {
      const uint8Array = Uint8Array.from(atob(sessionKey), c => c.charCodeAt(0));
      keyMaterial = uint8Array.buffer.slice(0);
    } else {
      const newKey = crypto.getRandomValues(new Uint8Array(32));
      sessionStorage.setItem(this.ENCRYPTION_KEY, btoa(String.fromCharCode(...newKey)));
      keyMaterial = newKey.buffer.slice(0);
    }
    
    return crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }
  
  // Encrypt data
  static async encrypt(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      dataBuffer
    );
    
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv, 0);
    result.set(encryptedArray, iv.length);
    
    return btoa(String.fromCharCode(...result));
  }
  
  // Decrypt data
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const decoder = new TextDecoder();
      const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const iv = encryptedBuffer.slice(0, 12);
      const data = encryptedBuffer.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );
      
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }
  
  // Store encrypted data in localStorage
  static async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(value);
    localStorage.setItem(key, encrypted);
  }
  
  // Retrieve and decrypt data from localStorage
  static async getItem(key: string): Promise<string | null> {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return await this.decrypt(encrypted);
  }
  
  // Remove item from localStorage
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  // Clear all items
  static clear(): void {
    localStorage.clear();
  }
}

// Initialize encryption key on module load
(() => {
  if (typeof window !== 'undefined' && window.crypto) {
    SecureStorage['getEncryptionKey']();
  }
})();