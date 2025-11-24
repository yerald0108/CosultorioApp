import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  StatusBar,
  Vibration,
} from 'react-native';
import { PINService } from '../services/PINService';
import { AccessLogService } from '../services/AccessLogService';
import { styles } from '../styles/screens/PINLockScreen.styles';

interface Props {
  onAuthSuccess: () => void;
  onAuthFailed: () => void;
  onChangeMethod?: () => void;
}

const PINLockScreen: React.FC<Props> = ({ onAuthSuccess, onAuthFailed, onChangeMethod }) => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  useEffect(() => {
    // Verificar estado inicial
    checkPinStatus();

    // Deshabilitar botón de retroceso
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => {
      backHandler.remove();
    };
  }, []);

  const checkPinStatus = async () => {
    const status = await PINService.getStatus();
    setAttemptsLeft(status.attemptsLeft);
    setIsLocked(status.isLocked);
    setLockedUntil(status.lockedUntil || null);
  };

  const handleNumberPress = (number: string) => {
    if (isVerifying || isLocked || pin.length >= 6) return;

    const newPin = pin + number;
    setPin(newPin);

    // Solo auto-verificar cuando llegue al máximo de 6 dígitos
    if (newPin.length === 6) {
      setTimeout(() => verifyPin(newPin), 100);
    }
  };

  const handleBackspace = () => {
    if (isVerifying || isLocked) return;
    setPin(pin.slice(0, -1));
  };

  const verifyPin = async (pinToVerify: string) => {
    if (isVerifying) return;

    setIsVerifying(true);

    try {
      const result = await PINService.verifyPin(pinToVerify);

      if (result.success) {
        // PIN correcto
        AccessLogService.logEvent('login', 'Acceso exitoso con PIN');
        Vibration.vibrate(100); // Vibración de éxito
        onAuthSuccess();
      } else {
        // PIN incorrecto
        AccessLogService.logEvent('biometric_failed', `Intento de PIN fallido. ${result.error}`);
        
        Vibration.vibrate([100, 100, 100]); // Vibración de error
        setPin(''); // Limpiar PIN

        if (result.lockedUntil) {
          // Bloqueado temporalmente
          setIsLocked(true);
          setLockedUntil(result.lockedUntil);
          
          Alert.alert(
            '🚨 PIN Bloqueado',
            `Demasiados intentos fallidos.\n\nEl PIN está bloqueado hasta las ${result.lockedUntil.toLocaleTimeString()}.\n\nPor seguridad, la aplicación se cerrará.`,
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
          // Mostrar intentos restantes
          setAttemptsLeft(result.attemptsLeft || 0);
          
          Alert.alert(
            '❌ PIN Incorrecto',
            `${result.error}\n\nIntentos restantes: ${result.attemptsLeft || 0}`,
            [
              {
                text: 'Reintentar',
                onPress: () => {
                  setPin('');
                  setIsVerifying(false);
                }
              }
            ],
            { cancelable: false }
          );
        }
      }
    } catch (error) {
      AccessLogService.logEvent('biometric_error', `Error técnico en PIN: ${error}`);
      
      Alert.alert(
        '⚠️ Error Técnico',
        'Ocurrió un error durante la verificación del PIN. Intenta nuevamente.',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setPin('');
              setIsVerifying(false);
            }
          }
        ]
      );
    }

    setIsVerifying(false);
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            i < pin.length ? styles.pinDotFilled : styles.pinDotEmpty
          ]}
        />
      );
    }
    return dots;
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '⌫']
    ];

    return numbers.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.numberRow}>
        {row.map((number, colIndex) => {
          if (number === '') {
            return <View key={colIndex} style={styles.numberButton} />;
          }
          
          if (number === '⌫') {
            return (
              <TouchableOpacity
                key={colIndex}
                style={[styles.numberButton, styles.backspaceButton]}
                onPress={handleBackspace}
                disabled={isVerifying || isLocked}
              >
                <Text style={styles.backspaceText}>⌫</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={colIndex}
              style={[
                styles.numberButton,
                (isVerifying || isLocked) && styles.numberButtonDisabled
              ]}
              onPress={() => handleNumberPress(number)}
              disabled={isVerifying || isLocked}
            >
              <Text style={styles.numberText}>{number}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔑 PIN de Acceso</Text>
        <Text style={styles.subtitle}>
          {isLocked 
            ? `Bloqueado hasta ${lockedUntil?.toLocaleTimeString()}`
            : 'Ingresa tu PIN para continuar'
          }
        </Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.pinContainer}>
        <View style={styles.pinDotsContainer}>
          {renderPinDots()}
        </View>
        
        {!isLocked && (
          <Text style={styles.attemptsText}>
            Intentos restantes: {attemptsLeft}
          </Text>
        )}
      </View>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {renderNumberPad()}
      </View>

      {/* Verify Button */}
      {pin.length >= 4 && pin.length < 6 && !isVerifying && !isLocked && (
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => verifyPin(pin)}
        >
          <Text style={styles.verifyButtonText}>
            ✅ Verificar PIN ({pin.length} dígitos)
          </Text>
        </TouchableOpacity>
      )}

      {/* Change Method Button */}
      {onChangeMethod && !isLocked && (
        <TouchableOpacity
          style={styles.changeMethodButton}
          onPress={onChangeMethod}
          disabled={isVerifying}
        >
          <Text style={styles.changeMethodText}>
            👆 Usar Huella Digital en su lugar
          </Text>
        </TouchableOpacity>
      )}

      {/* Status */}
      {isVerifying && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>🔍 Verificando PIN...</Text>
        </View>
      )}

      {isLocked && (
        <View style={styles.statusContainer}>
          <Text style={styles.lockedText}>🚨 PIN Bloqueado Temporalmente</Text>
        </View>
      )}
    </View>
  );
};


export default PINLockScreen;
