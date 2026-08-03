import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import type { FlashcardResponse, Citation } from '../../services/api';
import { 
  Layers, 
  RotateCw, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  AlertTriangle,
  BookOpen
} from 'lucide-react';

export default function FlashcardsTab() {
  const { selectedDocScope, setSelectedCitation, setPdfPanelOpen } = useAppStore();

  const [count, setCount] = useState<number>(5);
  const [flashcardsData, setFlashcardsData] = useState<FlashcardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active card slider index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerateCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentIndex(0);
      setIsFlipped(false);

      const data = await apiService.generateFlashcards(selectedDocScope, count);
      setFlashcardsData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (flashcardsData) {
      setCurrentIndex(prev => (prev < flashcardsData.cards.length - 1 ? prev + 1 : prev));
    }
  };

  const handleExportCSV = () => {
    if (!flashcardsData || flashcardsData.cards.length === 0) return;

    // Build Anki-compatible CSV content: "Front","Back","Category"
    const csvHeader = "Front,Back,Category\n";
    const csvRows = flashcardsData.cards.map(c => {
      const frontEscaped = `"${c.front.replace(/"/g, '""')}"`;
      const backEscaped = `"${c.back.replace(/"/g, '""')}"`;
      const catEscaped = `"${c.category.replace(/"/g, '""')}"`;
      return `${frontEscaped},${backEscaped},${catEscaped}`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Anki_Flashcards_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCitationClick = (citation?: Citation) => {
    if (citation) {
      setSelectedCitation(citation);
      setPdfPanelOpen(true);
    }
  };

  const currentCard = flashcardsData?.cards[currentIndex];
  const totalCards = flashcardsData?.cards.length || 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19]/5 dark:bg-[#070b13]/20 overflow-y-auto p-4 md:p-8 space-y-6">
      
      {/* Top Header Controls */}
      <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Concept & Terminology Flashcards
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">Anki Exportable</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flip through AI-generated term pairs grounded in source context.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Card Count:</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={5} className="dark:bg-slate-900">5 Cards</option>
              <option value={8} className="dark:bg-slate-900">8 Cards</option>
              <option value={10} className="dark:bg-slate-900">10 Cards</option>
            </select>
          </div>

          <button
            onClick={handleGenerateCards}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow shadow-indigo-500/20 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Generate Deck
              </>
            )}
          </button>

          {flashcardsData && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow shadow-emerald-500/20 transition-all"
              title="Download CSV for Anki Import"
            >
              <Download className="w-3.5 h-3.5" /> Export Anki CSV
            </button>
          )}
        </div>
      </div>

      {/* Main Body States */}
      {isLoading ? (
        <div className="max-w-md mx-auto w-full py-16 text-center space-y-4">
          <div className="w-72 h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse mx-auto shadow-inner" />
          <p className="text-xs text-indigo-500 font-mono animate-pulse">Extracting key terminology pairs from document vector index...</p>
        </div>
      ) : error ? (
        <div className="max-w-xl mx-auto w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Flashcard Generation Error</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={handleGenerateCards}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : !flashcardsData || !currentCard ? (
        <div className="max-w-md mx-auto my-auto text-center py-12 px-6 space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Flashcards Generated</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click "Generate Deck" to create an interactive, exportable flashcard deck from your PDF text context.
            </p>
          </div>
        </div>
      ) : (
        /* Active Flip Card Deck Container */
        <div className="max-w-xl mx-auto w-full space-y-6">
          
          {/* Card Counter & Tag */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-bold bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-lg border border-indigo-500/20">
              {currentCard.category}
            </span>
          </div>

          {/* 3D Flip Card */}
          <div 
            onClick={handleFlipCard}
            className="w-full h-80 perspective-1000 cursor-pointer group"
          >
            <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              
              {/* FRONT SIDE */}
              <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#0e1422] border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl p-8 flex flex-col justify-between shadow-xl backface-hidden group-hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>Front: Concept / Term</span>
                  <RotateCw className="w-4 h-4 opacity-75 group-hover:rotate-180 transition-transform duration-500" />
                </div>

                <div className="my-auto text-center space-y-3 px-4">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-snug">
                    {currentCard.front}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono uppercase tracking-wider font-semibold">
                    CLICK ANYWHERE TO FLIP ANSWER
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-mono">
                  Card {currentIndex + 1} of {totalCards} • Source Grounded
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 w-full h-full bg-indigo-950 text-white border-2 border-indigo-400/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl rotate-y-180 backface-hidden">
                <div className="flex items-center justify-between text-indigo-200 text-xs font-mono">
                  <span>Back: Answer / Definition</span>
                  <span className="text-[10px] bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700 font-sans">Answer Key</span>
                </div>

                <div className="my-auto space-y-3 overflow-y-auto max-h-48 pr-1">
                  <div className="text-xs md:text-sm leading-relaxed text-indigo-100 font-medium whitespace-pre-line space-y-1">
                    {currentCard.back}
                  </div>

                  {currentCard.citation && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCitationClick(currentCard.citation);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-800/80 border border-indigo-500/40 text-indigo-200 text-[10px] font-semibold hover:bg-indigo-700 transition-all mt-2"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{currentCard.citation.documentName}</span>
                      <span className="font-mono">• Pg {currentCard.citation.pageNumber}</span>
                    </button>
                  )}
                </div>

                <div className="text-center text-[10px] text-indigo-300 font-mono">
                  Click to flip back to front
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 text-xs font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={handleFlipCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-500/20"
            >
              <RotateCw className="w-3.5 h-3.5" /> Flip Card
            </button>

            <button
              onClick={handleNextCard}
              disabled={currentIndex === totalCards - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 text-xs font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
