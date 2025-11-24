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

import { RootStackParamList, IntegranteData } from '../types';
import { StorageService } from '../services/StorageService';
import { AgeCalculatorService } from '../services/AgeCalculatorService';
import GrupoDispensarialSelector from '../components/GrupoDispensarialSelector';
import { styles } from '../styles/screens/EditarIntegranteScreen.styles';

type EditarIntegranteScreenRouteProp = RouteProp<RootStackParamList, 'EditarIntegrante'>;
type EditarIntegranteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditarIntegrante'>;

interface Props {
  route: EditarIntegranteScreenRouteProp;
  navigation: EditarIntegranteScreenNavigationProp;
}

const EditarIntegranteScreen: React.FC<Props> = ({ route, navigation }) => {
  const { integranteId } = route.params;
  const [integrante, setIntegrante] = useState<IntegranteData | null>(null);
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<'Masculino' | 'Femenino' | ''>('');
  const [raza, setRaza] = useState('');
  const [enfermedadesText, setEnfermedadesText] = useState('');
  const [grupoDispensarial, setGrupoDispensarial] = useState<'I' | 'II' | 'III' | 'IV'>('I');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Función para formatear fecha automáticamente mientras se escribe
  const formatearFechaInput = (texto: string) => {
    // Remover todo lo que no sean números
    const numeros = texto.replace(/\D/g, '');
    
    // Aplicar formato DD/MM/YYYY
    let fechaFormateada = '';
    if (numeros.length >= 1) {
      fechaFormateada = numeros.substring(0, 2);
    }
    if (numeros.length >= 3) {
      fechaFormateada += '/' + numeros.substring(2, 4);
    }
    if (numeros.length >= 5) {
      fechaFormateada += '/' + numeros.substring(4, 8);
    }
    
    return fechaFormateada;
  };

  const handleFechaNacimientoChange = (texto: string) => {
    const fechaFormateada = formatearFechaInput(texto);
    setFechaNacimiento(fechaFormateada);
  };

  useEffect(() => {
    cargarIntegrante();
  }, [integranteId]);

  const cargarIntegrante = async () => {
    try {
      const integrantes = await StorageService.obtenerIntegrantes();
      const integranteData = integrantes.find(i => i.id === integranteId);
      if (integranteData) {
        setIntegrante(integranteData);
        setNombre(integranteData.nombre);
        // Si el integrante tiene fechaNacimiento, usarla; si no, crear una fecha estimada
        if (integranteData.fechaNacimiento) {
          setFechaNacimiento(AgeCalculatorService.formatearFecha(new Date(integranteData.fechaNacimiento)));
        } else {
          // Para integrantes existentes sin fechaNacimiento, estimar fecha basada en edad actual
          const fechaEstimada = new Date();
          fechaEstimada.setFullYear(fechaEstimada.getFullYear() - integranteData.edad);
          setFechaNacimiento(AgeCalculatorService.formatearFecha(fechaEstimada));
        }
        setSexo(integranteData.sexo as 'Masculino' | 'Femenino');
        setRaza(integranteData.raza);
        setEnfermedadesText(integranteData.enfermedades.join(', '));
        setGrupoDispensarial(integranteData.grupoDispensarial || 'I');
      }
    } catch (error) {
      console.error('Error cargando integrante:', error);
      Alert.alert('Error', 'No se pudo cargar la información del integrante');
    } finally {
      setLoading(false);
    }
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    if (!fechaNacimiento.trim()) {
      Alert.alert('Error', 'La fecha de nacimiento es requerida');
      return false;
    }
    
    const fechaParsed = AgeCalculatorService.parsearFecha(fechaNacimiento);
    if (!fechaParsed) {
      Alert.alert('Error', 'La fecha debe tener el formato DD/MM/YYYY (ej: 7/12/2001)');
      return false;
    }
    
    if (!AgeCalculatorService.validarFechaNacimiento(fechaParsed)) {
      Alert.alert('Error', 'La fecha de nacimiento no es válida (no puede ser futura o muy antigua)');
      return false;
    }
    
    if (!sexo) {
      Alert.alert('Error', 'El sexo es requerido');
      return false;
    }
    if (!raza.trim()) {
      Alert.alert('Error', 'La raza/etnia es requerida');
      return false;
    }
    return true;
  };

  const procesarEnfermedades = (texto: string): string[] => {
    if (!texto.trim()) return [];
    return texto
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    try {
      const enfermedades = procesarEnfermedades(enfermedadesText);
      const fechaParsed = AgeCalculatorService.parsearFecha(fechaNacimiento)!;
      const edadCalculada = AgeCalculatorService.calcularEdad(fechaParsed);
      
      const datosActualizados = {
        nombre: nombre.trim(),
        edad: edadCalculada,
        fechaNacimiento: fechaParsed,
        sexo: sexo as 'Masculino' | 'Femenino',
        raza: raza.trim(),
        enfermedades,
        grupoDispensarial,
      };
      
      await StorageService.actualizarIntegrante(integranteId, datosActualizados);

      Alert.alert(
        'Éxito',
        'Integrante actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error actualizando integrante:', error);
      Alert.alert('Error', `No se pudo actualizar el integrante: ${error}`);
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

  if (!integrante) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Integrante no encontrado</Text>
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
          <Text style={styles.title}>Editar Integrante</Text>
          <Text style={styles.subtitle}>
            Modifica la información del integrante
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre y apellidos"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de Nacimiento *</Text>
            <TextInput
              style={styles.input}
              value={fechaNacimiento}
              onChangeText={handleFechaNacimientoChange}
              placeholder="DD/MM/YYYY (ej: 7/12/2001)"
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.helperText}>
              💡 Formato: día/mes/año. La edad se calculará automáticamente
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sexo *</Text>
            <View style={styles.sexoContainer}>
              <TouchableOpacity
                style={[styles.sexoButton, sexo === 'Masculino' && styles.sexoButtonSelected]}
                onPress={() => setSexo('Masculino')}
              >
                <Text style={[styles.sexoText, sexo === 'Masculino' && styles.sexoTextSelected]}>
                  👨 Masculino
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sexoButton, sexo === 'Femenino' && styles.sexoButtonSelected]}
                onPress={() => setSexo('Femenino')}
              >
                <Text style={[styles.sexoText, sexo === 'Femenino' && styles.sexoTextSelected]}>
                  👩 Femenino
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Raza/Etnia *</Text>
            <TextInput
              style={styles.input}
              value={raza}
              onChangeText={setRaza}
              placeholder="Ej: Mestizo, Indígena, Afrodescendiente, etc."
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enfermedades</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={enfermedadesText}
              onChangeText={setEnfermedadesText}
              placeholder="Separar con comas (ej: Diabetes, Hipertensión, Asma)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              💡 Opcional. Separar múltiples enfermedades con comas
            </Text>
          </View>

          <GrupoDispensarialSelector
            selectedGroup={grupoDispensarial}
            onGroupChange={setGrupoDispensarial}
          />

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


export default EditarIntegranteScreen;
