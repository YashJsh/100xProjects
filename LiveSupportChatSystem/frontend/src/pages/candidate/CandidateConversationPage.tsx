import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  senderName: string;
  role: "CANDIDATE" | "AGENT" | "SYSTEM";
  content: string;
  timestamp: string;
}

export function CandidateConversationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status] = useState<"OPEN" | "IN_PROGRESS" | "CLOSED">("IN_PROGRESS");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      senderName: "System",
      role: "SYSTEM",
      content: `Connected to conversation ${id || "conv-101"}.`,
      timestamp: "10:15 AM",
    },
    {
      id: "m-2",
      senderName: "Alex Candidate",
      role: "CANDIDATE",
      content: "Hello! I am having an issue submitting my coding solution on Step 2.",
      timestamp: "10:16 AM",
    },
    {
      id: "m-3",
      senderName: "Sarah Miller (Agent)",
      role: "AGENT",
      content: "Hi Alex! I've joined your conversation. Checking the logs now.",
      timestamp: "10:18 AM",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || status === "CLOSED") return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderName: "Alex Candidate",
      role: "CANDIDATE",
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-reply-${Date.now()}`,
          senderName: "Sarah Miller (Agent)",
          role: "AGENT",
          content: "Received your update. Testing the payload now.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200);
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
          <span className="text-xs font-mono font-bold text-neutral-900">{id || "conv-101"}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-900 text-white">
            {status}
          </span>
        </div>
        <span className="text-xs text-neutral-500">Agent: Sarah Miller</span>
      </header>

      {/* Messages Stream */}
      <main className="max-w-3xl mx-auto w-full flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto mb-4">
          {messages.map((m) => {
            if (m.role === "SYSTEM") {
              return (
                <div key={m.id} className="text-center text-[11px] text-neutral-400 py-1">
                  {m.content}
                </div>
              );
            }

            const isCandidate = m.role === "CANDIDATE";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isCandidate ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center space-x-2 text-[10px] text-neutral-400 mb-0.5">
                  <span>{m.senderName}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`p-3 text-xs rounded-md max-w-[80%] ${
                    isCandidate
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 border border-neutral-200 text-neutral-900"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={status === "CLOSED"}
            placeholder="Type a message..."
            className="flex-1 h-9 px-3 text-xs bg-white border border-neutral-200 rounded focus:outline-none focus:border-neutral-900 text-neutral-900"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || status === "CLOSED"}
            className="h-9 px-4 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
