"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Key, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveApiKey, getApiKey } from '@/utils/secureStorage';
import { toast } from 'sonner';

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic (Claude)', icon: 'https://www.anthropic.com/favicon.ico' },
  { id: 'google', name: 'Google (Gemini)', icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160d13ffabc72b30.png' },
  { id: 'jules', name: 'Jules (Google)', icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160d13ffabc72b30.png' },
  { id: 'openrouter', name: 'OpenRouter', icon: 'https://openrouter.ai/favicon.ico' },
  { id: 'cursor', name: 'Cursor (Zai)', icon: 'https://cursor.sh/favicon.ico' },
  { id: 'openai', name: 'OpenAI', icon: 'https://openai.com/favicon.ico' }
];

const ProviderManager = () => {
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load saved provider if exists
    const savedProvider = localStorage.getItem('opencode_provider');
    if (savedProvider) {
      setSelectedProvider(savedProvider);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey) return;
    
    try {
      await saveApiKey(selectedProvider, apiKey);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setApiKey('');
      toast.success('API key saved securely');
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast.error('Failed to save API key securely');
    }
  };

  const handleTestConnection = async () => {
    // In a real implementation, this would test the connection with the provider
    console.log('Testing connection with provider:', selectedProvider);
    toast.info('Testing connection... (simulated)');
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