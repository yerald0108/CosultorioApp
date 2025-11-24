import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamiliaData, IntegranteData } from '../types';
import { AuthService } from './AuthService';
import { AccessLogService } from './AccessLogService';
import { AgeCalculatorService } from './AgeCalculatorService';
import { AgeUpdateService } from './AgeUpdateService';

const FAMILIAS_KEY = 'consultorio_familias';
const INTEGRANTES_KEY = 'consultorio_integrantes';

export class StorageService {
  // Obtener claves específicas por doctor
  private static async obtenerClaveDoctor(baseKey: string): Promise<string> {
    const sesion = await AuthService.obtenerSesionActiva();
    if (!sesion) {
      throw new Error('No hay sesión activa');
    }
    return `${baseKey}_${sesion.doctorId}`;
  }

  // Familias
  static async obtenerFamilias(): Promise<FamiliaData[]> {
    try {
      // Registrar acceso a datos
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess('Consulta de familias', sesion?.doctorId);
      const clave = await this.obtenerClaveDoctor(FAMILIAS_KEY);
      const data = await AsyncStorage.getItem(clave);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error obteniendo familias:', error);
      return [];
    }
  }

  static async guardarFamilias(familias: FamiliaData[]): Promise<void> {
    try {
      const clave = await this.obtenerClaveDoctor(FAMILIAS_KEY);
      await AsyncStorage.setItem(clave, JSON.stringify(familias));
    } catch (error) {
      console.error('Error guardando familias:', error);
    }
  }

