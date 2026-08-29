import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useConversationStore } from "@/store/conversation.store";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { adminAnalytics, fetchAdminAnalytics, isLoading, error } = useConversationStore();

  const [expandedSup, setExpandedSup] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminAnalytics().then((data) => {
      if (data?.supervisors?.[0]?.id) {
        setExpandedSup(data.supervisors[0].id);
      }
    });
  }, [fetchAdminAnalytics]);

  const metrics = adminAnalytics?.metrics || {
    totalSupervisors: 0,
    totalAgents: 0,
    totalConversations: 0,
    activeConversations: 0,
    closedConversations: 0,
  };

  const supervisors = adminAnalytics?.supervisors || [];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
          <span className="font-bold text-sm tracking-tight">LiveSupport</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500">System Admin Portal</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-neutral-900">
            Admin: {user?.name || user?.email}
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
      <main className="max-w-4xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        <div className="pb-4 border-b border-neutral-200">
          <h1 className="text-lg font-bold text-neutral-900">System Analytics & Hierarchy</h1>
          <p className="text-xs text-neutral-500">
            Global metrics, registered supervisors, agents, and conversation performance
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-md">
            {error}
          </div>
        )}

        {/* Top System Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 border border-neutral-200 rounded-md bg-white space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Supervisors
            </p>
            <p className="text-xl font-bold text-neutral-900">{metrics.totalSupervisors}</p>
          </div>

          <div className="p-3.5 border border-neutral-200 rounded-md bg-white space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Total Agents
            </p>
            <p className="text-xl font-bold text-neutral-900">{metrics.totalAgents}</p>
          </div>

          <div className="p-3.5 border border-neutral-200 rounded-md bg-white space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Total Conversations
            </p>
            <p className="text-xl font-bold text-neutral-900">{metrics.totalConversations}</p>
          </div>

          <div className="p-3.5 border border-neutral-200 rounded-md bg-white space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Active / Closed
            </p>
            <p className="text-xl font-bold text-neutral-900">
              {metrics.activeConversations} <span className="text-xs font-normal text-neutral-400">/ {metrics.closedConversations}</span>
            </p>
          </div>
        </div>

        {/* Supervisors List Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Supervisor Teams & Agent Breakdowns
          </h2>

          {isLoading && !adminAnalytics ? (
            <div className="p-8 text-center border border-neutral-200 rounded-md text-xs text-neutral-400">
              Loading system analytics...
            </div>
          ) : supervisors.length === 0 ? (
            <div className="p-8 text-center border border-neutral-200 border-dashed rounded-md text-xs text-neutral-500">
              No supervisor accounts created yet in the database.
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-md divide-y divide-neutral-200">
              {supervisors.map((s) => {
                const isExpanded = expandedSup === s.id;

                return (
                  <div key={s.id} className="bg-white">
                    <div
                      onClick={() => setExpandedSup(isExpanded ? null : s.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xs font-bold text-neutral-900">{s.name}</h3>
                          <span className="text-[11px] text-neutral-400 font-mono">({s.email})</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Assigned Agents: {s.agentsCount} • Total Conversations: {s.totalConversationsHandled}
                        </p>
                      </div>

                      <span className="text-xs text-neutral-400 font-medium">
                        {isExpanded ? "Collapse ▲" : "View Agents ▼"}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-3">
                        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                          Agents under {s.name}
                        </p>

                        {s.agents.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No agents registered under this supervisor.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {s.agents.map((ag) => (
                              <div key={ag.id} className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-semibold text-neutral-900">{ag.name}</span>
                                  <span className="text-[10px] text-neutral-400 font-mono">AGENT</span>
                                </div>
                                <p className="text-[11px] text-neutral-500">{ag.email}</p>
                                <div className="pt-1 text-[11px] font-medium text-neutral-700">
                                  Handled: {ag.conversationsHandled} chats
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
