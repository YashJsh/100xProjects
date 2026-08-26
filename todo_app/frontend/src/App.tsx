import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/api/auth";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Todos } from "@/pages/Todos";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/todos" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/todos"
        element={
          <ProtectedRoute>
            <Todos />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/todos" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Todo</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay organized, get things done.</p>
        </div>
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}
