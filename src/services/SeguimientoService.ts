import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from './AuthService';
import { AccessLogService } from './AccessLogService';
import { 
  SeguimientoGestante, 
  ControlPrenatal, 
  Cervicometria, 
  Interconsulta, 
  RemisionHospital,
  crearEstudiosComplementarios
} from '../types/SeguimientoTypes';

export class SeguimientoService {
  private static readonly STORAGE_KEY = 'seguimientos_gestantes';

  // Obtener clave específica por doctor
  private static async obtenerClaveDoctor(): Promise<string> {
    const sesion = await AuthService.obtenerSesionActiva();
    if (!sesion) {
      throw new Error('No hay sesión activa');
    }
    return `${this.STORAGE_KEY}_${sesion.doctorId}`;
  }

  // Obtener seguimiento de una gestante
  static async obtenerSeguimiento(gestanteId: string): Promise<SeguimientoGestante | null> {
    try {
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess(`Consulta de seguimiento para gestante: ${gestanteId}`, sesion?.doctorId);
      
      const seguimientos = await this.obtenerTodosSeguimientos();
      return seguimientos.find(s => s.gestanteId === gestanteId) || null;
    } catch (error) {
      console.error('Error al obtener seguimiento:', error);
      return null;
    }
  }

  // Crear seguimiento para una gestante
  static async crearSeguimiento(gestanteId: string): Promise<{ success: boolean; data?: SeguimientoGestante; error?: string }> {
    try {
      // Verificar si ya existe seguimiento
      const seguimientoExistente = await this.obtenerSeguimiento(gestanteId);
      if (seguimientoExistente) {
        return { success: false, error: 'Ya existe un seguimiento para esta gestante' };
      }

      const nuevoSeguimiento: SeguimientoGestante = {
        id: Date.now().toString(),
        gestanteId,
        fechaCaptacion: null,
        fechaEvaluacion: null,
        marcadores: [],
        alfafetoproteina: {
          fecha: null,
          resultado: '',
          realizado: false,
        },
        controlesPrenatales: [],
        reevaluacion: '',
        cervicometrias: [],
        complementarios: crearEstudiosComplementarios(null),
        interconsultas: [],
        remisionHospital: null,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      const seguimientos = await this.obtenerTodosSeguimientos();
      seguimientos.push(nuevoSeguimiento);
      
      const clave = await this.obtenerClaveDoctor();
      await AsyncStorage.setItem(clave, JSON.stringify(seguimientos));
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess(`Seguimiento creado para gestante: ${gestanteId}`, sesion?.doctorId);
      
      return { success: true, data: nuevoSeguimiento };
    } catch (error) {
      console.error('Error al crear seguimiento:', error);
      return { success: false, error: 'Error al crear el seguimiento' };
    }
  }

  // Actualizar seguimiento
  static async actualizarSeguimiento(
    seguimientoId: string, 
    datosActualizados: Partial<Omit<SeguimientoGestante, 'id' | 'gestanteId' | 'fechaCreacion'>>
  ): Promise<{ success: boolean; data?: SeguimientoGestante; error?: string }> {
    try {
      const seguimientos = await this.obtenerTodosSeguimientos();
      const indice = seguimientos.findIndex(s => s.id === seguimientoId);
      
      if (indice === -1) {
        return { success: false, error: 'Seguimiento no encontrado' };
      }

      seguimientos[indice] = {
        ...seguimientos[indice],
        ...datosActualizados,
        fechaActualizacion: new Date(),
      };

      const clave = await this.obtenerClaveDoctor();
      await AsyncStorage.setItem(clave, JSON.stringify(seguimientos));
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess(`Seguimiento actualizado: ${seguimientoId}`, sesion?.doctorId);
      
      return { success: true, data: seguimientos[indice] };
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      return { success: false, error: 'Error al actualizar el seguimiento' };
    }
  }

  // Agregar control prenatal
  static async agregarControlPrenatal(
    seguimientoId: string, 
    control: Omit<ControlPrenatal, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const seguimientos = await this.obtenerTodosSeguimientos();
      const seguimiento = seguimientos.find(s => s.id === seguimientoId);
      
      if (!seguimiento) {
        return { success: false, error: 'Seguimiento no encontrado' };
      }

      const nuevoControl: ControlPrenatal = {
        ...control,
        id: Date.now().toString(),
      };

      seguimiento.controlesPrenatales.push(nuevoControl);
      seguimiento.fechaActualizacion = new Date();

      const clave = await this.obtenerClaveDoctor();
      await AsyncStorage.setItem(clave, JSON.stringify(seguimientos));
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess(`Control prenatal agregado al seguimiento: ${seguimientoId}`, sesion?.doctorId);
      
      return { success: true };
    } catch (error) {
      console.error('Error al agregar control prenatal:', error);
      return { success: false, error: 'Error al agregar el control prenatal' };
    }
  }

