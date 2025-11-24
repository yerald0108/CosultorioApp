import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { PAMIStackParamList } from '../types/PAMITypes';
import { 
  SeguimientoGestante, 
  MarcadorFecha,
  AlfafetoproteínaData,
  EstudiosComplementarios,
  EstudioIndividual,
  PTGData,
  calcularFechaEvaluacion, 
  getEstadoEvaluacion,
  crearEstudiosComplementarios,
  calcularEdadGestacional,
  determinarTrimestre
} from '../types/SeguimientoTypes';
import { SeguimientoService } from '../services/SeguimientoService';
import { PAMIService } from '../services/PAMIService';
import { styles } from '../styles/screens/SeguimientoGestanteScreen.styles';

type SeguimientoGestanteScreenNavigationProp = StackNavigationProp<PAMIStackParamList, 'SeguimientoGestante'>;
type SeguimientoGestanteScreenRouteProp = RouteProp<PAMIStackParamList, 'SeguimientoGestante'>;

interface Props {
  navigation: SeguimientoGestanteScreenNavigationProp;
  route: SeguimientoGestanteScreenRouteProp;
}

const SeguimientoGestanteScreen: React.FC<Props> = ({ navigation, route }) => {
  const { gestanteId } = route.params;
  
  const [seguimiento, setSeguimiento] = useState<SeguimientoGestante | null>(null);
  const [gestanteNombre, setGestanteNombre] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [marcadores, setMarcadores] = useState<MarcadorFecha[]>([]);
  const [marcadorTextos, setMarcadorTextos] = useState<Record<string, string>>({});
  const [alfafetoproteina, setAlfafetoproteina] = useState<AlfafetoproteínaData>({
    fecha: null,
    resultado: '',
    realizado: false,
  });
  const [alfafetoproteínaTexto, setAlfafetoproteínaTexto] = useState<string>('');
  const [estudiosComplementarios, setEstudiosComplementarios] = useState<EstudiosComplementarios>(
    crearEstudiosComplementarios(null)
  );
  const [edadGestacionalInfo, setEdadGestacionalInfo] = useState<{
    semanas: number;
    trimestre: string;
    fum: Date | null;
  } | null>(null);

  // Estados para modal de PTG
  const [modalPTGVisible, setModalPTGVisible] = useState(false);
  const [ptgTemporal, setPtgTemporal] = useState<{
    trimestre: 'segundoTrimestre' | 'tercerTrimestre';
    id: string;
    fechaActual: string;
  } | null>(null);
  const [fechaPTGTexto, setFechaPTGTexto] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  // Estados para colapsar/expandir trimestres
  const [trimestreExpandido, setTrimestreExpandido] = useState({
    primero: true,
    segundo: true,
    tercero: true,
  });

  const [formData, setFormData] = useState({
    fechaCaptacion: '',
    reevaluacion: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para calcular la fecha de la semana 16 (alfafetoproteína)
  const calcularFechaSemana16 = (fum: Date): Date => {
    const fechaSemana16 = new Date(fum);
    fechaSemana16.setDate(fechaSemana16.getDate() + (16 * 7)); // 16 semanas = 112 días
    return fechaSemana16;
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de la gestante
      const gestante = await PAMIService.obtenerGestantePorId(gestanteId);
      if (gestante) {
        setGestanteNombre(gestante.nombresApellidos);
      }

      // Cargar o crear seguimiento
      let seguimientoData = await SeguimientoService.obtenerSeguimiento(gestanteId);
      
      if (!seguimientoData) {
        // Crear nuevo seguimiento si no existe
        const resultado = await SeguimientoService.crearSeguimiento(gestanteId);
        if (resultado.success && resultado.data) {
          seguimientoData = resultado.data;
        }
      }

      if (seguimientoData) {
        setSeguimiento(seguimientoData);
        const marcadoresData = seguimientoData.marcadores || [];
        setMarcadores(marcadoresData);
        
        // Inicializar textos de marcadores
        const textosIniciales: Record<string, string> = {};
        marcadoresData.forEach(marcador => {
          textosIniciales[marcador.id] = formatearFecha(marcador.fecha);
        });
        setMarcadorTextos(textosIniciales);
        
        // Inicializar alfafetoproteína
        let alfafetoproteínaData = seguimientoData.alfafetoproteina || {
          fecha: null,
          resultado: '',
          realizado: false,
        };
        
        // Obtener datos de la gestante para calcular fechas automáticas SIEMPRE
        const gestanteData = await PAMIService.obtenerGestantePorId(gestanteId);
        let fumGestante: Date | null = null;
        
        if (gestanteData && gestanteData.fum) {
          // Asegurar que sea un objeto Date válido
          fumGestante = new Date(gestanteData.fum);
          
          // Verificar que la fecha sea válida
          if (!isNaN(fumGestante.getTime())) {
            // Calcular información de edad gestacional
            const semanas = calcularEdadGestacional(fumGestante);
            const trimestre = determinarTrimestre(semanas);
            const trimestreTexto = trimestre === 'primero' ? '1er Trimestre' : 
                                 trimestre === 'segundo' ? '2do Trimestre' : 
                                 trimestre === 'tercero' ? '3er Trimestre' : 'Sin determinar';
            
            setEdadGestacionalInfo({
              semanas,
              trimestre: trimestreTexto,
              fum: fumGestante
            });

            // Calcular fecha automática de alfafetoproteína (semana 16) si no está realizada
            if (!alfafetoproteínaData.realizado && fumGestante) {
              const fechaAlfafetoproteína = calcularFechaSemana16(fumGestante);
              if (fechaAlfafetoproteína) {
                alfafetoproteínaData = {
                  ...alfafetoproteínaData,
                  fecha: fechaAlfafetoproteína
                };
              }
            }
          } else {
            fumGestante = null;
          }
        }

        // Establecer datos de alfafetoproteína (con fecha calculada si aplica)
        setAlfafetoproteina(alfafetoproteínaData);
        setAlfafetoproteínaTexto(alfafetoproteínaData.fecha ? 
          formatearFecha(alfafetoproteínaData.fecha) : '');
        
        // Inicializar estudios complementarios con fechas automáticas basadas en EG
        let estudiosData = seguimientoData.complementarios;
        
        // SIEMPRE recrear estudios si tenemos FUM para asegurar fechas correctas
        if (fumGestante) {
          estudiosData = crearEstudiosComplementarios(fumGestante);
        } else if (!estudiosData) {
          // Solo crear estudios vacíos si no tenemos FUM y no existen estudios
          estudiosData = crearEstudiosComplementarios(null);
        }
        
        setEstudiosComplementarios(estudiosData);
        
        setFormData({
          fechaCaptacion: seguimientoData.fechaCaptacion ? 
            formatearFecha(seguimientoData.fechaCaptacion) : '',
          reevaluacion: seguimientoData.reevaluacion || '',
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: Date): string => {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaObj.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const formatearFechaInput = (texto: string): string => {
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

  const parsearFecha = (fechaString: string): Date | null => {
    try {
      const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = fechaString.match(regex);
      
      if (!match) return null;
      
      const dia = parseInt(match[1], 10);
      const mes = parseInt(match[2], 10) - 1;
      const año = parseInt(match[3], 10);
      
      const fecha = new Date(año, mes, dia);
      
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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFechaCaptacionChange = (texto: string) => {
    const fechaFormateada = formatearFechaInput(texto);
    updateField('fechaCaptacion', fechaFormateada);
  };

  // Funciones para manejar marcadores
  const agregarMarcador = () => {
    const nuevoId = Date.now().toString();
    const nuevoMarcador: MarcadorFecha = {
      id: nuevoId,
      fecha: new Date(),
      descripcion: '',
      realizado: false,
    };
    setMarcadores(prev => [...prev, nuevoMarcador]);
    // Inicializar con texto vacío para permitir entrada manual
    setMarcadorTextos(prev => ({ ...prev, [nuevoId]: '' }));
  };

  const eliminarMarcador = (id: string) => {
    setMarcadores(prev => prev.filter(m => m.id !== id));
    setMarcadorTextos(prev => {
      const newTextos = { ...prev };
      delete newTextos[id];
      return newTextos;
    });
  };

  const actualizarFechaMarcador = (id: string, fechaTexto: string) => {
    const fechaFormateada = formatearFechaInput(fechaTexto);
    
    // Actualizar el texto inmediatamente
    setMarcadorTextos(prev => ({ ...prev, [id]: fechaFormateada }));
    
    // Solo actualizar la fecha del marcador si es una fecha válida completa
    if (fechaFormateada.length === 10) {
      const fechaParsed = parsearFecha(fechaFormateada);
      if (fechaParsed) {
        setMarcadores(prev => prev.map(m => 
          m.id === id ? { ...m, fecha: fechaParsed } : m
        ));
      }
    }
  };

  const toggleMarcadorRealizado = (id: string) => {
    setMarcadores(prev => prev.map(m => 
      m.id === id ? { ...m, realizado: !m.realizado } : m
    ));
  };

  // Funciones para manejar alfafetoproteína
  const actualizarFechaAlfafetoproteína = (fechaTexto: string) => {
    const fechaFormateada = formatearFechaInput(fechaTexto);
    
    // Actualizar el texto inmediatamente
    setAlfafetoproteínaTexto(fechaFormateada);
    
    // Solo actualizar la fecha si es una fecha válida completa
    if (fechaFormateada.length === 10) {
      const fechaParsed = parsearFecha(fechaFormateada);
      if (fechaParsed) {
        setAlfafetoproteina(prev => ({ ...prev, fecha: fechaParsed }));
      }
    }
  };

  const actualizarResultadoAlfafetoproteína = (resultado: string) => {
    setAlfafetoproteina(prev => ({ ...prev, resultado }));
  };

  const toggleAlfafetoproteínaRealizado = () => {
    setAlfafetoproteina(prev => ({ ...prev, realizado: !prev.realizado }));
  };

  // Funciones para manejar estudios complementarios
  const toggleEstudioRealizado = (trimestre: 'primerTrimestre' | 'segundoTrimestre' | 'tercerTrimestre', estudioId: string) => {
    setEstudiosComplementarios(prev => ({
      ...prev,
      [trimestre]: {
        ...prev[trimestre],
        estudios: prev[trimestre].estudios.map(estudio =>
          estudio.id === estudioId 
            ? { ...estudio, realizado: !estudio.realizado, fechaRealizada: !estudio.realizado ? new Date() : null }
            : estudio
        )
      }
    }));
  };

  const togglePTGRealizado = (trimestre: 'segundoTrimestre' | 'tercerTrimestre', ptgId: string) => {
    setEstudiosComplementarios(prev => ({
      ...prev,
      [trimestre]: {
        ...prev[trimestre],
        ptg: prev[trimestre].ptg?.map(ptg =>
          ptg.id === ptgId 
            ? { ...ptg, realizado: !ptg.realizado, fechaRealizada: !ptg.realizado ? new Date() : null }
            : ptg
        )
      }
    }));
  };

  const programarPTG = (trimestre: 'segundoTrimestre' | 'tercerTrimestre', ptgId: string, fecha: Date) => {
    setEstudiosComplementarios(prev => ({
      ...prev,
      [trimestre]: {
        ...prev[trimestre],
        ptg: prev[trimestre].ptg?.map(ptg =>
          ptg.id === ptgId 
            ? { ...ptg, fechaProgramada: fecha }
            : ptg
        )
      }
    }));
  };

  // Funciones para modal de PTG
  const abrirModalPTG = (trimestre: 'segundoTrimestre' | 'tercerTrimestre', ptgId: string, fechaActual?: Date) => {
    setPtgTemporal({
      trimestre,
      id: ptgId,
      fechaActual: fechaActual ? formatearFecha(fechaActual) : ''
    });
    setFechaPTGTexto(fechaActual ? formatearFecha(fechaActual) : '');
    setModalPTGVisible(true);
  };

  const cerrarModalPTG = () => {
    setModalPTGVisible(false);
    setPtgTemporal(null);
    setFechaPTGTexto('');
  };

  const confirmarFechaPTG = () => {
    if (ptgTemporal && fechaPTGTexto.length === 10) {
      const fecha = parsearFecha(fechaPTGTexto);
      if (fecha) {
        programarPTG(ptgTemporal.trimestre, ptgTemporal.id, fecha);
        cerrarModalPTG();
      } else {
        Alert.alert('Error', 'Formato de fecha inválido. Use DD/MM/YYYY');
      }
    } else {
      Alert.alert('Error', 'Ingrese una fecha válida');
    }
  };

  const actualizarFechaPTG = (texto: string) => {
    const fechaFormateada = formatearFechaInput(texto);
    setFechaPTGTexto(fechaFormateada);
  };

  // Función para toggle de trimestres
  const toggleTrimestre = (trimestre: 'primero' | 'segundo' | 'tercero') => {
    setTrimestreExpandido(prev => ({
      ...prev,
      [trimestre]: !prev[trimestre]
    }));
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar fecha de captación si está presente
    if (formData.fechaCaptacion.trim()) {
      const fecha = parsearFecha(formData.fechaCaptacion);
      if (!fecha) {
        newErrors.fechaCaptacion = 'Formato de fecha inválido (DD/MM/YYYY)';
      } else if (fecha > new Date()) {
        newErrors.fechaCaptacion = 'La fecha no puede ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      Alert.alert('Datos Incompletos', 'Por favor corrige los errores marcados en rojo');
      return;
    }

    if (!seguimiento) {
      Alert.alert('Error', 'No se pudo cargar el seguimiento');
      return;
    }

    setSaving(true);
    try {
      const fechaCaptacionParsed = formData.fechaCaptacion.trim() ? 
        parsearFecha(formData.fechaCaptacion) : null;
      
      const datosActualizados = {
        fechaCaptacion: fechaCaptacionParsed,
        fechaEvaluacion: fechaCaptacionParsed ? calcularFechaEvaluacion(fechaCaptacionParsed) : null,
        marcadores: marcadores,
        alfafetoproteina: alfafetoproteina,
        reevaluacion: formData.reevaluacion.trim(),
        complementarios: estudiosComplementarios,
      };

      const resultado = await SeguimientoService.actualizarSeguimiento(
        seguimiento.id,
        datosActualizados
      );

      if (resultado.success) {
        Alert.alert(
          'Éxito',
          'Seguimiento actualizado correctamente',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo actualizar el seguimiento');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando seguimiento...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 Seguimiento Individualizado</Text>
          <Text style={styles.headerSubtitle}>{gestanteNombre}</Text>
        </View>
        <View style={styles.formContainer}>
          
          {/* Información General */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Información General</Text>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Fecha de Captación</Text>
              <TextInput
                style={[styles.textInput, errors.fechaCaptacion && styles.textInputError]}
                value={formData.fechaCaptacion}
                onChangeText={handleFechaCaptacionChange}
                placeholder="DD/MM/YYYY (ej: 15/03/2024)"
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999"
              />
              {errors.fechaCaptacion && (
                <Text style={styles.errorText}>{errors.fechaCaptacion}</Text>
              )}
              <Text style={styles.fieldHint}>
                💡 Fecha en que se inició el seguimiento de la gestante
              </Text>
            </View>

            {/* Fecha de Evaluación Calculada */}
            {formData.fechaCaptacion.trim() && parsearFecha(formData.fechaCaptacion) && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>📅 Fecha de Evaluación (Calculada Automáticamente)</Text>
                <View style={styles.calculatedDateContainer}>
                  {(() => {
                    const fechaCaptacion = parsearFecha(formData.fechaCaptacion);
                    if (!fechaCaptacion) return null;
                    
                    const fechaEvaluacion = calcularFechaEvaluacion(fechaCaptacion);
                    const estadoEvaluacion = getEstadoEvaluacion(fechaEvaluacion);
                    
                    return (
                      <>
                        <Text style={[styles.calculatedDateText, 
                          estadoEvaluacion.estado === 'vencida' && styles.dateVencida,
                          estadoEvaluacion.estado === 'hoy' && styles.dateHoy,
                          estadoEvaluacion.estado === 'pendiente' && styles.datePendiente
                        ]}>
                          {fechaEvaluacion.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                        <Text style={[styles.evaluationStatus,
                          estadoEvaluacion.estado === 'vencida' && styles.statusVencida,
                          estadoEvaluacion.estado === 'hoy' && styles.statusHoy,
                          estadoEvaluacion.estado === 'pendiente' && styles.statusPendiente
                        ]}>
                          {estadoEvaluacion.mensaje}
                        </Text>
                      </>
                    );
                  })()}
                </View>
                <Text style={styles.fieldHint}>
                  💡 Se programa automáticamente 15 días después de la fecha de captación
                </Text>
              </View>
            )}

            {/* Marcadores - Fechas Individualizadas */}
            <View style={styles.fieldContainer}>
              <View style={styles.marcadorHeader}>
                <Text style={styles.fieldLabel}>🧪 Marcadores</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={agregarMarcador}
                >
                  <Text style={styles.addButtonText}>+ Agregar Marcador</Text>
                </TouchableOpacity>
              </View>
              
              {marcadores.length === 0 ? (
                <View style={styles.emptyMarcadores}>
                  <Text style={styles.emptyText}>
                    No hay marcadores programados. Presiona "Agregar Marcador" para programar fechas.
                  </Text>
                </View>
              ) : (
                marcadores.map((marcador, index) => (
                  <View key={marcador.id} style={styles.marcadorItem}>
                    <View style={styles.marcadorRow}>
                      <Text style={styles.marcadorNumber}>#{index + 1}</Text>
                      <TextInput
                        style={[styles.fechaMarcadorInput, 
                          marcador.realizado && styles.fechaMarcadorRealizado]}
                        value={marcadorTextos[marcador.id] || ''}
                        onChangeText={(text) => actualizarFechaMarcador(marcador.id, text)}
                        placeholder="DD/MM/YYYY"
                        keyboardType="numeric"
                        maxLength={10}
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={[styles.checkButton, 
                          marcador.realizado && styles.checkButtonActive]}
                        onPress={() => toggleMarcadorRealizado(marcador.id)}
                      >
                        <Text style={[styles.checkButtonText,
                          marcador.realizado && styles.checkButtonTextActive]}>
                          {marcador.realizado ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => eliminarMarcador(marcador.id)}
                      >
                        <Text style={styles.deleteButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    {marcador.realizado && (
                      <Text style={styles.marcadorStatus}>✅ Marcador realizado</Text>
                    )}
                  </View>
                ))
              )}
              
              <Text style={styles.fieldHint}>
                💡 Programa las fechas de marcadores según las necesidades individuales de cada gestante
              </Text>
            </View>

            {/* Alfafetoproteína - Fecha única + Resultado */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>🔬 Alfafetoproteína</Text>
              
              <View style={styles.alfafetoproteínaContainer}>
                <View style={styles.alfafetoproteínaRow}>
                  <Text style={styles.alfafetoproteínaLabel}>Fecha:</Text>
                  <TextInput
                    style={[styles.fechaAlfafetoproteínaInput, 
                      alfafetoproteina.realizado && styles.fechaAlfafetoproteínaRealizado]}
                    value={alfafetoproteínaTexto}
                    onChangeText={actualizarFechaAlfafetoproteína}
                    placeholder="DD/MM/YYYY"
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={[styles.checkButton, 
                      alfafetoproteina.realizado && styles.checkButtonActive]}
                    onPress={toggleAlfafetoproteínaRealizado}
                  >
                    <Text style={[styles.checkButtonText,
                      alfafetoproteina.realizado && styles.checkButtonTextActive]}>
                      {alfafetoproteina.realizado ? '✓' : '○'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {alfafetoproteina.realizado && (
                  <Text style={styles.alfafetoproteínaStatus}>✅ Alfafetoproteína realizada</Text>
                )}
                
                <View style={styles.resultadoContainer}>
                  <Text style={styles.resultadoLabel}>Resultado:</Text>
                  <TextInput
                    style={[styles.resultadoInput, 
                      alfafetoproteina.realizado && styles.resultadoInputRealizado]}
                    value={alfafetoproteina.resultado}
                    onChangeText={actualizarResultadoAlfafetoproteína}
                    placeholder="Ingrese el resultado de la alfafetoproteína..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              
              <Text style={styles.fieldHint}>
                💡 La fecha se programa automáticamente para la semana 16. Registra el resultado cuando se realice
              </Text>
            </View>
          </View>

          {/* Seguimiento y Controles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 Seguimiento y Controles</Text>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Reevaluación</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={formData.reevaluacion}
                onChangeText={(text) => updateField('reevaluacion', text)}
                placeholder="Reevaluaciones periódicas..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
              <Text style={styles.fieldHint}>
                💡 Reevaluaciones médicas periódicas y evolución
              </Text>
            </View>

            {/* Estudios Complementarios por Trimestres */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>📚 Estudios Complementarios</Text>
              
              {/* Información de Edad Gestacional */}
              {edadGestacionalInfo && (
                <View style={styles.edadGestacionalInfo}>
                  <Text style={styles.edadGestacionalTitle}>📊 Información Actual de la Gestante</Text>
                  <View style={styles.edadGestacionalRow}>
                    <Text style={styles.edadGestacionalLabel}>Edad Gestacional:</Text>
                    <Text style={styles.edadGestacionalValue}>{edadGestacionalInfo.semanas} semanas</Text>
                  </View>
                  <View style={styles.edadGestacionalRow}>
                    <Text style={styles.edadGestacionalLabel}>Trimestre Actual:</Text>
                    <Text style={styles.edadGestacionalValue}>{edadGestacionalInfo.trimestre}</Text>
                  </View>
                  <View style={styles.edadGestacionalRow}>
                    <Text style={styles.edadGestacionalLabel}>FUM:</Text>
                    <Text style={styles.edadGestacionalValue}>
                      {edadGestacionalInfo.fum ? formatearFecha(edadGestacionalInfo.fum) : 'No disponible'}
                    </Text>
                  </View>
                  <Text style={styles.edadGestacionalNote}>
                    ✨ Las fechas de estudios se calcularon automáticamente basándose en esta información
                  </Text>
                </View>
              )}
              
              <Text style={styles.fieldHint}>
                💡 Estudios organizados por trimestres con fechas automáticas basadas en edad gestacional
              </Text>
              
              {/* Primer Trimestre */}
              <View style={styles.trimestreContainer}>
                <TouchableOpacity 
                  style={styles.trimestreHeader}
                  onPress={() => toggleTrimestre('primero')}
                >
                  <Text style={styles.trimestreTitle}>🔹 PRIMER TRIMESTRE (Semana 6-14)</Text>
                  <Text style={styles.trimestreToggle}>
                    {trimestreExpandido.primero ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {trimestreExpandido.primero && estudiosComplementarios.primerTrimestre.estudios.map((estudio, index) => (
                  <View key={estudio.id} style={styles.estudioItem}>
                    <View style={styles.estudioRow}>
                      <Text style={styles.estudioNombre}>{estudio.abreviatura}</Text>
                      <Text style={styles.fechaProgramada}>
                        {estudio.fechaProgramada ? 
                          formatearFecha(estudio.fechaProgramada) : 'Sin fecha'}
                      </Text>
                      <TouchableOpacity
                        style={[styles.checkButton, 
                          estudio.realizado && styles.checkButtonActive]}
                        onPress={() => toggleEstudioRealizado('primerTrimestre', estudio.id)}
                      >
                        <Text style={[styles.checkButtonText,
                          estudio.realizado && styles.checkButtonTextActive]}>
                          {estudio.realizado ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {estudio.realizado && (
                      <Text style={styles.estudioStatus}>✅ Realizado</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Segundo Trimestre */}
              <View style={styles.trimestreContainer}>
                <TouchableOpacity 
                  style={styles.trimestreHeader}
                  onPress={() => toggleTrimestre('segundo')}
                >
                  <Text style={styles.trimestreTitle}>🔹 SEGUNDO TRIMESTRE (Semana 15-28)</Text>
                  <Text style={styles.trimestreToggle}>
                    {trimestreExpandido.segundo ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {trimestreExpandido.segundo && estudiosComplementarios.segundoTrimestre.estudios.map((estudio, index) => (
                  <View key={estudio.id} style={styles.estudioItem}>
                    <View style={styles.estudioRow}>
                      <Text style={styles.estudioNombre}>{estudio.abreviatura}</Text>
                      <Text style={styles.fechaProgramada}>
                        {estudio.fechaProgramada ? 
                          formatearFecha(estudio.fechaProgramada) : 'Sin fecha'}
                      </Text>
                      <TouchableOpacity
                        style={[styles.checkButton, 
                          estudio.realizado && styles.checkButtonActive]}
                        onPress={() => toggleEstudioRealizado('segundoTrimestre', estudio.id)}
                      >
                        <Text style={[styles.checkButtonText,
                          estudio.realizado && styles.checkButtonTextActive]}>
                          {estudio.realizado ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {estudio.realizado && (
                      <Text style={styles.estudioStatus}>✅ Realizado</Text>
                    )}
                  </View>
                ))}
                
                {/* PTG Segundo Trimestre */}
                {trimestreExpandido.segundo && estudiosComplementarios.segundoTrimestre.ptg?.map((ptg) => (
                  <View key={ptg.id} style={[styles.estudioItem, styles.ptgItem]}>
                    <View style={styles.estudioRow}>
                      <Text style={styles.estudioNombre}>PTG (24-26 sem)</Text>
                      <TouchableOpacity
                        style={styles.fechaProgramada}
                        onPress={() => abrirModalPTG('segundoTrimestre', ptg.id, ptg.fechaProgramada || undefined)}
                      >
                        <Text style={styles.fechaProgramada}>
                          {ptg.fechaProgramada ? formatearFecha(ptg.fechaProgramada) : 'Manual'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.checkButton, 
                          ptg.realizado && styles.checkButtonActive]}
                        onPress={() => togglePTGRealizado('segundoTrimestre', ptg.id)}
                      >
                        <Text style={[styles.checkButtonText,
                          ptg.realizado && styles.checkButtonTextActive]}>
                          {ptg.realizado ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {ptg.realizado && (
                      <Text style={styles.estudioStatus}>✅ PTG Realizada</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Tercer Trimestre */}
              <View style={styles.trimestreContainer}>
                <TouchableOpacity 
                  style={styles.trimestreHeader}
                  onPress={() => toggleTrimestre('tercero')}
                >
                  <Text style={styles.trimestreTitle}>🔹 TERCER TRIMESTRE (Semana 29+)</Text>
                  <Text style={styles.trimestreToggle}>
                    {trimestreExpandido.tercero ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {trimestreExpandido.tercero && estudiosComplementarios.tercerTrimestre.estudios.map((estudio, index) => (
                  <View key={estudio.id} style={styles.estudioItem}>
                    <View style={styles.estudioRow}>
                      <Text style={styles.estudioNombre}>{estudio.abreviatura}</Text>
                      <Text style={styles.fechaProgramada}>
                        {estudio.fechaProgramada ? 
                          formatearFecha(estudio.fechaProgramada) : 'Sin fecha'}
                      </Text>
                      <TouchableOpacity
                        style={[styles.checkButton, 
                          estudio.realizado && styles.checkButtonActive]}
                        onPress={() => toggleEstudioRealizado('tercerTrimestre', estudio.id)}
                      >
                        <Text style={[styles.checkButtonText,
                          estudio.realizado && styles.checkButtonTextActive]}>
                          {estudio.realizado ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {estudio.realizado && (
                      <Text style={styles.estudioStatus}>✅ Realizado</Text>
                    )}
                  </View>
                ))}
                
                {/* PTG Tercer Trimestre */}
                {trimestreExpandido.tercero && estudiosComplementarios.tercerTrimestre.ptg?.map((ptg) => (
                  <View key={ptg.id} style={[styles.estudioItem, styles.ptgItem]}>
                    <View style={styles.estudioRow}>
                      <Text style={styles.estudioNombre}>PTG (30-32 sem)</Text>
                      <TouchableOpacity
                        style={styles.fechaProgramada}
                        onPress={() => abrirModalPTG('tercerTrimestre', ptg.id, ptg.fechaProgramada || undefined)}
                      >
                        <Text style={styles.fechaProgramada}>
                          {ptg.fechaProgramada ? formatearFecha(ptg.fechaProgramada) : 'Manual'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.checkButton, 
                          ptg.realizado && styles.checkButtonActive]}
                        onPress={() => togglePTGRealizado('tercerTrimestre', ptg.id)}
                      >
                        <Text style={[styles.checkButtonText,
                          ptg.realizado && styles.checkButtonTextActive]}>
                          {ptg.realizado ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {ptg.realizado && (
                      <Text style={styles.estudioStatus}>✅ PTG Realizada</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Secciones de Controles (Próximamente) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🩺 Controles Especializados</Text>
            
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonTitle}>📋 Controles Prenatales</Text>
              <Text style={styles.comingSoonText}>
                Registro detallado de controles prenatales con peso, presión arterial, 
                altura uterina y frecuencia cardíaca fetal.
              </Text>
              <TouchableOpacity style={styles.comingSoonButton}>
                <Text style={styles.comingSoonButtonText}>Próximamente</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonTitle}>📏 Cervicometrías</Text>
              <Text style={styles.comingSoonText}>
                Mediciones de longitud cervical y evaluación del riesgo 
                de parto prematuro.
              </Text>
              <TouchableOpacity style={styles.comingSoonButton}>
                <Text style={styles.comingSoonButtonText}>Próximamente</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonTitle}>👨‍⚕️ Interconsultas</Text>
              <Text style={styles.comingSoonText}>
                Gestión de interconsultas con especialistas y seguimiento 
                de recomendaciones.
              </Text>
              <TouchableOpacity style={styles.comingSoonButton}>
                <Text style={styles.comingSoonButtonText}>Próximamente</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonTitle}>🏥 Remisión a Hospital</Text>
              <Text style={styles.comingSoonText}>
                Programación y seguimiento de remisiones hospitalarias 
                según urgencia y criterios médicos.
              </Text>
              <TouchableOpacity style={styles.comingSoonButton}>
                <Text style={styles.comingSoonButtonText}>Próximamente</Text>
              </TouchableOpacity>
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
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleGuardar}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '⏳ Guardando...' : '✓ Guardar Seguimiento'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para programar PTG */}
      <Modal
        visible={modalPTGVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrarModalPTG}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🎯 Programar PTG</Text>
            <Text style={styles.modalSubtitle}>
              {ptgTemporal?.trimestre === 'segundoTrimestre' 
                ? 'Segundo Trimestre (24-26 semanas)' 
                : 'Tercer Trimestre (30-32 semanas)'}
            </Text>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Fecha:</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  inputFocused && styles.modalInputFocused
                ]}
                value={fechaPTGTexto}
                onChangeText={actualizarFechaPTG}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#a0a0a0"
                autoFocus={true}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cerrarModalPTG}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmarFechaPTG}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default SeguimientoGestanteScreen;
