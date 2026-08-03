import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { ActionKpiResponse, ActionItem } from '../../services/api';
import { Target, CheckSquare, Square, Clock, User, Sparkles, BarChart2, RefreshCw, FileText } from 'lucide-react';

export default function ActionKpiTab() {
  const { selectedDocScope, setSelectedCitation } = useAppStore();
  const [department, setDepartment] = useState<string>('all');
  const [data, setData] = useState<ActionKpiResponse | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    try {
      setIsExtracting(true);
      setError(null);
      const res = await apiService.generateActionKpis(selectedDocScope, department);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to extract Action Items & KPIs');
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    if (!data) return;
    const updatedItems: ActionItem[] = data.actionItems.map((item) =>
      item.id === taskId
        ? { ...item, status: (item.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' }
        : item
    );
    setData({ ...data, actionItems: updatedItems });
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Target className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Manager Operations Extractor</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Action Items & KPI Extractor</h1>
            <p className="text-sm text-blue-100 max-w-2xl">
              Extract high-priority operational tasks, target ownership roles, deadlines, and key performance metrics directly from company documents.
            </p>
          </div>
        </div>

        {/* Filter & Controls Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Department & Extraction Scope</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Filter operational tasks by functional business unit.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                <option value="operations">Operations & Logistics</option>
                <option value="engineering">Engineering & Product</option>
                <option value="finance">Finance & Compliance</option>
              </select>

              <button
                onClick={handleExtract}
                disabled={isExtracting}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-3.5 h-3.5" />
                    <span>Extract Action & KPIs</span>
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

        {/* Results Content */}
        {data ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* KPI Metric Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <span>Extracted Key Performance Indicators (KPIs)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.kpis.map((kpi) => (
                  <div key={kpi.id} className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-wider">{kpi.category}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                        Target: {kpi.targetValue}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{kpi.metric}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{kpi.insight}</p>

                    {kpi.citation && (
                      <button
                        onClick={() => setSelectedCitation(kpi.citation || null)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 transition-all text-[11px] font-semibold mt-2"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Source Citation: {kpi.citation.documentName} (Page {kpi.citation.pageNumber})</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                <span>Actionable Operational Tasks</span>
              </h3>
              <div className="space-y-3">
                {data.actionItems.map((item) => {
                  const isDone = item.status === 'completed';
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                        isDone
                          ? 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-[#0e1422] border-slate-200 dark:border-slate-800 shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => toggleTaskStatus(item.id)}
                        className="mt-0.5 text-indigo-500 hover:text-indigo-600 transition-colors flex-shrink-0"
                      >
                        {isDone ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                      </button>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {item.task}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.ownerRole}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.deadline}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono ${
                            item.priority === 'high'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.priority} priority
                          </span>
                        </div>

                        {item.citationText && (
                          <p className="text-[11px] italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                            "{item.citationText}"
                          </p>
                        )}

                        {item.citation && (
                          <div className="pt-1">
                            <button
                              onClick={() => setSelectedCitation(item.citation || null)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 transition-all text-[11px] font-semibold"
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

          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Action Items Extracted Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Click <span className="font-semibold text-indigo-500">Extract Action & KPIs</span> above to identify tasks and metrics.
            </p>
          </div>
        )}


      </div>
    </div>
  );
}
