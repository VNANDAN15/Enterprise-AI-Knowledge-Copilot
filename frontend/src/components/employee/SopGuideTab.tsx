import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { SopGuideResponse } from '../../services/api';
import { UserCheck, Sparkles, CheckCircle2, AlertTriangle, FileText, RefreshCw, ListOrdered } from 'lucide-react';

export default function SopGuideTab() {
  const { selectedDocScope, setSelectedCitation } = useAppStore();
  const [processName, setProcessName] = useState<string>('Standard Operating Procedure');
  const [sop, setSop] = useState<SopGuideResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const res = await apiService.generateSopGuide(selectedDocScope, processName);
      setSop(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate SOP Guide');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <UserCheck className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Employee Operations Copilot</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">SOP & Operational Workflow Guide</h1>
            <p className="text-sm text-teal-100 max-w-2xl">
              Extract step-by-step Standard Operating Procedures, prerequisites, expected outcomes, and compliance safety guidelines.
            </p>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <label className="text-xs font-bold text-slate-800 dark:text-white block mb-1">Target Process / Workflow Name</label>
              <input
                type="text"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="e.g. Data Protection Procedure or Onboarding Flow"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-500/25 disabled:opacity-50 transition-all whitespace-nowrap self-end"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Steps...</span>
                </>
              ) : (
                <>
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Generate SOP Guide</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* SOP Content View */}
        {sop ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Title Header Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-500">Official Workflow Guide</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{sop.title}</h2>
                </div>
                {sop.citation && (
                  <button
                    onClick={() => setSelectedCitation(sop.citation || null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 hover:bg-teal-500/20 transition-all text-xs font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Citation</span>
                  </button>
                )}
              </div>

              {/* Prerequisites */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Prerequisites & System Requirements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sop.prerequisites.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Sequential Operational Instructions</h3>
              <div className="space-y-4">
                {sop.steps.map((step) => (
                  <div key={step.stepNumber} className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-sm flex-shrink-0 font-mono">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{step.heading}</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{step.instruction}</p>
                      {step.expectedOutcome && (
                        <div className="text-[11px] text-teal-700 dark:text-teal-300 bg-teal-500/5 p-2.5 rounded-xl border border-teal-500/15">
                          <span className="font-bold">Expected Verification: </span>
                          <span>{step.expectedOutcome}</span>
                        </div>
                      )}

                      {step.citation && (
                        <div className="pt-1">
                          <button
                            onClick={() => setSelectedCitation(step.citation || null)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 transition-all text-[11px] font-semibold"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Step Citation: {step.citation.documentName} (Page {step.citation.pageNumber})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Compliance Notes */}
            {sop.safetyNotes.length > 0 && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Operational Safety & Compliance Guidelines</span>
                </div>
                <ul className="space-y-1.5">
                  {sop.safetyNotes.map((note, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No SOP Guide Generated Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Enter a process name and click <span className="font-semibold text-teal-500">Generate SOP Guide</span> above.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
