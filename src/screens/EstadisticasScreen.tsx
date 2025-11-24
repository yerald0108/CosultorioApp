import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useStatsStore } from '../stores/statsStore';
import { styles } from '../styles/screens/EstadisticasScreen.styles';

const EstadisticasScreen: React.FC = () => {
  // Zustand store
  const {
    reporteActual,
    filtrosActivos,
    isGenerating,
    ultimaActualizacion,
    generateReport,
    exportReport,
    getEstadisticasGenerales,
    getEstadisticasPorGrupo,
    getEstadisticasPorEdad,
    getEstadisticasPorSexo,
    hasActiveFilters,
    getFilterCount,
  } = useStatsStore();

  // Estado local para filtros UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    if (!reporteActual) {
      generateReport();
    }
  }, []);

  // Función para refrescar datos
  const handleRefresh = async () => {
    try {
      await generateReport(filtrosActivos);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    }
  };

  // Función para exportar reporte
  const handleExport = async (formato: 'json' | 'csv') => {
    try {
      const data = await exportReport(formato);
      Alert.alert('Éxito', `Reporte exportado en formato ${formato.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el reporte');
    }
  };

  // Obtener datos del reporte
  const generales = getEstadisticasGenerales();
  const porGrupo = getEstadisticasPorGrupo();
  const porEdad = getEstadisticasPorEdad();
  const porSexo = getEstadisticasPorSexo();

  const renderCard = (title: string, children: React.ReactNode, icon: string) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderStatItem = (label: string, value: string | number, color: string = '#333') => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  if (isGenerating && !reporteActual) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>⏳ Generando estadísticas...</Text>
      </View>
    );
  }

  if (!reporteActual || !generales) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Error al cargar estadísticas</Text>
        <TouchableOpacity 
          style={[styles.card, { alignItems: 'center', margin: 16 }]}
          onPress={() => generateReport()}
        >
          <Text style={[styles.cardTitle, { color: '#2196F3' }]}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isGenerating} onRefresh={handleRefresh} />
      }
    >
      {/* Header con controles */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Estadísticas</Text>
        </View>
        {ultimaActualizacion && (
          <Text style={styles.statLabel}>
            Última actualización: {new Date(ultimaActualizacion).toLocaleString()}
          </Text>
        )}
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
          <TouchableOpacity 
            style={[styles.statItem, { flex: 1, marginRight: 8, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8 }]}
            onPress={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Text style={[styles.statLabel, { textAlign: 'center' }]}>
              🔍 Filtros {hasActiveFilters() ? `(${getFilterCount()})` : ''}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statItem, { flex: 1, marginLeft: 8, padding: 12, backgroundColor: '#f0fff0', borderRadius: 8 }]}
            onPress={() => handleExport('json')}
          >
            <Text style={[styles.statLabel, { textAlign: 'center' }]}>💾 Exportar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen General */}
      {renderCard('Resumen General', (
        <View>
          {renderStatItem('Total de Familias', generales.totalFamilias, '#2196F3')}
          {renderStatItem('Total de Integrantes', generales.totalIntegrantes, '#4CAF50')}
          {renderStatItem('Total de Gestantes', generales.totalGestantes, '#E91E63')}
          {renderStatItem(
            'Promedio por Familia', 
            generales.promedioIntegrantesPorFamilia.toFixed(1),
            '#FF9800'
          )}
          {renderStatItem(
            'Porcentaje Gestantes', 
            `${generales.porcentajeGestantes}%`,
            '#9C27B0'
          )}
        </View>
      ), '📊')}

      {/* Distribución por Sexo */}
      {porSexo && renderCard('👥 Distribución por Sexo', (
        <View>
          <View style={styles.sexoContainer}>
            <View style={styles.sexoItem}>
              <Text style={styles.sexoEmoji}>👨</Text>
              <Text style={styles.sexoLabel}>Masculino</Text>
              <Text style={styles.sexoValue}>{porSexo.masculino}</Text>
              <Text style={styles.sexoPorcentaje}>
                ({generales.totalIntegrantes > 0 ? 
                  Math.round((porSexo.masculino / generales.totalIntegrantes) * 100) : 0}%)
              </Text>
            </View>
            <View style={styles.sexoItem}>
              <Text style={styles.sexoEmoji}>👩</Text>
              <Text style={styles.sexoLabel}>Femenino</Text>
              <Text style={styles.sexoValue}>{porSexo.femenino}</Text>
              <Text style={styles.sexoPorcentaje}>
                ({generales.totalIntegrantes > 0 ? 
                  Math.round((porSexo.femenino / generales.totalIntegrantes) * 100) : 0}%)
              </Text>
            </View>
          </View>
        </View>
      ), '👥')}

      {/* Grupos Dispensariales */}
      {porGrupo && renderCard('🏥 Grupos Dispensariales', (
        <View>
          {renderStatItem('Grupo I (Sanos)', porGrupo.grupoI, '#4CAF50')}
          {renderStatItem('Grupo II (Riesgo)', porGrupo.grupoII, '#FF9800')}
          {renderStatItem('Grupo III (Enfermos)', porGrupo.grupoIII, '#F44336')}
          {renderStatItem('Grupo IV (Discapacidad)', porGrupo.grupoIV, '#9C27B0')}
        </View>
      ), '🏥')}

      {/* Distribución por Edad */}
      {porEdad && renderCard('🎂 Distribución por Edad', (
        <View>
          {renderStatItem('👶 Menores de 5', porEdad.menores5, '#4CAF50')}
          {renderStatItem('👦 5 a 18 años', porEdad.entre5y18, '#2196F3')}
          {renderStatItem('👨 19 a 59 años', porEdad.entre19y59, '#FF9800')}
          {renderStatItem('👴 60+ años', porEdad.mayores60, '#9C27B0')}
        </View>
      ), '🎂')}
    </ScrollView>
  );
};

export default EstadisticasScreen;
