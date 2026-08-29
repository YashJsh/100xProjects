import { create } from "zustand";
import { api } from "../lib/api";
import { useAuthStore } from "./auth.store";

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "CANDIDATE" | "AGENT" | "SUPERVISOR" | "ADMIN" | "SYSTEM";
  content: string;
  timestamp: string;
}

export interface AgentItem {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  supervisorID?: string | null;
  supervisorName?: string;
  conversationsHandled?: number;
}

export interface SupervisorMetrics {
  id: string;
  name: string;
  email: string;
  agentsCount: number;
  totalConversationsHandled: number;
  agents: AgentItem[];
}

export interface AdminAnalyticsData {
  metrics: {
    totalSupervisors: number;
    totalAgents: number;
    totalConversations: number;
    activeConversations: number;
    closedConversations: number;
  };
  supervisors: SupervisorMetrics[];
  allAgents: AgentItem[];
}

export interface ConversationItem {
  id: string;
  candidateID: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
  } | null;
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
  supervisorAgents: AgentItem[];
  adminAnalytics: AdminAnalyticsData | null;
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
  closeConversation: (id: string) => Promise<void>;

  // Supervisor REST Actions
  fetchSupervisorAgents: () => Promise<AgentItem[]>;
  assignAgentToConversation: (conversationId: string, agentId: string) => Promise<void>;

  // Admin REST Actions
  fetchAdminAnalytics: () => Promise<AdminAnalyticsData>;
  assignAgentToSupervisor: (agentId: string, supervisorId: string) => Promise<void>;

  // WebSocket Actions
  connectWebSocket: (conversationId?: string) => void;
  disconnectWebSocket: () => void;
  joinConversationSocket: (conversationId: string) => void;
  sendMessageSocket: (conversationId: string, content: string) => void;
  closeConversationSocket: (conversationId: string) => void;

  // Local Actions
  addMessage: (message: MessageItem) => void;
  updateConversationStatus: (id: string, status: "OPEN" | "IN_PROGRESS" | "CLOSED") => void;
  clearError: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  supervisorAgents: [],
  adminAnalytics: null,
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  socket: null,
  isConnected: false,

  clearError: () => set({ error: null }),

  // 1. Fetch Conversations via Axios REST
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/conversations");
      set({ conversations: data.conversations, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error fetching conversations", isLoading: false });
    }
  },

  // 2. Fetch Supervisor's Managed Agents
  fetchSupervisorAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/supervisor/agents");
      set({ supervisorAgents: data.agents, isLoading: false });
      return data.agents;
    } catch (err: any) {
      set({ error: err.message || "Error fetching supervisor agents", isLoading: false });
      throw err;
    }
  },

  // 3. Fetch Admin Analytics
  fetchAdminAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/admin/analytics");
      set({ adminAnalytics: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || "Error fetching admin analytics", isLoading: false });
      throw err;
    }
  },

  // 4. Admin Assign Agent to Supervisor
  assignAgentToSupervisor: async (agentId: string, supervisorId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/admin/assign-agent", { agentId, supervisorId });
      await get().fetchAdminAnalytics();
    } catch (err: any) {
      set({ error: err.message || "Error assigning agent to supervisor", isLoading: false });
      throw err;
    }
  },

  // 5. Supervisor Assign Agent to Conversation
  assignAgentToConversation: async (conversationId: string, agentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/conversations/${conversationId}/assign`, { agentId });
      
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, agentID: agentId, agent: data.assignedAgent, status: "IN_PROGRESS" }
            : c
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Error assigning agent", isLoading: false });
      throw err;
    }
  },

  // 6. Create New Conversation
  createConversation: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/conversations", {});
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

  // 7. Fetch Single Conversation Details
  fetchConversationById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/conversations/${id}`);
      const conv = data.conversation;

      const historyMessages: MessageItem[] = (conv.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.senderID,
        senderName: m.role === "CANDIDATE" ? "Candidate" : m.role === "AGENT" ? conv.agent?.name || "Agent" : "System",
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

  // 8. Close Conversation
  closeConversation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/conversations/${id}/close`);
      get().updateConversationStatus(id, "CLOSED");
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error closing conversation", isLoading: false });
      throw err;
    }
  },

  // 9. Manage WebSocket Connection
  connectWebSocket: (conversationId?: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

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

        if (payload.event === "error" || payload.success === false) {
          const errorMsg = payload.data?.message || payload.error || "WebSocket error";
          set({ error: typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg) });
          return;
        }

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

      const optimisticMsg: MessageItem = {
        id: `opt-${Date.now()}`,
        senderId: currentUser?.id || "me",
        senderName: "You",
        senderRole: currentUser?.role || "AGENT",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      get().addMessage(optimisticMsg);
    }
  },

  closeConversationSocket: (conversationId: string) => {
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "close_conversation",
          data: { conversationId },
        })
      );
    }
  },

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
}));
