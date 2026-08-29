import { create } from "zustand";
import { useAuthStore } from "./auth.store";

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
  agent?: {
    id: string;
    name: string;
    email: string;
  } | null;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
  messages?: MessageItem[];
}

interface ConversationState {
  conversations: ConversationItem[];
  activeConversation: ConversationItem | null;
  messages: MessageItem[];
  isLoading: boolean;
  error: string | null;

  // WebSocket Instance State
  socket: WebSocket | null;
  isConnected: boolean;

  // REST API Actions
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<ConversationItem>;
  fetchConversationById: (id: string) => Promise<ConversationItem>;

  // WebSocket Actions
  connectWebSocket: (conversationId?: string) => void;
  disconnectWebSocket: () => void;
  joinConversationSocket: (conversationId: string) => void;
  sendMessageSocket: (conversationId: string, content: string) => void;

  // Local Actions
  addMessage: (message: MessageItem) => void;
  clearError: () => void;
}

const API_BASE_URL = "http://localhost:3000";

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  socket: null,
  isConnected: false,

  clearError: () => set({ error: null }),

  // 1. Fetch All Candidate Conversations via REST
  fetchConversations: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch conversations");

      set({ conversations: data.conversations, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error fetching conversations", isLoading: false });
    }
  },

  // 2. Create New Candidate Conversation via REST
  createConversation: async () => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error("Unauthorized");

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create conversation");

      const newConv = data.conversation;
      set((state) => ({
        conversations: [newConv, ...state.conversations],
        isLoading: false,
      }));

      return newConv;
    } catch (err: any) {
      set({ error: err.message || "Error creating conversation", isLoading: false });
      throw err;
    }
  },

  // 3. Fetch Single Conversation Details + Message History
  fetchConversationById: async (id: string) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error("Unauthorized");

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch conversation");

      const conv = data.conversation;
      const historyMessages: MessageItem[] = (conv.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.senderID,
        senderName: m.role === "CANDIDATE" ? "You" : m.role === "AGENT" ? conv.agent?.name || "Agent" : "System",
        senderRole: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));

      set({
        activeConversation: conv,
        messages: historyMessages,
        isLoading: false,
      });

      return conv;
    } catch (err: any) {
      set({ error: err.message || "Error fetching conversation details", isLoading: false });
      throw err;
    }
  },

  // 4. Manage WebSocket Connection
  connectWebSocket: (conversationId?: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    // Disconnect previous socket if any
    const currentSocket = get().socket;
    if (currentSocket) {
      currentSocket.close();
    }

    const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected to backend");
      set({ isConnected: true, socket: ws });

      if (conversationId) {
        get().joinConversationSocket(conversationId);
      }
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        // Handle real-time incoming messages
        if (payload.event === "new_message") {
          const newMsg = payload.data;
          const currentUser = useAuthStore.getState().user;

          const formattedMessage: MessageItem = {
            id: `msg-${Date.now()}-${Math.random()}`,
            senderId: newMsg.senderId,
            senderName: newMsg.senderId === currentUser?.id ? "You" : newMsg.senderRole === "AGENT" ? "Agent" : "Candidate",
            senderRole: newMsg.senderRole,
            content: newMsg.content,
            timestamp: new Date(newMsg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          get().addMessage(formattedMessage);
        } else if (payload.event === "conversation_closed") {
          const closedConvId = payload.data?.conversationId;
          if (closedConvId) {
            get().updateConversationStatus(closedConvId, "CLOSED");
          }
        } else if (payload.event === "error") {
          console.error("WebSocket Error Payload:", payload.data);
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      set({ isConnected: false, socket: null });
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  },

  disconnectWebSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  joinConversationSocket: (conversationId: string) => {
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "join_conversation",
          data: { conversationId },
        })
      );
    }
  },

  sendMessageSocket: (conversationId: string, content: string) => {
    const socket = get().socket;
    const currentUser = useAuthStore.getState().user;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "send_message",
          data: { conversationId, content },
        })
      );

      // Optimistically append sender message locally
      const optimisticMsg: MessageItem = {
        id: `opt-${Date.now()}`,
        senderId: currentUser?.id || "me",
        senderName: "You",
        senderRole: currentUser?.role || "CANDIDATE",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      get().addMessage(optimisticMsg);
    }
  },

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));
