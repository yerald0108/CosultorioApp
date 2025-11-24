import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthStackParamList } from '../types';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecuperarContrasenaScreen from '../screens/RecuperarContrasenaScreen';

const Stack = createStackNavigator<AuthStackParamList>();

interface Props {
  onAuthSuccess: () => void;
}

const AuthNavigator: React.FC<Props> = ({ onAuthSuccess }) => {
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
        name="Login" 
        options={{ 
          title: 'Iniciar Sesión',
          headerShown: false, // Ocultamos el header para una mejor experiencia
        }}
      >
        {(props) => (
          <LoginScreen 
            {...props} 
            onLoginSuccess={onAuthSuccess}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen 
        name="Register" 
        options={{ 
          title: 'Crear Cuenta',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      >
        {(props) => (
          <RegisterScreen 
            {...props} 
            onRegisterSuccess={onAuthSuccess}
          />
        )}
      </Stack.Screen>

      <Stack.Screen 
        name="RecuperarContrasena" 
        component={RecuperarContrasenaScreen}
        options={{ 
          title: 'Recuperar Contraseña',
          headerStyle: { backgroundColor: '#FF9800' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
