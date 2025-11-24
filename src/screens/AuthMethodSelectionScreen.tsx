import * as React from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  Vibration,
} from 'react-native';
import { AccessLogService } from '../services/AccessLogService';
import { styles } from '../styles/screens/AuthMethodSelectionScreen.styles';

interface Props {
  onSelectBiometric: () => void;
  onSelectPIN: () => void;
  onAuthFailed: () => void;
}

const AuthMethodSelectionScreen: React.FC<Props> = ({ 
  onSelectBiometric, 
  onSelectPIN, 
  onAuthFailed 
}) => {
  useEffect(() => {
    // Deshabilitar botón de retroceso
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

    // Registrar evento de selección de método
    AccessLogService.logEvent('security_event', 'Pantalla de selección de método de autenticación mostrada');

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleBiometricSelect = () => {
    Vibration.vibrate(50);
    AccessLogService.logEvent('security_event', 'Usuario seleccionó autenticación biométrica');
    onSelectBiometric();
  };

  const handlePINSelect = () => {
    Vibration.vibrate(50);
    AccessLogService.logEvent('security_event', 'Usuario seleccionó autenticación por PIN');
    onSelectPIN();
  };

  const handleEmergencyExit = () => {
    AccessLogService.logEvent('security_event', 'Usuario activó salida de emergencia desde selección de método');
    onAuthFailed();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Desbloquear Aplicación</Text>
        <Text style={styles.subtitle}>
          Tienes múltiples métodos de seguridad configurados.{'\n'}
          Elige cómo deseas acceder:
        </Text>
      </View>

      {/* Authentication Methods */}
      <View style={styles.methodsContainer}>
        
        {/* Biometric Option */}
        <TouchableOpacity 
          style={styles.methodButton}
          onPress={handleBiometricSelect}
          activeOpacity={0.8}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.methodIconText}>👆</Text>
          </View>
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>Huella Digital</Text>
            <Text style={styles.methodDescription}>
              Rápido y seguro{'\n'}
              Usa tu sensor biométrico
            </Text>
          </View>
          <View style={styles.methodArrow}>
            <Text style={styles.methodArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* PIN Option */}
        <TouchableOpacity 
          style={styles.methodButton}
          onPress={handlePINSelect}
          activeOpacity={0.8}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.methodIconText}>🔑</Text>
          </View>
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>PIN de Acceso</Text>
            <Text style={styles.methodDescription}>
              Código numérico{'\n'}
              Ingresa tu PIN personalizado
            </Text>
          </View>
          <View style={styles.methodArrow}>
            <Text style={styles.methodArrowText}>→</Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* Security Info */}
      <View style={styles.securityInfo}>
        <Text style={styles.securityText}>
          🛡️ Ambos métodos ofrecen el mismo nivel de seguridad
        </Text>
        <Text style={styles.securityText}>
          💡 Puedes cambiar entre métodos en cualquier momento
        </Text>
      </View>

      {/* Emergency Exit */}
      <TouchableOpacity 
        style={styles.emergencyButton}
        onPress={handleEmergencyExit}
        onLongPress={handleEmergencyExit}
      >
        <Text style={styles.emergencyText}>
          🚨 Salida de Emergencia (Mantener presionado)
        </Text>
      </TouchableOpacity>

    </View>
  );
};


export default AuthMethodSelectionScreen;
