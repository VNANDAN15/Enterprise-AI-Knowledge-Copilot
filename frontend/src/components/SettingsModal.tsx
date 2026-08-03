import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { isMockMode, setMockMode } from '../services/api';
import { X, Cpu, Server, Sun, Moon, Info } from 'lucide-react';

export default function SettingsModal() {
  const { 
    isSettingsOpen, 
    setSettingsOpen, 
    activeModel, 
    setActiveModel,
    theme,
    toggleTheme
  } = useAppStore();

  if (!isSettingsOpen) return null;

  const models = [
    { id: 'Gemini 3.5 Flash', name: 'Gemini 3.5 Flash (Default)', provider: 'Google' },
    { id: 'Groq Llama-3.1 70B', name: 'Llama-3.1 70B', provider: 'Groq' },
    { id: 'DeepSeek R1', name: 'DeepSeek R1', provider: 'Groq' }
  ];

  const handleMockToggle = (checked: boolean) => {
    setMockMode(checked);
    // Reload to re-initialize state/mock database
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Settings & Preferences</h3>
          </div>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Model Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active LLM Model
            </label>
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setActiveModel(model.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                    activeModel === model.id
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-sm block">{model.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Provided by {model.provider}</span>
                  </div>
                  {activeModel === model.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow shadow-indigo-500/40" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Appearance Theme</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Switch between dark and light mode</span>
            </div>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 text-sm font-medium"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
                </>
              )}
            </button>
          </div>

          {/* Mock Backend Option */}
          <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-850/50">
            <div className="flex gap-2.5">
              <Server className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Mock Backend Mode</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Simulates PDF chunking/indexing & LLM streaming responses locally. Disable to connect to your FastAPI server.
                </span>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={isMockMode()}
              onChange={(e) => handleMockToggle(e.target.checked)}
              className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-800 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Setting changes take effect immediately. Reloading applies mock-mode database resets.</span>
        </div>
      </div>
    </div>
  );
}
