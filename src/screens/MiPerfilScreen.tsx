import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, DoctorData } from '../types';
import { AuthService } from '../services/AuthService';
import { PasswordStrengthIndicator } from '../components';
import { styles } from '../styles/screens/MiPerfilScreen.styles';

type MiPerfilScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MiPerfil'>;

interface Props {
  navigation: MiPerfilScreenNavigationProp;
}

const MiPerfilScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  
  // Estados para edición
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [poblacion, setPoblacion] = useState('');
  const [consultorio, setConsultorio] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  
  // Estados para cambio de contraseña
  const [mostrarCambioContrasena, setMostrarCambioContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  useEffect(() => {
    cargarDatosDoctor();
  }, []);

  const cargarDatosDoctor = async () => {
    try {
      const doctorActual = await AuthService.obtenerDoctorActual();
      if (doctorActual) {
        setDoctor(doctorActual);
        setNombreUsuario(doctorActual.nombreUsuario);
        setNombreCompleto(doctorActual.nombreCompleto);
        setPoblacion(doctorActual.poblacion);
        setConsultorio(doctorActual.consultorio);
        setFotoPerfil(doctorActual.fotoPerfil || null);
      }
    } catch (error) {
      console.error('Error cargando datos del doctor:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const validarFormulario = () => {
    if (!nombreUsuario.trim()) {
      Alert.alert('Error', 'El nombre de usuario es requerido');
      return false;
    }
    if (!nombreCompleto.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido');
      return false;
    }
    if (!poblacion.trim()) {
      Alert.alert('Error', 'La población es requerida');
      return false;
    }
    if (!consultorio.trim()) {
      Alert.alert('Error', 'El consultorio es requerido');
      return false;
    }
    return true;
  };

  const validarCambioContrasena = () => {
    if (!contrasenaActual.trim()) {
      Alert.alert('Error', 'Ingrese su contraseña actual');
      return false;
    }
    if (!contrasenaNueva.trim()) {
      Alert.alert('Error', 'Ingrese la nueva contraseña');
      return false;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    
    const validacion = AuthService.evaluarFortalezaPassword(contrasenaNueva);
    if (validacion.score < 3) {
      Alert.alert('Error', 'La nueva contraseña debe ser al menos de nivel medio');
      return false;
    }
    
    return true;
  };

  const seleccionarImagen = async () => {
    try {
      // Solicitar permisos de galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería de fotos');
        return;
      }

      // Mostrar opciones al usuario
      Alert.alert(
        '📸 Foto de Perfil',
        'Selecciona una opción para tu foto de perfil',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: '📷 Tomar Foto', onPress: tomarFoto },
          { text: '🖼️ Seleccionar de Galería', onPress: seleccionarDeGaleria },
          ...(fotoPerfil ? [{ text: '🗑️ Eliminar Foto', onPress: eliminarFoto, style: 'destructive' as const }] : [])
        ]
      );
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      Alert.alert('Error', 'No se pudieron solicitar los permisos necesarios');
    }
  };

  const tomarFoto = async () => {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para usar la cámara');
        return;
      }

      // Lanzar cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], // Nueva API sin deprecation warning
        allowsEditing: true,
        aspect: [1, 1], // Imagen cuadrada
        quality: 0.8, // Calidad optimizada
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFotoPerfil(result.assets[0].uri);
        Alert.alert('✅ Éxito', 'Foto capturada correctamente. No olvides guardar tu perfil.');
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.');
    }
  };

  const seleccionarDeGaleria = async () => {
    try {
      // Lanzar selector de galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Nueva API sin deprecation warning
        allowsEditing: true,
        aspect: [1, 1], // Imagen cuadrada
        quality: 0.8, // Calidad optimizada
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFotoPerfil(result.assets[0].uri);
        Alert.alert('✅ Éxito', 'Foto seleccionada correctamente. No olvides guardar tu perfil.');
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Inténtalo de nuevo.');
    }
  };

  const eliminarFoto = () => {
    Alert.alert(
      '🗑️ Eliminar Foto',
      '¿Estás seguro de que quieres eliminar tu foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            setFotoPerfil(null);
            Alert.alert('✅ Eliminada', 'Foto de perfil eliminada. No olvides guardar los cambios.');
          }
        }
      ]
    );
  };

  const handleGuardarPerfil = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    try {
      await AuthService.actualizarPerfil({
        nombreUsuario: nombreUsuario.trim(),
        nombreCompleto: nombreCompleto.trim(),
        poblacion: poblacion.trim(),
        consultorio: consultorio.trim(),
        fotoPerfil: fotoPerfil || undefined,
      });

      Alert.alert(
        'Éxito',
        'Perfil actualizado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarContrasena = async () => {
    if (!validarCambioContrasena()) return;

    setSaving(true);
    try {
      await AuthService.cambiarContrasena(contrasenaActual, contrasenaNueva);
      
      Alert.alert(
        'Éxito',
        'Contraseña cambiada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              setMostrarCambioContrasena(false);
              setContrasenaActual('');
              setContrasenaNueva('');
              setConfirmarContrasena('');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>👤 Mi Perfil</Text>
          <Text style={styles.subtitle}>
            Actualiza tu información personal y profesional
          </Text>

          {/* Foto de Perfil */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>📸 Foto de Perfil</Text>
            
            <View style={styles.photoContainer}>
              <TouchableOpacity style={styles.photoButton} onPress={seleccionarImagen}>
                {fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>📷</Text>
                    <Text style={styles.placeholderSubtext}>Agregar foto</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.photoInfo}>
                <Text style={styles.photoInfoTitle}>
                  {fotoPerfil ? '✅ Foto de Perfil' : '📷 Agregar Foto de Perfil'}
                </Text>
                <Text style={styles.photoInfoText}>
                  {fotoPerfil 
                    ? 'Toca la imagen para cambiar o eliminar tu foto de perfil' 
                    : 'Toca el área para agregar una foto profesional a tu perfil'
                  }
                </Text>
                <Text style={styles.photoInfoSubtext}>
                  📱 Opciones: Cámara o Galería • 📐 Formato: Cuadrado (1:1) • 📏 Tamaño: 200x200px
                </Text>
                {fotoPerfil && (
                  <Text style={styles.photoInfoSuccess}>
                    ✨ Foto cargada correctamente. Recuerda guardar tu perfil.
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Información del Doctor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Información Personal</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de Usuario *</Text>
              <TextInput
                style={styles.input}
                value={nombreUsuario}
                onChangeText={setNombreUsuario}
                placeholder="Ej: dr_martinez"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
                placeholder="Dr. Juan Martínez"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Información Profesional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 Información Profesional</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Población *</Text>
              <TextInput
                style={styles.input}
                value={poblacion}
                onChangeText={setPoblacion}
                placeholder="Nombre de la población"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Consultorio *</Text>
              <TextInput
                style={styles.input}
                value={consultorio}
                onChangeText={setConsultorio}
                placeholder="Nombre del consultorio"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Cambio de Contraseña */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setMostrarCambioContrasena(!mostrarCambioContrasena)}
            >
              <Text style={styles.passwordToggleText}>
                🔐 {mostrarCambioContrasena ? 'Ocultar' : 'Cambiar'} Contraseña
              </Text>
              <Text style={styles.passwordToggleIcon}>
                {mostrarCambioContrasena ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {mostrarCambioContrasena && (
              <View style={styles.passwordSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña Actual *</Text>
                  <TextInput
                    style={styles.input}
                    value={contrasenaActual}
                    onChangeText={setContrasenaActual}
                    placeholder="Ingrese su contraseña actual"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nueva Contraseña *</Text>
                  <TextInput
                    style={styles.input}
                    value={contrasenaNueva}
                    onChangeText={setContrasenaNueva}
                    placeholder="Ingrese la nueva contraseña"
                    secureTextEntry
                  />
                  {contrasenaNueva.length > 0 && (
                    <PasswordStrengthIndicator 
                      password={contrasenaNueva} 
                      strength={AuthService.evaluarFortalezaPassword(contrasenaNueva)} 
                    />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar Nueva Contraseña *</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmarContrasena}
                    onChangeText={setConfirmarContrasena}
                    placeholder="Confirme la nueva contraseña"
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.passwordButton]}
                  onPress={handleCambiarContrasena}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? 'Cambiando...' : '🔐 Cambiar Contraseña'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleGuardarPerfil}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? 'Guardando...' : '💾 Guardar Perfil'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Información de la cuenta */}
          {doctor && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>ℹ️ Información de la Cuenta</Text>
              <Text style={styles.infoText}>
                📅 Cuenta creada: {new Date(doctor.fechaCreacion).toLocaleDateString()}
              </Text>
              <Text style={styles.infoText}>
                🔄 Último acceso: {new Date(doctor.fechaUltimoAcceso).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};


export default MiPerfilScreen;
