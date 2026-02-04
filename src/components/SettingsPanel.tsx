"use client";

import React from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import MCPManager from './MCPManager';
import ProviderManager from './ProviderManager';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Settings size={18} className="text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">OpenCode Configuration</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-10">
            <ProviderManager />
            <div className="h-px bg-zinc-800" />
            <MCPManager />
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
          <Button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
            Close Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;