import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
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
  const mountedRef = useRef(true);

  const checkAdmin = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (mountedRef.current) {
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      if (mountedRef.current) {
        setIsAdmin(false);
      }
    }
  };

  const handleAuthChange = async (session: Session | null) => {
    if (!mountedRef.current) return;
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      await checkAdmin(session.user.id);
    } else {
      setIsAdmin(false);
    }
    
    if (mountedRef.current) {
      setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Auth state listener (for multi-tab sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
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
        
        if (mountedRef.current) {
          await handleAuthChange(session);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
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
