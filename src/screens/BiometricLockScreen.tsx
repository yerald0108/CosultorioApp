import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  Vibration,
  Alert,
} from 'react-native';
import { BiometricService } from '../services/BiometricService';
import { AccessLogService } from '../services/AccessLogService';
import { styles } from '../styles/screens/BiometricLockScreen.styles';

interface Props {
  onAuthSuccess: () => void;
  onAuthFailed: () => void;
  onChangeMethod?: () => void;
}

const BiometricLockScreen: React.FC<Props> = ({ onAuthSuccess, onAuthFailed, onChangeMethod }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 3;

  useEffect(() => {
    // Deshabilitar botón de atrás de Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevenir que se cierre la pantalla
    });

    // Iniciar autenticación automáticamente
    handleAuthenticate();

    return () => backHandler.remove();
  }, []);

  const handleAuthenticate = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);

    try {
      const result = await BiometricService.authenticate(
        'Verifica tu identidad para acceder a la aplicación'
      );

      if (result.success) {
        // Registrar autenticación exitosa
        AccessLogService.logEvent('biometric_success', 'Autenticación biométrica exitosa');
        onAuthSuccess();
      } else {
        const newAttemptCount = attemptCount + 1;
        console.log(`🔍 Debug contador: attemptCount actual=${attemptCount}, nuevo=${newAttemptCount}, max=${maxAttempts}, restantes=${maxAttempts - newAttemptCount}`);
        setAttemptCount(newAttemptCount);

        // Registrar intento fallido
        AccessLogService.logEvent('biometric_failed', `Intento de autenticación biométrica fallido (${newAttemptCount}/${maxAttempts})`);

        if (newAttemptCount >= maxAttempts) {
          Alert.alert(
            '🚨 Demasiados Intentos Fallidos',
            'Has excedido el número máximo de intentos de autenticación. La aplicación se cerrará por seguridad.',
            [
              {
                text: 'Cerrar App',
                onPress: onAuthFailed,
                style: 'destructive'
              }
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            '❌ Autenticación Fallida',
            `${result.error}\n\nIntentos restantes: ${maxAttempts - newAttemptCount}`,
            [
              {
                text: 'Reintentar',
                onPress: () => {
                  setIsAuthenticating(false);
                  // Pequeño delay antes de reintentar
                  setTimeout(() => handleAuthenticate(), 500);
                }
              }
            ],
            { cancelable: false }
          );
        }
      }
    } catch (error) {
      // Registrar error técnico
      AccessLogService.logEvent('biometric_error', `Error técnico en autenticación biométrica: ${error}`);
      
      Alert.alert(
        '⚠️ Error Técnico',
        'Ocurrió un error durante la autenticación. Intenta nuevamente.',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setIsAuthenticating(false);
              setTimeout(() => handleAuthenticate(), 500);
            }
          }
        ],
        { cancelable: false }
      );
    }

    setIsAuthenticating(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Overlay de seguridad */}
      <View style={styles.overlay}>
        <View style={styles.lockContainer}>
          {/* Icono de bloqueo */}
          <View style={styles.lockIcon}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>Aplicación Bloqueada</Text>
          
          {/* Subtítulo */}
          <Text style={styles.subtitle}>
            Verifica tu identidad para continuar
          </Text>

          {/* Información de intentos */}
          {attemptCount > 0 && (
            <View style={styles.attemptsContainer}>
              <Text style={styles.attemptsText}>
                ⚠️ Intentos fallidos: {attemptCount}/{maxAttempts}
              </Text>
            </View>
          )}

          {/* Botón de autenticación */}
          <TouchableOpacity
            style={[
              styles.authButton,
              isAuthenticating && styles.authButtonDisabled
            ]}
            onPress={handleAuthenticate}
            disabled={isAuthenticating}
          >
            <Text style={styles.authButtonIcon}>👆</Text>
            <Text style={styles.authButtonText}>
              {isAuthenticating ? 'Autenticando...' : 'Usar Huella Digital'}
            </Text>
          </TouchableOpacity>

          {/* Botón cambiar método */}
          {onChangeMethod && (
            <TouchableOpacity
              style={styles.changeMethodButton}
              onPress={onChangeMethod}
              disabled={isAuthenticating}
            >
              <Text style={styles.changeMethodText}>
                🔑 Usar PIN en su lugar
              </Text>
            </TouchableOpacity>
          )}

          {/* Información de seguridad */}
          <View style={styles.securityInfo}>
            <Text style={styles.securityText}>
              🛡️ Esta aplicación contiene información médica sensible
            </Text>
            <Text style={styles.securitySubtext}>
              La autenticación es obligatoria por seguridad
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};


export default BiometricLockScreen;
