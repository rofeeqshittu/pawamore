import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthReadyReturn {
  user: User | null;
  isReady: boolean;
}

export function useAuthReady(): UseAuthReadyReturn {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // First, get session from storage to restore auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsReady(true);
    });

    // Then listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!isReady) setIsReady(true);
      }
    );

    return () => subscription.unsubscribe();
  }, [isReady]);

  return { user, isReady };
}