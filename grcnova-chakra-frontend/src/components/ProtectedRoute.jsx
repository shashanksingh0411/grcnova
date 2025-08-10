import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (!user || (roles && !roles.includes(user.role))) {
    return <Navigate to="/auth/login" />;
  }

  return children;
};

export default ProtectedRoute;