export interface Document {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  progress: number;
  error?: string;
  uploadedAt: string;
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface ChatHistory {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  citation?: Citation;
}

export interface QuizResponse {
  title: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  citation?: Citation;
}

export interface FlashcardResponse {
  title: string;
  cards: Flashcard[];
}

export interface SummarySection {
  heading: string;
  keyTakeaways: string[];
  deepDive?: string;
  citation?: Citation;
}

export interface ChecklistItem {
  id: string;
  concept: string;
  description: string;
  status: 'pending' | 'completed';
  citation?: Citation;
}

export interface SummaryResponse {
  title: string;
  overview: string;
  sections: SummarySection[];
  checklist: ChecklistItem[];
}

export interface RubricTiers {
  fullMarks: string;
  partialMarks: string;
  minimalMarks: string;
}

export interface QuestionBankItem {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel?: string;
  questionType?: string;
  topicTag: string;
  totalMarks?: number;
  answerKey: string;
  markingCriteria: string;
  rubricTiers?: RubricTiers;
  citation?: Citation;
}

export interface QuestionBankResponse {
  title: string;
  questions: QuestionBankItem[];
}

export interface CoverageTopic {
  topic: string;
  coverage: 'dense' | 'sparse';
  chunkCount: number;
  summary: string;
  recommendation: string;
}

export interface CoverageGapResponse {
  documentName: string;
  overallDensityScore: number;
  topics: CoverageTopic[];
}

// Manager Persona Interfaces
export interface ExecutiveBriefingResponse {
  title: string;
  focusArea: string;
  executiveSummary: string;
  strategicObjectives: string[];
  resourceImpact: string;
  keyRisks: string[];
  recommendations: string[];
  citation?: Citation;
}

export interface ActionItem {
  id: string;
  task: string;
  ownerRole: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  status: 'pending' | 'completed';
  citationText?: string;
  citation?: Citation;
}

export interface KpiMetric {
  id: string;
  metric: string;
  targetValue: string;
  category: string;
  insight: string;
  citationText?: string;
  citation?: Citation;
}

export interface ActionKpiResponse {
  title: string;
  department: string;
  actionItems: ActionItem[];
  kpis: KpiMetric[];
}

// Employee Persona Interfaces
export interface SopStep {
  stepNumber: number;
  heading: string;
  instruction: string;
  expectedOutcome: string;
  citation?: Citation;
}

export interface SopGuideResponse {
  title: string;
  processName: string;
  prerequisites: string[];
  steps: SopStep[];
  safetyNotes: string[];
  citation?: Citation;
}

export interface ComplianceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  requirementLevel: 'Mandatory' | 'Recommended' | 'Optional';
  citationText?: string;
  citation?: Citation;
}

export interface ComplianceChecklistResponse {
  title: string;
  roleType: string;
  completionEstimate: string;
  items: ComplianceItem[];
}



// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// We toggle mock mode if explicitly set by user. Defaults to false (connecting to live Flask server on port 8000).
const getMockMode = (): boolean => {
  const localVal = localStorage.getItem('MOCK_MODE');
  if (localVal !== null) {
    return localVal === 'true';
  }
  return false;
};

export const setMockMode = (value: boolean) => {
  localStorage.setItem('MOCK_MODE', String(value));
};

export const isMockMode = getMockMode;

// In-Memory Database for Mock Mode
let mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Q3_Financial_Report.pdf',
    size: 2450000,
    status: 'ready',
    progress: 100,
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'doc-2',
    name: 'Security_Best_Practices_v4.pdf',
    size: 1120000,
    status: 'ready',
    progress: 100,
    uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

