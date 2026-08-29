import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { CandidateDashboardPage } from "./pages/candidate/CandidateDashboardPage";
import { CandidateConversationPage } from "./pages/candidate/CandidateConversationPage";
import { AgentDashboardPage } from "./pages/agent/AgentDashboardPage";
import { AgentConversationPage } from "./pages/agent/AgentConversationPage";
import { SupervisorDashboardPage } from "./pages/supervisor/SupervisorDashboardPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";

import "./index.css";

export function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Candidate Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CANDIDATE"]}>
              <CandidateDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/conversation/:id"
          element={
            <ProtectedRoute allowedRoles={["CANDIDATE"]}>
              <CandidateConversationPage />
            </ProtectedRoute>
          }
        />
        
        {/* Agent Routes */}
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute allowedRoles={["AGENT"]}>
              <AgentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/conversation/:id"
          element={
            <ProtectedRoute allowedRoles={["AGENT"]}>
              <AgentConversationPage />
            </ProtectedRoute>
          }
        />

        {/* Supervisor Routes */}
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SUPERVISOR"]}>
              <SupervisorDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERVISOR"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
