import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, type Role } from "@/store/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const { signin, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("candidate@example.com");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState<Role>("CANDIDATE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const user = await signin({ email, password });

      // Navigate based on actual backend user role or selected role fallback
      const role = user.role || selectedRole;
      if (role === "AGENT") {
        navigate("/agent/dashboard");
      } else if (role === "SUPERVISOR" || role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between p-6 md:p-10 font-sans">
      {/* Header Logo */}
      <div className="flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
        <span className="font-bold text-sm tracking-tight text-neutral-900">LiveSupport</span>
      </div>

      {/* Main Login Form Container */}
      <div className="w-full max-w-sm mx-auto my-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Sign in to your account</h1>
          <p className="text-xs text-neutral-500">Enter your credentials below to access support</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">Role Preference (Fallback)</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="w-full h-9 px-3 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 text-neutral-900"
            >
              <option value="CANDIDATE">Candidate</option>
              <option value="AGENT">Support Agent</option>
              <option value="SUPERVISOR">Supervisor / Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-9 px-3 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 text-neutral-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-9 px-3 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 text-neutral-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 text-xs font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-neutral-900 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="text-center text-[11px] text-neutral-400">
        © LiveSupport System
      </div>
    </div>
  );
}
