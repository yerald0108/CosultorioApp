import { useMemo } from 'react';
import { useAuthStore, useFamiliesStore, useSearchStore, useStatsStore } from '../stores';
import { IntegranteData } from '../types';

/**
 * Hook optimizado para acceder a múltiples stores con memoización
 * Evita re-renders innecesarios cuando solo cambian propiedades no utilizadas
 */
export const useOptimizedStores = () => {
  // Auth Store - Solo las propiedades esenciales
  const authData = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    getUserName: state.getUserName,
    isSessionValid: state.isSessionValid,
  }));

  // Families Store - Propiedades optimizadas
  const familiesData = useFamiliesStore((state) => ({
    familias: state.familias,
    integrantes: state.integrantes,
    selectedFamilia: state.selectedFamilia,
    isLoading: state.isLoading,
    loadFamilies: state.loadFamilies,
    loadIntegrantes: state.loadIntegrantes,
    getFamiliaStats: state.getFamiliaStats,
  }));

  // Search Store - Solo lo necesario
  const searchData = useSearchStore((state) => ({
    globalQuery: state.globalQuery,
    searchResults: state.searchResults,
    isSearching: state.isSearching,
    pagination: state.pagination,
    activeFilters: state.activeFilters,
    setGlobalQuery: state.setGlobalQuery,
    setSearchResults: state.setSearchResults,
    hasActiveFilters: state.hasActiveFilters,
    getFilterCount: state.getFilterCount,
  }));

  // Stats Store - Datos estadísticos
  const statsData = useStatsStore((state) => ({
    reporteActual: state.reporteActual,
    isGenerating: state.isGenerating,
    ultimaActualizacion: state.ultimaActualizacion,
    generateReport: state.generateReport,
    getEstadisticasGenerales: state.getEstadisticasGenerales,
  }));

  // Memoizar el objeto de retorno para evitar re-creaciones
  return useMemo(
    () => ({
      auth: authData,
      families: familiesData,
      search: searchData,
      stats: statsData,
    }),
    [authData, familiesData, searchData, statsData]
  );
};

/**
 * Hook específico para estadísticas optimizadas
 * Calcula estadísticas solo cuando los datos cambian
 */
export const useOptimizedStats = () => {
  const { familias, integrantes } = useFamiliesStore((state) => ({
    familias: state.familias,
    integrantes: state.integrantes,
  }));

  // Memoizar cálculos pesados
  const stats = useMemo(() => {
    const totalFamilias = familias.length;
    const totalIntegrantes = integrantes.length;
    
    const grupoStats = {
      grupoI: integrantes.filter((i: IntegranteData) => i.grupoDispensarial === 'I').length,
      grupoII: integrantes.filter((i: IntegranteData) => i.grupoDispensarial === 'II').length,
      grupoIII: integrantes.filter((i: IntegranteData) => i.grupoDispensarial === 'III').length,
      grupoIV: integrantes.filter((i: IntegranteData) => i.grupoDispensarial === 'IV').length,
    };

    const edadStats = {
      menores18: integrantes.filter((i: IntegranteData) => i.edad < 18).length,
      adultos: integrantes.filter((i: IntegranteData) => i.edad >= 18 && i.edad < 60).length,
      mayores60: integrantes.filter((i: IntegranteData) => i.edad >= 60).length,
    };

    const sexoStats = {
      masculino: integrantes.filter((i: IntegranteData) => i.sexo === 'Masculino').length,
      femenino: integrantes.filter((i: IntegranteData) => i.sexo === 'Femenino').length,
    };

    return {
      totalFamilias,
      totalIntegrantes,
      promedioIntegrantesPorFamilia: totalFamilias > 0 
        ? Math.round((totalIntegrantes / totalFamilias) * 100) / 100 
        : 0,
      grupoStats,
      edadStats,
      sexoStats,
    };
  }, [familias, integrantes]);

  return stats;
};

/**
 * Hook para búsquedas optimizadas
 */
export const useOptimizedSearch = () => {
  const searchStore = useSearchStore();
  
  // Memoizar funciones de búsqueda para evitar re-creaciones
  const searchFunctions = useMemo(
    () => ({
      setQuery: searchStore.setGlobalQuery,
      setFilters: searchStore.setFilters,
      clearFilters: searchStore.clearFilters,
      goToPage: searchStore.goToPage,
      setResults: searchStore.setSearchResults,
    }),
    [searchStore.setGlobalQuery, searchStore.setFilters, searchStore.clearFilters, searchStore.goToPage, searchStore.setSearchResults]
  );

  return {
    ...searchStore,
    ...searchFunctions,
  };
};