let mockChatHistory: ChatHistory[] = [
  {
    id: 'chat-1',
    title: 'Financial Q3 Profit Margin Analysis',
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What was our net profit margin in Q3?',
        timestamp: new Date(Date.now() - 590000).toISOString()
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'According to the Q3 Financial Report, the net profit margin was **24.6%**, which represents an increase of **1.8%** quarter-over-quarter. This growth was primarily driven by lower operational costs and a 12% rise in SaaS subscription revenues.',
        timestamp: new Date(Date.now() - 580000).toISOString(),
        citations: [
          {
            id: 'cit-1',
            documentId: 'doc-1',
            documentName: 'Q3_Financial_Report.pdf',
            pageNumber: 12,
            text: 'Net profit margins for Q3 reached 24.6% (compared to 22.8% in Q2). Operating expenses decreased by 4.2% while SaaS revenue increased 12.3% to $14.2M.'
          }
        ]
      }
    ]
  },
  {
    id: 'chat-2',
    title: 'Kubernetes Security Policy',
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'How should we configure Kubernetes network policies?',
        timestamp: new Date(Date.now() - 3600000 * 3 + 10000).toISOString()
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: 'To secure Kubernetes namespaces, you must enforce a **Default Deny All** ingress and egress policy and explicitly whitelist allowed traffic. Here is an example YAML:\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-all\n  namespace: production\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress\n```\n\nAdditionally:\n1. Apply Policies per namespace.\n2. Leverage service mesh (e.g. Istio) for mTLS authentication.\n3. Implement role-based access control (RBAC).',
        timestamp: new Date(Date.now() - 3600000 * 3 + 20000).toISOString(),
        citations: [
          {
            id: 'cit-2',
            documentId: 'doc-2',
            documentName: 'Security_Best_Practices_v4.pdf',
            pageNumber: 8,
            text: 'Kubernetes Security recommendation: Implement default deny-all NetworkPolicies across all production namespaces. This isolates pods from unauthorized ingress and egress traffic unless explicitly permitted.'
          }
        ]
      }
    ]
  }
];

