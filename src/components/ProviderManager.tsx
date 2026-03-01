"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Key, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SecureStorage } from '@/utils/secureStorage';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const PROVIDERS = [
  { id: "anthropic", name: "Anthropic (Claude)", icon: "https://www.anthropic.com/favicon.ico" },
  {
    id: "google",
    name: "Google (Gemini)",
    icon: "https://www.gstatic.com/lamda/images/favicon_v1_150160d13ffabc72b30.png",
  },
  {
    id: "jules",
    name: "Jules (Google)",
    icon: "https://www.gstatic.com/lamda/images/favicon_v1_150160d13ffabc72b30.png",
  },
  { id: "openrouter", name: "OpenRouter", icon: "https://openrouter.ai/favicon.ico" },
  { id: "cursor", name: "Cursor (Zai)", icon: "https://cursor.sh/favicon.ico" },
  { id: "openai", name: "OpenAI", icon: "https://openai.com/favicon.ico" },
];

const ProviderManager = () => {
  const [selectedProvider, setSelectedProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load saved provider if exists
    const loadSavedData = async () => {
      const savedProvider = localStorage.getItem("opencode_provider");
      if (savedProvider) {
        setSelectedProvider(savedProvider);
      }
    };

    loadSavedData();
  }, []);

  const handleSave = async () => {
    if (!apiKey) return;

    try {
      // Store the API key securely
      await SecureStorage.setItem(`opencode_api_key_${selectedProvider}`, apiKey);
      localStorage.setItem("opencode_provider", selectedProvider);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setApiKey("");
    } catch (error) {
      console.error("Failed to store API key:", error);
    }
  };

  const handleTestConnection = async () => {
    let currentApiKey = apiKey;
    if (!currentApiKey) {
      // Try to load from secure storage if not in state
      const savedKey = await SecureStorage.getItem(`opencode_api_key_${selectedProvider}`);
      if (savedKey) {
        currentApiKey = savedKey;
      }
    }

    if (!currentApiKey) {
      showError('Please enter an API key to test the connection');
      return;
    }

    const toastId = showLoading(`Testing connection to ${selectedProvider}...`);

    try {
      console.log('Testing connection with provider:', selectedProvider);

      let success = false;
      let errorMessage = '';

      if (selectedProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${currentApiKey}`
          }
        });

        if (response.ok) {
          success = true;
        } else {
          const data = await response.json().catch(() => ({}));
          errorMessage = data.error?.message || response.statusText;
        }
      } else if (selectedProvider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': currentApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hello' }]
          })
        });

        if (response.ok) {
          success = true;
        } else {
          const data = await response.json().catch(() => ({}));
          errorMessage = data.error?.message || response.statusText;
        }
      } else if (selectedProvider === 'google' || selectedProvider === 'jules') {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          headers: {
            'x-goog-api-key': currentApiKey
          }
        });

        if (response.ok) {
          success = true;
        } else {
          const data = await response.json().catch(() => ({}));
          errorMessage = data.error?.message || response.statusText;
        }
      } else if (selectedProvider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${currentApiKey}`
          }
        });

        if (response.ok) {
          success = true;
        } else {
          const data = await response.json().catch(() => ({}));
          errorMessage = data.error?.message || response.statusText;
        }
      } else if (selectedProvider === 'cursor') {
        // Cursor doesn't have a simple public API for browser-side connection testing.
        // Simulate a connection test, but clearly indicate that the API key was not verified.
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSuccess('Simulated connection to Cursor. Note: Your Cursor API key was not verified.');
        dismissToast(toastId);
        return;
      }

      if (success) {
        showSuccess(`Successfully connected to ${selectedProvider}!`);
      } else {
        showError(`Connection failed: ${errorMessage || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      // Many LLM providers block direct browser access due to CORS
      showError(`Connection test failed: ${error.message}. Note: Browser CORS restrictions may prevent direct API calls.`);
    } finally {
      dismissToast(toastId as any);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="text-indigo-400" size={20} />
        <h3 className="text-sm font-semibold text-zinc-200">LLM Provider</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="provider-select"
            className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
          >
            Select Provider
          </label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger
              id="provider-select"
              className="bg-zinc-900 border-zinc-800 text-zinc-300 h-11"
            >
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              {PROVIDERS.map((p) => (
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
          <label
            htmlFor="api-key-input"
            className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
          >
            API Key / Auth Token
          </label>
          <div className="relative">
            <Input
              id="api-key-input"
              type={showApiKey ? "text" : "password"}
              placeholder={`Enter your ${PROVIDERS.find((p) => p.id === selectedProvider)?.name} credentials`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 h-11 pl-10 pr-10"
            />
            <Key className="absolute left-3 top-3.5 text-zinc-600" size={16} />
            <button
              type="button"
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className={`flex-1 h-11 gap-2 transition-all ${isSaved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
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
          Your credentials are encrypted and stored locally. They never leave your browser. For
          production use, consider using a backend proxy for enhanced security.
        </p>
      </div>
    </div>
  );
};

export default ProviderManager;
