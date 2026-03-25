"use client";
import { Button } from "@/components/ui/button";
import { oidcConfig } from "@/lib/oidc";
import { useState } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";

export default function Home() {

  function AppContent() {

    const auth = useAuth();
    const [apiResponse, setApiResponse] = useState<string | null>(null);

    // Pendant que la librairie vérifie si l'utilisateur est déjà connecté (au chargement)
    if (auth.isLoading) {
      return <div>Chargement de l'authentification...</div>;
    }

    // TODO; c'est just un test pas ouf, a enlever
    // Fonction pour appeler votre API Hono (Mock APIM)
    const callHonoApi = async () => {
      try {
        const response = await fetch('http://localhost:7071/api/citizen/user/me', {
          method: 'GET',
          headers: {
            // On injecte le token JWT ici !
            'Authorization': `Bearer ${auth.user?.access_token}`,
          },
        });
        const data = await response.json();
        setApiResponse(JSON.stringify(data, null, 2));
      } catch (error) {
        setApiResponse(`Erreur réseau : ${error}`);
      }
    };

    // Affichage si l'utilisateur est connecté
    if (auth.isAuthenticated) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1>Connecté avec succès !</h1>
          <p>Bienvenue, {auth.user?.profile.preferred_username}</p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <Button onClick={() => callHonoApi()}>Appeler l'API Hono</Button>
            <Button onClick={() => void auth.removeUser()}>Se déconnecter</Button>
          </div>

          {apiResponse && (
            <pre style={{ background: '#eee', padding: '10px', borderRadius: '5px' }}>
              {apiResponse}
            </pre>
          )}
        </div>
      );
    } else {
      // Affichage si l'utilisateur n'est pas connecté
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1>Non connecté</h1>
          <Button onClick={() => void auth.signinRedirect()}>Se connecter</Button>
        </div>
      );
    }
  }




  return (
    // AuthProvider doit wrap tout l'app je crois
    // TODO : Need to be check and possibliy moved
    <AuthProvider {...oidcConfig}>
      <AppContent />
    </AuthProvider>
  );
}
