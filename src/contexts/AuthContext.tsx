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
  const AUTH_REQUEST_TIMEOUT_MS = 10000;
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const authReadyRef = useRef(false);

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, label: string) =>
    Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);

  const checkAdmin = async (userId: string) => {
    try {
      const { data } = await withTimeout(
        Promise.resolve(supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle()),
        AUTH_REQUEST_TIMEOUT_MS,
        "Admin role check"
      );
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
      authReadyRef.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Auth state listener (for multi-tab sync and token refresh)
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
        
        // Handle token refresh - update session silently
        if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          return;
        }
        
        await handleAuthChange(session);
      }
    );

    // Get initial session (only after listener is set up)
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_REQUEST_TIMEOUT_MS,
          "Initial auth session"
        );
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

    const authLoadingWatchdog = setTimeout(() => {
      if (!mountedRef.current || authReadyRef.current) return;
      console.warn("Auth initialization exceeded timeout; continuing without blocking UI");
      setIsAdmin(false);
      setLoading(false);
    }, AUTH_REQUEST_TIMEOUT_MS + 2000);

    initializeAuth();

    // Periodic session refresh to prevent token expiry issues
    const refreshInterval = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.expires_at) {
          const expiresIn = session.expires_at * 1000 - Date.now();
          // Refresh if expiring in less than 5 minutes
          if (expiresIn < 5 * 60 * 1000) {
            await supabase.auth.refreshSession();
          }
        }
      } catch (error) {
        console.error("Session refresh error:", error);
      }
    }, 60 * 1000); // Check every minute

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      clearTimeout(authLoadingWatchdog);
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
