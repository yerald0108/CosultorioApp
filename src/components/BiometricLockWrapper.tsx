import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { AppStateService } from '../services/AppStateService';
import { AccessLogService } from '../services/AccessLogService';
import { BiometricService } from '../services/BiometricService';
import { PINService } from '../services/PINService';
import BiometricLockScreen from '../screens/BiometricLockScreen';
import PINLockScreen from '../screens/PINLockScreen';
import AuthMethodSelectionScreen from '../screens/AuthMethodSelectionScreen';

interface Props {
  children: React.ReactNode;
}

const BiometricLockWrapper: React.FC<Props> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin' | 'selection' | null>(null);

  useEffect(() => {
    // Verificar estado inicial y método de autenticación
    const initializeAuth = async () => {
      setIsLocked(AppStateService.isAppLocked());
      
      // Determinar método de autenticación disponible
      const biometricStatus = await BiometricService.getStatus();
      const pinStatus = await PINService.getStatus();
      
      const biometricAvailable = biometricStatus.enabled && biometricStatus.available;
      const pinAvailable = pinStatus.enabled && pinStatus.hasPin;
      
      if (biometricAvailable && pinAvailable) {
        // Ambos métodos disponibles - mostrar selección
        setAuthMethod('selection');
      } else if (biometricAvailable) {
        // Solo biométrico disponible
        setAuthMethod('biometric');
      } else if (pinAvailable) {
        // Solo PIN disponible
        setAuthMethod('pin');
      } else {
        // Ningún método disponible
        setAuthMethod(null);
      }
    };
    
    initializeAuth();

    // Listener para cambios de estado de bloqueo
    const handleLockStateChange = (locked: boolean) => {
      setIsLocked(locked);
      
      // Registrar evento en los logs
      if (locked) {
        AccessLogService.logEvent('app_background', 'Aplicación bloqueada por inactividad');
      } else {
        AccessLogService.logEvent('app_foreground', 'Aplicación desbloqueada exitosamente');
      }
    };

    AppStateService.addLockStateChangeListener(handleLockStateChange);

    return () => {
      AppStateService.removeLockStateChangeListener(handleLockStateChange);
    };
  }, []);

  const handleAuthSuccess = () => {
    AppStateService.unlockApp();
  };

  const handleAuthFailed = () => {
    // En caso de fallo crítico, cerrar la aplicación
    BackHandler.exitApp();
  };

  const handleSelectBiometric = () => {
    setAuthMethod('biometric');
  };

  const handleSelectPIN = () => {
    setAuthMethod('pin');
  };

  const handleBackToSelection = async () => {
    // Verificar que ambos métodos estén disponibles antes de volver a selección
    const biometricStatus = await BiometricService.getStatus();
    const pinStatus = await PINService.getStatus();
    
    const biometricAvailable = biometricStatus.enabled && biometricStatus.available;
    const pinAvailable = pinStatus.enabled && pinStatus.hasPin;
    
    if (biometricAvailable && pinAvailable) {
      setAuthMethod('selection');
    }
  };

  if (isLocked && authMethod) {
    if (authMethod === 'selection') {
      return (
        <AuthMethodSelectionScreen
          onSelectBiometric={handleSelectBiometric}
          onSelectPIN={handleSelectPIN}
          onAuthFailed={handleAuthFailed}
        />
      );
    } else if (authMethod === 'biometric') {
      return (
        <BiometricLockScreen
          onAuthSuccess={handleAuthSuccess}
          onAuthFailed={handleAuthFailed}
          onChangeMethod={handleBackToSelection}
        />
      );
    } else if (authMethod === 'pin') {
      return (
        <PINLockScreen
          onAuthSuccess={handleAuthSuccess}
          onAuthFailed={handleAuthFailed}
          onChangeMethod={handleBackToSelection}
        />
      );
    }
  }

  return <>{children}</>;
};

export default BiometricLockWrapper;
