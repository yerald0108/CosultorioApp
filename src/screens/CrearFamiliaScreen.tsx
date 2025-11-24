import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';
import { AuthService } from '../services/AuthService';
import { useFamiliesStore } from '../stores';
import { styles } from '../styles/screens/CrearFamiliaScreen.styles';

type CrearFamiliaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrearFamilia'>;

interface Props {
  navigation: CrearFamiliaScreenNavigationProp;
}

const CrearFamiliaScreen: React.FC<Props> = ({ navigation }) => {
  const [numero, setNumero] = useState('');
  const [direccion, setDireccion] = useState('');
  const [manzana, setManzana] = useState('');
  const [poblacion, setPoblacion] = useState('');
  const [consultorio, setConsultorio] = useState('');
  const [loading, setLoading] = useState(false);

  // Store de familias para actualizar después de crear
  const { loadFamilies, addFamilia } = useFamiliesStore();
  const [doctorData, setDoctorData] = useState<{ poblacion: string; consultorio: string } | null>(null);

  useEffect(() => {
    cargarDatosDoctor();
  }, []);

  const cargarDatosDoctor = async () => {
    try {
      const sesion = await AuthService.obtenerSesionActiva();
      if (sesion) {
        setDoctorData({
          poblacion: sesion.poblacion,
          consultorio: sesion.consultorio,
        });
        setPoblacion(sesion.poblacion);
        setConsultorio(sesion.consultorio);
      }
    } catch (error) {
      console.error('Error cargando datos del doctor:', error);
    }
  };

  const validarFormulario = () => {
    if (!numero.trim()) {
      Alert.alert('Error', 'El número de familia es requerido');
      return false;
    }
    if (!direccion.trim()) {
      Alert.alert('Error', 'La dirección es requerida');
      return false;
    }
    if (manzana.trim() && (isNaN(Number(manzana)) || Number(manzana) < 1 || Number(manzana) > 999)) {
      Alert.alert('Error', 'La manzana debe ser un número entre 1 y 999');
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

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      console.log('🏠 Creando nueva familia...');
      const nuevaFamilia = await StorageService.crearFamilia({
        numero: numero.trim(),
        direccion: direccion.trim(),
        manzana: manzana.trim() ? Number(manzana.trim()) : undefined,
        poblacion: poblacion.trim(),
        consultorio: consultorio.trim(),
      });

      console.log('✅ Familia creada con ID:', nuevaFamilia.id);
      console.log('👨‍👩‍👧‍👦 Datos de la familia:', nuevaFamilia);

      // Actualizar el store para sincronizar con el storage
      console.log('🔄 Actualizando store de familias...');
      addFamilia(nuevaFamilia);
      
      // También forzar recarga para asegurar sincronización
      await loadFamilies();
      console.log('✅ Store actualizado');

      Alert.alert(
        'Éxito',
        'Familia creada correctamente',
        [
          {
            text: 'Ver Familia',
            onPress: () => {
              console.log('🔄 Navegando a FamiliaDetalle con ID:', nuevaFamilia.id);
              navigation.replace('FamiliaDetalle', { familiaId: nuevaFamilia.id });
            },
          },
          {
            text: 'Crear Otra',
            onPress: () => {
              setNumero('');
              setDireccion('');
              setManzana('');
              setPoblacion('');
              setConsultorio('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creando familia:', error);
      Alert.alert('Error', 'No se pudo crear la familia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>Nueva Familia</Text>
          <Text style={styles.subtitle}>
            Solo necesitas el número de familia. Tu población y consultorio ya están configurados.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de Familia *</Text>
            <TextInput
              style={styles.input}
              value={numero}
              onChangeText={setNumero}
              placeholder="Ej: 001, F-123, etc."
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>🏠 Dirección *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ej: Calle 13 entre 2 y 4 numero A14"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              autoCapitalize="words"
            />
            <Text style={styles.helperText}>
              💡 Formato: Calle [X] entre [Y] y [Z] numero [ABC123]
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>🏘️ Manzana (Opcional)</Text>
            <TextInput
              style={styles.input}
              value={manzana}
              onChangeText={setManzana}
              placeholder="Ej: 1, 25, 150, 999"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.helperText}>
              🔢 Número de manzana (1-999). Varias familias pueden pertenecer a la misma manzana.
            </Text>
          </View>

          {doctorData && (
            <View style={styles.doctorInfoContainer}>
              <Text style={styles.doctorInfoTitle}>📋 Información del Doctor</Text>
              
              <View style={styles.doctorInfoItem}>
                <Text style={styles.doctorInfoLabel}>📍 Población:</Text>
                <Text style={styles.doctorInfoValue}>{doctorData.poblacion}</Text>
              </View>
              
              <View style={styles.doctorInfoItem}>
                <Text style={styles.doctorInfoLabel}>🏥 Consultorio:</Text>
                <Text style={styles.doctorInfoValue}>{doctorData.consultorio}</Text>
              </View>
              
              <Text style={styles.doctorInfoNote}>
                ℹ️ Esta información se asignará automáticamente a la nueva familia
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleGuardar}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? '⏳ Guardando...' : '💾 Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              ℹ️ Los campos marcados con * son obligatorios
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


export default CrearFamiliaScreen;
