import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, type Role } from "@/store/auth.store";

const DEMO_SIGNUPS: Record<Role, { name: string; email: string; pass: string }> = {
  CANDIDATE: { name: "Alex Candidate", email: "candidate@example.com", pass: "password123" },
  AGENT: { name: "Sarah Miller", email: "agent@example.com", pass: "password123" },
  SUPERVISOR: { name: "Marcus Vance", email: "supervisor@example.com", pass: "password123" },
  ADMIN: { name: "System Admin", email: "admin@example.com", pass: "password123" },
};

export function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [role, setRole] = useState<Role>("CANDIDATE");
  const [name, setName] = useState(DEMO_SIGNUPS.CANDIDATE.name);
  const [email, setEmail] = useState(DEMO_SIGNUPS.CANDIDATE.email);
  const [password, setPassword] = useState(DEMO_SIGNUPS.CANDIDATE.pass);

  const handleRoleChange = (r: Role) => {
    setRole(r);
    setName(DEMO_SIGNUPS[r].name);
    setEmail(DEMO_SIGNUPS[r].email);
    setPassword(DEMO_SIGNUPS[r].pass);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const user = await signup({ name, email, password, role });

      const userRole = user.role || role;
      if (userRole === "SUPERVISOR") {
        navigate("/supervisor/dashboard");
      } else if (userRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (userRole === "AGENT") {
        navigate("/agent/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between p-6 md:p-10 font-sans">
      <div className="flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
        <span className="font-bold text-sm tracking-tight text-neutral-900">LiveSupport</span>
      </div>

      <div className="w-full max-w-sm mx-auto my-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Create an account</h1>
          <p className="text-xs text-neutral-500">Select a role preset or register your details</p>
        </div>

        {/* Quick Demo Role Preset Pills */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Demo Preset Role</label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 border border-neutral-200 rounded-md">
            {(["CANDIDATE", "AGENT", "SUPERVISOR", "ADMIN"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`py-1 text-[11px] font-semibold rounded transition-all ${
                  role === r
                    ? "bg-white text-neutral-900 shadow-xs border border-neutral-200"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-md font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              required
              className="w-full h-9 px-3 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 text-neutral-900"
            />
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
            {isLoading ? "Creating account..." : `Register as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-500">
            Already have an account?{" "}
            <Link to="/login" className="text-neutral-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-neutral-400">
        © LiveSupport System
      </div>
    </div>
  );
}
