import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredTrack?: "builder" | "subcontractor" | "homeowner";
}

export function AuthGuard({ children, requiredTrack }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredTrack && user) {
    const trackRoutes: Record<string, string> = {
      builder: "/app",
      subcontractor: "/sub",
      homeowner: "/owner",
    };
    if (user.accountTrack !== requiredTrack) {
      return <Navigate to={trackRoutes[user.accountTrack] || "/app"} replace />;
    }
  }

  return <>{children}</>;
}
