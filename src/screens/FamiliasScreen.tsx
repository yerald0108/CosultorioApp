import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, FamiliaData } from '../types';
import { StorageService } from '../services/StorageService';
import FamiliaCard from '../components/FamiliaCard';
import { styles } from '../styles/screens/FamiliasScreen.styles';

type FamiliasScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: FamiliasScreenNavigationProp;
}

interface FamiliaWithCount {
  familia: FamiliaData;
  integrantesCount: number;
}

const FamiliasScreen: React.FC<Props> = ({ navigation }) => {
  const [familias, setFamilias] = useState<FamiliaWithCount[]>([]);
  const [familiasFiltradas, setFamiliasFiltradas] = useState<FamiliaWithCount[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarFamilias = async () => {
    try {
      const familiasData = await StorageService.obtenerFamilias();
      const familiasConConteo = await Promise.all(
        familiasData.map(async (familia) => {
          const integrantes = await StorageService.obtenerIntegrantesPorFamilia(familia.id);
          return {
            familia,
            integrantesCount: integrantes.length,
          };
        })
      );
      setFamilias(familiasConConteo);
      setFamiliasFiltradas(familiasConConteo);
    } catch (error) {
      console.error('Error cargando familias:', error);
      Alert.alert('Error', 'No se pudieron cargar las familias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarFamilias();
    }, [])
  );

  const filtrarFamilias = (textoBusqueda: string) => {
    setBusqueda(textoBusqueda);
    
    if (textoBusqueda.trim() === '') {
      setFamiliasFiltradas(familias);
    } else {
      const familiasFiltradas = familias.filter(item =>
        item.familia.numero.toLowerCase().includes(textoBusqueda.toLowerCase().trim())
      );
      setFamiliasFiltradas(familiasFiltradas);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setFamiliasFiltradas(familias);
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarFamilias();
  };

  const handleEliminarFamilia = (familiaId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta familia? Se eliminarán todos los integrantes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.eliminarFamilia(familiaId);
              cargarFamilias();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la familia');
            }
          },
        },
      ]
    );
  };

  const renderFamilia = ({ item }: { item: FamiliaWithCount }) => (
    <FamiliaCard
      familia={item.familia}
      integrantesCount={item.integrantesCount}
      onPress={() => navigation.navigate('FamiliaDetalle', { familiaId: item.familia.id })}
      onEdit={() => navigation.navigate('EditarFamilia', { familiaId: item.familia.id })}
      onDelete={() => handleEliminarFamilia(item.familia.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
      <Text style={styles.emptyText}>No hay familias registradas</Text>
      <Text style={styles.emptySubtext}>Toca el botón + para crear una nueva familia</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda - Solo mostrar si hay familias */}
      {familias.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por número de familia..."
              value={busqueda}
              onChangeText={filtrarFamilias}
              placeholderTextColor="#999"
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={limpiarBusqueda} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>❌</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Contador de resultados */}
          {busqueda.length > 0 && (
            <Text style={styles.resultsCount}>
              📊 {familiasFiltradas.length} familia{familiasFiltradas.length !== 1 ? 's' : ''} encontrada{familiasFiltradas.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}

      <FlatList
        data={familiasFiltradas}
        keyExtractor={(item) => item.familia.id}
        renderItem={renderFamilia}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={familiasFiltradas.length === 0 ? styles.emptyList : undefined}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CrearFamilia')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};


export default FamiliasScreen;
