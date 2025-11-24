import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  GestanteData, 
  LactanteData, 
  PuerperaData, 
  EstadisticasPAMI,
  ClasificacionRiesgo,
  calcularFPP,
  calcularEdadGestacional,
  validarCarnetIdentidad
} from '../types/PAMITypes';
import { AuthService } from './AuthService';
import { AccessLogService } from './AccessLogService';

export class PAMIService {
  private static readonly GESTANTES_KEY = 'pami_gestantes';
  private static readonly LACTANTES_KEY = 'pami_lactantes';
  private static readonly PUERPERAS_KEY = 'pami_puerperas';

  // ==================== GESTANTES ====================

  /**
   * Obtener todas las gestantes
   */
  static async obtenerGestantes(): Promise<GestanteData[]> {
    try {
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess('Consulta de gestantes PAMI', sesion?.doctorId);

      const gestantesStr = await AsyncStorage.getItem(this.GESTANTES_KEY);
      if (!gestantesStr) return [];

      const gestantes = JSON.parse(gestantesStr);
      
      // Convertir fechas de string a Date
      return gestantes.map((gestante: any) => ({
        ...gestante,
        fum: new Date(gestante.fum),
        fpp: new Date(gestante.fpp),
        fechaCreacion: new Date(gestante.fechaCreacion),
        fechaActualizacion: new Date(gestante.fechaActualizacion)
      }));
    } catch (error) {
      console.error('Error obteniendo gestantes:', error);
      return [];
    }
  }

  /**
   * Obtener gestante por ID
   */
  static async obtenerGestantePorId(id: string): Promise<GestanteData | null> {
    try {
      const gestantes = await this.obtenerGestantes();
      return gestantes.find(g => g.id === id) || null;
    } catch (error) {
      console.error('Error obteniendo gestante por ID:', error);
      return null;
    }
  }

