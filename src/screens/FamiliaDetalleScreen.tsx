import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, FamiliaData, IntegranteData } from '../types';
import { useFamiliesStore } from '../stores';
import { IntegranteCard } from '../components';
import { styles } from '../styles/screens/FamiliaDetalleScreen.styles';

type FamiliaDetalleScreenRouteProp = RouteProp<RootStackParamList, 'FamiliaDetalle'>;
type FamiliaDetalleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FamiliaDetalle'>;

interface Props {
  route: FamiliaDetalleScreenRouteProp;
  navigation: FamiliaDetalleScreenNavigationProp;
}

const FamiliaDetalleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { familiaId } = route.params;
  
  // Zustand store
  const {
    selectedFamilia,
    integrantes,
    isLoading,
    selectFamilia,
    loadIntegrantes,
    deleteIntegrante,
    getIntegrantesByFamilia,
    getFamiliaById
  } = useFamiliesStore();

  // Estado local para integrantes filtrados
  const [familiaIntegrantes, setFamiliaIntegrantes] = useState<IntegranteData[]>([]);

  // Cargar familia y sus integrantes al montar o cambiar familiaId
  useFocusEffect(
    React.useCallback(() => {
      cargarDatosFamilia();
    }, [familiaId])
  );

  const cargarDatosFamilia = async () => {
    try {
      console.log('🔍 Buscando familia con ID:', familiaId);
      
      // Seleccionar familia en el store global
      const familia = await getFamiliaById(familiaId);
      console.log('👨‍👩‍👧‍👦 Familia encontrada:', familia);
      
      if (familia) {
        selectFamilia(familia);
        
        // Cargar integrantes de esta familia
        const integrantesFamilia = await getIntegrantesByFamilia(familiaId);
        console.log('👥 Integrantes de la familia:', integrantesFamilia.length);
        setFamiliaIntegrantes(integrantesFamilia);
      } else {
        console.log('❌ Familia no encontrada con ID:', familiaId);
        Alert.alert('Error', 'Familia no encontrada');
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la familia');
    }
  };

  // Función para refrescar datos
  const handleRefresh = async () => {
    await cargarDatosFamilia();
  };

  const handleEliminarIntegrante = (integranteId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este integrante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIntegrante(integranteId);
              // Recargar integrantes de la familia
              const integrantesFamilia = await getIntegrantesByFamilia(familiaId);
              setFamiliaIntegrantes(integrantesFamilia);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el integrante');
            }
          },
        },
      ]
    );
  };

  const renderIntegrante = ({ item }: { item: IntegranteData }) => (
    <IntegranteCard
      integrante={item}
      onEdit={() => navigation.navigate('EditarIntegrante', { integranteId: item.id, familiaId })}
      onDelete={() => handleEliminarIntegrante(item.id)}
    />
  );

  const renderFamiliaInfo = () => {
    if (!selectedFamilia) return null;

    return (
      <View style={styles.familiaInfo}>
        <Text style={styles.familiaTitle}>Familia #{selectedFamilia.numero}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Población:</Text>
          <Text style={styles.infoText}>{selectedFamilia.poblacion}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏥 Consultorio:</Text>
          <Text style={styles.infoText}>{selectedFamilia.consultorio}</Text>
        </View>
        
        {selectedFamilia.direccion && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏠 Dirección:</Text>
            <Text style={styles.infoText}>{selectedFamilia.direccion}</Text>
          </View>
        )}
        
        {selectedFamilia.manzana && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏘️ Manzana:</Text>
            <Text style={styles.infoText}>#{selectedFamilia.manzana}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👥 Integrantes:</Text>
          <Text style={styles.infoText}>
            {familiaIntegrantes.length} persona{familiaIntegrantes.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditarFamilia', { familiaId })}
          >
            <Text style={styles.editButtonText}>✏️ Editar Familia</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              console.log('🔄 Navegando a CrearIntegrante con familiaId:', familiaId);
              navigation.navigate('CrearIntegrante', { familiaId });
            }}
          >
            <Text style={styles.addButtonText}>➕ Agregar Integrante</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderIntegrantesHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Integrantes de la Familia</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👤</Text>
      <Text style={styles.emptyText}>No hay integrantes registrados</Text>
      <Text style={styles.emptySubtext}>
        Agrega el primer integrante de esta familia
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>⏳ Cargando...</Text>
      </View>
    );
  }

  if (!selectedFamilia) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Familia no encontrada</Text>
        <TouchableOpacity 
          style={[styles.editButton, { marginTop: 16, backgroundColor: '#2196F3' }]}
          onPress={cargarDatosFamilia}
        >
          <Text style={[styles.editButtonText, { color: '#fff' }]}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={familiaIntegrantes}
        keyExtractor={(item) => item.id}
        renderItem={renderIntegrante}
        ListHeaderComponent={
          <>
            {renderFamiliaInfo()}
            {renderIntegrantesHeader()}
          </>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={familiaIntegrantes.length === 0 ? styles.emptyList : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
      />
    </View>
  );
};


export default FamiliaDetalleScreen;
