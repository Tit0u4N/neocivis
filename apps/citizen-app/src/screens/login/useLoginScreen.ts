import { useAuth } from '@/providers/AuthProvider';

type LoginScreenViewModel = {
  isLoading: boolean;
  onSignIn: () => Promise<void>;
};

export function useLoginScreen(): LoginScreenViewModel {
  const { login, isLoading } = useAuth();

  return {
    isLoading,
    onSignIn: login,
  };
}
