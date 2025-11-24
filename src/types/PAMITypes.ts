// Tipos para el módulo PAMI (Programa de Atención Materno Infantil)

export type ClasificacionRiesgo = 'ARO' | 'BRO' | 'RR';

export interface GestanteData {
  id: string;
  nombresApellidos: string;
  edad: number;
  edadGestacional: number; // semanas
  direccion: string;
  carnetIdentidad: string;
  riesgoPresenta: string;
  fum: Date; // Fecha Última Menstruación
  fpp: Date; // Fecha Probable de Parto
  clasificacion: ClasificacionRiesgo;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface LactanteData {
  id: string;
  nombresApellidos: string;
  edad: number; // meses
  direccion: string;
  carnetIdentidad: string;
  tipoLactancia: 'Exclusiva' | 'Mixta' | 'Artificial';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface PuerperaData {
  id: string;
  nombresApellidos: string;
  edad: number;
  direccion: string;
  carnetIdentidad: string;
  fechaParto: Date;
  tipoParto: 'Natural' | 'Cesárea';
  complicaciones: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface FiltrosPAMI {
  nombre?: string;
  edadMin?: number;
  edadMax?: number;
  clasificacion?: ClasificacionRiesgo;
  direccion?: string;
}

export interface EstadisticasPAMI {
  totalGestantes: number;
  totalLactantes: number;
  totalPuerperas: number;
  gestantesARO: number;
  gestantesBRO: number;
  gestantesRR: number;
  promedioEdadGestantes: number;
  promedioEdadGestacional: number;
}

// Tipos para navegación PAMI
export type PAMIStackParamList = {
  PAMIPrincipal: undefined;
  Gestantes: undefined;
  CrearGestante: undefined;
  EditarGestante: { gestanteId: string };
  DetalleGestante: { gestanteId: string };
  SeguimientoGestante: { gestanteId: string };
  Lactantes: undefined;
  CrearLactante: undefined;
  EditarLactante: { lactanteId: string };
  Puerperas: undefined;
  CrearPuerpera: undefined;
  EditarPuerpera: { puerperaId: string };
};

// Opciones de clasificación con descripciones
export const CLASIFICACIONES_RIESGO = {
  ARO: {
    codigo: 'ARO',
    nombre: 'Alto Riesgo Obstétrico',
    descripcion: 'Gestantes con factores de riesgo que requieren seguimiento especializado',
    color: '#F44336'
  },
  BRO: {
    codigo: 'BRO',
    nombre: 'Bajo Riesgo Obstétrico',
    descripcion: 'Gestantes sin factores de riesgo significativos',
    color: '#4CAF50'
  },
  RR: {
    codigo: 'RR',
    nombre: 'Riesgo Relevante',
    descripcion: 'Gestantes con criterio de ingreso en hogar materno o hospital',
    color: '#FF9800'
  }
} as const;

// Validaciones
export const VALIDACIONES_GESTANTE = {
  edadMin: 12,
  edadMax: 50,
  edadGestacionalMin: 1,
  edadGestacionalMax: 42,
  carnetIdentidadLength: 11
};

// Utilidades para cálculos obstétricos
export const calcularFPP = (fum: Date): Date => {
  const fpp = new Date(fum);
  fpp.setDate(fpp.getDate() + 280); // 40 semanas = 280 días
  return fpp;
};

export const calcularEdadGestacional = (fum: Date): number => {
  const hoy = new Date();
  const diferenciaMilisegundos = hoy.getTime() - fum.getTime();
  const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(diferenciaDias / 7);
  const diasAdicionales = diferenciaDias % 7;
  
  // Devolver semanas con decimales: semanas + (días/10) para formato X.Y
  return parseFloat(`${semanas}.${diasAdicionales}`);
};

export const validarCarnetIdentidad = (carnet: string): boolean => {
  // Validación básica para carnet de identidad cubano
  return /^\d{11}$/.test(carnet);
};

export const formatearEdadGestacional = (semanas: number): string => {
  const semanasCompletas = Math.floor(semanas);
  const dias = Math.round((semanas - semanasCompletas) * 7);
  
  if (dias === 0) {
    return `${semanasCompletas} semanas`;
  } else {
    return `${semanasCompletas} semanas y ${dias} días`;
  }
};
