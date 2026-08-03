import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { CoverageGapResponse } from '../../services/api';
import { 
  PieChart, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  FileText,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function CoverageGapsTab() {
  const { documents, selectedDocScope } = useAppStore();

  // Target document ID (defaults to first in scope or first doc)
  const [targetDocId, setTargetDocId] = useState<string>(
    selectedDocScope[0] || documents[0]?.id || 'doc-1'
  );

  const [coverageData, setCoverageData] = useState<CoverageGapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoverage = async (docId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getCoverageGaps(docId);
      setCoverageData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to audit document coverage.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetDocId) {
      fetchCoverage(targetDocId);
    }
  }, [targetDocId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19]/5 dark:bg-[#070b13]/20 overflow-y-auto p-4 md:p-8 space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Document Density & Coverage Gap Audit
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">Teacher Audit Mode</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit FAISS vector chunk distribution and detect missing or sparse syllabus topics.
            </p>
          </div>
        </div>

        {/* Target Document Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium hidden sm:inline">Audit Document:</span>
            <select
              value={targetDocId}
              onChange={(e) => setTargetDocId(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {documents.length === 0 ? (
                <option value="doc-1">Sample PDF Audit</option>
              ) : (
                documents.map(d => (
                  <option key={d.id} value={d.id} className="dark:bg-slate-900">
                    {d.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => fetchCoverage(targetDocId)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow shadow-indigo-500/20 transition-all"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Re-Audit</span>
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      {isLoading ? (
        <div className="max-w-3xl mx-auto w-full py-12 space-y-4">
          <div className="p-6 bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
            <div className="h-20 bg-slate-100 dark:bg-slate-850 rounded-xl" />
            <div className="h-20 bg-slate-100 dark:bg-slate-850 rounded-xl" />
          </div>
          <p className="text-center text-xs text-indigo-500 font-mono animate-pulse">Analyzing vector chunk density and identifying syllabus gaps...</p>
        </div>
      ) : error ? (
        <div className="max-w-xl mx-auto w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Coverage Audit Error</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={() => fetchCoverage(targetDocId)}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Audit
          </button>
        </div>
      ) : !coverageData ? (
        <div className="max-w-md mx-auto my-auto text-center py-12 px-6 space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Audit Data</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select a document to run a chunk density audit and discover missing topics.
            </p>
          </div>
        </div>
      ) : (
        /* Audit Dashboard */
        <div className="max-w-3xl mx-auto w-full space-y-6">
          
          {/* Overall Density Score Card */}
          <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 justify-center md:justify-start">
                <FileText className="w-4 h-4 text-indigo-500" />
                {coverageData.documentName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vector chunk density analysis across retrieved embedding partitions.
              </p>
            </div>

            {/* Gauge Score Pill */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider block">Overall Density</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{coverageData.overallDensityScore}%</span>
              </div>

              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 flex items-center justify-center text-indigo-500 font-bold text-xs">
                {coverageData.overallDensityScore > 75 ? 'HIGH' : 'MED'}
              </div>
            </div>
          </div>

          {/* Topic Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Topic Coverage & Gap Analysis ({coverageData.topics.length} Key Areas)
            </h3>

            {coverageData.topics.map((t, idx) => {
              const isDense = t.coverage === 'dense';

              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {isDense ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                      )}
                      {t.topic}
                    </h4>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400">
                        {t.chunkCount} Chunks
                      </span>

                      <span className={`text-[10px] font-bold uppercase font-mono px-2.5 py-1 rounded-full border ${
                        isDense
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {t.coverage === 'dense' ? 'Dense Coverage' : 'Sparse Coverage'}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    {t.summary}
                  </p>

                  {/* Recommendation Box */}
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    isDense
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium'
                  }`}>
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">Teacher Recommendation:</span>
                      <span>{t.recommendation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