  /**
   * Crear nueva gestante
   */
  static async crearGestante(datos: Omit<GestanteData, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<{
    success: boolean;
    gestante?: GestanteData;
    error?: string;
  }> {
    try {
      // Validaciones
      const validacion = this.validarDatosGestante(datos);
      if (!validacion.valido) {
        return { success: false, error: validacion.error };
      }

      // Verificar carnet duplicado
      const gestantes = await this.obtenerGestantes();
      const carnetExiste = gestantes.some(g => g.carnetIdentidad === datos.carnetIdentidad);
      if (carnetExiste) {
        return { success: false, error: 'Ya existe una gestante con este carnet de identidad' };
      }

      const nuevaGestante: GestanteData = {
        ...datos,
        id: Date.now().toString(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      };

      gestantes.push(nuevaGestante);
      await AsyncStorage.setItem(this.GESTANTES_KEY, JSON.stringify(gestantes));

      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logEvent('data_creation', `Gestante creada: ${nuevaGestante.nombresApellidos}`, sesion?.doctorId);

      return { success: true, gestante: nuevaGestante };
    } catch (error) {
      console.error('Error creando gestante:', error);
      return { success: false, error: 'Error técnico al crear gestante' };
    }
  }

  /**
   * Actualizar gestante
   */
  static async actualizarGestante(id: string, datos: Partial<Omit<GestanteData, 'id' | 'fechaCreacion'>>): Promise<{
    success: boolean;
    gestante?: GestanteData;
    error?: string;
  }> {
    try {
      const gestantes = await this.obtenerGestantes();
      const indice = gestantes.findIndex(g => g.id === id);
      
      if (indice === -1) {
        return { success: false, error: 'Gestante no encontrada' };
      }

      // Validar carnet duplicado si se está cambiando
      if (datos.carnetIdentidad && datos.carnetIdentidad !== gestantes[indice].carnetIdentidad) {
        const carnetExiste = gestantes.some(g => g.id !== id && g.carnetIdentidad === datos.carnetIdentidad);
        if (carnetExiste) {
          return { success: false, error: 'Ya existe una gestante con este carnet de identidad' };
        }
      }

      const gestanteActualizada: GestanteData = {
        ...gestantes[indice],
        ...datos,
        fechaActualizacion: new Date()
      };

      // Recalcular FPP si se cambió FUM
      if (datos.fum) {
        gestanteActualizada.fpp = calcularFPP(datos.fum);
      }

      gestantes[indice] = gestanteActualizada;
      await AsyncStorage.setItem(this.GESTANTES_KEY, JSON.stringify(gestantes));

      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logEvent('data_update', `Gestante actualizada: ${gestanteActualizada.nombresApellidos}`, sesion?.doctorId);

      return { success: true, gestante: gestanteActualizada };
    } catch (error) {
      console.error('Error actualizando gestante:', error);
      return { success: false, error: 'Error técnico al actualizar gestante' };
    }
  }

  /**
   * Eliminar gestante
   */
  static async eliminarGestante(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const gestantes = await this.obtenerGestantes();
      const gestante = gestantes.find(g => g.id === id);
      
      if (!gestante) {
        return { success: false, error: 'Gestante no encontrada' };
      }

      const gestantesFiltradas = gestantes.filter(g => g.id !== id);
      await AsyncStorage.setItem(this.GESTANTES_KEY, JSON.stringify(gestantesFiltradas));

      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logEvent('data_deletion', `Gestante eliminada: ${gestante.nombresApellidos}`, sesion?.doctorId);

      return { success: true };
    } catch (error) {
      console.error('Error eliminando gestante:', error);
      return { success: false, error: 'Error técnico al eliminar gestante' };
    }
  }

  /**
   * Buscar gestantes con filtros
   */
  static async buscarGestantes(filtros: {
    nombre?: string;
    clasificacion?: ClasificacionRiesgo;
    edadMin?: number;
    edadMax?: number;
  }): Promise<GestanteData[]> {
    try {
      const gestantes = await this.obtenerGestantes();
      
      return gestantes.filter(gestante => {
        // Filtro por nombre
        if (filtros.nombre) {
          const nombreCompleto = gestante.nombresApellidos.toLowerCase();
          const busqueda = filtros.nombre.toLowerCase();
          if (!nombreCompleto.includes(busqueda)) return false;
        }

        // Filtro por clasificación
        if (filtros.clasificacion && gestante.clasificacion !== filtros.clasificacion) {
          return false;
        }

        // Filtro por edad
        if (filtros.edadMin && gestante.edad < filtros.edadMin) return false;
        if (filtros.edadMax && gestante.edad > filtros.edadMax) return false;

        return true;
      });
    } catch (error) {
      console.error('Error buscando gestantes:', error);
      return [];
    }
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas PAMI
   */
  static async obtenerEstadisticas(): Promise<EstadisticasPAMI> {
    try {
      const gestantes = await this.obtenerGestantes();
      const lactantes = await this.obtenerLactantes();
      const puerperas = await this.obtenerPuerperas();

      const gestantesARO = gestantes.filter(g => g.clasificacion === 'ARO').length;
      const gestantesBRO = gestantes.filter(g => g.clasificacion === 'BRO').length;
      const gestantesRR = gestantes.filter(g => g.clasificacion === 'RR').length;

      const promedioEdadGestantes = gestantes.length > 0 
        ? gestantes.reduce((sum, g) => sum + g.edad, 0) / gestantes.length 
        : 0;

      const promedioEdadGestacional = gestantes.length > 0
        ? gestantes.reduce((sum, g) => sum + g.edadGestacional, 0) / gestantes.length
        : 0;

      return {
        totalGestantes: gestantes.length,
        totalLactantes: lactantes.length,
        totalPuerperas: puerperas.length,
        gestantesARO,
        gestantesBRO,
        gestantesRR,
        promedioEdadGestantes: Math.round(promedioEdadGestantes * 10) / 10,
        promedioEdadGestacional: Math.round(promedioEdadGestacional * 10) / 10
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalGestantes: 0,
        totalLactantes: 0,
        totalPuerperas: 0,
        gestantesARO: 0,
        gestantesBRO: 0,
        gestantesRR: 0,
        promedioEdadGestantes: 0,
        promedioEdadGestacional: 0
      };
    }
  }

  // ==================== LACTANTES (Placeholder) ====================

  static async obtenerLactantes(): Promise<LactanteData[]> {
    try {
      const lactantesStr = await AsyncStorage.getItem(this.LACTANTES_KEY);
      return lactantesStr ? JSON.parse(lactantesStr) : [];
    } catch (error) {
      console.error('Error obteniendo lactantes:', error);
      return [];
    }
  }

  // ==================== PUÉRPERAS (Placeholder) ====================

  static async obtenerPuerperas(): Promise<PuerperaData[]> {
    try {
      const puerperasStr = await AsyncStorage.getItem(this.PUERPERAS_KEY);
      return puerperasStr ? JSON.parse(puerperasStr) : [];
    } catch (error) {
      console.error('Error obteniendo puérperas:', error);
      return [];
    }
  }

  // ==================== VALIDACIONES ====================

  /**
   * Validar datos de gestante
   */
  private static validarDatosGestante(datos: Omit<GestanteData, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): {
    valido: boolean;
    error?: string;
  } {
    // Validar nombres y apellidos
    if (!datos.nombresApellidos || datos.nombresApellidos.trim().length < 3) {
      return { valido: false, error: 'Los nombres y apellidos deben tener al menos 3 caracteres' };
    }

    // Validar edad
    if (!datos.edad || datos.edad < 12 || datos.edad > 50) {
      return { valido: false, error: 'La edad debe estar entre 12 y 50 años' };
    }

    // Validar edad gestacional
    if (!datos.edadGestacional || datos.edadGestacional < 1 || datos.edadGestacional > 42) {
      return { valido: false, error: 'La edad gestacional debe estar entre 1 y 42 semanas' };
    }

    // Validar carnet de identidad
    if (!validarCarnetIdentidad(datos.carnetIdentidad)) {
      return { valido: false, error: 'El carnet de identidad debe tener 11 dígitos' };
    }

    // Validar dirección
    if (!datos.direccion || datos.direccion.trim().length < 5) {
      return { valido: false, error: 'La dirección debe tener al menos 5 caracteres' };
    }

    // Validar FUM (no puede ser futura)
    const hoy = new Date();
    if (datos.fum > hoy) {
      return { valido: false, error: 'La fecha de última menstruación no puede ser futura' };
    }

    // Validar que FUM sea coherente con edad gestacional
    const edadCalculada = calcularEdadGestacional(datos.fum);
    const diferencia = Math.abs(edadCalculada - datos.edadGestacional);
    if (diferencia > 2) { // Permitir 2 semanas de diferencia
      return { 
        valido: false, 
        error: `La edad gestacional (${datos.edadGestacional} sem.) no coincide con la FUM (${edadCalculada} sem. calculadas)` 
      };
    }

    return { valido: true };
  }

  // ==================== UTILIDADES ====================

  /**
   * Exportar datos PAMI
   */
  static async exportarDatos(): Promise<string> {
    try {
      const gestantes = await this.obtenerGestantes();
      const lactantes = await this.obtenerLactantes();
      const puerperas = await this.obtenerPuerperas();
      const estadisticas = await this.obtenerEstadisticas();

      const datos = {
        fechaExportacion: new Date().toISOString(),
        estadisticas,
        gestantes,
        lactantes,
        puerperas
      };

      return JSON.stringify(datos, null, 2);
    } catch (error) {
      console.error('Error exportando datos PAMI:', error);
      throw new Error('Error al exportar datos PAMI');
    }
  }

  /**
   * Limpiar todos los datos PAMI
   */
  static async limpiarDatos(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.GESTANTES_KEY,
        this.LACTANTES_KEY,
        this.PUERPERAS_KEY
      ]);

      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logEvent('data_deletion', 'Datos PAMI limpiados completamente', sesion?.doctorId);
    } catch (error) {
      console.error('Error limpiando datos PAMI:', error);
      throw new Error('Error al limpiar datos PAMI');
    }
  }
}
