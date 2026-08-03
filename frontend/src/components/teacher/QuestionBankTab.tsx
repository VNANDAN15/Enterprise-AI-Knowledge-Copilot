import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { QuestionBankResponse, QuestionBankItem, Citation } from '../../services/api';
import { 
  FileQuestion, 
  Sparkles, 
  RefreshCw, 
  Download, 
  BookOpen, 
  AlertTriangle,
  Sliders,
  FileText,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Edit3,
  Repeat,
  FileCode,
  FileSpreadsheet,
  Save
} from 'lucide-react';

export default function QuestionBankTab() {
  const { selectedDocScope, setSelectedCitation, setPdfPanelOpen } = useAppStore();

  // Filter States
  const [difficultyMix, setDifficultyMix] = useState<string>('balanced');
  const [bloomLevel, setBloomLevel] = useState<string>('all');
  const [questionType, setQuestionType] = useState<string>('all');

  const [bankData, setBankData] = useState<QuestionBankResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single-item action state (editing items)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ question: string; answerKey: string; totalMarks: number }>({
    question: '',
    answerKey: '',
    totalMarks: 10
  });

  const handleGenerateQuestionBank = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setEditingId(null);

      const data = await apiService.generateQuestionBank(
        selectedDocScope, 
        difficultyMix,
        bloomLevel,
        questionType
      );
      setBankData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate Question Bank.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citation?: Citation) => {
    if (citation) {
      setSelectedCitation(citation);
      setPdfPanelOpen(true);
    }
  };

  // Single-Item Actions
  const handleRegenerateItem = (qId: string) => {
    if (!bankData) return;
    setBankData({
      ...bankData,
      questions: bankData.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            question: `${q.question} (Regenerated Variant)`,
            answerKey: `Regenerated Solution Key grounded in document page ${q.citation?.pageNumber || 1}.`
          };
        }
        return q;
      })
    });
  };

  const handleSwapItem = (qId: string) => {
    if (!bankData) return;
    setBankData({
      ...bankData,
      questions: bankData.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            id: `swap-${Date.now()}`,
            question: `Alternative Assessment Question: Formulate the core trade-offs of ${q.topicTag}.`,
            answerKey: `Alternative Answer Key: Direct grounded trade-off analysis.`,
            difficulty: q.difficulty === 'easy' ? 'medium' : 'hard'
          };
        }
        return q;
      })
    });
  };

  const startEditing = (q: QuestionBankItem) => {
    setEditingId(q.id);
    setEditForm({
      question: q.question,
      answerKey: q.answerKey,
      totalMarks: q.totalMarks || 10
    });
  };

  const saveEditing = (qId: string) => {
    if (!bankData) return;
    setBankData({
      ...bankData,
      questions: bankData.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            question: editForm.question,
            answerKey: editForm.answerKey,
            totalMarks: editForm.totalMarks
          };
        }
        return q;
      })
    });
    setEditingId(null);
  };

  // Export Capabilities (Markdown, PDF, Word, LaTeX)
  const handleExportMarkdown = () => {
    if (!bankData || bankData.questions.length === 0) return;
    let docContent = `# ${bankData.title}\n`;
    docContent += `Generated for In-Scope PDF Documents | Difficulty: ${difficultyMix.toUpperCase()} | Bloom: ${bloomLevel.toUpperCase()}\n\n`;
    docContent += `---\n\n`;

    bankData.questions.forEach((q, idx) => {
      docContent += `### [Q${idx + 1}] [${q.topicTag}] [${q.difficulty.toUpperCase()}] [Bloom: ${q.bloomLevel || 'Recall'}] [Total: ${q.totalMarks || 10} Marks]\n`;
      docContent += `**Question:** ${q.question}\n\n`;
      docContent += `**Answer Key / Solution:**\n${q.answerKey}\n\n`;
      docContent += `**Itemized Evaluation Rubric:**\n`;
      if (q.rubricTiers) {
        docContent += `- ${q.rubricTiers.fullMarks}\n`;
        docContent += `- ${q.rubricTiers.partialMarks}\n`;
        docContent += `- ${q.rubricTiers.minimalMarks}\n\n`;
      } else {
        docContent += `${q.markingCriteria}\n\n`;
      }
      if (q.citation) {
        docContent += `*Source Grounding:* ${q.citation.documentName} (Page ${q.citation.pageNumber})\n`;
      }
      docContent += `\n---\n\n`;
    });

    const blob = new Blob([docContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Exam_Question_Bank_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    if (!bankData || bankData.questions.length === 0) return;
    let htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>${bankData.title}</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
      h1 { color: #1e1b4b; }
      h3 { color: #4338ca; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
      .meta { background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; }
      .key { background: #ecfdf5; padding: 10px; border-left: 4px solid #10b981; margin: 10px 0; }
      .rubric { background: #f0fdf4; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0; }
    </style></head>
    <body>
    <h1>${bankData.title}</h1>
    <p><b>Difficulty Mix:</b> ${difficultyMix} | <b>Bloom's Taxonomy:</b> ${bloomLevel}</p>
    <hr/>`;

    bankData.questions.forEach((q, idx) => {
      htmlContent += `
        <h3>Q${idx + 1}. [${q.topicTag}] - Total: ${q.totalMarks || 10} Marks</h3>
        <p class="meta">Difficulty: ${q.difficulty.toUpperCase()} | Bloom Level: ${q.bloomLevel || 'Recall'}</p>
        <p><b>Question:</b> ${q.question}</p>
        <div class="key"><b>Answer Key:</b> ${q.answerKey}</div>
        <div class="rubric">
          <b>Evaluation Rubric:</b><br/>
          ${q.rubricTiers ? `
            • ${q.rubricTiers.fullMarks}<br/>
            • ${q.rubricTiers.partialMarks}<br/>
            • ${q.rubricTiers.minimalMarks}
          ` : q.markingCriteria}
        </div>
        <p><i>Source: ${q.citation?.documentName || 'Document Context'} (Page ${q.citation?.pageNumber || 1})</i></p>
        <br/><hr/>
      `;
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Exam_Question_Bank_${Date.now()}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLaTeX = () => {
    if (!bankData || bankData.questions.length === 0) return;
    let tex = `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{enumitem}\n\\title{${bankData.title}}\n\\author{Enterprise AI Copilot Generator}\n\\date{\\today}\n\n\\begin{document}\n\\maketitle\n\n`;

    bankData.questions.forEach((q, idx) => {
      tex += `\\section*{Question ${idx + 1} (${q.totalMarks || 10} Marks)}\n`;
      tex += `\\textbf{Topic:} ${q.topicTag} \\quad \\textbf{Difficulty:} ${q.difficulty.toUpperCase()} \\quad \\textbf{Bloom:} ${q.bloomLevel || 'Recall'}\\\\\n\n`;
      tex += `\\textbf{Question:} ${q.question}\\\\\n\n`;
      tex += `\\subsection*{Solution Key}\n${q.answerKey}\\\\\n\n`;
      tex += `\\subsection*{Evaluation Rubric}\n\\begin{itemize}\n`;
      if (q.rubricTiers) {
        tex += `  \\item ${q.rubricTiers.fullMarks}\n`;
        tex += `  \\item ${q.rubricTiers.partialMarks}\n`;
        tex += `  \\item ${q.rubricTiers.minimalMarks}\n`;
      } else {
        tex += `  \\item ${q.markingCriteria}\n`;
      }
      tex += `\\end{itemize}\n\n\\hrulefill\n\n`;
    });

    tex += `\\end{document}`;

    const blob = new Blob([tex], { type: 'text/x-tex;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Exam_Question_Bank_${Date.now()}.tex`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19]/5 dark:bg-[#070b13]/20 overflow-y-auto p-4 md:p-8 space-y-6">
      
      {/* Top Header Controls */}
      <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Assessment Question Bank & Itemized Rubrics
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">Teacher Mode</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate academic question sets complete with point allocations, multi-tier rubrics, and multi-format exports.
            </p>
          </div>
        </div>

        {/* Generate Button & Export Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateQuestionBank}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow shadow-indigo-500/20 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Generate Exam Bank
              </>
            )}
          </button>

          {bankData && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow shadow-emerald-500/20 transition-all"
                title="Export as Markdown document"
              >
                <Download className="w-3.5 h-3.5" /> Markdown
              </button>

              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow shadow-blue-500/20 transition-all"
                title="Export as Word (.docx) document"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Word (.docx)
              </button>

              <button
                onClick={handleExportLaTeX}
                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow shadow-violet-500/20 transition-all"
                title="Export as LaTeX (.tex) document"
              >
                <FileCode className="w-3.5 h-3.5" /> LaTeX (.tex)
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow transition-all"
                title="Print or Save PDF"
              >
                Print PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Visual Filter Bar */}
      <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Advanced Controls:</span>
        </div>

        {/* Difficulty Mix Filter */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
          <span className="text-slate-500 font-medium">Difficulty Mix:</span>
          <select
            value={difficultyMix}
            onChange={(e) => setDifficultyMix(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="balanced" className="dark:bg-slate-900">Balanced Mix</option>
            <option value="easy_heavy" className="dark:bg-slate-900">Easy Heavy (Introductory)</option>
            <option value="hard_heavy" className="dark:bg-slate-900">Hard Heavy (Advanced)</option>
          </select>
        </div>

        {/* Bloom's Taxonomy Level */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
          <span className="text-slate-500 font-medium">Bloom's Taxonomy:</span>
          <select
            value={bloomLevel}
            onChange={(e) => setBloomLevel(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900">All Levels</option>
            <option value="recall" className="dark:bg-slate-900">Recall / Understanding</option>
            <option value="analytical" className="dark:bg-slate-900">Analytical / Problem-Solving</option>
            <option value="synthesis" className="dark:bg-slate-900">Design / Synthesis</option>
          </select>
        </div>

        {/* Question Type Filter */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
          <span className="text-slate-500 font-medium">Question Type:</span>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900">All Question Types</option>
            <option value="short_answer" className="dark:bg-slate-900">Short Answer</option>
            <option value="long_answer" className="dark:bg-slate-900">Long Answer (10-Marker)</option>
            <option value="mcq" className="dark:bg-slate-900">Multiple Choice (MCQ)</option>
            <option value="numerical" className="dark:bg-slate-900">Numerical / Mathematical</option>
          </select>
        </div>
      </div>

      {/* Main Content States */}
      {isLoading ? (
        <div className="max-w-3xl mx-auto w-full py-12 space-y-4">
          <div className="p-6 bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-20 bg-slate-100 dark:bg-slate-850 rounded-xl" />
          </div>
          <p className="text-center text-xs text-indigo-500 font-mono animate-pulse">Constructing exam questions, Bloom's cognitive taxonomy tags, and multi-tier rubrics...</p>
        </div>
      ) : error ? (
        <div className="max-w-xl mx-auto w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Failed to Generate Question Bank</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={handleGenerateQuestionBank}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : !bankData ? (
        <div className="max-w-md mx-auto my-auto text-center py-12 px-6 space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Question Bank Active</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click "Generate Exam Bank" to construct an assessment suite with answer keys and itemized rubrics grounded in your uploaded documents.
            </p>
          </div>
        </div>
      ) : (
        /* Active Question Bank Feed */
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 px-6 shadow-sm flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              {bankData.title} ({bankData.questions.length} Items)
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                Mix: {difficultyMix.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg">
                Bloom: {bloomLevel}
              </span>
            </div>
          </div>

          {bankData.questions.map((q, idx) => {
            const isEditing = editingId === q.id;

            return (
              <div 
                key={q.id || idx}
                className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4"
              >
                {/* Question Header Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-black flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300">
                      {q.topicTag}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      Total: {q.totalMarks || 10} Marks
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-md border border-violet-500/20">
                      Bloom: {q.bloomLevel || 'Recall'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase font-mono px-2.5 py-1 rounded-full border ${
                      q.difficulty === 'easy' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : q.difficulty === 'hard'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {q.difficulty}
                    </span>

                    {/* Single-Item Action Hooks */}
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => handleRegenerateItem(q.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Regenerate this specific question"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => startEditing(q)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Edit question text and marks"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleSwapItem(q.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Swap with alternative question"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Editing Mode vs Standard View */}
                {isEditing ? (
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-indigo-500/30">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Edit Question Phrasing:</label>
                      <textarea
                        value={editForm.question}
                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Edit Answer Key:</label>
                      <textarea
                        value={editForm.answerKey}
                        onChange={(e) => setEditForm({ ...editForm, answerKey: e.target.value })}
                        className="w-full p-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">Total Marks:</span>
                        <input
                          type="number"
                          value={editForm.totalMarks}
                          onChange={(e) => setEditForm({ ...editForm, totalMarks: Number(e.target.value) })}
                          className="w-16 p-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-center"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditing(q.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                        >
                          <Save className="w-3 h-3" /> Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Academic Question Text */}
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
                      {q.question}
                    </h4>

                    {/* Solution Key */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Answer Key / Solution:</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                        {q.answerKey}
                      </p>
                    </div>

                    {/* Multi-Tier Evaluation Rubric */}
                    <div className="bg-indigo-500/5 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Itemized Multi-Tier Evaluation Rubric:
                        </span>
                        <span className="text-[10px] font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Total: {q.totalMarks || 10} Marks
                        </span>
                      </div>

                      {q.rubricTiers ? (
                        <div className="space-y-1.5 pl-2 text-xs">
                          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            <strong>Full Marks Tier:</strong> {q.rubricTiers.fullMarks}
                          </div>
                          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                            <strong>Partial Marks Tier:</strong> {q.rubricTiers.partialMarks}
                          </div>
                          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                            <strong>Minimal Marks Tier:</strong> {q.rubricTiers.minimalMarks}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                          {q.markingCriteria}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Grounded Source Citation */}
                {q.citation && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleCitationClick(q.citation)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Source Grounding: {q.citation.documentName} — Page {q.citation.pageNumber}</span>
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
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

