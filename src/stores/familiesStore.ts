import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamiliaData, IntegranteData } from '../types';
import { StorageService } from '../services/StorageService';

export interface FamiliesState {
  // Estado
  familias: FamiliaData[];
  integrantes: IntegranteData[];
  selectedFamilia: FamiliaData | null;
  isLoading: boolean;
  
  // Acciones - Familias
  setFamilias: (familias: FamiliaData[]) => void;
  addFamilia: (familia: FamiliaData) => void;
  updateFamilia: (id: string, updates: Partial<FamiliaData>) => void;
  deleteFamilia: (id: string) => void;
  selectFamilia: (familia: FamiliaData | null) => void;
  
  // Acciones - Integrantes
  setIntegrantes: (integrantes: IntegranteData[]) => void;
  addIntegrante: (integrante: IntegranteData) => void;
  updateIntegrante: (id: string, updates: Partial<IntegranteData>) => void;
  deleteIntegrante: (id: string) => Promise<void>;
  
  // Acciones - Loading y Data
  setLoading: (loading: boolean) => void;
  loadFamilies: () => Promise<void>;
  loadIntegrantes: () => Promise<void>;
  
  // Getters
  getFamiliaById: (id: string) => Promise<FamiliaData | undefined>;
  getIntegranteById: (id: string) => Promise<IntegranteData | undefined>;
  getIntegrantesByFamilia: (familiaId: string) => Promise<IntegranteData[]>;
  getFamiliaStats: () => {
    totalFamilias: number;
    totalIntegrantes: number;
    promedioIntegrantesPorFamilia: number;
  };
}

export const useFamiliesStore = create<FamiliesState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      familias: [],
      integrantes: [],
      selectedFamilia: null,
      isLoading: false,

      // Acciones - Familias
      setFamilias: (familias: FamiliaData[]) => {
        set({ familias });
      },

      addFamilia: (familia: FamiliaData) => {
        set((state) => ({
          familias: [...state.familias, familia],
        }));
      },

      updateFamilia: (id: string, updates: Partial<FamiliaData>) => {
        set((state) => ({
          familias: state.familias.map((familia) =>
            familia.id === id ? { ...familia, ...updates } : familia
          ),
          selectedFamilia:
            state.selectedFamilia?.id === id
              ? { ...state.selectedFamilia, ...updates }
              : state.selectedFamilia,
        }));
      },

      deleteFamilia: (id: string) => {
        set((state) => ({
          familias: state.familias.filter((familia) => familia.id !== id),
          integrantes: state.integrantes.filter((integrante) => integrante.familiaId !== id),
          selectedFamilia:
            state.selectedFamilia?.id === id ? null : state.selectedFamilia,
        }));
      },

      selectFamilia: (familia: FamiliaData | null) => {
        set({ selectedFamilia: familia });
      },

      // Acciones - Integrantes
      setIntegrantes: (integrantes: IntegranteData[]) => {
        set({ integrantes });
      },

      addIntegrante: (integrante: IntegranteData) => {
        set((state) => ({
          integrantes: [...state.integrantes, integrante],
        }));
      },

      updateIntegrante: (id: string, updates: Partial<IntegranteData>) => {
        set((state) => ({
          integrantes: state.integrantes.map((integrante) =>
            integrante.id === id ? { ...integrante, ...updates } : integrante
          ),
        }));
      },

      deleteIntegrante: async (id: string) => {
        try {
          // Eliminar del storage
          await StorageService.eliminarIntegrante(id);
          
          // Actualizar estado local
          set((state) => ({
            integrantes: state.integrantes.filter((integrante) => integrante.id !== id),
          }));
        } catch (error) {
          console.error('Error eliminando integrante:', error);
          throw error;
        }
      },

      // Acciones - Loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Acciones - Data Loading
      loadFamilies: async () => {
        try {
          set({ isLoading: true });
          const familias = await StorageService.obtenerFamilias();
          set({ familias, isLoading: false });
        } catch (error) {
          console.error('Error cargando familias:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      loadIntegrantes: async () => {
        try {
          set({ isLoading: true });
          const integrantes = await StorageService.obtenerIntegrantes();
          set({ integrantes, isLoading: false });
        } catch (error) {
          console.error('Error cargando integrantes:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Getters
      getFamiliaById: async (id: string) => {
        const { familias, loadFamilies } = get();
        
        console.log('🏪 Store - Buscando familia con ID:', id);
        console.log('📊 Familias en store:', familias.length);
        
        // Si no hay familias cargadas, cargarlas primero
        if (familias.length === 0) {
          console.log('📥 Cargando familias desde storage...');
          await loadFamilies();
        }
        
        const todasLasFamilias = get().familias;
        console.log('📋 IDs de familias disponibles:', todasLasFamilias.map(f => f.id));
        
        const familiaEncontrada = todasLasFamilias.find((familia) => familia.id === id);
        console.log('🎯 Familia encontrada en store:', familiaEncontrada ? 'SÍ' : 'NO');
        
        return familiaEncontrada;
      },

      getIntegranteById: async (id: string) => {
        const { integrantes, loadIntegrantes } = get();
        
        // Si no hay integrantes cargados, cargarlos primero
        if (integrantes.length === 0) {
          await loadIntegrantes();
        }
        
        return get().integrantes.find((integrante) => integrante.id === id);
      },

      getIntegrantesByFamilia: async (familiaId: string) => {
        const { integrantes, loadIntegrantes } = get();
        
        // Si no hay integrantes cargados, cargarlos primero
        if (integrantes.length === 0) {
          await loadIntegrantes();
        }
        
        return get().integrantes.filter((integrante) => integrante.familiaId === familiaId);
      },

      getFamiliaStats: () => {
        const { familias, integrantes } = get();
        const totalFamilias = familias.length;
        const totalIntegrantes = integrantes.length;
        const promedioIntegrantesPorFamilia = totalFamilias > 0 
          ? Math.round((totalIntegrantes / totalFamilias) * 100) / 100 
          : 0;

        return {
          totalFamilias,
          totalIntegrantes,
          promedioIntegrantesPorFamilia,
        };
      },
    }),
    {
      name: 'families-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        familias: state.familias,
        integrantes: state.integrantes,
      }),
    }
  )
);
