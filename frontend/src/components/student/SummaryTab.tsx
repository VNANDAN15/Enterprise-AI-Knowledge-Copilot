import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { SummaryResponse, Citation } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileText, 
  CheckSquare, 
  Square, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ListChecks,
  BookmarkCheck,
  HelpCircle,
  Layers,
  Code
} from 'lucide-react';

export default function SummaryTab() {
  const { selectedDocScope, setSelectedCitation, setPdfPanelOpen, setActiveTab } = useAppStore();

  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive Checklist & Deep Dive State
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const handleGenerateSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCompletedItems({});
      setExpandedSections({});

      const data = await apiService.generateSummary(selectedDocScope);
      setSummaryData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChecklist = (id: string) => {
    setCompletedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDeepDive = (idx: number) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCitationClick = (citation?: Citation) => {
    if (citation) {
      setSelectedCitation(citation);
      setPdfPanelOpen(true);
    }
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalChecklist = summaryData?.checklist.length || 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19]/5 dark:bg-[#070b13]/20 overflow-y-auto p-4 md:p-8 space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Factual Study Summary & Guide
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">Exam Grounded</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Concrete topic breakdowns, comparison tables, and topic-level quiz/flashcard hooks.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow shadow-indigo-500/20 transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Generate Summary
            </>
          )}
        </button>
      </div>

      {/* Main Body States */}
      {isLoading ? (
        <div className="max-w-3xl mx-auto w-full py-12 space-y-4">
          <div className="p-6 bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-16 bg-slate-100 dark:bg-slate-850 rounded-xl" />
            <div className="h-24 bg-slate-100 dark:bg-slate-850 rounded-xl" />
          </div>
          <p className="text-center text-xs text-indigo-500 font-mono animate-pulse">Extracting factual section breakdowns, tables, and study checklists...</p>
        </div>
      ) : error ? (
        <div className="max-w-xl mx-auto w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Summary Generation Error</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={handleGenerateSummary}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : !summaryData ? (
        <div className="max-w-md mx-auto my-auto text-center py-12 px-6 space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Summary Generated</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click "Generate Summary" to create a factual chapter breakdown and study checklist grounded in your uploaded documents.
            </p>
          </div>
        </div>
      ) : (
        /* Summary & Checklist Content */
        <div className="max-w-3xl mx-auto w-full space-y-6">
          
          {/* Executive Overview Box */}
          <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-indigo-500" />
              {summaryData.title}
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850 prose dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summaryData.overview}
              </ReactMarkdown>
            </div>
          </div>

          {/* Section Takeaways */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Key Chapter & Section Takeaways
            </h3>

            {summaryData.sections.map((sec, idx) => {
              const isExpanded = Boolean(expandedSections[idx]);

              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      {sec.heading}
                    </h4>

                    {/* Topic-Level Action Hooks */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('quiz')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                        title="Practice quiz scoped to this section"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Practice Quiz</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('flashcards')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-semibold hover:bg-violet-500/20 transition-all border border-violet-500/20"
                        title="Study flashcards for this topic"
                      >
                        <Layers className="w-3 h-3" />
                        <span>Study Flashcards</span>
                      </button>
                    </div>
                  </div>

                  {/* Factual Takeaways */}
                  <ul className="space-y-2.5">
                    {sec.keyTakeaways.map((takeaway, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 prose dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {takeaway}
                          </ReactMarkdown>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Expandable Deep-Dives */}
                  {sec.deepDive && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleDeepDive(idx)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Technical Deep-Dive' : 'Expand Technical Deep-Dive (Formulas / Logic)'}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs font-mono leading-relaxed overflow-x-auto">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {sec.deepDive}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grounded Citation */}
                  {sec.citation && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleCitationClick(sec.citation)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Source: {sec.citation.documentName} — Page {sec.citation.pageNumber}</span>
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Study Checklist */}
          <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-500" />
                  Interactive Exam Study Checklist
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mark off concepts as you complete your review.
                </p>
              </div>

              <div className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                {completedCount} / {totalChecklist} Reviewed
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {summaryData.checklist.map((item) => {
                const isChecked = Boolean(completedItems[item.id]);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-500 dark:text-slate-400 line-through'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="font-bold block">{item.concept}</span>
                      <p className="text-[11px] opacity-90 leading-relaxed">{item.description}</p>

                      {item.citation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCitationClick(item.citation);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-500 hover:underline pt-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Source: {item.citation.documentName} — Page {item.citation.pageNumber}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

