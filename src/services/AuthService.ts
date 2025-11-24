import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoctorData, SesionActiva, PasswordStrength } from '../types';

const DOCTORES_KEY = 'consultorio_doctores';
const SESION_ACTIVA_KEY = 'consultorio_sesion_activa';

export class AuthService {
  // Gestión de Doctores
  static async obtenerDoctores(): Promise<DoctorData[]> {
    try {
      const data = await AsyncStorage.getItem(DOCTORES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error obteniendo doctores:', error);
      return [];
    }
  }

  static async guardarDoctores(doctores: DoctorData[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DOCTORES_KEY, JSON.stringify(doctores));
    } catch (error) {
      console.error('Error guardando doctores:', error);
    }
  }

  // Registro de nuevo doctor
  static async registrarDoctor(datos: {
    nombreUsuario: string;
    nombreCompleto: string;
    password: string;
    poblacion: string;
    consultorio: string;
  }): Promise<{ success: boolean; message: string; doctor?: DoctorData }> {
    try {
      const doctores = await this.obtenerDoctores();
      
      // Verificar si el nombre de usuario ya existe
      const usuarioExiste = doctores.find(d => d.nombreUsuario.toLowerCase() === datos.nombreUsuario.toLowerCase());
      if (usuarioExiste) {
        return { success: false, message: 'El nombre de usuario ya está en uso' };
      }

      // Crear nuevo doctor
      const nuevoDoctor: DoctorData = {
        id: Date.now().toString(),
        nombreUsuario: datos.nombreUsuario.trim(),
        nombreCompleto: datos.nombreCompleto.trim(),
        password: datos.password, // En producción debería hashearse
        poblacion: datos.poblacion.trim(),
        consultorio: datos.consultorio.trim(),
        fechaCreacion: new Date(),
        fechaUltimoAcceso: new Date(),
      };

      doctores.push(nuevoDoctor);
      await this.guardarDoctores(doctores);

      return { 
        success: true, 
        message: 'Cuenta creada exitosamente',
        doctor: nuevoDoctor 
      };
    } catch (error) {
      console.error('Error registrando doctor:', error);
      return { success: false, message: 'Error al crear la cuenta' };
    }
  }

