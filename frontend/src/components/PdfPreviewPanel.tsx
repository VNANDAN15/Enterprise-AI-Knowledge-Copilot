import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, FileText, Bookmark, Share2, ZoomIn, ZoomOut, Check } from 'lucide-react';

export default function PdfPreviewPanel() {
  const { 
    isPdfPanelOpen, 
    setPdfPanelOpen, 
    selectedCitation, 
    setSelectedCitation 
  } = useAppStore();

  if (!isPdfPanelOpen || !selectedCitation) return null;

  const handleClose = () => {
    setPdfPanelOpen(false);
    setSelectedCitation(null);
  };

  const getUnitLabel = (filename: string, pageNum: number) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['pptx', 'ppt'].includes(ext)) {
      return `Slide ${pageNum}`;
    } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return `Sheet/Section ${pageNum}`;
    }
    return `Page ${pageNum}`;
  };

  const unitText = getUnitLabel(selectedCitation.documentName, selectedCitation.pageNumber);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-white dark:bg-[#0d121f] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800/50 px-5 flex items-center justify-between bg-slate-50 dark:bg-[#0b0f19]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-lg text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm truncate">
              {selectedCitation.documentName}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Source Citation • {unitText}
            </span>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Close Panel"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Toolbar Mockup */}
      <div className="px-5 py-2.5 border-b border-slate-200/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="font-mono">100%</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-350"><Bookmark className="w-3.5 h-3.5" /> Bookmark</button>
          <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-350"><Share2 className="w-3.5 h-3.5" /> Copy Link</button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-[#080b13] flex flex-col items-center">
        {/* Mock PDF Page Container */}
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-md p-6 font-serif relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-mono font-bold uppercase rounded-bl">
            {unitText}
          </div>

          {/* Dummy visual text mockups around the highlight */}
          <div className="space-y-2 mb-4 opacity-30 select-none">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-750 rounded" />
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-750 rounded" />
            <div className="h-3 w-11/12 bg-slate-200 dark:bg-slate-750 rounded" />
          </div>

          {/* Highlighted Chunk */}
          <div className="my-4 p-4 bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-amber-500 dark:border-amber-400 rounded-r-lg relative group">
            <span className="absolute -top-2.5 -left-1.5 px-1.5 py-0.5 rounded bg-amber-500 dark:bg-amber-400 text-[8px] font-sans font-bold text-slate-950 uppercase tracking-widest flex items-center gap-0.5 shadow-sm">
              <Check className="w-2 h-2 stroke-[3]" /> Retrieved Chunk
            </span>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed pt-1 whitespace-pre-wrap">
              {selectedCitation.text}
            </p>
          </div>

          {/* Dummy visual text mockups below */}
          <div className="space-y-2 mt-4 opacity-30 select-none">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-750 rounded" />
            <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-750 rounded" />
            <div className="h-3 w-11/12 bg-slate-200 dark:bg-slate-750 rounded" />
          </div>
        </div>

        {/* Info Box */}
        <div className="w-full max-w-sm mt-4 p-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 flex gap-2.5 items-start">
          <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            <strong>Contextual Retrieval</strong>: The Sentence Transformers model isolated this chunk using cosine similarity. The FAISS vector db indexed this section during the document uploading phase.
          </div>
        </div>
      </div>
    </div>
  );
}
