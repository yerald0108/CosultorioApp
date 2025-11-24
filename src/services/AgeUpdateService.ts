import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgeCalculatorService } from './AgeCalculatorService';
import { StorageService } from './StorageService';

/**
 * Servicio especializado para actualización automática de edades
 * Se ejecuta cada vez que la aplicación inicia o cuando se accede a los datos
 */
export class AgeUpdateService {
  private static readonly LAST_UPDATE_KEY = 'consultorio_last_age_update';
  
  /**
   * Verifica si es necesario actualizar las edades
   * Se considera necesario si:
   * 1. Nunca se ha actualizado
   * 2. Ha pasado más de 1 día desde la última actualización
   */
  static async necesitaActualizacion(): Promise<boolean> {
    try {
      const ultimaActualizacion = await AsyncStorage.getItem(this.LAST_UPDATE_KEY);
      
      if (!ultimaActualizacion) {
        return true; // Primera vez, necesita actualización
      }
      
      const fechaUltimaActualizacion = new Date(ultimaActualizacion);
      const ahora = new Date();
      
      // Verificar si ha pasado al menos 1 día (24 horas)
      const diferenciaMilisegundos = ahora.getTime() - fechaUltimaActualizacion.getTime();
      const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60);
      
      return diferenciaHoras >= 24;
    } catch (error) {
      console.error('Error verificando necesidad de actualización:', error);
      return true; // En caso de error, actualizar por seguridad
    }
  }
  
  /**
   * Actualiza todas las edades de los integrantes basándose en sus fechas de nacimiento
   */
  static async actualizarTodasLasEdades(): Promise<{ actualizados: number; errores: number }> {
    let actualizados = 0;
    let errores = 0;
    
    try {
      console.log('🔄 Iniciando actualización automática de edades...');
      
      // Obtener integrantes directamente del storage (sin la lógica de actualización automática)
      const clave = 'consultorio_integrantes'; // Usar clave base para evitar recursión
      const data = await AsyncStorage.getItem(clave);
      const integrantes = data ? JSON.parse(data) : [];
      
      if (integrantes.length === 0) {
        console.log('📝 No hay integrantes para actualizar');
        return { actualizados: 0, errores: 0 };
      }
      
      // Actualizar cada integrante
      const integrantesActualizados = integrantes.map((integrante: any) => {
        try {
          if (integrante.fechaNacimiento) {
            const fechaNacimiento = new Date(integrante.fechaNacimiento);
            const edadAnterior = integrante.edad;
            const edadActual = AgeCalculatorService.calcularEdad(fechaNacimiento);
            
            if (edadActual !== edadAnterior) {
              console.log(`👤 ${integrante.nombre}: ${edadAnterior} → ${edadActual} años`);
              actualizados++;
            }
            
            return {
              ...integrante,
              edad: edadActual,
              fechaActualizacion: new Date()
            };
          }
          return integrante;
        } catch (error) {
          console.error(`❌ Error actualizando edad de ${integrante.nombre}:`, error);
          errores++;
          return integrante;
        }
      });
      
      // Guardar cambios si hubo actualizaciones
      if (actualizados > 0) {
        await AsyncStorage.setItem(clave, JSON.stringify(integrantesActualizados));
        console.log(`✅ ${actualizados} edades actualizadas correctamente`);
      }
      
      // Registrar la fecha de actualización
      await AsyncStorage.setItem(this.LAST_UPDATE_KEY, new Date().toISOString());
      
      return { actualizados, errores };
    } catch (error) {
      console.error('❌ Error en actualización masiva de edades:', error);
      return { actualizados, errores: errores + 1 };
    }
  }
  
  /**
   * Ejecuta la actualización automática si es necesaria
   */
  static async ejecutarActualizacionAutomatica(): Promise<void> {
    try {
      const necesitaActualizacion = await this.necesitaActualizacion();
      
      if (necesitaActualizacion) {
        const resultado = await this.actualizarTodasLasEdades();
        
        if (resultado.actualizados > 0) {
          console.log(`🎂 Actualización automática completada: ${resultado.actualizados} edades actualizadas`);
        }
        
        if (resultado.errores > 0) {
          console.warn(`⚠️ ${resultado.errores} errores durante la actualización automática`);
        }
      } else {
        console.log('✅ Las edades están actualizadas (última actualización: menos de 24 horas)');
      }
    } catch (error) {
      console.error('❌ Error en actualización automática:', error);
    }
  }
  
  /**
   * Fuerza una actualización inmediata (útil para testing o mantenimiento)
   */
  static async forzarActualizacion(): Promise<void> {
    console.log('🔧 Forzando actualización de edades...');
    await this.actualizarTodasLasEdades();
  }
  
  /**
   * Obtiene información sobre la última actualización
   */
  static async obtenerInfoActualizacion(): Promise<{
    ultimaActualizacion: Date | null;
    horasDesdeUltimaActualizacion: number;
    necesitaActualizacion: boolean;
  }> {
    try {
      const ultimaActualizacionStr = await AsyncStorage.getItem(this.LAST_UPDATE_KEY);
      const ultimaActualizacion = ultimaActualizacionStr ? new Date(ultimaActualizacionStr) : null;
      
      let horasDesdeUltimaActualizacion = 0;
      if (ultimaActualizacion) {
        const ahora = new Date();
        const diferenciaMilisegundos = ahora.getTime() - ultimaActualizacion.getTime();
        horasDesdeUltimaActualizacion = diferenciaMilisegundos / (1000 * 60 * 60);
      }
      
      const necesitaActualizacion = await this.necesitaActualizacion();
      
      return {
        ultimaActualizacion,
        horasDesdeUltimaActualizacion,
        necesitaActualizacion
      };
    } catch (error) {
      console.error('Error obteniendo info de actualización:', error);
      return {
        ultimaActualizacion: null,
        horasDesdeUltimaActualizacion: 0,
        necesitaActualizacion: true
      };
    }
  }
}
