// Secure storage utility for encrypting API keys
import { toast } from 'sonner';

// Generate a session-based encryption key
export const generateEncryptionKey = (): string => {
  const sessionKey = sessionStorage.getItem('opencode_encryption_key');
  if (sessionKey) {
    return sessionKey;
  }
  
  const newKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  sessionStorage.setItem('opencode_encryption_key', newKey);
  return newKey;
};

// Encryption function
export const encryptData = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key.padEnd(32, '0').slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyBuffer,
    dataBuffer
  );
  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv, 0);
  result.set(encryptedArray, iv.length);
  return btoa(String.fromCharCode(...result));
};

// Decryption function
export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  const decoder = new TextDecoder();
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = encryptedBuffer.slice(0, 12);
  const data = encryptedBuffer.slice(12);
  const keyBuffer = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key.padEnd(32, '0').slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    keyBuffer,
    data
  );
  return decoder.decode(decrypted);
};

// Save encrypted API key
export const saveApiKey = async (provider: string, apiKey: string): Promise<void> => {
  try {
    const encryptionKey = generateEncryptionKey();
    const encryptedKey = await encryptData(apiKey, encryptionKey);
    localStorage.setItem(`opencode_api_key_${provider}`, encryptedKey);
    localStorage.setItem('opencode_provider', provider);
  } catch (error) {
    console.error('Failed to encrypt API key:', error);
    toast.error('Failed to save API key securely');
    throw error;
  }
};

// Get decrypted API key
export const getApiKey = async (provider: string): Promise<string | null> => {
  const encryptedKey = localStorage.getItem(`opencode_api_key_${provider}`);
  const encryptionKey = sessionStorage.getItem('opencode_encryption_key');
  
  if (!encryptedKey || !encryptionKey) {
    return null;
  }
  
  try {
    return await decryptData(encryptedKey, encryptionKey);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    toast.error('Failed to decrypt API key');
    return null;
  }
};

// Clear all stored API keys
export const clearApiKeys = (): void => {
  const providers = Object.keys(localStorage).filter(key => key.startsWith('opencode_api_key_'));
  providers.forEach(provider => localStorage.removeItem(provider));
  localStorage.removeItem('opencode_provider');
};