  static async crearFamilia(familia: Omit<FamiliaData, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<FamiliaData> {
    const familias = await this.obtenerFamilias();
    const nuevaFamilia: FamiliaData = {
      ...familia,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    
    familias.push(nuevaFamilia);
    await this.guardarFamilias(familias);
    return nuevaFamilia;
  }

  static async actualizarFamilia(id: string, datos: Partial<FamiliaData>): Promise<void> {
    const familias = await this.obtenerFamilias();
    const index = familias.findIndex(f => f.id === id);
    
    if (index !== -1) {
      familias[index] = {
        ...familias[index],
        ...datos,
        fechaActualizacion: new Date(),
      };
      await this.guardarFamilias(familias);
    }
  }

  static async eliminarFamilia(id: string): Promise<void> {
    const familias = await this.obtenerFamilias();
    const familiasFiltradas = familias.filter(f => f.id !== id);
    await this.guardarFamilias(familiasFiltradas);
    
    // También eliminar integrantes de esta familia
    const integrantes = await this.obtenerIntegrantes();
    const integrantesFiltrados = integrantes.filter(i => i.familiaId !== id);
    await this.guardarIntegrantes(integrantesFiltrados);
  }

  // Integrantes
  static async obtenerIntegrantes(): Promise<IntegranteData[]> {
    try {
      // Ejecutar actualización automática de edades si es necesaria
      await AgeUpdateService.ejecutarActualizacionAutomatica();
      
      // Registrar acceso a datos
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess('Consulta de integrantes', sesion?.doctorId);
      const clave = await this.obtenerClaveDoctor(INTEGRANTES_KEY);
      const data = await AsyncStorage.getItem(clave);
      const integrantes = data ? JSON.parse(data) : [];
      
      // Actualizar edades en tiempo real (por si acaso)
      const integrantesActualizados = integrantes.map((integrante: any) => {
        if (integrante.fechaNacimiento) {
          const edadActual = AgeCalculatorService.calcularEdad(new Date(integrante.fechaNacimiento));
          return {
            ...integrante,
            edad: edadActual
          };
        }
        return integrante;
      });
      
      return integrantesActualizados;
    } catch (error) {
      console.error('Error obteniendo integrantes:', error);
      return [];
    }
  }

  static async guardarIntegrantes(integrantes: IntegranteData[]): Promise<void> {
    try {
      const clave = await this.obtenerClaveDoctor(INTEGRANTES_KEY);
      await AsyncStorage.setItem(clave, JSON.stringify(integrantes));
    } catch (error) {
      console.error('Error guardando integrantes:', error);
    }
  }

  static async obtenerIntegrantesPorFamilia(familiaId: string): Promise<IntegranteData[]> {
    const integrantes = await this.obtenerIntegrantes();
    return integrantes.filter(i => i.familiaId === familiaId);
  }

  static async crearIntegrante(integrante: Omit<IntegranteData, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<IntegranteData> {
    console.log('💾 StorageService.crearIntegrante - Iniciando...');
    console.log('📋 Datos recibidos:', integrante);
    
    const integrantes = await this.obtenerIntegrantes();
    console.log('📊 Integrantes existentes:', integrantes.length);
    
    const nuevoIntegrante: IntegranteData = {
      ...integrante,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    
    console.log('👤 Nuevo integrante creado:', nuevoIntegrante);
    
    integrantes.push(nuevoIntegrante);
    await this.guardarIntegrantes(integrantes);
    
    console.log('✅ Integrante guardado exitosamente. Total integrantes:', integrantes.length);
    return nuevoIntegrante;
  }

  static async actualizarIntegrante(id: string, datos: Partial<IntegranteData>): Promise<void> {
    const integrantes = await this.obtenerIntegrantes();
    const index = integrantes.findIndex(i => i.id === id);
    
    if (index !== -1) {
      integrantes[index] = {
        ...integrantes[index],
        ...datos,
        fechaActualizacion: new Date(),
      };
      await this.guardarIntegrantes(integrantes);
    } else {
      throw new Error(`No se encontró el integrante con ID: ${id}`);
    }
  }

  static async eliminarIntegrante(id: string): Promise<void> {
    const integrantes = await this.obtenerIntegrantes();
    const integrantesFiltrados = integrantes.filter(i => i.id !== id);
    await this.guardarIntegrantes(integrantesFiltrados);
  }

  // Utilidades
  static async limpiarTodosLosDatos(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([FAMILIAS_KEY, INTEGRANTES_KEY]);
    } catch (error) {
      console.error('Error limpiando datos:', error);
    }
  }

  static async obtenerEstadisticas() {
    const familias = await this.obtenerFamilias();
    const integrantes = await this.obtenerIntegrantes();

    const totalFamilias = familias.length;
    const totalIntegrantes = integrantes.length;
    const promedioIntegrantesPorFamilia = totalFamilias > 0 ? totalIntegrantes / totalFamilias : 0;

    // Distribución por sexo con porcentajes
    const masculinoCount = integrantes.filter(i => i.sexo === 'Masculino').length;
    const femeninoCount = integrantes.filter(i => i.sexo === 'Femenino').length;
    
    const distribucionSexo = {
      masculino: {
        cantidad: masculinoCount,
        porcentaje: totalIntegrantes > 0 ? Math.round((masculinoCount / totalIntegrantes) * 100 * 100) / 100 : 0,
      },
      femenino: {
        cantidad: femeninoCount,
        porcentaje: totalIntegrantes > 0 ? Math.round((femeninoCount / totalIntegrantes) * 100 * 100) / 100 : 0,
      },
    };

    // Estadísticas de enfermedades
    const todasLasEnfermedades: string[] = [];
    integrantes.forEach(integrante => {
      todasLasEnfermedades.push(...integrante.enfermedades);
    });

    // Contar enfermedades únicas
    const conteoEnfermedades: { [key: string]: number } = {};
    todasLasEnfermedades.forEach(enfermedad => {
      const enfermedadLimpia = enfermedad.trim().toLowerCase();
      if (enfermedadLimpia) {
        conteoEnfermedades[enfermedadLimpia] = (conteoEnfermedades[enfermedadLimpia] || 0) + 1;
      }
    });

    // Convertir a array y ordenar por cantidad
    const enfermedades = Object.entries(conteoEnfermedades)
      .map(([nombre, cantidad]) => ({
        nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
        cantidad,
        porcentaje: totalIntegrantes > 0 ? Math.round((cantidad / totalIntegrantes) * 100 * 100) / 100 : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Personas sin enfermedades
    const sinEnfermedadesCount = integrantes.filter(i => i.enfermedades.length === 0).length;
    const sinEnfermedades = {
      cantidad: sinEnfermedadesCount,
      porcentaje: totalIntegrantes > 0 ? Math.round((sinEnfermedadesCount / totalIntegrantes) * 100 * 100) / 100 : 0,
    };

    // Distribución por edad
    const distribucionPorEdad = {
      ninos: integrantes.filter(i => i.edad < 18).length,
      adultos: integrantes.filter(i => i.edad >= 18 && i.edad < 65).length,
      adultosMayores: integrantes.filter(i => i.edad >= 65).length,
    };

    // Poblaciones y consultorios únicos
    const poblaciones = [...new Set(familias.map(f => f.poblacion))];
    const consultorios = [...new Set(familias.map(f => f.consultorio))];
    
    // Manzanas únicas (filtrar undefined/null y obtener valores únicos)
    const manzanasUnicas = [...new Set(
      familias
        .filter(f => f.manzana !== undefined && f.manzana !== null)
        .map(f => f.manzana)
    )];
    const totalManzanas = manzanasUnicas.length;

    // Estadísticas de grupos dispensariales
    const grupoICount = integrantes.filter(i => (i.grupoDispensarial || 'I') === 'I').length;
    const grupoIICount = integrantes.filter(i => (i.grupoDispensarial || 'I') === 'II').length;
    const grupoIIICount = integrantes.filter(i => (i.grupoDispensarial || 'I') === 'III').length;
    const grupoIVCount = integrantes.filter(i => (i.grupoDispensarial || 'I') === 'IV').length;

    const gruposDispensariales = {
      grupoI: {
        cantidad: grupoICount,
        porcentaje: totalIntegrantes > 0 ? Math.round((grupoICount / totalIntegrantes) * 100 * 100) / 100 : 0,
      },
      grupoII: {
        cantidad: grupoIICount,
        porcentaje: totalIntegrantes > 0 ? Math.round((grupoIICount / totalIntegrantes) * 100 * 100) / 100 : 0,
      },
      grupoIII: {
        cantidad: grupoIIICount,
        porcentaje: totalIntegrantes > 0 ? Math.round((grupoIIICount / totalIntegrantes) * 100 * 100) / 100 : 0,
      },
      grupoIV: {
        cantidad: grupoIVCount,
        porcentaje: totalIntegrantes > 0 ? Math.round((grupoIVCount / totalIntegrantes) * 100 * 100) / 100 : 0,
      },
    };

    return {
      totalFamilias,
      totalIntegrantes,
      totalManzanas,
      promedioIntegrantesPorFamilia: Math.round(promedioIntegrantesPorFamilia * 100) / 100,
      distribucionSexo,
      enfermedades,
      sinEnfermedades,
      distribucionPorEdad,
      gruposDispensariales,
      poblaciones,
      consultorios,
    };
  }
}
