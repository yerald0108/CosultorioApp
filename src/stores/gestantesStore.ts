import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestanteData } from '../types/PAMITypes';

export interface GestantesState {
  // Estado
  gestantes: GestanteData[];
  selectedGestante: GestanteData | null;
  isLoading: boolean;
  searchQuery: string;
  filters: {
    trimestre: 'todos' | '1' | '2' | '3';
    riesgo: 'todos' | 'bajo' | 'medio' | 'alto';
    edad: 'todos' | 'adolescente' | 'adulta' | 'mayor';
  };
  
  // Acciones - Gestantes
  setGestantes: (gestantes: GestanteData[]) => void;
  addGestante: (gestante: GestanteData) => void;
  updateGestante: (id: string, updates: Partial<GestanteData>) => void;
  deleteGestante: (id: string) => void;
  selectGestante: (gestante: GestanteData | null) => void;
  
  // Acciones - Búsqueda y Filtros
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<GestantesState['filters']>) => void;
  clearFilters: () => void;
  
  // Acciones - Loading
  setLoading: (loading: boolean) => void;
  
  // Getters
  getGestanteById: (id: string) => GestanteData | undefined;
  getFilteredGestantes: () => GestanteData[];
  getGestantesStats: () => {
    total: number;
    porTrimestre: { [key: string]: number };
    porRiesgo: { [key: string]: number };
    porEdad: { [key: string]: number };
  };
}

export const useGestantesStore = create<GestantesState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      gestantes: [],
      selectedGestante: null,
      isLoading: false,
      searchQuery: '',
      filters: {
        trimestre: 'todos',
        riesgo: 'todos',
        edad: 'todos',
      },

      // Acciones - Gestantes
      setGestantes: (gestantes: GestanteData[]) => {
        set({ gestantes });
      },

      addGestante: (gestante: GestanteData) => {
        set((state) => ({
          gestantes: [...state.gestantes, gestante],
        }));
      },

      updateGestante: (id: string, updates: Partial<GestanteData>) => {
        set((state) => ({
          gestantes: state.gestantes.map((gestante) =>
            gestante.id === id ? { ...gestante, ...updates } : gestante
          ),
          selectedGestante:
            state.selectedGestante?.id === id
              ? { ...state.selectedGestante, ...updates }
              : state.selectedGestante,
        }));
      },

      deleteGestante: (id: string) => {
        set((state) => ({
          gestantes: state.gestantes.filter((gestante) => gestante.id !== id),
          selectedGestante:
            state.selectedGestante?.id === id ? null : state.selectedGestante,
        }));
      },

      selectGestante: (gestante: GestanteData | null) => {
        set({ selectedGestante: gestante });
      },

      // Acciones - Búsqueda y Filtros
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setFilters: (newFilters: Partial<GestantesState['filters']>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({
          filters: {
            trimestre: 'todos',
            riesgo: 'todos',
            edad: 'todos',
          },
          searchQuery: '',
        });
      },

      // Acciones - Loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Getters
      getGestanteById: (id: string) => {
        return get().gestantes.find((gestante) => gestante.id === id);
      },

      getFilteredGestantes: () => {
        const { gestantes, searchQuery, filters } = get();
        
        return gestantes.filter((gestante) => {
          // Filtro de búsqueda
          const matchesSearch = searchQuery === '' || 
            gestante.nombresApellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gestante.carnetIdentidad.includes(searchQuery);

          // Filtro de trimestre (calculado desde edadGestacional)
          const trimestre = Math.ceil(gestante.edadGestacional / 13);
          const matchesTrimestre = filters.trimestre === 'todos' || 
            trimestre.toString() === filters.trimestre;

          // Filtro de riesgo (basado en clasificación)
          const riesgoLevel = gestante.clasificacion === 'ARO' ? 'alto' : 
                             gestante.clasificacion === 'BRO' ? 'medio' : 'bajo';
          const matchesRiesgo = filters.riesgo === 'todos' || 
            riesgoLevel === filters.riesgo;

          // Filtro de edad
          let matchesEdad = true;
          if (filters.edad !== 'todos') {
            const edad = gestante.edad;
            switch (filters.edad) {
              case 'adolescente':
                matchesEdad = edad < 20;
                break;
              case 'adulta':
                matchesEdad = edad >= 20 && edad < 35;
                break;
              case 'mayor':
                matchesEdad = edad >= 35;
                break;
            }
          }

          return matchesSearch && matchesTrimestre && matchesRiesgo && matchesEdad;
        });
      },

      getGestantesStats: () => {
        const gestantes = get().gestantes;
        
        const stats = {
          total: gestantes.length,
          porTrimestre: { '1': 0, '2': 0, '3': 0 },
          porRiesgo: { bajo: 0, medio: 0, alto: 0 },
          porEdad: { adolescente: 0, adulta: 0, mayor: 0 },
        };

        gestantes.forEach((gestante) => {
          // Por trimestre (calculado desde edadGestacional)
          const trimestre = Math.ceil(gestante.edadGestacional / 13);
          if (trimestre >= 1 && trimestre <= 3) {
            stats.porTrimestre[trimestre.toString() as '1' | '2' | '3']++;
          }

          // Por riesgo (basado en clasificación)
          const riesgoLevel = gestante.clasificacion === 'ARO' ? 'alto' : 
                             gestante.clasificacion === 'BRO' ? 'medio' : 'bajo';
          stats.porRiesgo[riesgoLevel as 'bajo' | 'medio' | 'alto']++;

          // Por edad
          const edad = gestante.edad;
          if (edad < 20) {
            stats.porEdad.adolescente++;
          } else if (edad < 35) {
            stats.porEdad.adulta++;
          } else {
            stats.porEdad.mayor++;
          }
        });

        return stats;
      },
    }),
    {
      name: 'gestantes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gestantes: state.gestantes,
      }),
    }
  )
);
