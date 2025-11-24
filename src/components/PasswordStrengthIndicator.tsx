import * as React from 'react';
import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { PasswordStrength } from '../types';
import { styles } from '../styles/components/PasswordStrengthIndicator.styles';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  password,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de la barra de progreso
    Animated.timing(progressAnim, {
      toValue: (strength.score / 5) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Animación de escala y opacidad
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [strength.score]);

  if (!password) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: strength.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.strengthText, { color: strength.color }]}>
          {strength.emoji} {strength.message}
        </Text>
      </View>

      {/* Requisitos */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
        
        <View style={styles.requirementsList}>
          <RequirementItem
            met={strength.requirements.length}
            text="Al menos 8 caracteres"
          />
          <RequirementItem
            met={strength.requirements.uppercase}
            text="Una letra mayúscula"
          />
          <RequirementItem
            met={strength.requirements.lowercase}
            text="Una letra minúscula"
          />
          <RequirementItem
            met={strength.requirements.numbers}
            text="Un número"
          />
          <RequirementItem
            met={strength.requirements.symbols}
            text="Un símbolo (!@#$%^&*)"
          />
        </View>
      </View>
    </Animated.View>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: met ? 1.1 : 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      if (met) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [met]);

  return (
    <Animated.View 
      style={[
        styles.requirementItem,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={[styles.requirementIcon, { color: met ? '#00AA00' : '#CCCCCC' }]}>
        {met ? '✅' : '⭕'}
      </Text>
      <Text style={[styles.requirementText, { color: met ? '#00AA00' : '#666666' }]}>
        {text}
      </Text>
    </Animated.View>
  );
};


export default PasswordStrengthIndicator;
