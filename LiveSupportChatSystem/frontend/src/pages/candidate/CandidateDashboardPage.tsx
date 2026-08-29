import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useConversationStore } from "@/store/conversation.store";

export function CandidateDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { conversations, fetchConversations, createConversation, isLoading, error } =
    useConversationStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleCreateTicket = async () => {
    try {
      const newConv = await createConversation();
      navigate(`/candidate/conversation/${newConv.id}`);
    } catch (err) {
      // Error handled by store
    }
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
          <span className="text-xs font-medium text-neutral-900">{user?.name || user?.email || "Candidate"}</span>
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
        {/* Title bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Your Support Tickets</h1>
            <p className="text-xs text-neutral-500">Manage and track active support conversations</p>
          </div>
          <button
            onClick={handleCreateTicket}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "New Ticket"}
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-md">
            {error}
          </div>
        )}

        {/* Clean Ticket List */}
        {conversations.length === 0 ? (
          <div className="p-8 text-center border border-neutral-200 border-dashed rounded-md space-y-2">
            <p className="text-xs text-neutral-500">No support tickets created yet.</p>
            <button
              onClick={handleCreateTicket}
              className="text-xs font-semibold text-neutral-900 hover:underline"
            >
              Create your first support conversation →
            </button>
          </div>
        ) : (
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
                    <span className="text-[11px] text-neutral-400">
                      • {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-neutral-900">
                    Support Ticket #{c.id.slice(0, 8)}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Assigned Agent: {c.agent?.name || "Unassigned"}
                  </p>
                </div>

                <span className="text-xs font-medium text-neutral-900 hover:underline">
                  Open Chat →
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
