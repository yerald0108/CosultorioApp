import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  Vibration,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { PINService } from '../services/PINService';
import { AccessLogService } from '../services/AccessLogService';
import { styles } from '../styles/screens/ConfigurarPINScreen.styles';

type ConfigurarPINScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: ConfigurarPINScreenNavigationProp;
}

const ConfigurarPINScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: step === 'create' ? '🔑 Crear PIN' : '🔑 Confirmar PIN',
    });
  }, [step, navigation]);

  const handleNumberPress = (number: string) => {
    if (isProcessing) return;

    const currentPin = step === 'create' ? pin : confirmPin;
    
    if (currentPin.length >= 6) return;

    const newPin = currentPin + number;
    
    if (step === 'create') {
      setPin(newPin);
      
      // Solo auto-avanzar cuando llegue al máximo de 6 dígitos
      if (newPin.length === 6) {
        setTimeout(() => {
          setStep('confirm');
          Vibration.vibrate(50);
        }, 200);
      }
    } else {
      setConfirmPin(newPin);
      
      // Auto-verificar cuando llegue a la misma longitud
      if (newPin.length === pin.length) {
        setTimeout(() => verifyAndSavePin(pin, newPin), 200);
      }
    }
  };

  const handleBackspace = () => {
    if (isProcessing) return;

    if (step === 'create') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setConfirmPin('');
      Vibration.vibrate(50);
    } else {
      navigation.goBack();
    }
  };

  const verifyAndSavePin = async (originalPin: string, confirmationPin: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Verificar que los PINs coincidan
      if (originalPin !== confirmationPin) {
        Vibration.vibrate([100, 100, 100]);
        
        Alert.alert(
          '❌ PINs No Coinciden',
          'Los PINs ingresados no son iguales. Intenta nuevamente.',
          [
            {
              text: 'Reintentar',
              onPress: () => {
                setStep('create');
                setPin('');
                setConfirmPin('');
                setIsProcessing(false);
              }
            }
          ]
        );
        return;
      }

      // Guardar PIN
      const result = await PINService.setPin(originalPin);

      if (result.success) {
        // PIN guardado exitosamente
        AccessLogService.logEvent('security_event', 'PIN de acceso configurado exitosamente');
        Vibration.vibrate(100);

        Alert.alert(
          '✅ PIN Configurado',
          'Tu PIN de acceso rápido ha sido configurado exitosamente.\n\n🔐 Ahora puedes usar tu PIN para acceder a la aplicación de forma segura.',
          [
            {
              text: 'Entendido',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        // Error al guardar PIN
        AccessLogService.logEvent('security_event', `Error configurando PIN: ${result.error}`);
        
        Alert.alert(
          '❌ Error',
          result.error || 'No se pudo configurar el PIN. Intenta nuevamente.',
          [
            {
              text: 'Reintentar',
              onPress: () => {
                setStep('create');
                setPin('');
                setConfirmPin('');
                setIsProcessing(false);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error configurando PIN:', error);
      AccessLogService.logEvent('security_event', `Error técnico configurando PIN: ${error}`);
      
      Alert.alert(
        '⚠️ Error Técnico',
        'Ocurrió un error técnico. Intenta nuevamente.',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setStep('create');
              setPin('');
              setConfirmPin('');
              setIsProcessing(false);
            }
          }
        ]
      );
    }

    setIsProcessing(false);
  };

  const renderPinDots = () => {
    const currentPin = step === 'create' ? pin : confirmPin;
    const dots = [];
    
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            i < currentPin.length ? styles.pinDotFilled : styles.pinDotEmpty
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
                disabled={isProcessing}
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
                isProcessing && styles.numberButtonDisabled
              ]}
              onPress={() => handleNumberPress(number)}
              disabled={isProcessing}
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>
          {step === 'create' ? '🔑 Crear PIN' : '🔑 Confirmar PIN'}
        </Text>
        
        <Text style={styles.subtitle}>
          {step === 'create' 
            ? 'Ingresa un PIN de 4-6 dígitos'
            : 'Confirma tu PIN ingresándolo nuevamente'
          }
        </Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.pinContainer}>
        <View style={styles.pinDotsContainer}>
          {renderPinDots()}
        </View>
        
        <Text style={styles.lengthText}>
          {step === 'create' ? pin.length : confirmPin.length} / 6 dígitos
        </Text>
      </View>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {renderNumberPad()}
      </View>

      {/* Continue Button */}
      {step === 'create' && pin.length >= 4 && pin.length < 6 && !isProcessing && (
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => {
            setStep('confirm');
            Vibration.vibrate(50);
          }}
        >
          <Text style={styles.continueButtonText}>
            ✅ Continuar con {pin.length} dígitos
          </Text>
        </TouchableOpacity>
      )}

      {/* Status */}
      {isProcessing && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>🔍 Configurando PIN...</Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          💡 Tu PIN debe tener entre 4 y 6 dígitos
        </Text>
        <Text style={styles.instructionsText}>
          🔐 Úsalo para acceder rápidamente a la aplicación
        </Text>
      </View>
    </View>
  );
};


export default ConfigurarPINScreen;
