import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ErrorBoundary from './ErrorBoundary';
import { styles } from '../styles/components/StoreErrorBoundary.styles';

interface StoreErrorBoundaryProps {
  children: React.ReactNode;
  storeName: string;
  onReset?: () => void;
}

const StoreErrorBoundary: React.FC<StoreErrorBoundaryProps> = ({ 
  children, 
  storeName, 
  onReset 
}) => {
  const handleStoreError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Error en ${storeName}:`, error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, Crashlytics, etc.
  };

  const customFallback = (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.errorIcon}>🔧</Text>
        <Text style={styles.errorTitle}>Error en {storeName}</Text>
        <Text style={styles.errorMessage}>
          Hubo un problema con la gestión de datos. Los datos pueden no estar 
          actualizados temporalmente.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={onReset}
          >
            <Text style={styles.resetButtonText}>🔄 Reiniciar Store</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          Si el problema persiste, cierra y vuelve a abrir la aplicación.
        </Text>
      </View>
    </View>
  );

  return (
    <ErrorBoundary 
      fallback={customFallback}
      onError={handleStoreError}
    >
      {children}
    </ErrorBoundary>
  );
};


export default StoreErrorBoundary;
