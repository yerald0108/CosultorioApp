export interface FamiliaData {
  id: string;
  numero: string;
  direccion: string;
  poblacion: string;
  consultorio: string;
  manzana?: number; // Número entero de hasta 3 cifras (1-999)
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface IntegranteData {
  id: string;
  familiaId: string;
  nombre: string;
  edad: number; // Calculada automáticamente desde fechaNacimiento
  fechaNacimiento: Date; // Nueva: fecha de nacimiento del integrante
  sexo: 'Masculino' | 'Femenino';
  raza: string;
  enfermedades: string[];
  grupoDispensarial: 'I' | 'II' | 'III' | 'IV';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface FiltrosBusqueda {
  nombre?: string;
  direccion?: string;
  edadMin?: number;
  edadMax?: number;
  sexo?: string;
  raza?: string;
  enfermedad?: string;
  poblacion?: string;
  consultorio?: string;
  grupoDispensarial?: string;
}

export type RootStackParamList = {
  // Pantallas principales
  Main: undefined;
  Familias: undefined;
  CrearFamilia: undefined;
  EditarFamilia: { familiaId: string };
  FamiliaDetalle: { familiaId: string };
  CrearIntegrante: { familiaId: string };
  EditarIntegrante: { integranteId: string; familiaId: string };
  Busqueda: undefined;
  Estadisticas: undefined;
  PAMI: undefined;
  Gestantes: undefined;
  CrearGestante: undefined;
  EditarGestante: { gestanteId: string };
  SeguimientoGestante: { gestanteId: string };
  Configuracion: undefined;
  ConfigurarPIN: undefined;
  MiPerfil: undefined;
  TerminosCondiciones: undefined;
  SoporteTecnico: undefined;
  ManualUsuario: undefined;
  Notificacion: undefined;
  
  // Autenticación
  Login: undefined;
  Register: undefined;
  RecuperarContrasena: undefined;
};

export type TabParamList = {
  Familias: undefined;
  Busqueda: undefined;
  Estadisticas: undefined;
  PAMI: undefined;
  Configuracion: undefined;
};

// Tipos para Autenticación
export interface DoctorData {
  id: string;
  nombreUsuario: string;
  nombreCompleto: string;
  password: string; // En producción debería estar hasheada
  poblacion: string;
  consultorio: string;
  fotoPerfil?: string; // URI de la imagen de perfil
  fechaCreacion: Date;
  fechaUltimoAcceso: Date;
}

export interface SesionActiva {
  doctorId: string;
  nombreUsuario: string;
  nombreCompleto: string;
  poblacion: string;
  consultorio: string;
  fechaInicio: Date;
}

export interface PasswordStrength {
  score: number; // 0-4 (muy débil a muy fuerte)
  level: 'muy-debil' | 'debil' | 'media' | 'fuerte' | 'muy-fuerte';
  color: string;
  emoji: string;
  message: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RecuperarContrasena: undefined;
};

export type RootAuthParamList = {
  Auth: undefined;
  Main: undefined;
};
