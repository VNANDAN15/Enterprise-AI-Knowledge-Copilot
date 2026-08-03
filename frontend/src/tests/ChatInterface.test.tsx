import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatInterface from '../components/ChatInterface';

// Mock the Zustand store hooks to simulate different conversation structures
vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({
    activeChatId: null,
    setActiveChatId: vi.fn(),
    conversations: [],
    addConversation: vi.fn(),
    addMessageToChat: vi.fn(),
    updateLastMessageContent: vi.fn(),
    updateLastMessageCitations: vi.fn(),
    activeModel: 'Gemini 3.5 Flash',
    documents: [],
    selectedDocScope: [],
    toggleDocScope: vi.fn(),
    setSelectedCitation: vi.fn(),
    setPdfPanelOpen: vi.fn(),
    setSidebarOpen: vi.fn(),
  }),
}));

describe('ChatInterface Component', () => {
  it('renders the welcome state when there are no active messages', () => {
    render(<ChatInterface />);
    
    expect(screen.getByText('Enterprise AI Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Ask questions from your uploaded PDF repository/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask a question from the PDF context...')).toBeInTheDocument();
  });

  it('displays the suggested prompt buttons in empty state', () => {
    render(<ChatInterface />);
    
    expect(screen.getByText('What was our net profit margin in Q3?')).toBeInTheDocument();
    expect(screen.getByText('How should we configure Kubernetes network policies?')).toBeInTheDocument();
  });
});
