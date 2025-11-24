import { create } from 'zustand';

export interface SearchState {
  // Estado - Búsqueda General
  globalQuery: string;
  searchHistory: string[];
  recentSearches: string[];
  
  // Estado - Filtros
  activeFilters: {
    tipo: 'todos' | 'familias' | 'integrantes' | 'gestantes';
    fechaDesde: string | null;
    fechaHasta: string | null;
    edad: { min: number | null; max: number | null };
    sexo: 'todos' | 'masculino' | 'femenino';
    grupoDispensarial: 'todos' | 'I' | 'II' | 'III' | 'IV';
  };
  
  // Estado - Paginación
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
  
  // Estado - Resultados
  searchResults: any[];
  isSearching: boolean;
  lastSearchTime: number | null;
  
  // Acciones - Búsqueda
  setGlobalQuery: (query: string) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Acciones - Filtros
  setFilters: (filters: Partial<SearchState['activeFilters']>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  
  // Acciones - Paginación
  setPagination: (pagination: Partial<SearchState['pagination']>) => void;
  goToPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  // Acciones - Resultados
  setSearchResults: (results: any[]) => void;
  setSearching: (searching: boolean) => void;
  clearResults: () => void;
  
  // Getters
  hasActiveFilters: () => boolean;
  getFilterCount: () => number;
  canGoToNextPage: () => boolean;
  canGoToPreviousPage: () => boolean;
  getSearchSummary: () => string;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // Estado inicial - Búsqueda General
  globalQuery: '',
  searchHistory: [],
  recentSearches: [],
  
  // Estado inicial - Filtros
  activeFilters: {
    tipo: 'todos',
    fechaDesde: null,
    fechaHasta: null,
    edad: { min: null, max: null },
    sexo: 'todos',
    grupoDispensarial: 'todos',
  },
  
  // Estado inicial - Paginación
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
  
  // Estado inicial - Resultados
  searchResults: [],
  isSearching: false,
  lastSearchTime: null,

  // Acciones - Búsqueda
  setGlobalQuery: (query: string) => {
    set({ globalQuery: query });
  },

  addToHistory: (query: string) => {
    if (query.trim() === '') return;
    
    set((state) => {
      const newHistory = [query, ...state.searchHistory.filter(h => h !== query)].slice(0, 20);
      return { searchHistory: newHistory };
    });
  },

  clearHistory: () => {
    set({ searchHistory: [] });
  },

  addToRecentSearches: (query: string) => {
    if (query.trim() === '') return;
    
    set((state) => {
      const newRecent = [query, ...state.recentSearches.filter(r => r !== query)].slice(0, 5);
      return { recentSearches: newRecent };
    });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  // Acciones - Filtros
  setFilters: (newFilters: Partial<SearchState['activeFilters']>) => {
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...newFilters },
      pagination: { ...state.pagination, currentPage: 1 }, // Reset página al cambiar filtros
    }));
  },

  clearFilters: () => {
    set({
      activeFilters: {
        tipo: 'todos',
        fechaDesde: null,
        fechaHasta: null,
        edad: { min: null, max: null },
        sexo: 'todos',
        grupoDispensarial: 'todos',
      },
      pagination: { ...get().pagination, currentPage: 1 },
    });
  },

  resetFilters: () => {
    get().clearFilters();
    set({ globalQuery: '' });
  },

  // Acciones - Paginación
  setPagination: (newPagination: Partial<SearchState['pagination']>) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },

  goToPage: (page: number) => {
    const { totalPages } = get().pagination;
    if (page >= 1 && page <= totalPages) {
      set((state) => ({
        pagination: { ...state.pagination, currentPage: page },
      }));
    }
  },

  setItemsPerPage: (items: number) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        itemsPerPage: items,
        currentPage: 1,
        totalPages: Math.ceil(state.pagination.totalItems / items),
      },
    }));
  },

  // Acciones - Resultados
  setSearchResults: (results: any[]) => {
    const { itemsPerPage } = get().pagination;
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    set({
      searchResults: results,
      lastSearchTime: Date.now(),
      pagination: {
        ...get().pagination,
        totalItems,
        totalPages,
        currentPage: 1,
      },
    });
  },

  setSearching: (searching: boolean) => {
    set({ isSearching: searching });
  },

  clearResults: () => {
    set({
      searchResults: [],
      pagination: {
        ...get().pagination,
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      },
    });
  },

  // Getters
  hasActiveFilters: () => {
    const { activeFilters } = get();
    return (
      activeFilters.tipo !== 'todos' ||
      activeFilters.fechaDesde !== null ||
      activeFilters.fechaHasta !== null ||
      activeFilters.edad.min !== null ||
      activeFilters.edad.max !== null ||
      activeFilters.sexo !== 'todos' ||
      activeFilters.grupoDispensarial !== 'todos'
    );
  },

  getFilterCount: () => {
    const { activeFilters } = get();
    let count = 0;
    
    if (activeFilters.tipo !== 'todos') count++;
    if (activeFilters.fechaDesde !== null) count++;
    if (activeFilters.fechaHasta !== null) count++;
    if (activeFilters.edad.min !== null || activeFilters.edad.max !== null) count++;
    if (activeFilters.sexo !== 'todos') count++;
    if (activeFilters.grupoDispensarial !== 'todos') count++;
    
    return count;
  },

  canGoToNextPage: () => {
    const { currentPage, totalPages } = get().pagination;
    return currentPage < totalPages;
  },

  canGoToPreviousPage: () => {
    const { currentPage } = get().pagination;
    return currentPage > 1;
  },

  getSearchSummary: () => {
    const { searchResults, pagination, globalQuery } = get();
    const { currentPage, itemsPerPage, totalItems } = pagination;
    
    if (totalItems === 0) {
      return globalQuery ? `No se encontraron resultados para "${globalQuery}"` : 'No hay resultados';
    }
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return `Mostrando ${startItem}-${endItem} de ${totalItems} resultados`;
  },
}));
