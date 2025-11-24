import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { GestanteData, CLASIFICACIONES_RIESGO, formatearEdadGestacional } from '../types/PAMITypes';
import { PAMIService } from '../services/PAMIService';
import { styles } from '../styles/screens/GestantesScreen.styles';

type GestantesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: GestantesScreenNavigationProp;
}

const GestantesScreen: React.FC<Props> = ({ navigation }) => {
  const [gestantes, setGestantes] = useState<GestanteData[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarGestantes = useCallback(async () => {
    try {
      setLoading(true);
      const gestantesData = await PAMIService.obtenerGestantes();
      setGestantes(gestantesData);
    } catch (error) {
      console.error('Error cargando gestantes:', error);
      Alert.alert('Error', 'No se pudieron cargar las gestantes');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarGestantes();
    }, [cargarGestantes])
  );


  const eliminarGestante = useCallback(async (id: string) => {
    try {
      const resultado = await PAMIService.eliminarGestante(id);
      if (resultado.success) {
        Alert.alert('Éxito', 'Gestante eliminada correctamente');
        cargarGestantes();
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo eliminar la gestante');
      }
    } catch (error) {
      console.error('Error eliminando gestante:', error);
      Alert.alert('Error', 'Error técnico al eliminar gestante');
    }
  }, [cargarGestantes]);

  const confirmarEliminar = useCallback((gestante: GestanteData) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar a ${gestante.nombresApellidos}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarGestante(gestante.id)
        }
      ]
    );
  }, [eliminarGestante]);

  const calcularDiasParaParto = useCallback((fpp: Date): { dias: number; texto: string; color: string } => {
    const hoy = new Date();
    const diferenciaMilisegundos = fpp.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      return {
        dias: Math.abs(dias),
        texto: `${Math.abs(dias)} días vencida`,
        color: '#F44336'
      };
    } else if (dias <= 14) {
      return {
        dias,
        texto: `${dias} días para parto`,
        color: '#FF9800'
      };
    } else {
      return {
        dias,
        texto: `${dias} días para parto`,
        color: '#4CAF50'
      };
    }
  }, []);

  const renderGestanteCard = useCallback((gestante: GestanteData) => {
    const clasificacion = CLASIFICACIONES_RIESGO[gestante.clasificacion];
    const diasParto = calcularDiasParaParto(gestante.fpp);

    return (
      <TouchableOpacity
        key={gestante.id}
        style={[styles.gestanteCard, { borderLeftColor: clasificacion.color }]}
        onPress={() => navigation.navigate('EditarGestante', { gestanteId: gestante.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nombreContainer}>
            <Text style={styles.nombreText}>{gestante.nombresApellidos}</Text>
            <Text style={styles.carnetText}>CI: {gestante.carnetIdentidad}</Text>
          </View>
          <View style={styles.clasificacionContainer}>
            <View style={[styles.clasificacionBadge, { backgroundColor: clasificacion.color }]}>
              <Text style={styles.clasificacionText}>{clasificacion.codigo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👩 Edad:</Text>
            <Text style={styles.infoValue}>{gestante.edad} años</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🤰 EG:</Text>
            <Text style={styles.infoValue}>{formatearEdadGestacional(gestante.edadGestacional)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Dirección:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{gestante.direccion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 FPP:</Text>
            <Text style={[styles.infoValue, { color: diasParto.color }]}>
              {gestante.fpp.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.diasPartoContainer, { backgroundColor: diasParto.color + '20' }]}>
            <Text style={[styles.diasPartoText, { color: diasParto.color }]}>
              {diasParto.texto}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.eliminarButton}
            onPress={(e) => {
              e.stopPropagation();
              confirmarEliminar(gestante);
            }}
          >
            <Text style={styles.eliminarButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [calcularDiasParaParto, confirmarEliminar, navigation]);

  const renderEstadisticasResumen = useCallback(() => {
    const total = gestantes.length;
    const aro = gestantes.filter((g: GestanteData) => g.clasificacion === 'ARO').length;
    const bro = gestantes.filter((g: GestanteData) => g.clasificacion === 'BRO').length;
    const rr = gestantes.filter((g: GestanteData) => g.clasificacion === 'RR').length;

    return (
      <View style={styles.resumenContainer}>
        <Text style={styles.resumenTitle}>📊 Resumen</Text>
        <View style={styles.resumenStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>{aro}</Text>
            <Text style={styles.statLabel}>ARO</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{bro}</Text>
            <Text style={styles.statLabel}>BRO</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{rr}</Text>
            <Text style={styles.statLabel}>RR</Text>
          </View>
        </View>
      </View>
    );
  }, [gestantes]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤰 Gestantes</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarGestantes} />
        }
      >
        {/* Resumen estadísticas */}
        {gestantes.length > 0 && renderEstadisticasResumen()}

        {/* Lista de gestantes */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando gestantes...</Text>
            </View>
          ) : gestantes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🤰</Text>
              <Text style={styles.emptyTitle}>No hay gestantes registradas</Text>
              <Text style={styles.emptySubtitle}>
                Agrega la primera gestante para comenzar
              </Text>
            </View>
          ) : (
            gestantes.map(renderGestanteCard)
          )}
        </View>

        {/* Espaciado para el botón flotante */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CrearGestante')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};


export default GestantesScreen;
