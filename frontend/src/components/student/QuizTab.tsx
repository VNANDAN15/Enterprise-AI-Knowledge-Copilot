import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { QuizResponse, Citation } from '../../services/api';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Award, 
  Sliders, 
  AlertTriangle,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function QuizTab() {
  const { selectedDocScope, setSelectedCitation, setPdfPanelOpen } = useAppStore();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User answers state: questionId -> selectedOption/shortAnswer
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  const handleGenerateQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUserAnswers({});
      setSubmittedAnswers({});

      const data = await apiService.generateQuiz(selectedDocScope, difficulty, questionCount);
      setQuizData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz. Please ensure documents are selected.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
    setSubmittedAnswers(prev => ({ ...prev, [questionId]: true }));
  };

  const handleCitationClick = (citation?: Citation) => {
    if (citation) {
      setSelectedCitation(citation);
      setPdfPanelOpen(true);
    }
  };

  // Calculate score
  const totalQuestions = quizData?.questions.length || 0;
  const answeredCount = Object.keys(submittedAnswers).length;
  const correctCount = quizData?.questions.filter(q => {
    const userAns = userAnswers[q.id];
    if (!userAns) return false;
    return userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }).length || 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19]/5 dark:bg-[#070b13]/20 overflow-y-auto p-4 md:p-8 space-y-6">
      
      {/* Quiz Top Bar / Configuration Bar */}
      <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Interactive Quiz Generator
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">Student Mode</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate grounded 5–10 MCQ/short-answer tests from in-scope document context.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium hidden sm:inline">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="easy" className="dark:bg-slate-900">Easy</option>
              <option value="medium" className="dark:bg-slate-900">Medium</option>
              <option value="hard" className="dark:bg-slate-900">Hard</option>
            </select>
          </div>

          {/* Question Count Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Questions:</span>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={5} className="dark:bg-slate-900">5 Qs</option>
              <option value={8} className="dark:bg-slate-900">8 Qs</option>
              <option value={10} className="dark:bg-slate-900">10 Qs</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow shadow-indigo-500/20 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body States */}
      {isLoading ? (
        /* Skeleton Loading State */
        <div className="space-y-4 max-w-3xl mx-auto w-full py-8">
          <div className="p-6 bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="space-y-2 pt-2">
              <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-xl" />
              <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-xl" />
              <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-xl" />
            </div>
          </div>
          <div className="text-center text-xs text-indigo-500 font-mono tracking-wider animate-pulse">
            Auditing FAISS text chunks and generating grounded questions...
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="max-w-xl mx-auto w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Failed to Generate Quiz</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={handleGenerateQuiz}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : !quizData ? (
        /* Empty State */
        <div className="max-w-md mx-auto my-auto text-center py-12 px-6 space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Active Quiz</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select your document scope from the top dropdown and click "Generate Quiz" to test your knowledge with instant scoring.
            </p>
          </div>
        </div>
      ) : (
        /* Active Quiz Feed */
        <div className="max-w-3xl mx-auto w-full space-y-6">
          
          {/* Live Score Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{quizData.title}</h3>
                <p className="text-xs text-indigo-100 opacity-90">
                  Answered: {answeredCount} of {totalQuestions} questions
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black">{correctCount} / {answeredCount}</span>
              <span className="text-[10px] block text-indigo-200 uppercase tracking-wider font-mono">Score</span>
            </div>
          </div>

          {/* Question List */}
          {quizData.questions.map((q, qIdx) => {
            const isAnswered = Boolean(submittedAnswers[q.id]);
            const selectedOpt = userAnswers[q.id];
            const isCorrect = selectedOpt && selectedOpt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

            return (
              <div 
                key={q.id}
                className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                      {q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                    </span>
                  </div>

                  {isAnswered && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCorrect 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
                  {q.question}
                </h4>

                {/* MCQ Options */}
                {q.type === 'mcq' && q.options.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === opt;
                      const isThisCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                      let btnStyle = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400";
                      
                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-semibold";
                        } else if (isThisSelected && !isThisCorrect) {
                          btnStyle = "bg-rose-500/10 border-rose-500/50 text-rose-700 dark:text-rose-300";
                        } else {
                          btnStyle = "opacity-50 border-slate-200 dark:border-slate-800";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                          {isAnswered && isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Input */}
                {q.type === 'short_answer' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      disabled={isAnswered}
                      placeholder="Type your answer here..."
                      value={selectedOpt || ''}
                      onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && selectedOpt?.trim()) {
                          setSubmittedAnswers(prev => ({ ...prev, [q.id]: true }));
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    {!isAnswered && (
                      <button
                        onClick={() => selectedOpt?.trim() && setSubmittedAnswers(prev => ({ ...prev, [q.id]: true }))}
                        className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                      >
                        Check Answer
                      </button>
                    )}
                  </div>
                )}

                {/* Explanation & Citation Box (Appears after answer is selected) */}
                {isAnswered && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block mb-1">
                        Explanation & Solution
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>

                    {/* Grounded Citation */}
                    {q.citation && (
                      <button
                        onClick={() => handleCitationClick(q.citation)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Source: {q.citation.documentName}</span>
                        <span className="font-mono text-[10px]">Page {q.citation.pageNumber}</span>
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
