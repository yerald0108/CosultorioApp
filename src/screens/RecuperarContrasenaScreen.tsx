import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AuthService } from '../services/AuthService';
import { styles } from '../styles/screens/RecuperarContrasenaScreen.styles';

type RecuperarContrasenaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecuperarContrasena'>;

interface Props {
  navigation: RecuperarContrasenaScreenNavigationProp;
}

const RecuperarContrasenaScreen: React.FC<Props> = ({ navigation }) => {
  const [paso, setPaso] = useState(1); // 1: Usuario, 2: Pregunta de seguridad, 3: Nueva contraseña
  const [loading, setLoading] = useState(false);
  
  // Datos del formulario
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [respuestaSeguridad, setRespuestaSeguridad] = useState('');
  const [contrasenaTemporal, setContrasenaTemporal] = useState('');

  const validarUsuario = async () => {
    if (!nombreUsuario.trim()) {
      Alert.alert('Error', 'Ingrese su nombre de usuario');
      return;
    }

    setLoading(true);
    try {
      // Verificar si el usuario existe
      const doctores = await AuthService.obtenerDoctores();
      const doctor = doctores.find(d => d.nombreUsuario.toLowerCase() === nombreUsuario.toLowerCase());
      
      if (!doctor) {
        Alert.alert('Error', 'Usuario no encontrado');
        return;
      }

      setPaso(2);
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const recuperarContrasena = async () => {
    if (!respuestaSeguridad.trim()) {
      Alert.alert('Error', 'Ingrese su nombre completo');
      return;
    }

    setLoading(true);
    try {
      const nuevaContrasena = await AuthService.recuperarContrasena(nombreUsuario, respuestaSeguridad);
      setContrasenaTemporal(nuevaContrasena);
      setPaso(3);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo recuperar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const irAlLogin = () => {
    navigation.navigate('Login');
  };

  const renderPaso1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>🔍 Paso 1: Verificar Usuario</Text>
      <Text style={styles.stepDescription}>
        Ingrese su nombre de usuario para comenzar el proceso de recuperación
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre de Usuario</Text>
        <TextInput
          style={styles.input}
          value={nombreUsuario}
          onChangeText={setNombreUsuario}
          placeholder="Ej: dr_martinez"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={validarUsuario}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verificando...' : '🔍 Verificar Usuario'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaso2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>🔐 Paso 2: Pregunta de Seguridad</Text>
      <Text style={styles.stepDescription}>
        Por seguridad, necesitamos verificar su identidad
      </Text>

      <View style={styles.securityContainer}>
        <Text style={styles.securityQuestion}>
          ❓ ¿Cuál es su nombre completo registrado?
        </Text>
        <Text style={styles.securityHint}>
          💡 Ingrese exactamente como lo registró (Ej: Dr. Juan Martínez)
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Respuesta de Seguridad</Text>
        <TextInput
          style={styles.input}
          value={respuestaSeguridad}
          onChangeText={setRespuestaSeguridad}
          placeholder="Dr. Juan Martínez"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setPaso(1)}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={recuperarContrasena}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verificando...' : '🔐 Recuperar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaso3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>✅ ¡Contraseña Recuperada!</Text>
      <Text style={styles.stepDescription}>
        Su contraseña ha sido restablecida exitosamente
      </Text>

      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>🎉 Nueva Contraseña Temporal</Text>
        <View style={styles.passwordContainer}>
          <Text style={styles.temporalPassword}>{contrasenaTemporal}</Text>
        </View>
        <Text style={styles.passwordNote}>
          📝 Anote esta contraseña en un lugar seguro
        </Text>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📋 Instrucciones:</Text>
        <Text style={styles.instruction}>
          1. 🔑 Use esta contraseña temporal para iniciar sesión
        </Text>
        <Text style={styles.instruction}>
          2. 🔐 Vaya a "Mi Perfil" para cambiar por una contraseña permanente
        </Text>
        <Text style={styles.instruction}>
          3. 🛡️ Por seguridad, cambie la contraseña lo antes posible
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={irAlLogin}
      >
        <Text style={styles.buttonText}>
          🚀 Ir al Login
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>🔓 Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>
            Sistema de recuperación offline seguro
          </Text>

          {/* Indicador de pasos */}
          <View style={styles.stepsIndicator}>
            <View style={[styles.stepDot, paso >= 1 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, paso >= 1 && styles.stepDotTextActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, paso >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, paso >= 2 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, paso >= 2 && styles.stepDotTextActive]}>2</Text>
            </View>
            <View style={[styles.stepLine, paso >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, paso >= 3 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, paso >= 3 && styles.stepDotTextActive]}>3</Text>
            </View>
          </View>

          {/* Contenido según el paso */}
          {paso === 1 && renderPaso1()}
          {paso === 2 && renderPaso2()}
          {paso === 3 && renderPaso3()}

          {/* Botón volver al login */}
          {paso < 3 && (
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToLoginText}>
                ← Volver al Login
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};


export default RecuperarContrasenaScreen;
