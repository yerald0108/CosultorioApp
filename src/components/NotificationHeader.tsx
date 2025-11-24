import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from './ThemeProvider';
import { styles } from '../styles/components/NotificationHeader.styles';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface NotificationHeaderProps {
  title: string;
  notificationCount?: number;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({ 
  title, 
  notificationCount = 0 
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  
  // Animación para la campanita
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Función para crear la animación de shake
  const startShakeAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Pausa de 2 segundos entre animaciones
      ])
    ).start();
  };

  // Función para detener la animación
  const stopShakeAnimation = () => {
    shakeAnimation.stopAnimation();
    shakeAnimation.setValue(0);
  };

  // Efecto para controlar la animación basada en notificationCount
  useEffect(() => {
    if (notificationCount > 0) {
      startShakeAnimation();
    } else {
      stopShakeAnimation();
    }

    // Cleanup al desmontar el componente
    return () => {
      stopShakeAnimation();
    };
  }, [notificationCount]);

  const handleNotificationPress = () => {
    navigation.navigate('Notificacion');
  };

  // Interpolación para el movimiento de shake
  const shakeTransform = shakeAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-3, 0, 3], // Movimiento de 3px a cada lado
  });

  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={handleNotificationPress}
        activeOpacity={0.7}
      >
        <Animated.View
          style={{
            transform: [{ translateX: shakeTransform }],
          }}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
        </Animated.View>
        {notificationCount > 0 && (
          <View style={[styles.badge, { backgroundColor: '#FF4444' }]}>
            <Text style={styles.badgeText}>
              {notificationCount > 99 ? '99+' : notificationCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};


export default NotificationHeader;
