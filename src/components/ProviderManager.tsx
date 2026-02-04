"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Key, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic (Claude)', icon: 'https://www.anthropic.com/favicon.ico' },
  { id: 'google', name: 'Google (Gemini)', icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160d13ffabc72b30.png' },
  { id: 'jules', name: 'Jules (Google)', icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160d13ffabc72b30.png' },
  { id: 'openrouter', name: 'OpenRouter', icon: 'https://openrouter.ai/favicon.ico' },
  { id: 'cursor', name: 'Cursor (Zai)', icon: 'https://cursor.sh/favicon.ico' },
  { id: 'openai', name: 'OpenAI', icon: 'https://openai.com/favicon.ico' }
];

// Encryption utility functions
const encryptData = async (data: string, key: string): Promise<string> => {
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

const decryptData = async (encryptedData: string, key: string): Promise<string> => {
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

const ProviderManager = () => {
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');

  useEffect(() => {
    // Generate a session-based encryption key
    const sessionKey = sessionStorage.getItem('opencode_encryption_key');
    if (sessionKey) {
      setEncryptionKey(sessionKey);
    } else {
      const newKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      sessionStorage.setItem('opencode_encryption_key', newKey);
      setEncryptionKey(newKey);
    }
    
    // Load saved provider if exists
    const savedProvider = localStorage.getItem('opencode_provider');
    if (savedProvider) {
      setSelectedProvider(savedProvider);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey || !encryptionKey) return;
    
    try {
      // Encrypt the API key before storing
      const encryptedKey = await encryptData(apiKey, encryptionKey);
      localStorage.setItem(`opencode_api_key_${selectedProvider}`, encryptedKey);
      localStorage.setItem('opencode_provider', selectedProvider);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setApiKey('');
    } catch (error) {
      console.error('Failed to encrypt API key:', error);
    }
  };

  const handleTestConnection = async () => {
    // In a real implementation, this would test the connection with the provider
    console.log('Testing connection with provider:', selectedProvider);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="text-indigo-400" size={20} />
        <h3 className="text-sm font-semibold text-zinc-200">LLM Provider</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Provider</label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 h-11">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              {PROVIDERS.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <span>{p.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">API Key / Auth Token</label>
          <div className="relative">
            <Input 
              type={showApiKey ? "text" : "password"}
              placeholder={`Enter your ${PROVIDERS.find(p => p.id === selectedProvider)?.name} credentials`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 h-11 pl-10 pr-10"
            />
            <Key className="absolute left-3 top-3.5 text-zinc-600" size={16} />
            <button 
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className={`flex-1 h-11 gap-2 transition-all ${isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
            onClick={handleSave}
          >
            {isSaved ? (
              <>
                <Check size={18} />
                Configuration Saved
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Securely Save Configuration
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            className="h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={handleTestConnection}
          >
            Test Connection
          </Button>
        </div>

        <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
          Your credentials are encrypted and stored locally. They never leave your browser. 
          For production use, consider using a backend proxy for enhanced security.
        </p>
      </div>
    </div>
  );
};

export default ProviderManager;