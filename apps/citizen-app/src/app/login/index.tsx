import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/services/AuthContext';
import type { ErrorBoundaryProps } from 'expo-router';

// Ce composant va attraper le crash silencieux et l'afficher !
export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  const message = error instanceof Error ? error.message : String(error ?? 'Erreur inconnue');

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'red' }}>
      <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>ERREUR FATALE TROUVÉE :</Text>
      <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>{message}</Text>
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>Connectez-vous pour accéder à l'application.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <TouchableOpacity 
          style={styles.button} 
          onPress={signIn}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Se connecter avec Keycloak</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff', // À adapter avec votre ThemeProvider si besoin
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1c1c1e',
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});