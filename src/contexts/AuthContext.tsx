import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, isAdmin: false, loading: true, signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const checkAdmin = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    }
  };

  const handleAuthChange = async (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      await checkAdmin(session.user.id);
    } else {
      setIsAdmin(false);
    }
    
    // Only set loading to false after we're mounted and processed the session
    if (mounted) {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Set mounted flag
    setMounted(true);
    
    // Auth state listener (for multi-tab sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        // Handle sign out in other tabs
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        await handleAuthChange(session);
      }
    );

    // Get initial session (only after listener is set up)
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (isMounted) {
          await handleAuthChange(session);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth initialization timeout - setting loading to false");
        setLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // Remove dependency array to avoid re-runs

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Don't manually set state here - let onAuthStateChange handle it
      // This ensures multi-tab sync works properly
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback manual cleanup
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      window.location.href = "/";
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
