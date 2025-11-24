import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { AuthStackParamList, PasswordStrength } from '../types';
import { AuthService } from '../services/AuthService';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { styles } from '../styles/screens/RegisterScreen.styles';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
  onRegisterSuccess: () => void;
}

const RegisterScreen: React.FC<Props> = ({ navigation, onRegisterSuccess }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [poblacion, setPoblacion] = useState('');
  const [consultorio, setConsultorio] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  useEffect(() => {
    if (password) {
      const strength = AuthService.evaluarFortalezaPassword(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const validarFormulario = (): { valido: boolean; mensaje?: string } => {
    // Validar nombre de usuario
    const validacionUsuario = AuthService.validarNombreUsuario(nombreUsuario);
    if (!validacionUsuario.valido) {
      return { valido: false, mensaje: validacionUsuario.mensaje };
    }

    // Validar nombre completo
    if (!nombreCompleto.trim()) {
      return { valido: false, mensaje: 'El nombre completo es requerido' };
    }
    if (nombreCompleto.trim().length < 3) {
      return { valido: false, mensaje: 'El nombre completo debe tener al menos 3 caracteres' };
    }

    // Validar contraseña
    const validacionPassword = AuthService.validarPassword(password);
    if (!validacionPassword.valido) {
      return { valido: false, mensaje: validacionPassword.mensaje };
    }

    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
      return { valido: false, mensaje: 'Las contraseñas no coinciden' };
    }

    // Validar población
    if (!poblacion.trim()) {
      return { valido: false, mensaje: 'La población es requerida' };
    }

    // Validar consultorio
    if (!consultorio.trim()) {
      return { valido: false, mensaje: 'El consultorio es requerido' };
    }

    // Validar términos
    if (!aceptaTerminos) {
      return { valido: false, mensaje: 'Debes aceptar los términos y condiciones' };
    }

    return { valido: true };
  };

  const handleRegister = async () => {
    const validacion = validarFormulario();
    if (!validacion.valido) {
      Alert.alert('Error de validación', validacion.mensaje);
      return;
    }

    setLoading(true);
    try {
      const resultado = await AuthService.registrarDoctor({
        nombreUsuario: nombreUsuario.trim(),
        nombreCompleto: nombreCompleto.trim(),
        password,
        poblacion: poblacion.trim(),
        consultorio: consultorio.trim(),
      });

      if (resultado.success) {
        Alert.alert(
          '¡Cuenta creada exitosamente!',
          `Bienvenido Dr(a). ${resultado.doctor?.nombreCompleto}. Tu cuenta ha sido creada y ya puedes comenzar a gestionar tus pacientes.`,
          [
            {
              text: 'Continuar',
              onPress: async () => {
                // Iniciar sesión automáticamente
                await AuthService.iniciarSesion(nombreUsuario.trim(), password);
                onRegisterSuccess();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error al crear cuenta', resultado.message);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>👨‍⚕️</Text>
          <Text style={styles.title}>Crear Nueva Cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para comenzar a gestionar tus pacientes
          </Text>
        </View>

        <View style={styles.form}>
          {/* Nombre de Usuario */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>👤 Nombre de Usuario *</Text>
            <TextInput
              style={styles.input}
              value={nombreUsuario}
              onChangeText={setNombreUsuario}
              placeholder="Ej: dr_martinez, doctora_ana"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <Text style={styles.helperText}>
              Solo letras, números y guiones bajos. Mínimo 3 caracteres.
            </Text>
          </View>

          {/* Nombre Completo */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🩺 Nombre Completo del Doctor(a) *</Text>
            <TextInput
              style={styles.input}
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
              placeholder="Dr. Juan Martínez / Dra. Ana López"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔒 Contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Crea una contraseña segura"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '👁️' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordStrength && (
              <PasswordStrengthIndicator 
                strength={passwordStrength} 
                password={password}
              />
            )}
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔒 Confirmar Contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showConfirmPassword ? '👁️' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>❌ Las contraseñas no coinciden</Text>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <Text style={styles.successText}>✅ Las contraseñas coinciden</Text>
            )}
          </View>

          {/* Población */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📍 Población donde Trabajas *</Text>
            <TextInput
              style={styles.input}
              value={poblacion}
              onChangeText={setPoblacion}
              placeholder="Ej: Villa Nueva, San José, Centro"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Consultorio */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🏥 Tu Consultorio *</Text>
            <TextInput
              style={styles.input}
              value={consultorio}
              onChangeText={setConsultorio}
              placeholder="Ej: Centro de Salud A, Consultorio 1"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Términos y Condiciones */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAceptaTerminos(!aceptaTerminos)}
            disabled={loading}
          >
            <View style={[styles.checkbox, aceptaTerminos && styles.checkboxChecked]}>
              {aceptaTerminos && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Acepto los términos y condiciones de uso de la aplicación
            </Text>
          </TouchableOpacity>

          {/* Botones */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? '⏳ Creando cuenta...' : '🚀 Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleGoToLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              ← Ya tengo una cuenta
            </Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              ℹ️ Todos tus datos se almacenan de forma segura en tu dispositivo.
              Solo tú tendrás acceso a la información de tus pacientes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


export default RegisterScreen;
