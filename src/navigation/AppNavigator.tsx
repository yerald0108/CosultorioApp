import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { TabParamList, RootStackParamList } from '../types';

// Screens
import FamiliasScreen from '../screens/FamiliasScreen';
import BusquedaScreen from '../screens/BusquedaScreen';
import EstadisticasScreen from '../screens/EstadisticasScreen';
import NotificacionScreen from '../screens/NotificacionScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import FamiliaDetalleScreen from '../screens/FamiliaDetalleScreen';
import CrearFamiliaScreen from '../screens/CrearFamiliaScreen';
import EditarFamiliaScreen from '../screens/EditarFamiliaScreen';
import CrearIntegranteScreen from '../screens/CrearIntegranteScreen';
import EditarIntegranteScreen from '../screens/EditarIntegranteScreen';
import MiPerfilScreen from '../screens/MiPerfilScreen';
import TerminosCondicionesScreen from '../screens/TerminosCondicionesScreen';
import SoporteTecnicoScreen from '../screens/SoporteTecnicoScreen';
import ManualUsuarioScreen from '../screens/ManualUsuarioScreen';
import ConfigurarPINScreen from '../screens/ConfigurarPINScreen';
import PAMIScreen from '../screens/PAMIScreen';
import GestantesScreen from '../screens/GestantesScreen';
import CrearGestanteScreen from '../screens/CrearGestanteScreen';
import EditarGestanteScreen from '../screens/EditarGestanteScreen';
import SeguimientoGestanteScreen from '../screens/SeguimientoGestanteScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Componente para el botón de notificaciones en el header
const NotificationHeaderButton: React.FC = () => {
  const navigation = useNavigation();
  const notificationCount = 3; // Por ahora hardcodeado, después será dinámico
  
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

  const handlePress = () => {
    navigation.navigate('Notificacion' as never);
  };

  // Interpolación para el movimiento de shake
  const shakeTransform = shakeAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-3, 0, 3], // Movimiento de 3px a cada lado
  });

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={{
        marginRight: 15,
        position: 'relative',
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateX: shakeTransform }],
        }}
      >
        <Text style={{ fontSize: 24, color: '#fff' }}>🔔</Text>
      </Animated.View>
      {notificationCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -2,
          right: -2,
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FF4444',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            {notificationCount > 99 ? '99+' : notificationCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface TabNavigatorProps {
  onLogout: () => void;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Familias':
              iconName = '👨‍👩‍👧‍👦';
              break;
            case 'Busqueda':
              iconName = '🔍';
              break;
            case 'Estadisticas':
              iconName = '📊';
              break;
            case 'PAMI':
              iconName = '🤰';
              break;
            case 'Configuracion':
              iconName = '⚙️';
              break;
            default:
              iconName = '❓';
          }

          return <Text style={{ fontSize: size }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <NotificationHeaderButton />
        ),
      })}
    >
      <Tab.Screen 
        name="Familias" 
        component={FamiliasScreen}
        options={{ title: 'Familias' }}
      />
      <Tab.Screen 
        name="Busqueda" 
        component={BusquedaScreen}
        options={{ title: 'Búsqueda' }}
      />
      <Tab.Screen 
        name="Estadisticas" 
        component={EstadisticasScreen}
        options={{
          tabBarLabel: 'Estadísticas',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="PAMI" 
        component={PAMIScreen}
        options={{
          tabBarLabel: 'PAMI',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>🤰</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Configuracion" 
        options={{
          tabBarLabel: 'Configuración',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          ),
        }}
      >
        {(props) => <ConfiguracionScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

interface Props {
  onLogout: () => void;
}

const AppNavigator: React.FC<Props> = ({ onLogout }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        options={{ headerShown: false }}
      >
        {(props) => <TabNavigator {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Configuracion" 
        options={{ headerShown: false }}
      >
        {(props) => <ConfiguracionScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="ConfigurarPIN" 
        component={ConfigurarPINScreen}
        options={{ 
          title: '🔑 Configurar PIN',
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="MiPerfil" 
        component={MiPerfilScreen}
        options={{ 
          title: 'Mi Perfil',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="TerminosCondiciones" 
        component={TerminosCondicionesScreen}
        options={{ 
          title: 'Términos y Condiciones',
          headerStyle: { backgroundColor: '#607D8B' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="SoporteTecnico" 
        component={SoporteTecnicoScreen}
        options={{ 
          title: 'Soporte Técnico',
          headerStyle: { backgroundColor: '#FF5722' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="ManualUsuario" 
        component={ManualUsuarioScreen}
        options={{ 
          title: 'Manual de Usuario',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="FamiliaDetalle" 
        component={FamiliaDetalleScreen}
        options={{ title: 'Detalle de Familia' }}
      />
      <Stack.Screen 
        name="CrearFamilia" 
        component={CrearFamiliaScreen}
        options={{ title: 'Nueva Familia' }}
      />
      <Stack.Screen 
        name="EditarFamilia" 
        component={EditarFamiliaScreen}
        options={{ title: 'Editar Familia' }}
      />
      <Stack.Screen 
        name="CrearIntegrante" 
        component={CrearIntegranteScreen}
        options={{ title: 'Nuevo Integrante' }}
      />
      <Stack.Screen 
        name="EditarIntegrante" 
        component={EditarIntegranteScreen}
        options={{ title: 'Editar Integrante' }}
      />
      <Stack.Screen 
        name="Gestantes" 
        component={GestantesScreen}
        options={{ 
          title: 'Gestantes',
          headerStyle: { backgroundColor: '#E91E63' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="CrearGestante" 
        component={CrearGestanteScreen}
        options={{ 
          title: 'Nueva Gestante',
          headerStyle: { backgroundColor: '#E91E63' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="EditarGestante" 
        component={EditarGestanteScreen}
        options={{ 
          title: 'Editar Gestante',
          headerStyle: { backgroundColor: '#E91E63' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="SeguimientoGestante" 
        component={SeguimientoGestanteScreen}
        options={{ 
          title: 'Seguimiento Individualizado',
          headerStyle: { backgroundColor: '#007bff' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      <Stack.Screen 
        name="Notificacion" 
        component={NotificacionScreen}
        options={{ 
          title: '🔔 Notificaciones',
          headerStyle: { backgroundColor: '#FF9800' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
