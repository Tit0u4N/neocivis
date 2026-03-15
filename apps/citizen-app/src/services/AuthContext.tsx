import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { 
  useAuthRequest, 
  exchangeCodeAsync, 
  refreshAsync, 
  TokenResponse 
} from 'expo-auth-session';
import { authConfig, discovery } from '@/config/authConfig';

WebBrowser.maybeCompleteAuthSession();

// Typage de notre contexte
interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(authConfig, discovery);

  // 1. Interception du retour du navigateur (Login)
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log("Code d'autorisation reçu:", code);
      console.log("Request:", request);
      
      

      if (!code || !request?.codeVerifier) {
        console.error('Auth callback invalide: code ou code verifier manquant.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      exchangeCodeAsync(
        {
          clientId: authConfig.clientId,
          code,
          redirectUri: authConfig.redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        discovery
      )
        .then((res) => setTokenResponse(new TokenResponse(res)))
        .catch((error) => {
          console.error('Erreur lors de la récupération du token:', error);
          setTokenResponse(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [request?.codeVerifier, response]);

  // 2. Gestion du rafraîchissement automatique
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout | number | null = null;

    const scheduleRefresh = () => {
      if (!tokenResponse || !tokenResponse.refreshToken || !tokenResponse.expiresIn) return;

      // On calcule le temps restant avant expiration (moins 60 secondes de marge de sécurité)
      const expiresInSeconds = tokenResponse.expiresIn;
      const timeToRefresh = (expiresInSeconds - 60) * 1000;

      if (timeToRefresh > 0) {
        refreshTimeout = setTimeout(async () => {
          try {
            console.log("Rafraîchissement automatique du token...");
            const refreshed = await refreshAsync(
              {
                clientId: authConfig.clientId,
                refreshToken: tokenResponse.refreshToken!,
              },
              discovery
            );
            setTokenResponse(new TokenResponse(refreshed));
          } catch (error) {
            console.error("Échec du rafraîchissement, déconnexion", error);
            signOut();
          }
        }, timeToRefresh);
      }
    };

    scheduleRefresh();

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [tokenResponse]);

  // Actions exposées
  const signIn = async () => {
    setIsLoading(true);
    try {
      const authResponse = await promptAsync();
      if (authResponse.type !== 'success' && authResponse.type !== 'dismiss') {
        console.error('Échec de la connexion OAuth:', authResponse);
      }
    } catch (error) {
      console.error('Erreur pendant signIn:', error);
      setTokenResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    // Note : Pour une vraie déconnexion, il faudrait aussi appeler l'URL de logout de Keycloak
    setTokenResponse(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: tokenResponse?.accessToken || null,
        isAuthenticated: !!tokenResponse?.accessToken,
        signIn,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour consommer le service facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};