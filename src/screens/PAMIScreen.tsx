import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { EstadisticasPAMI } from '../types/PAMITypes';
import { PAMIService } from '../services/PAMIService';
import { styles } from '../styles/screens/PAMIScreen.styles';

type PAMIScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: PAMIScreenNavigationProp;
}

const PAMIScreen: React.FC<Props> = ({ navigation }) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPAMI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const stats = await PAMIService.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas PAMI:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderModuloCard = (
    titulo: string,
    icono: string,
    descripcion: string,
    total: number,
    onPress: () => void,
    color: string = '#2196F3'
  ) => (
    <TouchableOpacity
      style={[styles.moduloCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.moduloHeader}>
        <Text style={styles.moduloIcono}>{icono}</Text>
        <View style={styles.moduloInfo}>
          <Text style={styles.moduloTitulo}>{titulo}</Text>
          <Text style={styles.moduloDescripcion}>{descripcion}</Text>
        </View>
        <View style={styles.moduloTotal}>
          <Text style={styles.totalNumero}>{total}</Text>
          <Text style={styles.totalLabel}>Total</Text>
        </View>
      </View>
      <View style={styles.moduloFooter}>
        <Text style={styles.verMasText}>Ver detalles →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEstadisticaCard = (titulo: string, valor: string | number, icono: string, color: string) => (
    <View style={[styles.estadisticaCard, { borderTopColor: color }]}>
      <Text style={styles.estadisticaIcono}>{icono}</Text>
      <Text style={styles.estadisticaValor}>{valor}</Text>
      <Text style={styles.estadisticaTitulo}>{titulo}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={cargarEstadisticas} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤰 PAMI</Text>
        <Text style={styles.headerSubtitle}>
          Programa de Atención Materno Infantil
        </Text>
      </View>

      {/* Módulos Principales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Módulos</Text>
        
        {renderModuloCard(
          'Gestantes',
          '🤰',
          'Seguimiento de embarazadas',
          estadisticas?.totalGestantes || 0,
          () => navigation.navigate('Gestantes'),
          '#E91E63'
        )}

        {renderModuloCard(
          'Lactantes',
          '🤱',
          'Control de lactancia materna',
          estadisticas?.totalLactantes || 0,
          () => {
            // TODO: Navegar a lactantes cuando esté implementado
            console.log('Navegando a Lactantes (próximamente)');
          },
          '#4CAF50'
        )}

        {renderModuloCard(
          'Puérperas',
          '👶',
          'Atención post-parto',
          estadisticas?.totalPuerperas || 0,
          () => {
            // TODO: Navegar a puérperas cuando esté implementado
            console.log('Navegando a Puérperas (próximamente)');
          },
          '#FF9800'
        )}
      </View>

      {/* Estadísticas Rápidas */}
      {estadisticas && estadisticas.totalGestantes > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estadísticas de Gestantes</Text>
          
          <View style={styles.estadisticasGrid}>
            {renderEstadisticaCard(
              'Alto Riesgo',
              estadisticas.gestantesARO,
              '🔴',
              '#F44336'
            )}
            {renderEstadisticaCard(
              'Bajo Riesgo',
              estadisticas.gestantesBRO,
              '🟢',
              '#4CAF50'
            )}
            {renderEstadisticaCard(
              'Riesgo Relevante',
              estadisticas.gestantesRR,
              '🟡',
              '#FF9800'
            )}
          </View>

          <View style={styles.estadisticasGrid}>
            {renderEstadisticaCard(
              'Edad Promedio',
              `${estadisticas.promedioEdadGestantes} años`,
              '👩',
              '#9C27B0'
            )}
            {renderEstadisticaCard(
              'EG Promedio',
              `${estadisticas.promedioEdadGestacional} sem`,
              '📅',
              '#2196F3'
            )}
          </View>
        </View>
      )}

      {/* Información del Programa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Acerca de PAMI</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            El Programa de Atención Materno Infantil (PAMI) está diseñado para el seguimiento 
            integral de la salud materna e infantil, desde la gestación hasta el período post-parto.
          </Text>
          <Text style={styles.infoText}>
            📋 <Text style={styles.infoBold}>Gestantes:</Text> Control prenatal y clasificación de riesgo{'\n'}
            🤱 <Text style={styles.infoBold}>Lactantes:</Text> Seguimiento de lactancia materna{'\n'}
            👶 <Text style={styles.infoBold}>Puérperas:</Text> Atención en el puerperio
          </Text>
        </View>
      </View>

      {/* Espaciado inferior */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};


export default PAMIScreen;
