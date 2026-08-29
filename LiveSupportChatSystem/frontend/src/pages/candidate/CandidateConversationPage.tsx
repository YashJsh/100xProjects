import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useConversationStore } from "@/store/conversation.store";

export function CandidateConversationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    activeConversation,
    messages,
    fetchConversationById,
    connectWebSocket,
    disconnectWebSocket,
    sendMessageSocket,
    isConnected,
    isLoading,
    error,
  } = useConversationStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversation history & connect WebSocket
  useEffect(() => {
    if (id) {
      fetchConversationById(id);
      connectWebSocket(id);
    }

    return () => {
      disconnectWebSocket();
    };
  }, [id, fetchConversationById, connectWebSocket, disconnectWebSocket]);

  // 2. Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !id || activeConversation?.status === "CLOSED") return;

    sendMessageSocket(id, inputMessage.trim());
    setInputMessage("");
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
          >
            ← Back
          </button>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-mono font-bold text-neutral-900">{id}</span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              activeConversation?.status === "CLOSED"
                ? "bg-neutral-100 text-neutral-400"
                : "bg-neutral-900 text-white"
            }`}
          >
            {activeConversation?.status || "OPEN"}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-neutral-300"
            }`}
            title={isConnected ? "WebSocket Connected" : "Connecting..."}
          />
        </div>
        <span className="text-xs text-neutral-500">
          Agent: {activeConversation?.agent?.name || "Unassigned"}
        </span>
      </header>

      {/* Messages Stream */}
      <main className="max-w-3xl mx-auto w-full flex-1 p-6 flex flex-col justify-between">
        {error && (
          <div className="p-3 text-xs bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 overflow-y-auto mb-4 flex-1">
          {isLoading && messages.length === 0 ? (
            <div className="text-center text-xs text-neutral-400 py-8">
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-xs text-neutral-400 py-8">
              No messages yet. Send a message to start the conversation.
            </div>
          ) : (
            messages.map((m) => {
              if (m.senderRole === "SYSTEM") {
                return (
                  <div key={m.id} className="text-center text-[11px] text-neutral-400 py-1">
                    {m.content}
                  </div>
                );
              }

              const isMe = m.senderId === user?.id || m.senderRole === "CANDIDATE";

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-400 mb-0.5">
                    <span>{m.senderName}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div
                    className={`p-3 text-xs rounded-md max-w-[80%] ${
                      isMe
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 border border-neutral-200 text-neutral-900"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={activeConversation?.status === "CLOSED"}
            placeholder={
              activeConversation?.status === "CLOSED"
                ? "This conversation is closed."
                : "Type your message..."
            }
            className="flex-1 h-9 px-3 text-xs bg-white border border-neutral-200 rounded focus:outline-none focus:border-neutral-900 text-neutral-900 disabled:bg-neutral-100"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || activeConversation?.status === "CLOSED"}
            className="h-9 px-4 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
