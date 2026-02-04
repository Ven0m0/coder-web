// Secure API client for handling LLM requests
import { getApiKey } from '@/utils/secureStorage';
import { toast } from 'sonner';

// Secure API request function that uses encrypted credentials
export const secureApiRequest = async (
  provider: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const apiKey = await getApiKey(provider);
  
  if (!apiKey) {
    throw new Error('API key not found or could not be decrypted');
  }
  
  // Add API key to headers
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  
  // In a production environment, you would route this through a backend proxy
  // For now, we'll make the request directly but with encrypted storage
  return fetch(endpoint, {
    ...options,
    headers,
  });
};

// Proxy-based API request function (recommended for production)
export const proxyApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // This would call your backend proxy in production
  // The backend would then add the real API key before calling the LLM provider
  return fetch(`/api/proxy${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
};

export default {
  secureApiRequest,
  proxyApiRequest,
};