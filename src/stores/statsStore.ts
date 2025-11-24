import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamiliaData, IntegranteData } from '../types';
import { GestanteData } from '../types/PAMITypes';
import { StorageService } from '../services/StorageService';

// Tipos para estadísticas
export interface EstadisticasPorGrupo {
  grupoI: number;
  grupoII: number;
  grupoIII: number;
  grupoIV: number;
}

export interface EstadisticasPorEdad {
  menores5: number;
  entre5y18: number;
  entre19y59: number;
  mayores60: number;
}

export interface EstadisticasPorSexo {
  masculino: number;
  femenino: number;
}

export interface EstadisticasGenerales {
  totalFamilias: number;
  totalIntegrantes: number;
  totalGestantes: number;
  promedioIntegrantesPorFamilia: number;
  porcentajeGestantes: number;
}

export interface ReporteCompleto {
  generales: EstadisticasGenerales;
  porGrupo: EstadisticasPorGrupo;
  porEdad: EstadisticasPorEdad;
  porSexo: EstadisticasPorSexo;
  fechaGeneracion: string;
}

export interface FiltrosEstadisticas {
  poblacion?: string;
  consultorio?: string;
  grupoDispensarial?: string;
  edadMin?: number;
  edadMax?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface StatsState {
  // Estado
  reporteActual: ReporteCompleto | null;
  filtrosActivos: FiltrosEstadisticas;
  isGenerating: boolean;
  ultimaActualizacion: string | null;
  reportesGuardados: ReporteCompleto[];
  
  // Acciones
  generateReport: (filtros?: FiltrosEstadisticas) => Promise<void>;
  setFiltros: (filtros: FiltrosEstadisticas) => void;
  clearFiltros: () => void;
  saveReport: (nombre: string) => void;
  deleteReport: (index: number) => void;
  exportReport: (formato: 'json' | 'csv') => Promise<string>;
  
  // Getters
  getEstadisticasGenerales: () => EstadisticasGenerales | null;
  getEstadisticasPorGrupo: () => EstadisticasPorGrupo | null;
  getEstadisticasPorEdad: () => EstadisticasPorEdad | null;
  getEstadisticasPorSexo: () => EstadisticasPorSexo | null;
  hasActiveFilters: () => boolean;
  getFilterCount: () => number;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      reporteActual: null,
      filtrosActivos: {},
      isGenerating: false,
      ultimaActualizacion: null,
      reportesGuardados: [],

      // Acciones
      generateReport: async (filtros?: FiltrosEstadisticas) => {
        set({ isGenerating: true });
        
        try {
          // Aplicar filtros si se proporcionan
          if (filtros) {
            set({ filtrosActivos: filtros });
          }
          
          const filtrosActuales = filtros || get().filtrosActivos;
          
          // Cargar datos
          const familias = await StorageService.obtenerFamilias();
          const integrantes = await StorageService.obtenerIntegrantes();
          
          // Obtener gestantes desde el gestantesStore
          const { useGestantesStore } = await import('./gestantesStore');
          const gestantesState = useGestantesStore.getState();
          const gestantes = gestantesState.gestantes;
          
          // Filtrar datos según criterios
          let familiasFiltradas = familias;
          let integrantesFiltrados = integrantes;
          
          // Aplicar filtros de familia
          if (filtrosActuales.poblacion) {
            familiasFiltradas = familiasFiltradas.filter(f => 
              f.poblacion.toLowerCase().includes(filtrosActuales.poblacion!.toLowerCase())
            );
          }
          
          if (filtrosActuales.consultorio) {
            familiasFiltradas = familiasFiltradas.filter(f => 
              f.consultorio.toLowerCase().includes(filtrosActuales.consultorio!.toLowerCase())
            );
          }
          
          // Filtrar integrantes por familias válidas
          const familiaIds = new Set(familiasFiltradas.map(f => f.id));
          integrantesFiltrados = integrantesFiltrados.filter(i => 
            familiaIds.has(i.familiaId)
          );
          
          // Aplicar filtros de integrantes
          if (filtrosActuales.grupoDispensarial) {
            integrantesFiltrados = integrantesFiltrados.filter(i => 
              i.grupoDispensarial === filtrosActuales.grupoDispensarial
            );
          }
          
          if (filtrosActuales.edadMin !== undefined) {
            integrantesFiltrados = integrantesFiltrados.filter(i => 
              i.edad >= filtrosActuales.edadMin!
            );
          }
          
          if (filtrosActuales.edadMax !== undefined) {
            integrantesFiltrados = integrantesFiltrados.filter(i => 
              i.edad <= filtrosActuales.edadMax!
            );
          }
          
          // Calcular estadísticas generales
          const totalFamilias = familiasFiltradas.length;
          const totalIntegrantes = integrantesFiltrados.length;
          const totalGestantes = gestantes.length;
          
          const generales: EstadisticasGenerales = {
            totalFamilias,
            totalIntegrantes,
            totalGestantes,
            promedioIntegrantesPorFamilia: totalFamilias > 0 ? 
              Math.round((totalIntegrantes / totalFamilias) * 100) / 100 : 0,
            porcentajeGestantes: totalIntegrantes > 0 ? 
              Math.round((totalGestantes / totalIntegrantes) * 10000) / 100 : 0,
          };
          
          // Calcular estadísticas por grupo dispensarial
          const porGrupo: EstadisticasPorGrupo = {
            grupoI: integrantesFiltrados.filter(i => i.grupoDispensarial === 'I').length,
            grupoII: integrantesFiltrados.filter(i => i.grupoDispensarial === 'II').length,
            grupoIII: integrantesFiltrados.filter(i => i.grupoDispensarial === 'III').length,
            grupoIV: integrantesFiltrados.filter(i => i.grupoDispensarial === 'IV').length,
          };
          
          // Calcular estadísticas por edad
          const porEdad: EstadisticasPorEdad = {
            menores5: integrantesFiltrados.filter(i => i.edad < 5).length,
            entre5y18: integrantesFiltrados.filter(i => i.edad >= 5 && i.edad <= 18).length,
            entre19y59: integrantesFiltrados.filter(i => i.edad >= 19 && i.edad <= 59).length,
            mayores60: integrantesFiltrados.filter(i => i.edad >= 60).length,
          };
          
          // Calcular estadísticas por sexo
          const porSexo: EstadisticasPorSexo = {
            masculino: integrantesFiltrados.filter(i => i.sexo === 'Masculino').length,
            femenino: integrantesFiltrados.filter(i => i.sexo === 'Femenino').length,
          };
          
          // Crear reporte completo
          const reporte: ReporteCompleto = {
            generales,
            porGrupo,
            porEdad,
            porSexo,
            fechaGeneracion: new Date().toISOString(),
          };
          
          set({
            reporteActual: reporte,
            ultimaActualizacion: new Date().toISOString(),
          });
          
        } catch (error) {
          console.error('Error generando reporte:', error);
          throw error;
        } finally {
          set({ isGenerating: false });
        }
      },

      setFiltros: (filtros: FiltrosEstadisticas) => {
        set({ filtrosActivos: filtros });
      },

      clearFiltros: () => {
        set({ filtrosActivos: {} });
      },

      saveReport: (nombre: string) => {
        const { reporteActual, reportesGuardados } = get();
        if (reporteActual) {
          const reporteConNombre = {
            ...reporteActual,
            nombre,
            fechaGuardado: new Date().toISOString(),
          };
          
          set({
            reportesGuardados: [...reportesGuardados, reporteConNombre],
          });
        }
      },

      deleteReport: (index: number) => {
        const { reportesGuardados } = get();
        const nuevosReportes = reportesGuardados.filter((_, i) => i !== index);
        set({ reportesGuardados: nuevosReportes });
      },

      exportReport: async (formato: 'json' | 'csv') => {
        const { reporteActual } = get();
        if (!reporteActual) {
          throw new Error('No hay reporte para exportar');
        }
        
        if (formato === 'json') {
          return JSON.stringify(reporteActual, null, 2);
        } else {
          // Convertir a CSV
          const csv = [
            'Categoría,Subcategoría,Valor',
            `Generales,Total Familias,${reporteActual.generales.totalFamilias}`,
            `Generales,Total Integrantes,${reporteActual.generales.totalIntegrantes}`,
            `Generales,Total Gestantes,${reporteActual.generales.totalGestantes}`,
            `Generales,Promedio Integrantes por Familia,${reporteActual.generales.promedioIntegrantesPorFamilia}`,
            `Generales,Porcentaje Gestantes,${reporteActual.generales.porcentajeGestantes}%`,
            `Grupos,Grupo I,${reporteActual.porGrupo.grupoI}`,
            `Grupos,Grupo II,${reporteActual.porGrupo.grupoII}`,
            `Grupos,Grupo III,${reporteActual.porGrupo.grupoIII}`,
            `Grupos,Grupo IV,${reporteActual.porGrupo.grupoIV}`,
            `Edades,Menores de 5,${reporteActual.porEdad.menores5}`,
            `Edades,Entre 5 y 18,${reporteActual.porEdad.entre5y18}`,
            `Edades,Entre 19 y 59,${reporteActual.porEdad.entre19y59}`,
            `Edades,Mayores de 60,${reporteActual.porEdad.mayores60}`,
            `Sexo,Masculino,${reporteActual.porSexo.masculino}`,
            `Sexo,Femenino,${reporteActual.porSexo.femenino}`,
          ].join('\n');
          
          return csv;
        }
      },

      // Getters
      getEstadisticasGenerales: () => {
        return get().reporteActual?.generales || null;
      },

      getEstadisticasPorGrupo: () => {
        return get().reporteActual?.porGrupo || null;
      },

      getEstadisticasPorEdad: () => {
        return get().reporteActual?.porEdad || null;
      },

      getEstadisticasPorSexo: () => {
        return get().reporteActual?.porSexo || null;
      },

      hasActiveFilters: () => {
        const filtros = get().filtrosActivos;
        return Object.keys(filtros).length > 0;
      },

      getFilterCount: () => {
        const filtros = get().filtrosActivos;
        return Object.keys(filtros).filter(key => 
          filtros[key as keyof FiltrosEstadisticas] !== undefined &&
          filtros[key as keyof FiltrosEstadisticas] !== ''
        ).length;
      },
    }),
    {
      name: 'stats-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reportesGuardados: state.reportesGuardados,
        ultimaActualizacion: state.ultimaActualizacion,
      }),
    }
  )
);
