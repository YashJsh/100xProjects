import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { CandidateDashboardPage } from "./pages/candidate/CandidateDashboardPage";
import { CandidateConversationPage } from "./pages/candidate/CandidateConversationPage";
import { AgentDashboardPage } from "./pages/agent/AgentDashboardPage";
import { AgentConversationPage } from "./pages/agent/AgentConversationPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Candidate Routes */}
        <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
        <Route path="/candidate/conversation/:id" element={<CandidateConversationPage />} />
        
        {/* Agent Routes */}
        <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
        <Route path="/agent/conversation/:id" element={<AgentConversationPage />} />

        {/* Admin / Supervisor Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
