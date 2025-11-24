import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StorageService } from '../services/StorageService';
import { SoundService } from '../services/SoundService';
import { FamiliaData, IntegranteData, FiltrosBusqueda } from '../types';
import { useSearchStore, useFamiliesStore } from '../stores';
import IntegranteCard from '../components/IntegranteCard';
import GrupoDispensarialSelector from '../components/GrupoDispensarialSelector';
import { styles } from '../styles/screens/BusquedaScreen.styles';

// Definir tipo local para GrupoDispensarial
type GrupoDispensarial = 'I' | 'II' | 'III' | 'IV';

interface IntegranteConFamilia {
  integrante: IntegranteData;
  familia: FamiliaData;
}

const BusquedaScreen: React.FC = () => {
  // Zustand stores
  const {
    globalQuery,
    activeFilters,
    pagination,
    searchResults,
    isSearching,
    setGlobalQuery,
    setFilters,
    clearFilters,
    setPagination,
    goToPage,
    setSearchResults,
    setSearching,
    hasActiveFilters,
    getFilterCount,
    canGoToNextPage,
    canGoToPreviousPage,
    getSearchSummary,
    addToHistory,
  } = useSearchStore();
  
  const { familias, integrantes } = useFamiliesStore();
  
  // Estados locales
  const [filtrosVisible, setFiltrosVisible] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Mapear filtros de Zustand a filtros locales
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosBusqueda>({});

  const buscarIntegrantes = async () => {
    SoundService.playClick();
    setSearching(true);
    setHasSearched(true);
    
    try {
      // Usar datos del store si están disponibles, sino cargar desde storage
      let integrantesData = integrantes;
      let familiasData = familias;
      
      if (integrantesData.length === 0 || familiasData.length === 0) {
        integrantesData = await StorageService.obtenerIntegrantes();
        familiasData = await StorageService.obtenerFamilias();
      }
      
      let integrantesFiltrados = integrantesData;

      // Aplicar filtrosLocales usando filtrosLocales
      if (filtrosLocales.nombre && filtrosLocales.nombre.trim() !== '') {
        integrantesFiltrados = integrantesFiltrados.filter((i: IntegranteData) => 
          i.nombre.toLowerCase().includes(filtrosLocales.nombre!.toLowerCase().trim())
        );
      }
      
      if (filtrosLocales.edadMin !== undefined && filtrosLocales.edadMin !== null && !isNaN(filtrosLocales.edadMin)) {
        integrantesFiltrados = integrantesFiltrados.filter((i: IntegranteData) => i.edad >= filtrosLocales.edadMin!);
      }
      
      if (filtrosLocales.edadMax !== undefined && filtrosLocales.edadMax !== null && !isNaN(filtrosLocales.edadMax)) {
        integrantesFiltrados = integrantesFiltrados.filter((i: IntegranteData) => i.edad <= filtrosLocales.edadMax!);
      }
      
      if (filtrosLocales.sexo && filtrosLocales.sexo !== '' && filtrosLocales.sexo !== 'todos') {
        integrantesFiltrados = integrantesFiltrados.filter((i: IntegranteData) => i.sexo === filtrosLocales.sexo);
      }
      
      if (filtrosLocales.raza && filtrosLocales.raza.trim() !== '') {
        integrantesFiltrados = integrantesFiltrados.filter((i: IntegranteData) => 
          i.raza && i.raza.toLowerCase().includes(filtrosLocales.raza!.toLowerCase().trim())
        );
      }
      
      if (filtrosLocales.enfermedad && filtrosLocales.enfermedad.trim() !== '') {
        integrantesFiltrados = integrantesFiltrados.filter((i: IntegranteData) => {
          return i.enfermedades && i.enfermedades.length > 0 && 
                 i.enfermedades.some((e: string) => e.toLowerCase().includes(filtrosLocales.enfermedad!.toLowerCase().trim()));
        });
      }

      if (filtrosLocales.grupoDispensarial && filtrosLocales.grupoDispensarial !== '' && filtrosLocales.grupoDispensarial !== 'todos') {
        integrantesFiltrados = integrantesFiltrados.filter((i: IntegranteData) => 
          i.grupoDispensarial === filtrosLocales.grupoDispensarial
        );
      }

      // Combinar con información de familias
      let resultadosConFamilia: IntegranteConFamilia[] = integrantesFiltrados
        .map((integrante: IntegranteData) => {
          const familia = familiasData.find((f: FamiliaData) => f.id === integrante.familiaId);
          if (!familia) return null;
          return { integrante, familia };
        })
        .filter((item: IntegranteConFamilia | null) => item !== null);

      // Aplicar filtrosLocales de familia
      if (filtrosLocales.direccion && filtrosLocales.direccion.trim() !== '') {
        resultadosConFamilia = resultadosConFamilia.filter((item: IntegranteConFamilia) => 
          item.familia.direccion && 
          item.familia.direccion.toLowerCase().includes(filtrosLocales.direccion!.toLowerCase().trim())
        );
      }

      if (filtrosLocales.poblacion && filtrosLocales.poblacion.trim() !== '') {
        resultadosConFamilia = resultadosConFamilia.filter((item: IntegranteConFamilia) => 
          item.familia.poblacion && 
          item.familia.poblacion.toLowerCase().includes(filtrosLocales.poblacion!.toLowerCase().trim())
        );
      }
      
      if (filtrosLocales.consultorio && filtrosLocales.consultorio.trim() !== '') {
        resultadosConFamilia = resultadosConFamilia.filter((item: IntegranteConFamilia) => 
          item.familia.consultorio && 
          item.familia.consultorio.toLowerCase().includes(filtrosLocales.consultorio!.toLowerCase().trim())
        );
      }
      
      // Guardar en Zustand store
      setSearchResults(resultadosConFamilia);
      addToHistory(globalQuery);
      
      SoundService.playSuccess();
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      SoundService.playError();
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setSearching(false);
    }
  };

  const limpiarFiltros = () => {
    SoundService.playClick();
    setFiltrosLocales({});
    clearFilters();
    setHasSearched(false);
  };

  // Función para cambiar de página
  const irAPagina = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    
    SoundService.playClick(); 
    goToPage(page);
  };

  // Función para ir a la página anterior
  const irAPaginaAnterior = () => {
    if (canGoToPreviousPage()) {
      goToPage(pagination.currentPage - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (canGoToNextPage()) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const renderIntegrante = ({ item }: { item: IntegranteConFamilia }) => (
    <View style={styles.resultItem}>
      <IntegranteCard
        integrante={item.integrante}
        showActions={false}
      />
      <View style={styles.familiaInfo}>
        <Text style={styles.familiaText}>
          👨‍👩‍👧‍👦 Familia #{item.familia.numero}
        </Text>
        <Text style={styles.familiaSubtext}>
          🏠 {item.familia.direccion}
        </Text>
        <Text style={styles.familiaSubtext}>
          📍 {item.familia.poblacion} - {item.familia.consultorio}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>🔍 Buscando...</Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Búsqueda Avanzada</Text>
          <Text style={styles.emptySubtext}>
            Configura los filtrosLocales y presiona buscar para encontrar integrantes específicos
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>❌</Text>
        <Text style={styles.emptyText}>Sin resultados</Text>
        <Text style={styles.emptySubtext}>
          No se encontraron integrantes que coincidan con los criterios de búsqueda
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <View style={styles.filtersTitleContainer}>
          <Text style={styles.filtersTitle}>🔍 Filtros de Búsqueda</Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setFiltrosVisible(!filtrosVisible)}
          >
            <Text style={styles.toggleButtonText}>
              {filtrosVisible ? '🔼' : '🔽'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {filtrosVisible && (
          <ScrollView style={styles.filtersScroll} showsVerticalScrollIndicator={true}>
          {/* Información Personal */}
          <Text style={styles.filterSectionTitle}>👤 Información Personal</Text>
          
          <TextInput
            style={styles.input}
            placeholder="👤 Nombre del integrante"
            value={filtrosLocales.nombre || ''}
            onChangeText={(text) => setFiltrosLocales({...filtrosLocales, nombre: text})}
            autoCapitalize="words"
          />
          
          {/* Rango de Edad */}
          <Text style={styles.filterSectionTitle}>🎂 Rango de Edad</Text>
          
          <View style={styles.filterRow}>
            <TextInput
              style={styles.input}
              placeholder="Edad mínima"
              value={filtrosLocales.edadMin?.toString() || ''}
              onChangeText={(text) => setFiltrosLocales({...filtrosLocales, edadMin: text ? parseInt(text) : undefined})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Edad máxima"
              value={filtrosLocales.edadMax?.toString() || ''}
              onChangeText={(text) => setFiltrosLocales({...filtrosLocales, edadMax: text ? parseInt(text) : undefined})}
              keyboardType="numeric"
            />
          </View>

          {/* Género - Separado en su propia sección */}
          <Text style={styles.filterSectionTitle}>👥 Género</Text>
          
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.sexoButton, filtrosLocales.sexo === 'Masculino' && styles.sexoButtonSelected]}
              onPress={() => setFiltrosLocales({...filtrosLocales, sexo: filtrosLocales.sexo === 'Masculino' ? '' : 'Masculino'})}
            >
              <Text style={[styles.sexoText, filtrosLocales.sexo === 'Masculino' && styles.sexoTextSelected]}>
                👨 Masculino
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sexoButton, filtrosLocales.sexo === 'Femenino' && styles.sexoButtonSelected]}
              onPress={() => setFiltrosLocales({...filtrosLocales, sexo: filtrosLocales.sexo === 'Femenino' ? '' : 'Femenino'})}
            >
              <Text style={[styles.sexoText, filtrosLocales.sexo === 'Femenino' && styles.sexoTextSelected]}>
                👩 Femenino
              </Text>
            </TouchableOpacity>
          </View>

          {/* Raza/Etnia - Separado del género */}
          <Text style={styles.filterSectionTitle}>🧬 Raza/Etnia</Text>
          
          <TextInput
            style={styles.input}
            placeholder="🧬 Raza/Etnia (ej: Mestizo, Indígena, Afrodescendiente)"
            value={filtrosLocales.raza || ''}
            onChangeText={(text) => setFiltrosLocales({...filtrosLocales, raza: text})}
            autoCapitalize="words"
          />

          {/* Información de Ubicación */}
          <Text style={styles.filterSectionTitle}>🏠 Información de Ubicación</Text>
          
          <TextInput
            style={styles.input}
            placeholder="🏠 Dirección de la familia"
            value={filtrosLocales.direccion || ''}
            onChangeText={(text) => setFiltrosLocales({...filtrosLocales, direccion: text})}
            autoCapitalize="words"
          />

          {/* Información Médica */}
          <Text style={styles.filterSectionTitle}>🏥 Información Médica</Text>
          
          <TextInput
            style={styles.input}
            placeholder="🏥 Enfermedad específica"
            value={filtrosLocales.enfermedad || ''}
            onChangeText={(text) => setFiltrosLocales({...filtrosLocales, enfermedad: text})}
            autoCapitalize="words"
          />

          {/* Grupo Dispensarial */}
          <Text style={styles.filterLabel}>🏥 Grupo Dispensarial</Text>
          <View style={styles.grupoDispensarialContainer}>
            <TouchableOpacity
              style={[
                styles.grupoButton,
                { borderColor: '#4CAF50' },
                filtrosLocales.grupoDispensarial === 'I' && {
                  ...styles.grupoButtonSelected,
                  backgroundColor: '#4CAF50',
                  borderColor: '#388E3C',
                }
              ]}
              onPress={() => setFiltrosLocales({...filtrosLocales, grupoDispensarial: filtrosLocales.grupoDispensarial === 'I' ? 'todos' : 'I'})}
            >
              <Text style={[
                styles.grupoText,
                filtrosLocales.grupoDispensarial === 'I' && styles.grupoTextSelected
              ]}>
                ✅ Grupo I
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.grupoButton,
                { borderColor: '#FF9800' },
                filtrosLocales.grupoDispensarial === 'II' && {
                  ...styles.grupoButtonSelected,
                  backgroundColor: '#FF9800',
                  borderColor: '#F57C00',
                }
              ]}
              onPress={() => setFiltrosLocales({...filtrosLocales, grupoDispensarial: filtrosLocales.grupoDispensarial === 'II' ? 'todos' : 'II'})}
            >
              <Text style={[
                styles.grupoText,
                filtrosLocales.grupoDispensarial === 'II' && styles.grupoTextSelected
              ]}>
                ⚠️ Grupo II
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.grupoButton,
                { borderColor: '#F44336' },
                filtrosLocales.grupoDispensarial === 'III' && {
                  ...styles.grupoButtonSelected,
                  backgroundColor: '#F44336',
                  borderColor: '#D32F2F',
                }
              ]}
              onPress={() => setFiltrosLocales({...filtrosLocales, grupoDispensarial: filtrosLocales.grupoDispensarial === 'III' ? 'todos' : 'III'})}
            >
              <Text style={[
                styles.grupoText,
                filtrosLocales.grupoDispensarial === 'III' && styles.grupoTextSelected
              ]}>
                🏥 Grupo III
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.grupoButton,
                { borderColor: '#9C27B0' },
                filtrosLocales.grupoDispensarial === 'IV' && {
                  ...styles.grupoButtonSelected,
                  backgroundColor: '#9C27B0',
                  borderColor: '#7B1FA2',
                }
              ]}
              onPress={() => setFiltrosLocales({...filtrosLocales, grupoDispensarial: filtrosLocales.grupoDispensarial === 'IV' ? 'todos' : 'IV'})}
            >
              <Text style={[
                styles.grupoText,
                filtrosLocales.grupoDispensarial === 'IV' && styles.grupoTextSelected
              ]}>
                ♿ Grupo IV
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.grupoButton,
                (!filtrosLocales.grupoDispensarial || filtrosLocales.grupoDispensarial === 'todos') && {
                  ...styles.grupoButtonSelected,
                  backgroundColor: '#2196F3',
                  borderColor: '#1976D2',
                }
              ]}
              onPress={() => setFiltrosLocales({...filtrosLocales, grupoDispensarial: 'todos'})}
            >
              <Text style={[
                styles.grupoText,
                (!filtrosLocales.grupoDispensarial || filtrosLocales.grupoDispensarial === 'todos') && styles.grupoTextSelected
              ]}>
                🔍 Todos
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        )}
        
        {/* Botones fijos en la parte inferior - Solo visibles cuando filtros están expandidos */}
        {filtrosVisible && (
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={limpiarFiltros}>
              <Text style={styles.clearButtonText}>🗑️ Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={buscarIntegrantes}>
              <Text style={styles.searchButtonText}>🔍 Buscar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {hasSearched && !isSearching && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            📋 {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
          </Text>
          {pagination.totalPages > 1 && (
            <Text style={styles.paginationInfo}>
              📄 Página {pagination.currentPage} de {pagination.totalPages} • {getSearchSummary()}
            </Text>
          )}
        </View>
      )}

      <FlatList
        data={searchResults.slice(
          (pagination.currentPage - 1) * pagination.itemsPerPage,
          pagination.currentPage * pagination.itemsPerPage
        )}
        keyExtractor={(item) => item.integrante.id}
        renderItem={renderIntegrante}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={searchResults.length === 0 ? styles.emptyList : undefined}
        style={styles.resultsList}
      />

      {/* Controles de Paginación */}
      {hasSearched && !isSearching && pagination.totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity 
            style={[styles.paginationButton, !canGoToPreviousPage() && styles.paginationButtonDisabled]}
            onPress={irAPaginaAnterior}
            disabled={!canGoToPreviousPage()}
          >
            <Text style={[styles.paginationButtonText, !canGoToPreviousPage() && styles.paginationButtonTextDisabled]}>
              ⬅️ Anterior
            </Text>
          </TouchableOpacity>

          <View style={styles.paginationNumbers}>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => {
              let pageNumber;
              if (pagination.totalPages <= 5) {
                pageNumber = index + 1;
              } else if (pagination.currentPage <= 3) {
                pageNumber = index + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNumber = pagination.totalPages - 4 + index;
              } else {
                pageNumber = pagination.currentPage - 2 + index;
              }

              return (
                <TouchableOpacity
                  key={pageNumber}
                  style={[
                    styles.paginationNumberButton,
                    pagination.currentPage === pageNumber && styles.paginationNumberButtonActive
                  ]}
                  onPress={() => irAPagina(pageNumber)}
                >
                  <Text style={[
                    styles.paginationNumberText,
                    pagination.currentPage === pageNumber && styles.paginationNumberTextActive
                  ]}>
                    {pageNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity 
            style={[styles.paginationButton, !canGoToNextPage() && styles.paginationButtonDisabled]}
            onPress={irAPaginaSiguiente}
            disabled={!canGoToNextPage()}
          >
            <Text style={[styles.paginationButtonText, !canGoToNextPage() && styles.paginationButtonTextDisabled]}>
              Siguiente ➡️
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


export default BusquedaScreen;
