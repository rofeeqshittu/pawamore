import { useAuth } from '@/contexts/AuthContext';

interface UseAuthReadyReturn {
  user: any;
  isReady: boolean;
}

// Simplified hook that uses the main AuthContext to avoid duplication
export function useAuthReady(): UseAuthReadyReturn {
  const { user, loading } = useAuth();
  
  return { 
    user, 
    isReady: !loading 
  };
}