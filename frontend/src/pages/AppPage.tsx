import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ActiveTab } from '../store/useAppStore';
import { apiService } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import UploadZone from '../components/UploadZone';
import PdfPreviewPanel from '../components/PdfPreviewPanel';
import SettingsModal from '../components/SettingsModal';
import RoleSelector from '../components/RoleSelector';
import QuizTab from '../components/student/QuizTab';
import FlashcardsTab from '../components/student/FlashcardsTab';
import SummaryTab from '../components/student/SummaryTab';
import QuestionBankTab from '../components/teacher/QuestionBankTab';
import CoverageGapsTab from '../components/teacher/CoverageGapsTab';
import ExecutiveBriefingTab from '../components/manager/ExecutiveBriefingTab';
import ActionKpiTab from '../components/manager/ActionKpiTab';
import SopGuideTab from '../components/employee/SopGuideTab';
import ComplianceChecklistTab from '../components/employee/ComplianceChecklistTab';

import { 
  UploadCloud, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Layers,
  MessageSquare,
  HelpCircle,
  ListChecks,
  FileQuestion,
  PieChart,
  Briefcase,
  Target,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export default function AppPage() {
  const { 
    setDocuments, 
    setConversations,
    setActiveChatId,
    currentRole,
    activeTab,
    setActiveTab
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isUploadExpanded, setIsUploadExpanded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch initial app data (docs & histories)
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const [docs, chats] = await Promise.all([
          apiService.getDocuments(),
          apiService.getChatHistory()
        ]);
        
        setDocuments(docs);
        setConversations(chats);
        
        if (chats.length > 0) {
          setActiveChatId(chats[0].id);
        }
      } catch (err) {
        setLoadError('Failed to synchronize with RAG server. Operating in offline/mock fallback mode.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [setDocuments, setConversations, setActiveChatId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 font-mono tracking-wider">
          Initializing RAG Workspace...
        </span>
      </div>
    );
  }

  // Define tabs based on role
  const studentTabs = [
    { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
    { id: 'quiz', label: 'Quiz Mode', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'summary', label: 'Summary & Guide', icon: ListChecks }
  ];

  const teacherTabs = [
    { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
    { id: 'question-bank', label: 'Question Bank', icon: FileQuestion },
    { id: 'coverage', label: 'Coverage Gaps', icon: PieChart }
  ];

  const managerTabs = [
    { id: 'chat', label: 'Executive Chat', icon: MessageSquare },
    { id: 'executive-briefing', label: 'Executive Briefing', icon: Briefcase },
    { id: 'action-kpis', label: 'Action Items & KPIs', icon: Target }
  ];

  const employeeTabs = [
    { id: 'chat', label: 'Operations Chat', icon: MessageSquare },
    { id: 'sop-guide', label: 'SOP Workflow Guide', icon: UserCheck },
    { id: 'compliance', label: 'Onboarding & Compliance', icon: ShieldCheck }
  ];

  const currentTabs = currentRole === 'teacher' 
    ? teacherTabs 
    : currentRole === 'manager'
      ? managerTabs
      : currentRole === 'employee'
        ? employeeTabs
        : studentTabs;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex relative overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Panel Shell */}
      <div className="flex-1 md:pl-80 flex flex-col h-screen overflow-hidden">
        
        {/* Workspace Top Header Bar */}
        <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#0e1422] px-6 flex items-center justify-between z-10 shadow-sm shadow-slate-100/5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 hidden sm:block">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">Document Copilot Workspace</h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden md:inline">Grounded Retrieval Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Persona Role Switcher */}
            <RoleSelector />

            {/* Quick Upload Expand Trigger */}
            <button
              onClick={() => setIsUploadExpanded(!isUploadExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isUploadExpanded 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-350 dark:hover:border-slate-700'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload PDF</span>
              {isUploadExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </header>

        {/* Role Feature Navigation Tab Bar */}
        <div className="bg-white dark:bg-[#0c101c] border-b border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center gap-2 overflow-x-auto z-10">
          {currentTabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Upload Accordion Section */}
        {isUploadExpanded && (
          <div className="bg-white dark:bg-[#0e1422] border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 animate-in slide-in-from-top duration-200 z-10">
            <div className="max-w-3xl mx-auto">
              <UploadZone />
            </div>
          </div>
        )}

        {/* Sync Server Error Warning Header */}
        {loadError && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 z-10 font-medium">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{loadError}</span>
            </div>
            <button 
              onClick={() => setLoadError(null)} 
              className="text-[10px] uppercase font-bold tracking-wider opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Inner Workspace Container (Selected Feature Content) */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Dynamic Tab Content */}
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'quiz' && <QuizTab />}
          {activeTab === 'flashcards' && <FlashcardsTab />}
          {activeTab === 'summary' && <SummaryTab />}
          {activeTab === 'question-bank' && <QuestionBankTab />}
          {activeTab === 'coverage' && <CoverageGapsTab />}
          {activeTab === 'executive-briefing' && <ExecutiveBriefingTab />}
          {activeTab === 'action-kpis' && <ActionKpiTab />}
          {activeTab === 'sop-guide' && <SopGuideTab />}
          {activeTab === 'compliance' && <ComplianceChecklistTab />}

          {/* Right Citation PDF Highlight Panel */}
          <PdfPreviewPanel />
        </div>
      </div>

      {/* Settings Dialog Portal Overlay */}
      <SettingsModal />
    </div>
  );
}

