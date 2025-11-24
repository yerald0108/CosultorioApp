import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { AppStateService } from './src/services/AppStateService';
import { AgeUpdateService } from './src/services/AgeUpdateService';
import BiometricLockWrapper from './src/components/BiometricLockWrapper';
import { ThemeProvider, useTheme } from './src/components';

// Componente interno para StatusBar con tema
const AppContent = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      <BiometricLockWrapper>
        <RootNavigator />
      </BiometricLockWrapper>
    </View>
  );
};

export default function App() {
  useEffect(() => {
    // Inicializar servicios de la aplicación
    const initializeApp = async () => {
      try {
        // Inicializar el servicio de estado de la aplicación
        AppStateService.getInstance();
        
        // Ejecutar actualización automática de edades al iniciar la app
        console.log('🚀 Inicializando aplicación...');
        await AgeUpdateService.ejecutarActualizacionAutomatica();
        console.log('✅ Aplicación inicializada correctamente');
      } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
      }
    };
    
    initializeApp();
    
    // Cleanup al desmontar
    return () => {
      AppStateService.cleanup();
    };
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
