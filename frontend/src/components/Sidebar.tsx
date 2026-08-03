import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService, isMockMode } from '../services/api';
import { 
  Trash2, 
  Plus, 
  Edit3, 
  Settings, 
  Moon, 
  Sun, 
  Check, 
  AlertTriangle, 
  Database,
  MessageSquare,
  X,
  FolderOpen
} from 'lucide-react';

export default function Sidebar() {
  const { 
    theme, 
    toggleTheme,
    isSidebarOpen, 
    setSidebarOpen, 
    setSettingsOpen,
    documents,
    deleteDocumentState,
    selectedDocScope,
    toggleDocScope,
    conversations,
    activeChatId,
    setActiveChatId,
    renameConversation,
    deleteConversation,
    addConversation
  } = useAppStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const getFileBadge = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">PDF</span>;
      case 'docx':
      case 'doc':
        return <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">DOCX</span>;
      case 'pptx':
      case 'ppt':
        return <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">PPTX</span>;
      case 'xlsx':
      case 'xls':
        return <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">EXCEL</span>;
      case 'csv':
        return <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">CSV</span>;
      case 'md':
      case 'txt':
        return <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">{ext.toUpperCase()}</span>;
      default:
        return <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">FILE</span>;
    }
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  const handleDeleteDoc = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove "${name}"?`)) {
      try {
        await apiService.deleteDocument(id);
        deleteDocumentState(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete document');
      }
    }
  };

  const handleNewChat = () => {
    const newId = 'chat-' + Math.random().toString(36).substr(2, 9);
    const newChat = {
      id: newId,
      title: 'New Conversation',
      updatedAt: new Date().toISOString(),
      messages: []
    };
    addConversation(newChat);
    setActiveChatId(newId);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-80 bg-white dark:bg-[#0e1422] border-r border-slate-200 dark:border-slate-800/80 flex flex-col transform ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } md:translate-x-0 transition-transform duration-300 ease-in-out`}>
      
      {/* Branding */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800/50 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500 rounded-lg text-white">
            <Database className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white tracking-tight">KnowledgeCopilot</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Actions */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow shadow-indigo-500/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> New Conversation
        </button>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Document Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> Documents ({documents.length})
            </h4>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
              Scope: {selectedDocScope.length}
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-6 px-3 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl">
              <p className="text-xs text-slate-400 dark:text-slate-500">No PDFs uploaded yet. Drag one into the upload zone to start.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isInScope = selectedDocScope.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (doc.status === 'ready') toggleDocScope(doc.id);
                    }}
                    className={`group flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      doc.status === 'ready'
                        ? isInScope
                          ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/40 dark:border-indigo-500/30'
                          : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                        : 'bg-slate-100/30 dark:bg-slate-900/10 border-slate-200/20 dark:border-slate-800/20 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {doc.status === 'uploading' && (
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {doc.status === 'processing' && (
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" title="Extracting text & building FAISS index" />
                        )}
                        {doc.status === 'failed' && (
                          <span title={doc.error || 'Extraction failed'}>
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          </span>
                        )}
                        {doc.status === 'ready' && (
                          <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all ${
                            isInScope 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium block truncate ${
                            doc.status === 'ready' 
                              ? 'text-slate-700 dark:text-slate-300' 
                              : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {doc.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {getFileBadge(doc.name)}

                          {doc.status === 'uploading' && (
                            <span className="text-[9px] text-indigo-500 font-medium block">
                              Uploading {doc.progress}%
                            </span>
                          )}
                          {doc.status === 'processing' && (
                            <span className="text-[9px] text-amber-500 font-semibold block animate-pulse">
                              Embedding...
                            </span>
                          )}
                          {doc.status === 'failed' && (
                            <span className="text-[9px] text-rose-500 font-medium block truncate" title={doc.error}>
                              Failed: {doc.error}
                            </span>
                          )}
                          {doc.status === 'ready' && (
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                              {formatBytes(doc.size)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDoc(doc.id, doc.name, e)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all ml-1.5"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat History Section */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Conversations
          </h4>
          
          {conversations.length === 0 ? (
            <div className="text-center py-6 px-3 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl">
              <p className="text-xs text-slate-400 dark:text-slate-500">No chat history. Start a new topic above.</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setSidebarOpen(false); // Close on mobile
                  }}
                  className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                    activeChatId === chat.id
                      ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(chat.id)}
                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-950 border border-indigo-500 text-xs px-1.5 py-0.5 rounded w-full focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs truncate block flex-1">
                        {chat.title}
                      </span>
                    )}
                  </div>

                  {editingChatId !== chat.id && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5">
                      <button
                        onClick={(e) => handleStartRename(chat.id, chat.title, e)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        title="Rename"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this conversation?')) deleteConversation(chat.id);
                        }}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-[#0c101c] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        {/* Backend mode status badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${
          isMockMode() 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isMockMode() ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {isMockMode() ? 'Mock Engine' : 'FastAPI live'}
        </div>
      </div>
    </aside>
  );
}
