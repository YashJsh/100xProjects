import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, type Role } from "@/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user, fetchMe } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (token && !user) {
        await fetchMe();
      }
      setIsInitializing(false);
    };
    init();
  }, [token, user, fetchMe]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-400 font-sans">
        Authenticating...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard if unauthorized for this specific role route
    switch (user.role) {
      case "AGENT":
        return <Navigate to="/agent/dashboard" replace />;
      case "SUPERVISOR":
        return <Navigate to="/supervisor/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/candidate/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
