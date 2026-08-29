import { create } from "zustand";

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "CANDIDATE" | "AGENT" | "SUPERVISOR" | "ADMIN" | "SYSTEM";
  content: string;
  timestamp: string;
}

export interface ConversationItem {
  id: string;
  candidateID: string;
  agentID?: string | null;
  agentName?: string;
  topic?: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
  lastMessage?: string;
}

interface ConversationState {
  conversations: ConversationItem[];
  activeConversation: ConversationItem | null;
  messages: MessageItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setConversations: (conversations: ConversationItem[]) => void;
  setActiveConversation: (conversation: ConversationItem | null) => void;
  setMessages: (messages: MessageItem[]) => void;
  addMessage: (message: MessageItem) => void;
  updateConversationStatus: (id: string, status: "OPEN" | "IN_PROGRESS" | "CLOSED") => void;
  clearChat: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (activeConversation) => set({ activeConversation }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateConversationStatus: (id, status) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
      activeConversation:
        state.activeConversation && state.activeConversation.id === id
          ? { ...state.activeConversation, status }
          : state.activeConversation,
    })),

  clearChat: () => set({ activeConversation: null, messages: [] }),
}));