// Helper to delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // 1. Get List of Documents
  async getDocuments(): Promise<Document[]> {
    if (isMockMode()) {
      await delay(400);
      return [...mockDocuments];
    }
    const response = await fetch(`${API_BASE_URL}/documents`);
    if (!response.ok) throw new Error('Failed to load documents');
    return response.json();
  },

  // 2. Upload Document
  async uploadDocument(
    file: File,
    onProgress: (progress: number, status: Document['status'], error?: string) => void
  ): Promise<Document> {
    if (isMockMode()) {
      const newDoc: Document = {
        id: 'doc-' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date().toISOString()
      };
      
      mockDocuments.unshift(newDoc);

      // Check for forced simulation error (e.g., if file contains "error" or is not PDF)
      const isCorrupt = file.name.toLowerCase().includes('corrupt') || !file.name.endsWith('.pdf');

      // Simulate Uploading State
      for (let p = 0; p <= 100; p += 25) {
        await delay(250);
        newDoc.progress = p;
        onProgress(p, 'uploading');
      }

      if (isCorrupt) {
        await delay(300);
        newDoc.status = 'failed';
        newDoc.error = !file.name.endsWith('.pdf') 
          ? 'Unsupported format. Only PDF files are allowed.' 
          : 'Failed to process document: PDF file is corrupted or unreadable.';
        onProgress(100, 'failed', newDoc.error);
        return newDoc;
      }

      // Simulate Processing/Embedding State (Sentence Transformers + FAISS)
      newDoc.status = 'processing';
      newDoc.progress = 100;
      onProgress(100, 'processing');
      await delay(2000); // 2s processing simulation

      // Ready State
      newDoc.status = 'ready';
      onProgress(100, 'ready');
      return newDoc;
    }

    // Real API Call
    const formData = new FormData();
    formData.append('file', file);

    // Simple XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress, 'uploading');
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const doc = JSON.parse(xhr.responseText);
            // If the backend returns immediately but does processing in background/sync,
            // we adjust the response.
            resolve(doc);
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          let errMsg = 'Failed to upload document';
          try {
            const resp = JSON.parse(xhr.responseText);
            errMsg = resp.detail || errMsg;
          } catch {}
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  },

  // 3. Delete Document
  async deleteDocument(id: string): Promise<void> {
    if (isMockMode()) {
      await delay(300);
      mockDocuments = mockDocuments.filter((d) => d.id !== id);
      return;
    }
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },

  // 4. Get Chat History
  async getChatHistory(): Promise<ChatHistory[]> {
    if (isMockMode()) {
      await delay(400);
      return [...mockChatHistory];
    }
    const response = await fetch(`${API_BASE_URL}/chat/history`);
    if (!response.ok) throw new Error('Failed to load chat history');
    return response.json();
  },

  // 5. Send Chat Message (Standard Request/Response)
  async sendMessage(
    message: string,
    documentIds: string[],
    model: string,
    chatId?: string
  ): Promise<{ response: ChatMessage; chatId: string }> {
    if (isMockMode()) {
      await delay(1500);
      const generatedId = chatId || 'chat-' + Math.random().toString(36).substr(2, 9);
      
      const newResponse: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: `This is a standard mock response for query: "${message}". Modeled using **${model}**. We have matched context from ${documentIds.length} document(s).`,
        timestamp: new Date().toISOString(),
        citations: documentIds.map((docId, index) => {
          const doc = mockDocuments.find(d => d.id === docId);
          return {
            id: `cit-mock-${index}`,
            documentId: docId,
            documentName: doc ? doc.name : 'Unknown.pdf',
            pageNumber: index + 1,
            text: `Mock retrieved text chunk ${index + 1} from page ${index + 1} of ${doc ? doc.name : 'document'}. This contains the relevant context.`
          };
        })
      };

      return { response: newResponse, chatId: generatedId };
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, document_ids: documentIds, model, chat_id: chatId }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // 6. Stream Chat Message (SSE/Stream Connection)
  async streamMessage(
    message: string,
    documentIds: string[],
    model: string,
    chatId: string | undefined,
    onToken: (token: string) => void,
    onCitation: (citations: Citation[]) => void,
    onComplete: (finalChatId: string) => void,
    onError: (err: any) => void,
    role: string = 'student',
    explainSimpler: boolean = false
  ): Promise<void> {
    if (isMockMode()) {
      const generatedChatId = chatId || 'chat-' + Math.random().toString(36).substr(2, 9);
      
      const queryLower = message.toLowerCase();
      let responseText = '';
      let mockCitations: Citation[] = [];

      const selectedDocs = mockDocuments.filter(d => documentIds.includes(d.id));

      if (explainSimpler) {
        responseText = `💡 **Plain Language Explanation (Tutor Mode)**:\n\nImagine you have a personal digital filing cabinet. Whenever you ask a question, instead of searching through every single page manually, your assistant uses a smart index card system to immediately pull out the top 3 most relevant pages!\n\nHere is what that means for your question "${message}":\n- **Core Concept**: We look up key matching terms in the document text.\n- **Analogy**: It's like using a laser pointer to highlight exact paragraphs in a textbook rather than reading the whole book from cover to cover.\n\nEverything is strictly backed by your uploaded source documents!`;
        mockCitations = selectedDocs.map((doc, idx) => ({
          id: `cit-simpler-${idx}`,
          documentId: doc.id,
          documentName: doc.name,
          pageNumber: 1,
          text: `Retrieved passage explaining core concept for ${message}.`
        }));
      } else if (queryLower.includes('profit') || queryLower.includes('financial') || queryLower.includes('q3')) {
        responseText = `Based on the **Q3 Financial Report**:\n\n* **Net profit margin** reached **24.6%** (up from 22.8% in Q2).\n* **SaaS Revenue** grew **12.3%** quarter-over-quarter, reaching **$14.2M**.\n* **Operational Expenses** were trimmed by **4.2%**, primarily through automated cloud cost optimizations.\n\nHere is a quick summary table of performance metrics:\n\n| Quarter | Profit Margin | SaaS Revenue | OpEx Savings |\n| ------- | ------------- | ------------ | ------------ |\n| Q2      | 22.8%         | $12.6M       | Baseline     |\n| Q3      | 24.6%         | $14.2M       | 4.2%         |\n\nLet me know if you would like me to compile the projected figures for Q4.`;
        if (selectedDocs.some(d => d.id === 'doc-1')) {
          mockCitations = [
            {
              id: 'cit-1',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 12,
              text: 'Net profit margins for Q3 reached 24.6% (compared to 22.8% in Q2). Operating expenses decreased by 4.2% while SaaS revenue increased 12.3% to $14.2M.'
            },
            {
              id: 'cit-3',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 15,
              text: 'SaaS subscription MRR saw an accelerated growth rate in September, peaking at $4.73M monthly run rate, showing substantial expansion in enterprise tier clients.'
            }
          ];
        }
      } else if (queryLower.includes('security') || queryLower.includes('kubernetes') || queryLower.includes('policy')) {
        responseText = `To implement standard Kubernetes network security guidelines, you should establish a default isolation posture first:\n\n1. **Default Deny All Ingress/Egress**: Ensures no network communication occurs unless explicitly allowed.\n2. **Targeted Whitelisting**: Use namespace selectors to restrict backend pods to database pods.\n\nHere is the recommended configuration:\n\n\`\`\`yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-all\n  namespace: production\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress\n\`\`\`\n\nApply this immediately in your staging clusters before rolling to production.`;
        if (selectedDocs.some(d => d.id === 'doc-2')) {
          mockCitations = [
            {
              id: 'cit-2',
              documentId: 'doc-2',
              documentName: 'Security_Best_Practices_v4.pdf',
              pageNumber: 8,
              text: 'Kubernetes Security recommendation: Implement default deny-all NetworkPolicies across all production namespaces. This isolates pods from unauthorized ingress and egress traffic unless explicitly permitted.'
            }
          ];
        }
      } else {
        responseText = `Hello! You asked: "${message}". I am analyzing your request using **${model}** as the LLM model.\n\nBecause we are running in the **Enterprise AI Copilot** workspace, I scanned the selected documents in scope. Here are the main details:\n- Selected docs: ${selectedDocs.length > 0 ? selectedDocs.map(d => d.name).join(', ') : 'None (System-wide search)'}.\n- Search Method: FAISS index cosine similarity over embeddings.\n\nPlease select relevant PDF documents from the list and checkbox filter them in the chat input bar to restrict my analysis to those specific sources.`;
        mockCitations = selectedDocs.map((doc, idx) => ({
          id: `cit-gen-${idx}`,
          documentId: doc.id,
          documentName: doc.name,
          pageNumber: 1,
          text: `Retrieved general chunk ${idx + 1} from ${doc.name}. Relevant information: ${message.substr(0, 40)}...`
        }));
      }

      const tokens = responseText.split(/(\s+)/);
      let currentIndex = 0;

      const timer = setInterval(() => {
        if (currentIndex < tokens.length) {
          onToken(tokens[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(timer);
          if (mockCitations.length > 0) {
            onCitation(mockCitations);
          }
          onComplete(generatedChatId);
        }
      }, 35);
      
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          document_ids: documentIds,
          model,
          chat_id: chatId,
          role,
          explain_simpler: explainSimpler
        }),
      });

      if (!response.ok) throw new Error('Failed to connect to streaming API');
      if (!response.body) throw new Error('Response body is empty');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.substring(5).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.token) onToken(data.token);
              if (data.citations) onCitation(data.citations);
              if (data.chat_id) chatId = data.chat_id;
            } catch (err) {
              console.error('Failed to parse SSE data packet', err);
            }
          }
        }
      }

      onComplete(chatId || 'chat-default');
    } catch (err) {
      onError(err);
    }
  },

  // 7. Student Mode: Generate Quiz
  async generateQuiz(documentIds: string[], difficulty: string = 'medium', questionCount: number = 5): Promise<QuizResponse> {
    if (isMockMode()) {
      await delay(1200);
      return {
        title: `Interactive Document Quiz (${difficulty.toUpperCase()})`,
        difficulty: difficulty,
        questions: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'What was the Q3 net profit margin reported in the financial documentation?',
            options: ['22.8%', '24.6%', '12.3%', '18.4%'],
            correctAnswer: '24.6%',
            explanation: 'According to the Q3 Financial Report, net profit margin reached 24.6%, representing a 1.8% quarter-over-quarter increase.',
            citation: {
              id: 'cit-q1',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 12,
              text: 'Net profit margins for Q3 reached 24.6% (compared to 22.8% in Q2).'
            }
          },
          {
            id: 'q2',
            type: 'mcq',
            question: 'What is the primary Kubernetes security recommendation for pod ingress/egress network traffic?',
            options: ['Allow All Traffic by Default', 'Default Deny All NetworkPolicy', 'Enable HTTP Basic Auth', 'Disable Namespaces'],
            correctAnswer: 'Default Deny All NetworkPolicy',
            explanation: 'Enforcing a default deny-all policy prevents unauthorized pod-to-pod communication across production namespaces.',
            citation: {
              id: 'cit-q2',
              documentId: 'doc-2',
              documentName: 'Security_Best_Practices_v4.pdf',
              pageNumber: 8,
              text: 'Implement default deny-all NetworkPolicies across all production namespaces.'
            }
          },
          {
            id: 'q3',
            type: 'short_answer',
            question: 'What percentage did operational expenses decrease in Q3?',
            options: [],
            correctAnswer: '4.2%',
            explanation: 'Operational expenses decreased by 4.2% through automated cloud infrastructure cost optimizations.',
            citation: {
              id: 'cit-q3',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 12,
              text: 'Operating expenses decreased by 4.2% while SaaS revenue increased 12.3%.'
            }
          }
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/student/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds, difficulty, question_count: questionCount })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate quiz');
    }
    return response.json();
  },

  // 8. Student Mode: Generate Flashcards
  async generateFlashcards(documentIds: string[], count: number = 5): Promise<FlashcardResponse> {
    if (isMockMode()) {
      await delay(1000);
      return {
        title: 'Document Key Concepts & Terminology Flashcards',
        cards: [
          {
            id: 'fc-1',
            front: 'Net Profit Margin (Q3)',
            back: '24.6% — up from 22.8% in Q2, driven by higher SaaS MRR and reduced operational expenditures.',
            category: 'Financial Metrics',
            citation: {
              id: 'cit-fc1',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 12,
              text: 'Net profit margins for Q3 reached 24.6% (compared to 22.8% in Q2).'
            }
          },
          {
            id: 'fc-2',
            front: 'Kubernetes NetworkPolicy Isolation',
            back: 'A security rule posture that blocks all incoming/outgoing pod traffic by default until explicitly permitted.',
            category: 'Infrastructure Security',
            citation: {
              id: 'cit-fc2',
              documentId: 'doc-2',
              documentName: 'Security_Best_Practices_v4.pdf',
              pageNumber: 8,
              text: 'Implement default deny-all NetworkPolicies across all production namespaces.'
            }
          },
          {
            id: 'fc-3',
            front: 'SaaS MRR Acceleration',
            back: 'Monthly recurring revenue from enterprise subscribers reached $4.73M in September.',
            category: 'SaaS Growth',
            citation: {
              id: 'cit-fc3',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 15,
              text: 'SaaS subscription MRR saw an accelerated growth rate in September, peaking at $4.73M.'
            }
          }
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/student/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds, count })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate flashcards');
    }
    return response.json();
  },

  // 9. Student Mode: Generate Summary & Checklist
  async generateSummary(documentIds: string[]): Promise<SummaryResponse> {
    if (isMockMode()) {
      await delay(1200);
      return {
        title: 'In-Scope Document Executive Summary & Study Guide',
        overview: 'Comprehensive breakdown of financial performance and security infrastructure best practices compiled from selected PDF sources.',
        sections: [
          {
            heading: '1. Financial Expansion & Operational Performance',
            keyTakeaways: [
              'Q3 Net profit margin expanded to 24.6% (up +1.8% QoQ).',
              'SaaS revenue rose 12.3% to $14.2M overall.',
              'OpEx spending decreased by 4.2% due to automated cloud savings.'
            ],
            citation: {
              id: 'cit-s1',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 12,
              text: 'Net profit margins for Q3 reached 24.6% (compared to 22.8% in Q2). Operating expenses decreased by 4.2%.'
            }
          },
          {
            heading: '2. Kubernetes & Network Security Hardening',
            keyTakeaways: [
              'Enforce Default-Deny NetworkPolicies across all production namespaces.',
              'Whitelist pod-to-pod communications explicitly via labeled selectors.',
              'Integrate service mesh mTLS for encrypted in-cluster transport.'
            ],
            citation: {
              id: 'cit-s2',
              documentId: 'doc-2',
              documentName: 'Security_Best_Practices_v4.pdf',
              pageNumber: 8,
              text: 'Implement default deny-all NetworkPolicies across all production namespaces.'
            }
          }
        ],
        checklist: [
          {
            id: 'chk-1',
            concept: 'Q3 Financial Margins',
            description: 'Understand the key drivers behind the 24.6% net profit margin expansion.',
            status: 'pending',
            citation: {
              id: 'cit-c1',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 12,
              text: 'Net profit margins for Q3 reached 24.6%.'
            }
          },
          {
            id: 'chk-2',
            concept: 'Kubernetes Network Policy YAML Syntax',
            description: 'Master writing default-deny NetworkPolicy declarations for ingress and egress.',
            status: 'pending',
            citation: {
              id: 'cit-c2',
              documentId: 'doc-2',
              documentName: 'Security_Best_Practices_v4.pdf',
              pageNumber: 8,
              text: 'Default deny-all NetworkPolicies across production namespaces.'
            }
          }
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/student/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate summary');
    }
    return response.json();
  },

  async generateQuestionBank(
    documentIds: string[], 
    difficultyMix: string = 'balanced',
    bloomLevel: string = 'all',
    questionType: string = 'all'
  ): Promise<QuestionBankResponse> {
    if (isMockMode()) {
      await delay(1100);
      return {
        title: 'Teacher Assessment Question Bank',
        questions: [
          {
            id: 'tb-1',
            question: 'Formulate a detailed financial breakdown comparing total net profit margin increases from Q2 to Q3.',
            difficulty: 'easy',
            bloomLevel: 'Analytical',
            questionType: 'long_answer',
            topicTag: 'Financial Analysis',
            totalMarks: 10,
            answerKey: 'Net profit margin in Q3 reached 24.6%, representing a 1.8% expansion over Q2 (22.8%). Operating expenses declined by 4.2%.',
            markingCriteria: 'Multi-tier rubric applied based on accurate calculation and textual citations.',
            rubricTiers: {
              fullMarks: 'Full Marks (10/10): Identifies 24.6% Q3 margin, 1.8% expansion, and 4.2% expense decline with full workings.',
              partialMarks: 'Partial Marks (5/10): Identifies margin percentage without quarter-over-quarter difference.',
              minimalMarks: 'Minimal Marks (2/10): States general financial growth without specific percentages.'
            },
            citation: {
              id: 'cit-tb1',
              documentId: 'doc-1',
              documentName: 'Q3_Financial_Report.pdf',
              pageNumber: 12,
              text: 'Net profit margins for Q3 reached 24.6% (compared to 22.8% in Q2). Operating expenses decreased by 4.2%.'
            }
          }
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/teacher/question-bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        document_ids: documentIds, 
        difficulty_mix: difficultyMix,
        bloom_level: bloomLevel,
        question_type: questionType
      })
    });
    if (!response.ok) throw new Error('Failed to generate Question Bank');
    return response.json();
  },

  // 11. Teacher Mode: Get Coverage Gaps
  async getCoverageGaps(documentId: string): Promise<CoverageGapResponse> {
    if (isMockMode()) {
      await delay(800);
      return {
        documentName: 'Document Content Audit',
        overallDensityScore: 84,
        topics: [
          {
            topic: 'Financial Margins & SaaS Revenue',
            coverage: 'dense',
            chunkCount: 14,
            summary: 'Comprehensive data on Q3 performance, margins, and recurring revenue numbers.',
            recommendation: 'Excellent coverage for quiz and exam generation.'
          },
          {
            topic: 'Disaster Recovery & Backup Procedures',
            coverage: 'sparse',
            chunkCount: 2,
            summary: 'Only briefly mentioned in security policies without detailed recovery steps.',
            recommendation: 'Supplement with dedicated DR handbook before assessment.'
          }
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/teacher/coverage/${documentId}`);
    if (!response.ok) throw new Error('Failed to fetch coverage gaps');
    return response.json();
  },

  // 12. Manager Mode: Generate Executive Briefing
  async generateExecutiveBriefing(documentIds: string[], focusArea: string = 'general'): Promise<ExecutiveBriefingResponse> {
    if (isMockMode()) {
      await delay(1200);
      return {
        title: 'Executive Briefing: Document Strategic Summary',
        focusArea,
        executiveSummary: 'Executive overview synthesizes Q3 business indicators and technology infrastructure readiness grounded in enterprise documents.',
        strategicObjectives: [
          'Accelerate enterprise digital transformation and AI workflow adoption',
          'Optimize operational expenditure while maintaining strict SLA benchmarks'
        ],
        resourceImpact: 'Cross-functional team alignment requires 2 additional engineering sprints and low capital expenditure.',
        keyRisks: [
          'Transition friction during legacy workflow migration',
          'Data privacy and compliance alignment requiring continuous audit'
        ],
        recommendations: [
          'Approve phased rollout across core operations team',
          'Establish automated compliance monitoring dashboard'
        ],
        citation: {
          id: 'cit-mgr-1',
          documentId: 'doc-1',
          documentName: 'Q3_Financial_Report.pdf',
          pageNumber: 4,
          text: 'Executive leadership approved targeted R&D allocation for automated document processing pipelines.'
        }
      };
    }

    const response = await fetch(`${API_BASE_URL}/manager/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds, focus_area: focusArea })
    });
    if (!response.ok) throw new Error('Failed to generate Executive Briefing');
    return response.json();
  },

  // 13. Manager Mode: Generate Action Items & KPIs
  async generateActionKpis(documentIds: string[], department: string = 'all'): Promise<ActionKpiResponse> {
    if (isMockMode()) {
      await delay(1000);
      return {
        title: 'Action Items & KPI Analysis',
        department,
        actionItems: [
          {
            id: 'act-1',
            task: 'Conduct technical documentation audit and verify security parameters',
            ownerRole: 'Security Lead',
            priority: 'high',
            deadline: 'End of Q3',
            status: 'pending',
            citationText: 'All cloud deployments must pass automated vulnerability scans prior to production release.'
          },
          {
            id: 'act-2',
            task: 'Establish cross-departmental SLA tracking dashboard',
            ownerRole: 'Analytics Manager',
            priority: 'medium',
            deadline: 'Immediate',
            status: 'pending',
            citationText: 'Operations teams require real-time visibility into query latency and throughput metrics.'
          }
        ],
        kpis: [
          {
            id: 'kpi-1',
            metric: 'Document Retrieval SLA',
            targetValue: '< 1.5 Seconds',
            category: 'Performance',
            insight: 'FAISS vector search indexing guarantees low latency across uploaded PDFs.'
          },
          {
            id: 'kpi-2',
            metric: 'Onboarding Compliance Rate',
            targetValue: '98% Pass Rate',
            category: 'Governance',
            insight: 'Automated SOP guide generation accelerates employee time-to-productivity.'
          }
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/manager/action-kpis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds, department })
    });
    if (!response.ok) throw new Error('Failed to generate Action Items & KPIs');
    return response.json();
  },

  // 14. Employee Mode: Generate SOP Guide
  async generateSopGuide(documentIds: string[], processName: string = 'Standard Operating Procedure'): Promise<SopGuideResponse> {
    if (isMockMode()) {
      await delay(1100);
      return {
        title: `Standard Operating Procedure: ${processName}`,
        processName,
        prerequisites: [
          'Active Enterprise Knowledge Copilot workspace credentials',
          'Verified PDF document uploaded and status confirmed as Ready'
        ],
        steps: [
          {
            stepNumber: 1,
            heading: 'Access RAG Workspace',
            instruction: 'Log into the workspace shell and select target PDF documents from the left sidebar scope.',
            expectedOutcome: 'Selected document pills reflect active scope.'
          },
          {
            stepNumber: 2,
            heading: 'Initiate Operational Query',
            instruction: 'Select Employee Persona mode and type your specific workflow query into the chat assistant.',
            expectedOutcome: 'Receives step-by-step guidance grounded in official company manuals.'
          },
          {
            stepNumber: 3,
            heading: 'Verify Document Citations',
            instruction: 'Click citation badges to preview exact source pages in the embedded PDF viewer.',
            expectedOutcome: 'Source text highlight is displayed in the right panel preview.'
          }
        ],
        safetyNotes: [
          'Verify policy updates monthly against standard documentation.',
          'Escalate operational discrepancies to your direct manager.'
        ],
        citation: {
          id: 'cit-sop-1',
          documentId: 'doc-1',
          documentName: 'Company_Policy_SOP.pdf',
          pageNumber: 2,
          text: 'Employees must adhere to standard operating procedure guidelines when accessing customer data repositories.'
        }
      };
    }

    const response = await fetch(`${API_BASE_URL}/employee/sop-guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds, process_name: processName })
    });
    if (!response.ok) throw new Error('Failed to generate SOP Guide');
    return response.json();
  },

  // 15. Employee Mode: Generate Onboarding & Compliance Checklist
  async generateComplianceChecklist(documentIds: string[], roleType: string = 'General Employee'): Promise<ComplianceChecklistResponse> {
    if (isMockMode()) {
      await delay(900);
      return {
        title: 'Onboarding & Policy Compliance Roadmap',
        roleType,
        completionEstimate: 'First 14 Days',
        items: [
          {
            id: 'comp-1',
            category: 'Security & Governance',
            title: 'Review Enterprise Data Privacy & Security Manual',
            description: 'Read and acknowledge mandatory data protection protocols for company information.',
            requirementLevel: 'Mandatory',
            citationText: 'All employees are required to complete annual data privacy training.'
          },
          {
            id: 'comp-2',
            category: 'Operational Tools',
            title: 'Complete Knowledge Copilot Workspace Walkthrough',
            description: 'Learn how to generate SOP guides, view citations, and run grounded search.',
            requirementLevel: 'Mandatory',
            citationText: 'Copilot training is integrated into the 14-day employee onboarding track.'
          },
          {
            id: 'comp-3',
            category: 'Compliance Audit',
            title: 'Acknowledge Departmental SOP Checklist',
            description: 'Confirm review of operational workflow guidelines relevant to your active role.',
            requirementLevel: 'Recommended',
            citationText: 'Departmental managers audit onboarding compliance every quarter.'
          }
        ]
      };
    }

    const response = await fetch(`${API_BASE_URL}/employee/compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds, role_type: roleType })
    });
    if (!response.ok) throw new Error('Failed to generate Compliance Checklist');
    return response.json();
  }
};

