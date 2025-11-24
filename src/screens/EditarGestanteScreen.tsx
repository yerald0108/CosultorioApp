import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { GestanteData, ClasificacionRiesgo, calcularFPP, calcularEdadGestacional, formatearEdadGestacional } from '../types/PAMITypes';
import { PAMIService } from '../services/PAMIService';
import ClasificacionSelector from '../components/ClasificacionSelector';
import { styles } from '../styles/screens/EditarGestanteScreen.styles';

type EditarGestanteScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type EditarGestanteScreenRouteProp = RouteProp<RootStackParamList, 'EditarGestante'>;

interface Props {
  navigation: EditarGestanteScreenNavigationProp;
  route: EditarGestanteScreenRouteProp;
}

const EditarGestanteScreen: React.FC<Props> = ({ navigation, route }) => {
  const { gestanteId } = route.params;
  const [gestante, setGestante] = useState<GestanteData | null>(null);
  const [formData, setFormData] = useState({
    nombresApellidos: '',
    fechaNacimiento: '',
    edadGestacional: '',
    direccion: '',
    carnetIdentidad: '',
    riesgoPresenta: '',
    fum: '',
    clasificacion: null as ClasificacionRiesgo | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarGestante();
  }, []);

  // Función para convertir Date a formato DD/MM/YYYY para edición
  const formatearFechaParaEdicion = (fecha: Date): string => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  // Función para calcular fecha de nacimiento aproximada desde edad
  const calcularFechaNacimientoDesdeEdad = (edad: number): string => {
    const hoy = new Date();
    const añoNacimiento = hoy.getFullYear() - edad;
    // Usar 1 de enero como fecha aproximada
    const fechaNacimiento = new Date(añoNacimiento, 0, 1);
    return formatearFechaParaEdicion(fechaNacimiento);
  };

  const cargarGestante = async () => {
    try {
      setLoading(true);
      const gestanteData = await PAMIService.obtenerGestantePorId(gestanteId);
      
      if (!gestanteData) {
        Alert.alert('Error', 'Gestante no encontrada', [
          { text: 'Volver', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      setGestante(gestanteData);
      
      // Calcular fecha de nacimiento aproximada desde edad
      const fechaNacimientoAprox = calcularFechaNacimientoDesdeEdad(gestanteData.edad);
      
      setFormData({
        nombresApellidos: gestanteData.nombresApellidos,
        fechaNacimiento: fechaNacimientoAprox,
        edadGestacional: gestanteData.edadGestacional.toString(),
        direccion: gestanteData.direccion,
        carnetIdentidad: gestanteData.carnetIdentidad,
        riesgoPresenta: gestanteData.riesgoPresenta,
        fum: formatearFechaParaEdicion(gestanteData.fum), // Formato DD/MM/YYYY
        clasificacion: gestanteData.clasificacion,
      });
    } catch (error) {
      console.error('Error cargando gestante:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la gestante');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | ClasificacionRiesgo) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Función especial para formatear edad gestacional en formato semanas.días
  const formatearEdadGestacional = (texto: string) => {
    // Remover todo lo que no sean números o puntos
    let limpio = texto.replace(/[^0-9.]/g, '');
    
    // Si no hay punto, permitir solo números
    if (!limpio.includes('.')) {
      return limpio;
    }
    
    // Si hay punto, validar formato semanas.días
    const partes = limpio.split('.');
    if (partes.length > 2) {
      // Solo permitir un punto
      limpio = partes[0] + '.' + partes[1];
    }
    
    const semanas = parseInt(partes[0]) || 0;
    const dias = parseInt(partes[1]) || 0;
    
    // Validar que los días no sean mayores a 6
    if (dias > 6) {
      // Si los días son mayores a 6, convertir a la siguiente semana
      const nuevasSemanas = semanas + Math.floor(dias / 7);
      const nuevosDias = dias % 7;
      limpio = `${nuevasSemanas}.${nuevosDias}`;
    }
    
    return limpio;
  };

  const handleEdadGestacionalChange = (texto: string) => {
    const textoFormateado = formatearEdadGestacional(texto);
    updateField('edadGestacional', textoFormateado);
    
    // Si hay EG válida, SIEMPRE calcular y actualizar FUM automáticamente
    if (textoFormateado && !isNaN(parseFloat(textoFormateado))) {
      const eg = parseFloat(textoFormateado);
      if (eg >= 1 && eg <= 42) { // Validar rango de semanas gestacionales
        const fumCalculada = calcularFUMDesdeEG(eg);
        if (fumCalculada) {
          const fechaFormateada = formatearFechaFUM(
            fumCalculada.getDate().toString().padStart(2, '0') + 
            (fumCalculada.getMonth() + 1).toString().padStart(2, '0') + 
            fumCalculada.getFullYear().toString()
          );
          updateField('fum', fechaFormateada);
        }
      }
    } else if (!textoFormateado.trim()) {
      // Si se borra la EG, limpiar también la FUM
      updateField('fum', '');
    }
  };

  // Función para formatear fecha FUM automáticamente (igual que fecha de nacimiento)
  const formatearFechaFUM = (texto: string) => {
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

  const handleFUMChange = (texto: string) => {
    const fechaFormateada = formatearFechaFUM(texto);
    updateField('fum', fechaFormateada);
    
    // Si hay FUM válida completa, SIEMPRE calcular y actualizar EG automáticamente
    if (fechaFormateada.length === 10) {
      const fumDate = parsearFechaFUM(fechaFormateada);
      if (fumDate && !isNaN(fumDate.getTime())) {
        const edadCalculada = calcularEdadGestacional(fumDate);
        if (edadCalculada >= 1 && edadCalculada <= 42) { // Validar rango razonable
          const edadFormateada = formatearEdadGestacional(edadCalculada.toString());
          updateField('edadGestacional', edadFormateada);
        }
      }
    } else if (!fechaFormateada.trim()) {
      // Si se borra la FUM, limpiar también la EG
      updateField('edadGestacional', '');
    }
  };

  // Función para calcular FUM desde EG
  const calcularFUMDesdeEG = (edadGestacional: number): Date | null => {
    try {
      const hoy = new Date();
      const diasGestacion = Math.floor(edadGestacional * 7);
      const fum = new Date(hoy.getTime() - (diasGestacion * 24 * 60 * 60 * 1000));
      return fum;
    } catch (error) {
      return null;
    }
  };

  // Función para formatear fecha de nacimiento
  const formatearFechaNacimiento = (texto: string) => {
    const numeros = texto.replace(/\D/g, '');
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

  // Función para generar carnet desde fecha nacimiento
  const generarCarnetDesdeNacimiento = (fechaNacimiento: string): string => {
    const fecha = parsearFechaFUM(fechaNacimiento);
    if (!fecha) return '';
    
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    
    return año + mes + dia;
  };

  // Función para calcular edad desde fecha nacimiento
  const calcularEdadDesdeNacimiento = (fechaNacimiento: string): number => {
    const fecha = parsearFechaFUM(fechaNacimiento);
    if (!fecha) return 0;
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fecha.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const handleFechaNacimientoChange = (texto: string) => {
    const fechaFormateada = formatearFechaNacimiento(texto);
    updateField('fechaNacimiento', fechaFormateada);
    
    // Si la fecha está completa, generar carnet automáticamente
    if (fechaFormateada.length === 10) {
      const carnetParcial = generarCarnetDesdeNacimiento(fechaFormateada);
      if (carnetParcial) {
        const carnetActual = formData.carnetIdentidad;
        const ultimosCinco = carnetActual.length > 6 ? carnetActual.slice(6) : '';
        updateField('carnetIdentidad', carnetParcial + ultimosCinco);
      }
    }
  };

  // Función para convertir DD/MM/YYYY a Date
  const parsearFechaFUM = (fechaString: string): Date | null => {
    try {
      const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = fechaString.match(regex);
      
      if (!match) {
        return null;
      }
      
      const dia = parseInt(match[1], 10);
      const mes = parseInt(match[2], 10) - 1; // Los meses en JS van de 0-11
      const año = parseInt(match[3], 10);
      
      const fecha = new Date(año, mes, dia);
      
      // Verificar que la fecha sea válida
      if (fecha.getDate() !== dia || 
          fecha.getMonth() !== mes || 
          fecha.getFullYear() !== año) {
        return null;
      }
      
      return fecha;
    } catch (error) {
      return null;
    }
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombres y apellidos
    if (!formData.nombresApellidos.trim()) {
      newErrors.nombresApellidos = 'Los nombres y apellidos son obligatorios';
    } else if (formData.nombresApellidos.trim().length < 3) {
      newErrors.nombresApellidos = 'Debe tener al menos 3 caracteres';
    }

    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento.trim()) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const fechaNac = parsearFechaFUM(formData.fechaNacimiento);
      if (!fechaNac) {
        newErrors.fechaNacimiento = 'Formato de fecha inválido (DD/MM/YYYY)';
      } else {
        const edad = calcularEdadDesdeNacimiento(formData.fechaNacimiento);
        if (edad < 12 || edad > 50) {
          newErrors.fechaNacimiento = 'La edad debe estar entre 12 y 50 años';
        }
      }
    }

    // Validar que al menos uno de los campos (EG o FUM) esté presente
    const edadGestacional = parseFloat(formData.edadGestacional);
    const hayFUM = formData.fum.trim().length > 0;
    const hayEG = formData.edadGestacional.trim().length > 0;
    
    if (!hayFUM && !hayEG) {
      newErrors.edadGestacional = 'Debe ingresar al menos la Edad Gestacional o la FUM';
      newErrors.fum = 'Debe ingresar al menos la Edad Gestacional o la FUM';
    } else {
      // Validar EG si está presente
      if (hayEG && (isNaN(edadGestacional) || edadGestacional < 1 || edadGestacional > 42)) {
        newErrors.edadGestacional = 'Debe estar entre 1 y 42 semanas';
      }
      
      // Validar FUM si está presente
      if (hayFUM && !parsearFechaFUM(formData.fum)) {
        newErrors.fum = 'Formato de fecha inválido (DD/MM/YYYY)';
      }
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    } else if (formData.direccion.trim().length < 5) {
      newErrors.direccion = 'Debe tener al menos 5 caracteres';
    }

    // Validar carnet de identidad
    if (!formData.carnetIdentidad.trim()) {
      newErrors.carnetIdentidad = 'El carnet de identidad es obligatorio';
    } else if (!/^\d{11}$/.test(formData.carnetIdentidad)) {
      newErrors.carnetIdentidad = 'Debe tener exactamente 11 dígitos';
    }

    // Validar FUM
    if (!formData.fum.trim()) {
      newErrors.fum = 'La fecha de última menstruación es obligatoria';
    } else {
      const fumDate = parsearFechaFUM(formData.fum);
      if (!fumDate) {
        newErrors.fum = 'Formato de fecha inválido (DD/MM/YYYY)';
      } else {
        const hoy = new Date();
        if (fumDate > hoy) {
          newErrors.fum = 'La fecha no puede ser futura';
        } else if (edadGestacional && !isNaN(edadGestacional)) {
          const edadCalculada = calcularEdadGestacional(fumDate);
          const diferencia = Math.abs(edadCalculada - edadGestacional);
          if (diferencia > 2) {
            newErrors.fum = `No coincide con la EG (calculada: ${edadCalculada} sem.)`;
          }
        }
      }
    }

    // Validar clasificación
    if (!formData.clasificacion) {
      newErrors.clasificacion = 'La clasificación de riesgo es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      Alert.alert('Datos Incompletos', 'Por favor corrige los errores marcados en rojo');
      return;
    }

    setSaving(true);
    try {
      // Calcular edad desde fecha de nacimiento
      const edad = calcularEdadDesdeNacimiento(formData.fechaNacimiento);
      
      // Usar FUM si está disponible, sino calcular desde EG
      let fumDate: Date;
      let edadGestacional: number;
      
      if (formData.fum.trim()) {
        const fumParsed = parsearFechaFUM(formData.fum);
        if (!fumParsed) {
          Alert.alert('Error', 'Formato de fecha FUM inválido');
          setSaving(false);
          return;
        }
        fumDate = fumParsed;
        edadGestacional = formData.edadGestacional ? parseFloat(formData.edadGestacional) : calcularEdadGestacional(fumDate);
      } else {
        edadGestacional = parseFloat(formData.edadGestacional);
        const fumCalculada = calcularFUMDesdeEG(edadGestacional);
        if (!fumCalculada) {
          Alert.alert('Error', 'No se pudo calcular la FUM');
          setSaving(false);
          return;
        }
        fumDate = fumCalculada;
      }

      const datosActualizados: Partial<Omit<GestanteData, 'id' | 'fechaCreacion'>> = {
        nombresApellidos: formData.nombresApellidos.trim(),
        edad: edad,
        edadGestacional: edadGestacional,
        direccion: formData.direccion.trim(),
        carnetIdentidad: formData.carnetIdentidad.trim(),
        riesgoPresenta: formData.riesgoPresenta.trim() || 'Sin especificar',
        fum: fumDate,
        fpp: calcularFPP(fumDate),
        clasificacion: formData.clasificacion!,
      };

      const resultado = await PAMIService.actualizarGestante(gestanteId, datosActualizados);

      if (resultado.success) {
        Alert.alert(
          'Éxito',
          'Gestante actualizada correctamente',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo actualizar la gestante');
      }
    } catch (error) {
      console.error('Error actualizando gestante:', error);
      Alert.alert('Error', 'Error técnico al actualizar la gestante');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options: {
      placeholder?: string;
      keyboardType?: 'default' | 'numeric' | 'email-address';
      multiline?: boolean;
      maxLength?: number;
      error?: string;
    } = {}
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          options.multiline && styles.textInputMultiline,
          options.error && styles.textInputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={options.placeholder}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        maxLength={options.maxLength}
        placeholderTextColor="#999"
      />
      {options.error && (
        <Text style={styles.errorText}>{options.error}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!gestante) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✏️ Editar Gestante</Text>
          <Text style={styles.headerSubtitle}>
            Creada: {gestante.fechaCreacion.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Información Personal</Text>
            
            {renderField(
              'Nombres y Apellidos *',
              formData.nombresApellidos,
              (text) => updateField('nombresApellidos', text),
              {
                placeholder: 'Ej: María García López',
                maxLength: 100,
                error: errors.nombresApellidos
              }
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Fecha de Nacimiento *</Text>
              <TextInput
                style={[styles.textInput, errors.fechaNacimiento && styles.textInputError]}
                value={formData.fechaNacimiento}
                onChangeText={handleFechaNacimientoChange}
                placeholder="DD/MM/YYYY (ej: 07/12/1990)"
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999"
              />
              {errors.fechaNacimiento && (
                <Text style={styles.errorText}>{errors.fechaNacimiento}</Text>
              )}
              {formData.fechaNacimiento.length === 10 && (
                <Text style={styles.fieldHint}>
                  💡 Edad calculada: {calcularEdadDesdeNacimiento(formData.fechaNacimiento)} años
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Carnet de Identidad *</Text>
              <TextInput
                style={[styles.textInput, errors.carnetIdentidad && styles.textInputError]}
                value={formData.carnetIdentidad}
                onChangeText={(text) => updateField('carnetIdentidad', text.replace(/[^0-9]/g, ''))}
                placeholder="Ej: 85042312345"
                keyboardType="numeric"
                maxLength={11}
                placeholderTextColor="#999"
              />
              {errors.carnetIdentidad && (
                <Text style={styles.errorText}>{errors.carnetIdentidad}</Text>
              )}
              {formData.fechaNacimiento.length === 10 && (
                <Text style={styles.fieldHint}>
                  💡 Primeros 6 dígitos autocompletados desde fecha nacimiento
                </Text>
              )}
            </View>

            {renderField(
              'Dirección *',
              formData.direccion,
              (text) => updateField('direccion', text),
              {
                placeholder: 'Ej: Calle 23 #456 e/ A y B, Vedado',
                multiline: true,
                maxLength: 200,
                error: errors.direccion
              }
            )}
          </View>

          {/* Información Obstétrica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤰 Información Obstétrica</Text>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Edad Gestacional por semanas (Opcional)</Text>
              <TextInput
                style={[styles.textInput, errors.edadGestacional && styles.textInputError]}
                value={formData.edadGestacional}
                onChangeText={handleEdadGestacionalChange}
                placeholder="Ej: 14.1 (14 semanas con 1 día)"
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor="#999"
              />
              {errors.edadGestacional && (
                <Text style={styles.errorText}>{errors.edadGestacional}</Text>
              )}
              <Text style={styles.fieldHint}>
                💡 Al ingresar EG, se calcula automáticamente la FUM. Ambos campos se sincronizan
              </Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Fecha Última Menstruación (FUM) (Opcional)</Text>
              <TextInput
                style={[styles.textInput, errors.fum && styles.textInputError]}
                value={formData.fum}
                onChangeText={handleFUMChange}
                placeholder="DD/MM/YYYY (ej: 07/12/2023)"
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999"
              />
              {errors.fum && (
                <Text style={styles.errorText}>{errors.fum}</Text>
              )}
              <Text style={styles.fieldHint}>
                💡 Al ingresar FUM, se calcula automáticamente la EG. Ambos campos se sincronizan
              </Text>
            </View>

            {renderField(
              'Riesgo que Presenta',
              formData.riesgoPresenta,
              (text) => updateField('riesgoPresenta', text),
              {
                placeholder: 'Ej: Diabetes gestacional, hipertensión...',
                multiline: true,
                maxLength: 300
              }
            )}
          </View>

          {/* Clasificación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Clasificación</Text>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Clasificación de Riesgo *</Text>
              <ClasificacionSelector
                value={formData.clasificacion}
                onValueChange={(clasificacion) => updateField('clasificacion', clasificacion)}
                placeholder="Seleccionar clasificación de riesgo"
              />
              {errors.clasificacion && (
                <Text style={styles.errorText}>{errors.clasificacion}</Text>
              )}
            </View>
          </View>

          {/* Información Calculada */}
          {(formData.fum.trim() || formData.edadGestacional.trim()) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Información Calculada</Text>
              <View style={styles.calculatedInfo}>
                <View style={styles.calculatedItem}>
                  <Text style={styles.calculatedLabel}>📅 FPP Actual:</Text>
                  <Text style={styles.calculatedValue}>
                    {gestante.fpp.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.calculatedItem}>
                  <Text style={styles.calculatedLabel}>📅 Nueva FPP:</Text>
                  <Text style={[styles.calculatedValue, { color: '#E91E63' }]}>
                    {(() => {
                      if (formData.fum.trim()) {
                        const fumDate = parsearFechaFUM(formData.fum);
                        return fumDate ? calcularFPP(fumDate).toLocaleDateString() : 'Fecha FUM inválida';
                      } else if (formData.edadGestacional.trim()) {
                        const eg = parseFloat(formData.edadGestacional);
                        if (!isNaN(eg)) {
                          const fumCalculada = calcularFUMDesdeEG(eg);
                          return fumCalculada ? calcularFPP(fumCalculada).toLocaleDateString() : 'Error en cálculo';
                        }
                      }
                      return 'Ingrese FUM o EG';
                    })()}
                  </Text>
                </View>
                <View style={styles.calculatedItem}>
                  <Text style={styles.calculatedLabel}>🤰 EG Calculada:</Text>
                  <Text style={styles.calculatedValue}>
                    {(() => {
                      if (formData.edadGestacional.trim()) {
                        return formData.edadGestacional + ' semanas';
                      } else if (formData.fum.trim()) {
                        const fumDate = parsearFechaFUM(formData.fum);
                        return fumDate ? formatearEdadGestacional(calcularEdadGestacional(fumDate).toString()) : 'Fecha FUM inválida';
                      }
                      return 'Ingrese FUM o EG';
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Información de Auditoría */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Información del Registro</Text>
            <View style={styles.auditInfo}>
              <View style={styles.auditItem}>
                <Text style={styles.auditLabel}>📅 Creado:</Text>
                <Text style={styles.auditValue}>
                  {gestante.fechaCreacion.toLocaleString()}
                </Text>
              </View>
              <View style={styles.auditItem}>
                <Text style={styles.auditLabel}>✏️ Actualizado:</Text>
                <Text style={styles.auditValue}>
                  {gestante.fechaActualizacion.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>✕ Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.followupButton}
          onPress={() => navigation.navigate('SeguimientoGestante', { gestanteId: gestante.id })}
          disabled={saving}
        >
          <Text style={styles.followupButtonText}>📋 Seguimiento</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleGuardar}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '⏳ Guardando...' : '✓ Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};


export default EditarGestanteScreen;
