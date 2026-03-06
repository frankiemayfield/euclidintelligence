import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredTrack?: "builder" | "subcontractor";
}

export function AuthGuard({ children, requiredTrack }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredTrack && user) {
    if (requiredTrack === "builder" && user.accountTrack === "subcontractor") {
      return <Navigate to="/sub" replace />;
    }
    if (requiredTrack === "subcontractor" && user.accountTrack === "builder") {
      return <Navigate to="/app" replace />;
    }
  }

  return <>{children}</>;
}
