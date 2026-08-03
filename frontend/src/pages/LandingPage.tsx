import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  FileText, 
  Search, 
  Shield, 
  Zap, 
  ArrowRight, 
  Sun, 
  Moon,
  MessageSquare,
  BookmarkCheck,
  CheckCircle,
  Database
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      title: "Multi-PDF Document Scope",
      description: "Upload folders of PDFs and scope queries to specific files or search across the entire corporate repository."
    },
    {
      icon: <Search className="w-6 h-6 text-emerald-500" />,
      title: "Deep Semantic Retrieval",
      description: "Uses Sentence Transformers embeddings and FAISS vector indices to pinpoint exact paragraphs in seconds."
    },
    {
      icon: <BookmarkCheck className="w-6 h-6 text-violet-500" />,
      title: "Precise Page-Level Citations",
      description: "Answers display clickable references detailing source documents and pages, loading exact highlights."
    },
    {
      icon: <Shield className="w-6 h-6 text-sky-500" />,
      title: "Enterprise Grade Privacy",
      description: "All documents remain locally processed and stored. Vector search is run in-memory for security compliance."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* Mesh Glow Background */}
      <div className="glow-indigo w-[500px] h-[500px] -top-40 -left-40" />
      <div className="glow-violet w-[500px] h-[500px] -bottom-40 -right-40" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-md shadow-indigo-500/25">
            <Database className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            KnowledgeCopilot
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-widest bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full ml-1">
            Enterprise
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => navigate('/app')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            Launch Copilot <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-8 animate-pulse-glow">
          <Zap className="w-3.5 h-3.5" /> High-Performance Local RAG is Here
        </div>

        <h1 className="max-w-4xl text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
          Unlock the Knowledge Locked Inside Your{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Enterprise Documents
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
          Upload PDF reports, policy manuals, or developer guides. Get instant, verified answers backed by source citations with page highlights. No data leaks, no hallucinations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button 
            onClick={() => navigate('/app')}
            className="flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:brightness-105 transition-all text-base"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center px-7 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-base"
          >
            Explore Features
          </button>
        </div>

        {/* Product Preview Mockup */}
        <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 p-4 backdrop-blur-md shadow-2xl shadow-slate-900/5 dark:shadow-indigo-500/5 mb-28">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-[#0b0f19]/50 rounded-2xl pointer-events-none" />
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/50 pb-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 ml-2" />
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-left">
            {/* Sidebar Mockup */}
            <div className="col-span-1 border-r border-slate-200/50 dark:border-slate-800/40 pr-4 hidden md:block space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-full rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/30" />
                <div className="h-6 w-full rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/30" />
              </div>
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40 space-y-2">
                <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-full rounded bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10" />
              </div>
            </div>
            
            {/* Chat Pane Mockup */}
            <div className="col-span-4 md:col-span-3 space-y-4 py-2">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                  U
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/70 rounded-xl px-4 py-2.5 max-w-[80%] text-sm">
                  What was our profit margin increase in Q3?
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex-shrink-0 flex items-center justify-center shadow shadow-indigo-500/20">
                  <Database className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="space-y-3 max-w-[90%]">
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl px-4 py-3 text-sm">
                    <p className="leading-relaxed">According to the Q3 Financial Report, the net profit margin was <strong>24.6%</strong>, representing an increase of <strong>1.8%</strong> quarter-over-quarter. This growth was primarily driven by lower operational costs and a 12% rise in SaaS subscription revenues.</p>
                    
                    {/* Citations Mock */}
                    <div className="mt-3 flex flex-wrap gap-2 pt-2.5 border-t border-indigo-100/50 dark:border-indigo-900/20">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-indigo-200/50 dark:border-indigo-900/50 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer shadow-sm">
                        <FileText className="w-3 h-3" /> Q3_Financial_Report.pdf • Page 12
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full max-w-6xl scroll-mt-24 mb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Engineered for Enterprise Documents
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Our high-performance indexing pipeline extracts text, chunks accurately, and builds instant FAISS indices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="glass-panel glass-panel-hover p-6 rounded-2xl text-left flex gap-4"
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl h-fit border border-slate-200/40 dark:border-slate-800/30">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full max-w-5xl bg-gradient-to-r from-indigo-600/10 to-violet-600/10 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200/40 dark:border-indigo-900/30 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="glow-indigo w-80 h-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <h2 className="relative z-10 text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Unlock Your Enterprise Intelligence?
          </h2>
          <p className="relative z-10 text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
            Experience lightning fast retrieval times, precise page coordinates, and full dark-theme workspace capabilities.
          </p>
          <button 
            onClick={() => navigate('/app')}
            className="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md"
          >
            Access Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 py-8 bg-slate-100/50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} Enterprise AI Knowledge Copilot. Built with React + FastAPI.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Security</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">API Docs</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
