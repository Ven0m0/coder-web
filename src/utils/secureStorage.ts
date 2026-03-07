// Secure storage utility using Web Crypto API
const ENCRYPTION_KEY = "opencode_encryption_key";
let cachedKeyPromise: Promise<CryptoKey> | null = null;

// Generate a session-based encryption key
async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKeyPromise) {
    return cachedKeyPromise;
  }

  cachedKeyPromise = (async () => {
    const sessionKey = sessionStorage.getItem(ENCRYPTION_KEY);
    let keyMaterial: ArrayBuffer;

    if (sessionKey) {
      const uint8Array = Uint8Array.from(atob(sessionKey), (c) => c.charCodeAt(0));
      keyMaterial = uint8Array.buffer.slice(0);
    } else {
      const newKey = crypto.getRandomValues(new Uint8Array(32));
      sessionStorage.setItem(ENCRYPTION_KEY, btoa(String.fromCharCode(...newKey)));
      keyMaterial = newKey.buffer.slice(0);
    }

    return crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
  })();

  return cachedKeyPromise;
}

export const SecureStorage = {
  // Generate a session-based encryption key (exposed for testing/initialization)
  getEncryptionKey,

  // Encrypt data
  async encrypt(data: string): Promise<string> {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, dataBuffer);

    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv, 0);
    result.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...result));
  },

  // Decrypt data
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await getEncryptionKey();
      const decoder = new TextDecoder();
      const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
      const iv = encryptedBuffer.slice(0, 12);
      const data = encryptedBuffer.slice(12);

      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

      return decoder.decode(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return "";
    }
  },

  // Store encrypted data in localStorage
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await SecureStorage.encrypt(value);
    localStorage.setItem(key, encrypted);
  },

  // Retrieve and decrypt data from localStorage
  async getItem(key: string): Promise<string | null> {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return await SecureStorage.decrypt(encrypted);
  },

  // Remove item from localStorage
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  // Clear all items
  clear(): void {
    localStorage.clear();
  },
};

// Initialize encryption key on module load
(() => {
  if (typeof window !== "undefined" && window.crypto) {
    SecureStorage.getEncryptionKey();
  }
})();
