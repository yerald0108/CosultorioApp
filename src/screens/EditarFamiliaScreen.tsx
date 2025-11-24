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
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, FamiliaData } from '../types';
import { StorageService } from '../services/StorageService';
import { styles } from '../styles/screens/EditarFamiliaScreen.styles';

type EditarFamiliaScreenRouteProp = RouteProp<RootStackParamList, 'EditarFamilia'>;
type EditarFamiliaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditarFamilia'>;

interface Props {
  route: EditarFamiliaScreenRouteProp;
  navigation: EditarFamiliaScreenNavigationProp;
}

const EditarFamiliaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { familiaId } = route.params;
  const [familia, setFamilia] = useState<FamiliaData | null>(null);
  const [numero, setNumero] = useState('');
  const [direccion, setDireccion] = useState('');
  const [manzana, setManzana] = useState('');
  const [poblacion, setPoblacion] = useState('');
  const [consultorio, setConsultorio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarFamilia();
  }, [familiaId]);

  const cargarFamilia = async () => {
    try {
      const familias = await StorageService.obtenerFamilias();
      const familiaData = familias.find(f => f.id === familiaId);
      if (familiaData) {
        setFamilia(familiaData);
        setNumero(familiaData.numero);
        setDireccion(familiaData.direccion || '');
        setManzana(familiaData.manzana ? familiaData.manzana.toString() : '');
        setPoblacion(familiaData.poblacion);
        setConsultorio(familiaData.consultorio);
      }
    } catch (error) {
      console.error('Error cargando familia:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la familia');
    } finally {
      setLoading(false);
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

    setSaving(true);
    try {
      await StorageService.actualizarFamilia(familiaId, {
        numero: numero.trim(),
        direccion: direccion.trim(),
        manzana: manzana.trim() ? Number(manzana.trim()) : undefined,
        poblacion: poblacion.trim(),
        consultorio: consultorio.trim(),
      });

      Alert.alert(
        'Éxito',
        'Familia actualizada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error actualizando familia:', error);
      Alert.alert('Error', 'No se pudo actualizar la familia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>⏳ Cargando...</Text>
      </View>
    );
  }

  if (!familia) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Familia no encontrada</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>Editar Familia</Text>
          <Text style={styles.subtitle}>
            Modifica la información de la familia
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Población *</Text>
            <TextInput
              style={styles.input}
              value={poblacion}
              onChangeText={setPoblacion}
              placeholder="Nombre de la población o comunidad"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Consultorio *</Text>
            <TextInput
              style={styles.input}
              value={consultorio}
              onChangeText={setConsultorio}
              placeholder="Nombre o código del consultorio"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleGuardar}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? '⏳ Guardando...' : '💾 Guardar'}
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


export default EditarFamiliaScreen;