  // Inicio de sesión
  static async iniciarSesion(nombreUsuario: string, password: string): Promise<{ 
    success: boolean; 
    message: string; 
    doctor?: DoctorData 
  }> {
    try {
      const doctores = await this.obtenerDoctores();
      
      const doctor = doctores.find(d => 
        d.nombreUsuario.toLowerCase() === nombreUsuario.toLowerCase() && 
        d.password === password
      );

      if (!doctor) {
        return { success: false, message: 'Usuario o contraseña incorrectos' };
      }

      // Actualizar último acceso
      doctor.fechaUltimoAcceso = new Date();
      await this.guardarDoctores(doctores);

      // Crear sesión activa
      const sesion: SesionActiva = {
        doctorId: doctor.id,
        nombreUsuario: doctor.nombreUsuario,
        nombreCompleto: doctor.nombreCompleto,
        poblacion: doctor.poblacion,
        consultorio: doctor.consultorio,
        fechaInicio: new Date(),
      };

      await this.guardarSesionActiva(sesion);

      return { 
        success: true, 
        message: 'Inicio de sesión exitoso',
        doctor 
      };
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }

  // Gestión de sesión activa
  static async guardarSesionActiva(sesion: SesionActiva): Promise<void> {
    try {
      await AsyncStorage.setItem(SESION_ACTIVA_KEY, JSON.stringify(sesion));
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  }

  static async obtenerSesionActiva(): Promise<SesionActiva | null> {
    try {
      const data = await AsyncStorage.getItem(SESION_ACTIVA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }
  }

  static async cerrarSesion(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESION_ACTIVA_KEY);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  }

  // Actualizar perfil del doctor
  static async actualizarPerfil(datosActualizados: Partial<Omit<DoctorData, 'id' | 'fechaCreacion'>>): Promise<DoctorData> {
    try {
      const sesion = await this.obtenerSesionActiva();
      if (!sesion) {
        throw new Error('No hay sesión activa');
      }

      const doctores = await this.obtenerDoctores();
      const indiceDoctor = doctores.findIndex(d => d.id === sesion.doctorId);
      
      if (indiceDoctor === -1) {
        throw new Error('Doctor no encontrado');
      }

      // Verificar si el nuevo nombre de usuario ya existe (si se está cambiando)
      if (datosActualizados.nombreUsuario && datosActualizados.nombreUsuario !== doctores[indiceDoctor].nombreUsuario) {
        const usuarioExiste = doctores.some(d => d.nombreUsuario === datosActualizados.nombreUsuario && d.id !== sesion.doctorId);
        if (usuarioExiste) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }

      // Actualizar datos del doctor
      const doctorActualizado: DoctorData = {
        ...doctores[indiceDoctor],
        ...datosActualizados,
        fechaUltimoAcceso: new Date(),
      };

      doctores[indiceDoctor] = doctorActualizado;
      await AsyncStorage.setItem(DOCTORES_KEY, JSON.stringify(doctores));

      return doctorActualizado;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  static async cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Promise<void> {
    try {
      const sesion = await this.obtenerSesionActiva();
      if (!sesion) {
        throw new Error('No hay sesión activa');
      }

      const doctores = await this.obtenerDoctores();
      const doctor = doctores.find(d => d.id === sesion.doctorId);
      
      if (!doctor) {
        throw new Error('Doctor no encontrado');
      }

      // Verificar contraseña actual
      if (doctor.password !== contrasenaActual) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Validar nueva contraseña
      const validacion = this.validarPassword(contrasenaNueva);
      if (!validacion.valido) {
        throw new Error('La nueva contraseña no es válida');
      }

      // Actualizar contraseña
      await this.actualizarPerfil({ password: contrasenaNueva });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  // Recuperar contraseña por pregunta de seguridad (offline)
  static async recuperarContrasena(usuario: string, respuestaSeguridad: string): Promise<string> {
    try {
      const doctores = await this.obtenerDoctores();
      const doctor = doctores.find(d => d.nombreUsuario.toLowerCase() === usuario.toLowerCase());
      
      if (!doctor) {
        throw new Error('Usuario no encontrado');
      }

      // Por seguridad offline, usamos el nombre completo como "pregunta de seguridad"
      const respuestaCorrecta = doctor.nombreCompleto.toLowerCase().trim();
      const respuestaIngresada = respuestaSeguridad.toLowerCase().trim();
      
      if (respuestaCorrecta !== respuestaIngresada) {
        throw new Error('La respuesta de seguridad es incorrecta');
      }

      // Generar contraseña temporal
      const contrasenaTemporalGenerada = this.generarContrasenaTemporal();
      
      // Actualizar la contraseña del doctor
      const indiceDoctor = doctores.findIndex(d => d.id === doctor.id);
      doctores[indiceDoctor] = {
        ...doctor,
        password: contrasenaTemporalGenerada,
        fechaUltimoAcceso: new Date(),
      };
      
      await AsyncStorage.setItem(DOCTORES_KEY, JSON.stringify(doctores));
      
      return contrasenaTemporalGenerada;
    } catch (error) {
      console.error('Error recuperando contraseña:', error);
      throw error;
    }
  }

  // Generar contraseña temporal
  private static generarContrasenaTemporal(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let contrasenaTemporal = '';
    for (let i = 0; i < 8; i++) {
      contrasenaTemporal += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contrasenaTemporal;
  }

  // Verificar si hay sesión activa
  static async verificarSesion(): Promise<boolean> {
    const sesion = await this.obtenerSesionActiva();
    return sesion !== null;
  }

  // Validador de fortaleza de contraseña
  static evaluarFortalezaPassword(password: string): PasswordStrength {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let level: PasswordStrength['level'];
    let color: string;
    let emoji: string;
    let message: string;

    switch (score) {
      case 0:
      case 1:
        level = 'muy-debil';
        color = '#FF4444';
        emoji = '🔴';
        message = 'Muy débil';
        break;
      case 2:
        level = 'debil';
        color = '#FF8800';
        emoji = '🟠';
        message = 'Débil';
        break;
      case 3:
        level = 'media';
        color = '#FFBB00';
        emoji = '🟡';
        message = 'Media';
        break;
      case 4:
        level = 'fuerte';
        color = '#88CC00';
        emoji = '🟢';
        message = 'Fuerte';
        break;
      case 5:
        level = 'muy-fuerte';
        color = '#00AA00';
        emoji = '✅';
        message = 'Muy fuerte';
        break;
      default:
        level = 'muy-debil';
        color = '#FF4444';
        emoji = '🔴';
        message = 'Muy débil';
    }

    return {
      score,
      level,
      color,
      emoji,
      message,
      requirements,
    };
  }

  // Obtener datos del doctor actual
  static async obtenerDoctorActual(): Promise<DoctorData | null> {
    try {
      const sesion = await this.obtenerSesionActiva();
      if (!sesion) return null;

      const doctores = await this.obtenerDoctores();
      return doctores.find(d => d.id === sesion.doctorId) || null;
    } catch (error) {
      console.error('Error obteniendo doctor actual:', error);
      return null;
    }
  }

  // Validaciones
  static validarNombreUsuario(nombreUsuario: string): { valido: boolean; mensaje?: string } {
    if (!nombreUsuario.trim()) {
      return { valido: false, mensaje: 'El nombre de usuario es requerido' };
    }
    if (nombreUsuario.length < 3) {
      return { valido: false, mensaje: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }
    if (nombreUsuario.length > 20) {
      return { valido: false, mensaje: 'El nombre de usuario no puede tener más de 20 caracteres' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(nombreUsuario)) {
      return { valido: false, mensaje: 'Solo se permiten letras, números y guiones bajos' };
    }
    return { valido: true };
  }

  static validarPassword(password: string): { valido: boolean; mensaje?: string } {
    if (!password) {
      return { valido: false, mensaje: 'La contraseña es requerida' };
    }
    if (password.length < 6) {
      return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valido: true };
  }

  // Utilidades
  static async limpiarTodosLosDatos(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([DOCTORES_KEY, SESION_ACTIVA_KEY]);
    } catch (error) {
      console.error('Error limpiando datos de autenticación:', error);
    }
  }

  static async obtenerEstadisticasAuth() {
    const doctores = await this.obtenerDoctores();
    const sesion = await this.obtenerSesionActiva();

    return {
      totalDoctores: doctores.length,
      sesionActiva: sesion !== null,
      doctorActual: sesion?.nombreCompleto || 'Ninguno',
      poblaciones: [...new Set(doctores.map(d => d.poblacion))],
      consultorios: [...new Set(doctores.map(d => d.consultorio))],
    };
  }
}
