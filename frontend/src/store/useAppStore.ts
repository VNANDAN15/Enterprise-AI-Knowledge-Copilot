import { create } from 'zustand';
import type { Document, ChatMessage, ChatHistory, Citation } from '../services/api';

export type PersonaRole = 'student' | 'teacher' | 'manager' | 'employee';
export type ActiveTab = 'chat' | 'quiz' | 'flashcards' | 'summary' | 'question-bank' | 'coverage' | 'executive-briefing' | 'action-kpis' | 'sop-guide' | 'compliance';

interface AppState {
  // Persona & Role Navigation
  currentRole: PersonaRole;
  setCurrentRole: (role: PersonaRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  explainSimpler: boolean;
  setExplainSimpler: (explain: boolean) => void;

  // Theme & UI States
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isPdfPanelOpen: boolean;
  setPdfPanelOpen: (open: boolean) => void;

  // Documents
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  replaceDocumentId: (oldId: string, newDoc: Document) => void;
  deleteDocumentState: (id: string) => void;
  selectedDocScope: string[];
  setSelectedDocScope: (ids: string[]) => void;
  toggleDocScope: (id: string) => void;

  // Chats
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  activeModel: string;
  setActiveModel: (model: string) => void;
  conversations: ChatHistory[];
  setConversations: (convs: ChatHistory[]) => void;
  addConversation: (chat: ChatHistory) => void;
  addMessageToChat: (chatId: string, message: ChatMessage) => void;
  updateLastMessageContent: (chatId: string, content: string) => void;
  updateLastMessageCitations: (chatId: string, citations: Citation[]) => void;
  renameConversation: (chatId: string, title: string) => void;
  deleteConversation: (chatId: string) => void;

  // Citations Preview
  selectedCitation: Citation | null;
  setSelectedCitation: (citation: Citation | null) => void;
}


export const useAppStore = create<AppState>((set) => {
  // Initial Theme logic
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const initialTheme = savedTheme || 'dark'; // Default to a premium dark mode

  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Initial Role logic
  const savedRole = localStorage.getItem('app_role') as PersonaRole | null;
  const initialRole: PersonaRole = (savedRole === 'student' || savedRole === 'teacher' || savedRole === 'manager' || savedRole === 'employee') 
    ? savedRole 
    : 'student';

  return {
    // Persona & Role Navigation
    currentRole: initialRole,
    setCurrentRole: (role) => set(() => {
      localStorage.setItem('app_role', role);
      // Default tab when switching role
      const defaultTab = role === 'teacher' ? 'chat' : 'chat';
      return { currentRole: role, activeTab: defaultTab };
    }),
    activeTab: 'chat',
    setActiveTab: (tab) => set({ activeTab: tab }),
    explainSimpler: false,
    setExplainSimpler: (explain) => set({ explainSimpler: explain }),

    // Theme & UI

    theme: initialTheme,
    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    }),
    isSidebarOpen: false,
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    isSettingsOpen: false,
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    isPdfPanelOpen: false,
    setPdfPanelOpen: (open) => set({ isPdfPanelOpen: open }),

    // Documents
    documents: [],
    setDocuments: (docs) => set({ documents: docs }),
    addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
    updateDocument: (id, updates) => set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    })),
    replaceDocumentId: (oldId, newDoc) => set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === oldId ? { ...newDoc } : doc
      ),
      selectedDocScope: state.selectedDocScope.map((scopeId) =>
        scopeId === oldId ? newDoc.id : scopeId
      )
    })),
    deleteDocumentState: (id) => set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
      selectedDocScope: state.selectedDocScope.filter((scopeId) => scopeId !== id)
    })),
    selectedDocScope: [],
    setSelectedDocScope: (ids) => set({ selectedDocScope: ids }),
    toggleDocScope: (id) => set((state) => {
      const isSelected = state.selectedDocScope.includes(id);
      return {
        selectedDocScope: isSelected
          ? state.selectedDocScope.filter((x) => x !== id)
          : [...state.selectedDocScope, id]
      };
    }),

    // Chats
    activeChatId: null,
    setActiveChatId: (id) => set({ activeChatId: id }),
    activeModel: 'Gemini 3.5 Flash',
    setActiveModel: (model) => set({ activeModel: model }),
    conversations: [],
    setConversations: (convs) => set({ conversations: convs }),
    addConversation: (chat) => set((state) => ({ conversations: [chat, ...state.conversations] })),
    addMessageToChat: (chatId, message) => set((state) => ({
      conversations: state.conversations.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
              updatedAt: new Date().toISOString()
            }
          : chat
      )
    })),
    updateLastMessageContent: (chatId, content) => set((state) => ({
      conversations: state.conversations.map((chat) => {
        if (chat.id !== chatId) return chat;
        const messages = [...chat.messages];
        if (messages.length === 0) return chat;
        const lastMsg = messages[messages.length - 1];
        messages[messages.length - 1] = { ...lastMsg, content };
        return { ...chat, messages, updatedAt: new Date().toISOString() };
      })
    })),
    updateLastMessageCitations: (chatId, citations) => set((state) => ({
      conversations: state.conversations.map((chat) => {
        if (chat.id !== chatId) return chat;
        const messages = [...chat.messages];
        if (messages.length === 0) return chat;
        const lastMsg = messages[messages.length - 1];
        messages[messages.length - 1] = { ...lastMsg, citations };
        return { ...chat, messages, updatedAt: new Date().toISOString() };
      })
    })),
    renameConversation: (chatId, title) => set((state) => ({
      conversations: state.conversations.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    })),
    deleteConversation: (chatId) => set((state) => ({
      conversations: state.conversations.filter((chat) => chat.id !== chatId),
      activeChatId: state.activeChatId === chatId ? null : state.activeChatId
    })),

    // Citations
    selectedCitation: null,
    setSelectedCitation: (citation) => set({ selectedCitation: citation })
  };
});
