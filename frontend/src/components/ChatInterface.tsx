import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Database,
  Cpu, 
  AlertCircle, 
  ChevronDown,
  BookOpen,
  Sparkles
} from 'lucide-react';

export default function ChatInterface() {
  const { 
    activeChatId, 
    setActiveChatId, 
    conversations, 
    addConversation,
    addMessageToChat, 
    updateLastMessageContent,
    updateLastMessageCitations,
    activeModel,
    documents,
    selectedDocScope,
    toggleDocScope,
    setSelectedCitation,
    setPdfPanelOpen,
    setSidebarOpen,
    currentRole,
    explainSimpler,
    setExplainSimpler
  } = useAppStore();


  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];
  const readyDocuments = documents.filter(d => d.status === 'ready');

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Click outside listener for scope dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsScopeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isStreaming) return;

    setStreamError(null);
    let chatId = activeChatId;

    // 1. If no active conversation exists, generate one
    if (!chatId) {
      chatId = 'chat-' + Math.random().toString(36).substr(2, 9);
      const newTitle = textToSend.length > 25 ? textToSend.substring(0, 25) + '...' : textToSend;
      const newChat = {
        id: chatId,
        title: newTitle,
        updatedAt: new Date().toISOString(),
        messages: []
      };
      addConversation(newChat);
      setActiveChatId(chatId);
    }

    // 2. Add user message
    const userMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      role: 'user' as const,
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    addMessageToChat(chatId, userMsg);
    setInputMessage('');

    // 3. Add temporary assistant message
    const assistantMsgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: '',
      timestamp: new Date().toISOString()
    };
    addMessageToChat(chatId, assistantMsg);
    
    setIsStreaming(true);
    let cumulativeResponse = '';

    // 4. Stream response
    try {
      await apiService.streamMessage(
        textToSend,
        selectedDocScope,
        activeModel,
        chatId,
        (token) => {
          cumulativeResponse += token;
          updateLastMessageContent(chatId!, cumulativeResponse);
        },
        (citations) => {
          updateLastMessageCitations(chatId!, citations);
        },
        () => {
          setIsStreaming(false);
        },
        (err) => {
          console.error(err);
          setStreamError('Connection to server lost. Showing partial response.');
          setIsStreaming(false);
        },
        currentRole,
        explainSimpler
      );
    } catch (err) {
      console.error(err);
      setStreamError('Failed to establish API connection.');
      setIsStreaming(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleCitationClick = (citation: any) => {
    setSelectedCitation(citation);
    setPdfPanelOpen(true);
  };

  // Suggestions for empty state
  const suggestions = [
    { text: "What was our net profit margin in Q3?", query: "profit Q3" },
    { text: "How should we configure Kubernetes network policies?", query: "Kubernetes network security policy" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19]/5 dark:bg-[#070b13]/20 relative overflow-hidden">
      
      {/* Mobile Header */}
      <header className="h-16 bg-white dark:bg-[#0e1422] border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between md:hidden">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-slate-850 dark:text-slate-200">Workspace Chat</span>
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6">
        {messages.length === 0 ? (
          /* Empty Chat View */
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6">
            <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow shadow-indigo-500/5 animate-pulse-glow">
              <Bot className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Enterprise AI Assistant</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask questions from your uploaded PDF repository. Select which documents to scope for contextual answers.
              </p>
            </div>

            {/* Suggestions */}
            <div className="grid grid-cols-1 gap-2.5 w-full pt-4">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug.text)}
                  className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 rounded-xl text-xs text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-sm"
                >
                  <span className="font-medium block text-slate-800 dark:text-slate-200 mb-0.5">{sug.text}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Triggers simulation for: "{sug.query}"</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar left */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Bubble content */}
                <div className={`max-w-[85%] rounded-2xl px-4.5 py-3 border shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-950 dark:border-white font-medium'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/65 text-slate-800 dark:text-slate-200'
                }`}>
                  {/* Markdown or plain text */}
                  {msg.role === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose dark:prose-invert text-sm leading-relaxed">
                      {msg.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        /* Typing indicator */
                        <div className="flex items-center gap-1 py-1.5" aria-label="Thinking">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Citations list for assistant message */}
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-2">
                      {msg.citations.map((citation) => (
                        <button
                          key={citation.id}
                          onClick={() => handleCitationClick(citation)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-200/40 dark:border-indigo-900/40 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:border-indigo-400 dark:hover:border-indigo-800/80 transition-all shadow-sm"
                        >
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{citation.documentName}</span>
                          <span className="text-[9px] opacity-75 font-mono">• Page {citation.pageNumber}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Avatar right */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Inline stream error badge */}
            {streamError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-500">
                <AlertCircle className="w-4.5 h-4.5" />
                <span>{streamError}</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Tray */}
      <div className="p-4 md:p-6 bg-white dark:bg-[#0e1422] border-t border-slate-200 dark:border-slate-800/60 shadow-lg relative">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto space-y-3">
          
          {/* Top Options Bar (Document scopes & model details) */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Document Scope Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
                disabled={readyDocuments.length === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                  readyDocuments.length === 0
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 font-medium'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                {selectedDocScope.length === 0
                  ? 'All Documents (System Scope)'
                  : `Scope: ${selectedDocScope.length} PDF${selectedDocScope.length > 1 ? 's' : ''}`}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Dropdown Menu */}
              {isScopeDropdownOpen && readyDocuments.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2.5 z-20 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                    Filter Search Scope
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {readyDocuments.map((doc) => {
                      const isChecked = selectedDocScope.includes(doc.id);
                      return (
                        <label
                          key={doc.id}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDocScope(doc.id)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-750 dark:text-slate-350 truncate">{doc.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-900 flex justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDocScope(readyDocuments[0]?.id)} // Simple toggle helper or clear
                      className="text-[10px] text-indigo-500 font-medium hover:underline"
                    >
                      Clear/Toggle
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScopeDropdownOpen(false)}
                      className="text-[10px] text-slate-500 font-medium hover:underline"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Model & Tutor Mode Indicators */}
            <div className="flex items-center gap-3 text-slate-450 dark:text-slate-500 font-mono text-[10px]">
              {/* Explain Simpler Toggle */}
              {currentRole === 'student' && (
                <button
                  type="button"
                  onClick={() => setExplainSimpler(!explainSimpler)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                    explainSimpler
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  title="Toggles plain-language simplified answers tailored for students"
                >
                  <Sparkles className={`w-3 h-3 ${explainSimpler ? 'text-indigo-500 animate-pulse' : 'opacity-60'}`} />
                  <span>Explain Simpler</span>
                </button>
              )}

              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>LLM: {activeModel}</span>
              </div>
            </div>
          </div>

          {/* Actual Input Container */}
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-all">
            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e);
                }
              }}
              placeholder="Ask a question from the PDF context..."
              className="w-full pl-4 pr-12 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none resize-none max-h-24"
            />
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className={`absolute right-2 p-2 rounded-lg transition-colors ${
                inputMessage.trim() && !isStreaming
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow shadow-indigo-500/10'
                  : 'bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
