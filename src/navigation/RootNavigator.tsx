import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { AuthService } from '../services/AuthService';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const RootNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const hasSession = await AuthService.verificarSesion();
      setIsAuthenticated(hasSession);
    } catch (error) {
      console.error('Error verificando sesión:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await AuthService.cerrarSesion();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.loadingText}>Consultorio App</Text>
        <Text style={styles.loadingSubtext}>⏳ Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator onLogout={handleLogout} />
      ) : (
        <AuthNavigator onAuthSuccess={handleAuthSuccess} />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default RootNavigator;
