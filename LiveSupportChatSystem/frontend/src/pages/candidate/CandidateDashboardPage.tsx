import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  topic: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  agentName: string;
  updatedAt: string;
}

export function CandidateDashboardPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-101",
      topic: "Issue with candidate technical assessment submission",
      status: "IN_PROGRESS",
      agentName: "Sarah Miller",
      updatedAt: "10m ago",
    },
    {
      id: "conv-102",
      topic: "Clarification on live coding round instructions",
      status: "OPEN",
      agentName: "Unassigned",
      updatedAt: "25m ago",
    },
    {
      id: "conv-103",
      topic: "System environment setup help for Docker",
      status: "CLOSED",
      agentName: "David Smith",
      updatedAt: "Yesterday",
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [topic, setTopic] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newConv: Conversation = {
      id: `conv-${Math.floor(100 + Math.random() * 900)}`,
      topic: topic.trim(),
      status: "OPEN",
      agentName: "Unassigned",
      updatedAt: "Just now",
    };

    setConversations([newConv, ...conversations]);
    setTopic("");
    setIsCreating(false);
    navigate(`/candidate/conversation/${newConv.id}`);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
          <span className="font-bold text-sm tracking-tight">LiveSupport</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500">Candidate</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-neutral-500">Alex Candidate</span>
          <button
            onClick={() => navigate("/login")}
            className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        {/* Title bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Your Support Tickets</h1>
            <p className="text-xs text-neutral-500">Manage and track active support conversations</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
          >
            {isCreating ? "Cancel" : "New Ticket"}
          </button>
        </div>

        {/* Inline Create Ticket Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-4 bg-neutral-50 border border-neutral-200 rounded-md space-y-3">
            <h2 className="text-xs font-semibold text-neutral-900">Describe the issue</h2>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Cannot submit code solution on step 2"
              required
              className="w-full h-9 px-3 text-xs bg-white border border-neutral-200 rounded focus:outline-none focus:border-neutral-900 text-neutral-900"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Clean Ticket List */}
        <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-md">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/candidate/conversation/${c.id}`)}
              className="p-4 hover:bg-neutral-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-neutral-400">{c.id}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      c.status === "IN_PROGRESS"
                        ? "bg-neutral-900 text-white"
                        : c.status === "OPEN"
                        ? "bg-neutral-100 border border-neutral-300 text-neutral-700"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[11px] text-neutral-400">• {c.updatedAt}</span>
                </div>
                <h3 className="text-xs font-semibold text-neutral-900">{c.topic}</h3>
                <p className="text-[11px] text-neutral-500">Agent: {c.agentName}</p>
              </div>

              <span className="text-xs font-medium text-neutral-900 hover:underline">
                View →
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
