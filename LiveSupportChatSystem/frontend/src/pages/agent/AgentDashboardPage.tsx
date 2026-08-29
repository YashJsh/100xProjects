import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  candidateName: string;
  topic: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  updatedAt: string;
}

export function AgentDashboardPage() {
  const navigate = useNavigate();

  const [conversations] = useState<Conversation[]>([
    {
      id: "conv-101",
      candidateName: "Alex Candidate",
      topic: "Issue with candidate technical assessment submission",
      status: "IN_PROGRESS",
      updatedAt: "10m ago",
    },
    {
      id: "conv-104",
      candidateName: "Emma Watson",
      topic: "Webpack build error during sandbox initialization",
      status: "IN_PROGRESS",
      updatedAt: "45m ago",
    },
    {
      id: "conv-103",
      candidateName: "Michael Chang",
      topic: "System environment setup help for Docker",
      status: "CLOSED",
      updatedAt: "Yesterday",
    },
  ]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
          <span className="font-bold text-sm tracking-tight">LiveSupport</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500">Agent Portal</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-neutral-500">Sarah Miller (Agent)</span>
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
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Assigned Conversations</h1>
            <p className="text-xs text-neutral-500">Respond to candidates and manage support sessions</p>
          </div>
        </div>

        {/* Clean Conversation Table/List */}
        <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-md">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/agent/conversation/${c.id}`)}
              className="p-4 hover:bg-neutral-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-neutral-400">{c.id}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      c.status === "IN_PROGRESS"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 border border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[11px] text-neutral-400">• {c.updatedAt}</span>
                </div>
                <h3 className="text-xs font-semibold text-neutral-900">{c.topic}</h3>
                <p className="text-[11px] text-neutral-500">Candidate: {c.candidateName}</p>
              </div>

              <span className="text-xs font-medium text-neutral-900 hover:underline">
                Open Chat →
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
