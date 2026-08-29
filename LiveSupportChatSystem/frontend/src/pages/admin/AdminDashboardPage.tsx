import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AgentSummary {
  id: string;
  name: string;
  email: string;
  conversationsHandled: number;
}

interface SupervisorSummary {
  id: string;
  name: string;
  email: string;
  agentsCount: number;
  totalConversationsHandled: number;
  agents: AgentSummary[];
}

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const [supervisors] = useState<SupervisorSummary[]>([
    {
      id: "sup-1",
      name: "Marcus Vance",
      email: "marcus.vance@company.com",
      agentsCount: 3,
      totalConversationsHandled: 48,
      agents: [
        { id: "ag-1", name: "Sarah Miller", email: "sarah@company.com", conversationsHandled: 21 },
        { id: "ag-2", name: "David Smith", email: "david@company.com", conversationsHandled: 15 },
        { id: "ag-3", name: "Elena Rostova", email: "elena@company.com", conversationsHandled: 12 },
      ],
    },
    {
      id: "sup-2",
      name: "Rachel Green",
      email: "rachel.green@company.com",
      agentsCount: 2,
      totalConversationsHandled: 34,
      agents: [
        { id: "ag-4", name: "James Wilson", email: "james@company.com", conversationsHandled: 19 },
        { id: "ag-5", name: "Anita Kumar", email: "anita@company.com", conversationsHandled: 15 },
      ],
    },
  ]);

  const [expandedSup, setExpandedSup] = useState<string | null>("sup-1");

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
          <span className="font-bold text-sm tracking-tight">LiveSupport</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500">Admin Dashboard</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-neutral-500">System Admin</span>
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
        <div className="pb-4 border-b border-neutral-200">
          <h1 className="text-lg font-bold text-neutral-900">Supervisors & Teams</h1>
          <p className="text-xs text-neutral-500">Overview of active supervisors, assigned agents, and ticket volumes</p>
        </div>

        {/* Supervisors List Table */}
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
                      Agents: {s.agentsCount} • Total Handled: {s.totalConversationsHandled} chats
                    </p>
                  </div>

                  <span className="text-xs text-neutral-400 font-medium">
                    {isExpanded ? "Collapse ▲" : "View Team ▼"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      Agents under {s.name}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {s.agents.map((ag) => (
                        <div key={ag.id} className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-neutral-900">{ag.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{ag.id}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500">{ag.email}</p>
                          <div className="pt-1 text-[11px] font-medium text-neutral-700">
                            Handled: {ag.conversationsHandled} chats
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
