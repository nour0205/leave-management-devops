import { Navigate } from "react-router-dom";
import { useHR } from "@/contexts/HRContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, isAuthenticated } = useHR();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}