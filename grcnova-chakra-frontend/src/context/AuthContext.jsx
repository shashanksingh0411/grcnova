// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile + organization
  const fetchUserAndOrg = async (session) => {
    try {
      if (!session?.user) {
        setUser(null);
        setOrganization(null);
        return;
      }

      // Fetch profile from "profiles" table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.warn("Profile fetch error:", profileError.message);
      }

      // Fetch organization if profile has organization_id
      let orgData = null;
      if (profile?.organization_id) {
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profile.organization_id)
          .single();

        if (!orgError) orgData = org;
        else console.warn("Organization fetch error:", orgError.message);
      }

      setUser({
        ...session.user,
        role: profile?.role || "user",
        organization_id: profile?.organization_id || null,
        full_name: profile?.full_name || null,
        email: session.user.email,
      });

      setOrganization(orgData || null);
    } catch (err) {
      console.error("Error fetching user or organization:", err);
      setUser(session.user || null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndOrg(session);
    });

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchUserAndOrg(session);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrganization(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizationEmailId: organization?.organization_email_id,
        organizationAddress: organization?.organization_address,
        organizationContact: organization?.contact,
        loading,
        signOut,
      }}
    >
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
