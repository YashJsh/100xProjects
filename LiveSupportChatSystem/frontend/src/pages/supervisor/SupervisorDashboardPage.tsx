import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useConversationStore } from "@/store/conversation.store";

export function SupervisorDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    conversations,
    supervisorAgents,
    fetchConversations,
    fetchSupervisorAgents,
    assignAgentToConversation,
    isLoading,
    error,
  } = useConversationStore();

  const [selectedAgentMap, setSelectedAgentMap] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchSupervisorAgents();
  }, [fetchConversations, fetchSupervisorAgents]);

  const handleAssign = async (conversationId: string) => {
    const agentId = selectedAgentMap[conversationId];
    if (!agentId) return;

    setAssigningId(conversationId);
    try {
      await assignAgentToConversation(conversationId, agentId);
    } catch (err) {
      // Handled by store
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
          <span className="font-bold text-sm tracking-tight">LiveSupport</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500">Supervisor Portal</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-neutral-900">
            Supervisor: {user?.name || user?.email}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        <div className="pb-4 border-b border-neutral-200">
          <h1 className="text-lg font-bold text-neutral-900">Team Supervision & Assignment</h1>
          <p className="text-xs text-neutral-500">
            Monitor support queues and assign candidate tickets to your agents
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-md">
            {error}
          </div>
        )}

        {/* 1. Managed Agents Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Your Managed Support Agents ({supervisorAgents.length})
          </h2>

          {supervisorAgents.length === 0 ? (
            <div className="p-4 border border-neutral-200 rounded text-xs text-neutral-400">
              No agents assigned under your supervision yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {supervisorAgents.map((ag) => (
                <div key={ag.id} className="p-3.5 border border-neutral-200 rounded-md bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{ag.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400">AGENT</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{ag.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Team Conversations & Assignment Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Team Support Conversations ({conversations.length})
          </h2>

          {isLoading && conversations.length === 0 ? (
            <div className="p-8 text-center border border-neutral-200 rounded-md text-xs text-neutral-400">
              Loading team conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center border border-neutral-200 border-dashed rounded-md text-xs text-neutral-500">
              No conversations found for your team.
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-md divide-y divide-neutral-200">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                >
                  <div className="space-y-1 max-w-md">
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
                      <span className="text-[11px] text-neutral-400">
                        • {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-neutral-900">
                      Ticket #{c.id.slice(0, 8)}
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Candidate ID: {c.candidateID} | Agent:{" "}
                      <strong className="text-neutral-800">{c.agent?.name || "Unassigned"}</strong>
                    </p>
                  </div>

                  {/* Assign Agent Dropdown & Button */}
                  {c.status !== "CLOSED" && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedAgentMap[c.id] || c.agentID || ""}
                        onChange={(e) =>
                          setSelectedAgentMap({ ...selectedAgentMap, [c.id]: e.target.value })
                        }
                        className="h-8 px-2 text-xs bg-white border border-neutral-200 rounded text-neutral-900 focus:outline-none focus:border-neutral-900"
                      >
                        <option value="">Select Agent...</option>
                        {supervisorAgents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.name} ({ag.email})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleAssign(c.id)}
                        disabled={!selectedAgentMap[c.id] || assigningId === c.id}
                        className="h-8 px-3 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                      >
                        {assigningId === c.id ? "Assigning..." : c.agentID ? "Re-assign" : "Assign"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
