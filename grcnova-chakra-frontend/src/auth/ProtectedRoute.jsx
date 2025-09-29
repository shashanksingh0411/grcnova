import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";

const ProtectedRoute = ({ children, roles }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async (userId) => {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error.message);
        return null;
      }
      return data?.role;
    };

    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) console.error("Error getting session:", error.message);

      if (!mounted) return;

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser(session.user);
      const role = await fetchUserRole(session.user.id);
      setUserRole(role);
      setLoading(false);
    };

    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        setUser(session.user);
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && userRole && !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
