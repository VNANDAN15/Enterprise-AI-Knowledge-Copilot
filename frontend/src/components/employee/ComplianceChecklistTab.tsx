import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { ComplianceChecklistResponse } from '../../services/api';
import { ShieldCheck, Sparkles, CheckSquare, Square, RefreshCw, Award, FileText } from 'lucide-react';

export default function ComplianceChecklistTab() {
  const { selectedDocScope, setSelectedCitation } = useAppStore();
  const [roleType, setRoleType] = useState<string>('General Employee');
  const [checklist, setChecklist] = useState<ComplianceChecklistResponse | null>(null);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const res = await apiService.generateComplianceChecklist(selectedDocScope, roleType);
      setChecklist(res);
      setCheckedIds([]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate Compliance Checklist');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const progressPercent = checklist && checklist.items.length > 0
    ? Math.round((checkedIds.length / checklist.items.length) * 100)
    : 0;

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-700 to-indigo-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Compliance & Onboarding Auditor</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Onboarding & Policy Compliance Roadmap</h1>
            <p className="text-sm text-cyan-100 max-w-2xl">
              Audit employee policy compliance, security requirements, and onboarding milestones with interactive progress tracking.
            </p>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <label className="text-xs font-bold text-slate-800 dark:text-white block mb-1">Target Employee Role</label>
              <input
                type="text"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                placeholder="e.g. Software Engineer or Financial Analyst"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all whitespace-nowrap self-end"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Generate Roadmap</span>
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

        {/* Roadmap Display */}
        {checklist ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Progress Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-500">{checklist.roleType}</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{checklist.title}</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
                  <Award className="w-4 h-4" />
                  <span>Target: {checklist.completionEstimate}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Compliance Completion Progress</span>
                  <span>{progressPercent}% ({checkedIds.length}/{checklist.items.length} Tasks)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {checklist.items.map((item) => {
                const isChecked = checkedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                      isChecked
                        ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-65'
                        : 'bg-white dark:bg-[#0e1422] border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="mt-0.5 text-cyan-500 hover:text-cyan-600 transition-colors flex-shrink-0"
                    >
                      {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.category}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.requirementLevel === 'Mandatory'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {item.requirementLevel}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>

                      {item.citationText && (
                        <p className="text-[11px] italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                          "{item.citationText}"
                        </p>
                      )}

                      {item.citation && (
                        <div className="pt-1">
                          <button
                            onClick={() => setSelectedCitation(item.citation || null)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 transition-all text-[11px] font-semibold"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Source Citation: {item.citation.documentName} (Page {item.citation.pageNumber})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Compliance Roadmap Generated Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Click <span className="font-semibold text-cyan-500">Generate Roadmap</span> above to audit compliance tasks.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
