import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { ExecutiveBriefingResponse } from '../../services/api';
import { Briefcase, Sparkles, AlertTriangle, TrendingUp, CheckCircle, FileText, RefreshCw, ArrowRight } from 'lucide-react';

export default function ExecutiveBriefingTab() {
  const { selectedDocScope, setSelectedCitation } = useAppStore();
  const [focusArea, setFocusArea] = useState<string>('general');
  const [briefing, setBriefing] = useState<ExecutiveBriefingResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const res = await apiService.generateExecutiveBriefing(selectedDocScope, focusArea);
      setBriefing(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate Executive Briefing');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Briefcase className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Manager Persona Copilot</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Executive Briefing Generator</h1>
            <p className="text-sm text-indigo-100 max-w-2xl">
              Synthesize multi-page PDF documentation into executive C-suite summaries, key operational risks, resource impacts, and strategic recommendations.
            </p>
          </div>
        </div>

        {/* Controls Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Briefing Configuration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select strategic emphasis for the generated executive report.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">General Executive Overview</option>
                <option value="financial">Financial & Expenditure Impact</option>
                <option value="risk">Risk & Regulatory Alignment</option>
                <option value="operations">Operational & Resource Strategy</option>
              </select>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Briefing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Executive Report View */}
        {briefing ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Title & Executive Summary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">Executive Report</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{briefing.title}</h2>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 capitalize font-semibold">
                  Focus: {briefing.focusArea}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Executive Summary</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  {briefing.executiveSummary}
                </p>
              </div>

              {briefing.citation && (
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedCitation(briefing.citation || null)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition-all text-xs font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Grounding Citation: {briefing.citation.documentName} (Page {briefing.citation.pageNumber})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Strategic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strategic Objectives */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>Strategic Objectives</span>
                </div>
                <ul className="space-y-2.5">
                  {briefing.strategicObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resource Impact */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <CheckCircle className="w-4 h-4" />
                  <span>Resource & Financial Impact</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/20">
                  {briefing.resourceImpact}
                </p>
              </div>
            </div>

            {/* Risks & Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Identified Risks */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Risks & Bottlenecks</span>
                </div>
                <ul className="space-y-2.5">
                  {briefing.keyRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/15">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Actionable Recommendations</span>
                </div>
                <ul className="space-y-2.5">
                  {briefing.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-1.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Briefing Generated Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Click <span className="font-semibold text-indigo-500">Generate Briefing</span> above to analyze your documents and synthesize executive recommendations.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