  // Agregar cervicometría
  static async agregarCervicometria(
    seguimientoId: string, 
    cervicometria: Omit<Cervicometria, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const seguimientos = await this.obtenerTodosSeguimientos();
      const seguimiento = seguimientos.find(s => s.id === seguimientoId);
      
      if (!seguimiento) {
        return { success: false, error: 'Seguimiento no encontrado' };
      }

      const nuevaCervicometria: Cervicometria = {
        ...cervicometria,
        id: Date.now().toString(),
      };

      seguimiento.cervicometrias.push(nuevaCervicometria);
      seguimiento.fechaActualizacion = new Date();

      const clave = await this.obtenerClaveDoctor();
      await AsyncStorage.setItem(clave, JSON.stringify(seguimientos));
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess(`Cervicometría agregada al seguimiento: ${seguimientoId}`, sesion?.doctorId);
      
      return { success: true };
    } catch (error) {
      console.error('Error al agregar cervicometría:', error);
      return { success: false, error: 'Error al agregar la cervicometría' };
    }
  }

  // Agregar interconsulta
  static async agregarInterconsulta(
    seguimientoId: string, 
    interconsulta: Omit<Interconsulta, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const seguimientos = await this.obtenerTodosSeguimientos();
      const seguimiento = seguimientos.find(s => s.id === seguimientoId);
      
      if (!seguimiento) {
        return { success: false, error: 'Seguimiento no encontrado' };
      }

      const nuevaInterconsulta: Interconsulta = {
        ...interconsulta,
        id: Date.now().toString(),
      };

      seguimiento.interconsultas.push(nuevaInterconsulta);
      seguimiento.fechaActualizacion = new Date();

      const clave = await this.obtenerClaveDoctor();
      await AsyncStorage.setItem(clave, JSON.stringify(seguimientos));
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess(`Interconsulta agregada al seguimiento: ${seguimientoId}`, sesion?.doctorId);
      
      return { success: true };
    } catch (error) {
      console.error('Error al agregar interconsulta:', error);
      return { success: false, error: 'Error al agregar la interconsulta' };
    }
  }

  // Programar remisión a hospital
  static async programarRemision(
    seguimientoId: string, 
    remision: Omit<RemisionHospital, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const seguimientos = await this.obtenerTodosSeguimientos();
      const seguimiento = seguimientos.find(s => s.id === seguimientoId);
      
      if (!seguimiento) {
        return { success: false, error: 'Seguimiento no encontrado' };
      }

      const nuevaRemision: RemisionHospital = {
        ...remision,
        id: Date.now().toString(),
      };

      seguimiento.remisionHospital = nuevaRemision;
      seguimiento.fechaActualizacion = new Date();

      const clave = await this.obtenerClaveDoctor();
      await AsyncStorage.setItem(clave, JSON.stringify(seguimientos));
      const sesion = await AuthService.obtenerSesionActiva();
      AccessLogService.logDataAccess(`Remisión programada en seguimiento: ${seguimientoId}`, sesion?.doctorId);
      
      return { success: true };
    } catch (error) {
      console.error('Error al programar remisión:', error);
      return { success: false, error: 'Error al programar la remisión' };
    }
  }

  // Obtener todos los seguimientos
  private static async obtenerTodosSeguimientos(): Promise<SeguimientoGestante[]> {
    try {
      const clave = await this.obtenerClaveDoctor();
      const data = await AsyncStorage.getItem(clave);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener seguimientos:', error);
      return [];
    }
  }
}
