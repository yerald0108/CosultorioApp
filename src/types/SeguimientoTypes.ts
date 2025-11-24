// Tipos para el sistema de seguimiento individualizado de gestantes

export interface SeguimientoGestante {
  id: string;
  gestanteId: string;
  fechaCaptacion: Date | null;
  fechaEvaluacion: Date | null; // Calculada automáticamente: fechaCaptacion + 15 días
  marcadores: MarcadorFecha[]; // Array de fechas de marcadores individualizados
  alfafetoproteina: AlfafetoproteínaData; // Fecha única + resultado
  controlesPrenatales: ControlPrenatal[];
  reevaluacion: string;
  cervicometrias: Cervicometria[];
  complementarios: EstudiosComplementarios; // Sistema por trimestres
  interconsultas: Interconsulta[];
  remisionHospital: RemisionHospital | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface AlfafetoproteínaData {
  fecha: Date | null;
  resultado: string;
  realizado: boolean;
}

export interface EstudiosComplementarios {
  primerTrimestre: EstudioTrimestre;
  segundoTrimestre: EstudioTrimestre;
  tercerTrimestre: EstudioTrimestre;
}

export interface EstudioTrimestre {
  semanaInicio: number;
  semanaFin: number;
  estudios: EstudioIndividual[];
  ptg?: PTGData[]; // Solo para 2do y 3er trimestre
}

export interface EstudioIndividual {
  id: string;
  nombre: string;
  abreviatura: string;
  fechaProgramada: Date | null;
  fechaRealizada: Date | null;
  resultado: string;
  realizado: boolean;
}

export interface PTGData {
  id: string;
  tipo: 'segundo_trimestre' | 'tercer_trimestre';
  semanaMinima: number;
  semanaMaxima: number;
  fechaProgramada: Date | null;
  fechaRealizada: Date | null;
  resultado: string;
  realizado: boolean;
}

// Lista de estudios estándar por trimestre
export const ESTUDIOS_ESTANDAR = [
  { nombre: 'Hemoglobina', abreviatura: 'HB' },
  { nombre: 'Hematocrito', abreviatura: 'HTO' },
  { nombre: 'Glicemias', abreviatura: 'Glicemias' },
  { nombre: 'Cituria', abreviatura: 'Cituria' },
  { nombre: 'Urocultivos', abreviatura: 'Urocultivos' },
  { nombre: 'Microalbuminuria', abreviatura: 'Microalbuminuria' },
  { nombre: 'Exudado Vaginal', abreviatura: 'Exudado Vaginal' },
  { nombre: 'Exudado Endocervical', abreviatura: 'Exudado Endocervical' },
  { nombre: 'Serologías', abreviatura: 'Serologías' },
  { nombre: 'VIH', abreviatura: 'VIH' },
  { nombre: 'Antígeno de superficie B', abreviatura: 'ASB' },
  { nombre: 'Electroforesis de hemoglobina', abreviatura: 'Electroforesis Hb' },
  { nombre: 'Grupo y factor RH', abreviatura: 'Grupo y RH' },
  { nombre: 'Heces fecales', abreviatura: 'Heces fecales' },
] as const;

export interface MarcadorFecha {
  id: string;
  fecha: Date;
  descripcion?: string; // Opcional: tipo de marcador o notas
  realizado: boolean; // Si ya se realizó o está pendiente
}

export interface ControlPrenatal {
  id: string;
  fecha: Date;
  semanaGestacional: number;
  peso: number;
  presionArterial: string;
  alturaUterina: number;
  frecuenciaCardiacaFetal: number;
  observaciones: string;
  proximoControl: Date;
}

export interface Cervicometria {
  id: string;
  fecha: Date;
  semanaGestacional: number;
  longitudCervical: number; // en mm
  observaciones: string;
  riesgoPartoPrematuro: 'Bajo' | 'Moderado' | 'Alto';
}

export interface Interconsulta {
  id: string;
  fecha: Date;
  especialidad: string;
  motivo: string;
  resultado: string;
  recomendaciones: string;
  proximaConsulta: Date | null;
}

export interface RemisionHospital {
  id: string;
  fecha: Date;
  motivo: string;
  hospital: string;
  urgencia: 'Programada' | 'Urgente' | 'Emergencia';
  observaciones: string;
  estado: 'Pendiente' | 'Realizada' | 'Cancelada';
}

// Tipos para navegación del seguimiento
export type SeguimientoStackParamList = {
  SeguimientoGestante: { gestanteId: string };
  AgregarControlPrenatal: { seguimientoId: string };
  AgregarCervicometria: { seguimientoId: string };
  AgregarInterconsulta: { seguimientoId: string };
  ProgramarRemision: { seguimientoId: string };
};

// Constantes para validaciones
export const VALIDACIONES_SEGUIMIENTO = {
  pesoMin: 30,
  pesoMax: 150,
  alturaUterinaMin: 10,
  alturaUterinaMax: 50,
  frecuenciaCardiacaMin: 110,
  frecuenciaCardiacaMax: 180,
  longitudCervicalMin: 10,
  longitudCervicalMax: 60,
};

// Especialidades para interconsultas
export const ESPECIALIDADES_INTERCONSULTA = [
  'Obstetricia',
  'Medicina Interna',
  'Cardiología',
  'Endocrinología',
  'Nutrición',
  'Psicología',
  'Genética',
  'Neonatología',
  'Anestesiología',
  'Otras'
] as const;

export type EspecialidadInterconsulta = typeof ESPECIALIDADES_INTERCONSULTA[number];

// Funciones utilitarias
export const calcularFechaEvaluacion = (fechaCaptacion: Date): Date => {
  const fechaEvaluacion = new Date(fechaCaptacion);
  fechaEvaluacion.setDate(fechaEvaluacion.getDate() + 15);
  return fechaEvaluacion;
};

export const diasHastaEvaluacion = (fechaEvaluacion: Date): number => {
  const hoy = new Date();
  const diferencia = fechaEvaluacion.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

export const getEstadoEvaluacion = (fechaEvaluacion: Date): {
  estado: 'pendiente' | 'vencida' | 'hoy';
  diasRestantes: number;
  mensaje: string;
} => {
  const dias = diasHastaEvaluacion(fechaEvaluacion);
  
  if (dias > 0) {
    return {
      estado: 'pendiente',
      diasRestantes: dias,
      mensaje: `Faltan ${dias} días para la evaluación`
    };
  } else if (dias === 0) {
    return {
      estado: 'hoy',
      diasRestantes: 0,
      mensaje: 'Evaluación programada para HOY'
    };
  } else {
    return {
      estado: 'vencida',
      diasRestantes: Math.abs(dias),
      mensaje: `Evaluación vencida hace ${Math.abs(dias)} días`
    };
  }
};

// Funciones para estudios complementarios
export const calcularEdadGestacional = (fum: Date): number => {
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy.getTime() - fum.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diferenciaDias / 7); // Convertir a semanas
};

export const determinarTrimestre = (semanaGestacional: number): 'primero' | 'segundo' | 'tercero' | null => {
  if (semanaGestacional >= 6 && semanaGestacional <= 14) return 'primero';
  if (semanaGestacional >= 15 && semanaGestacional <= 28) return 'segundo';
  if (semanaGestacional >= 29) return 'tercero';
  return null;
};

export const calcularFechaInicioTrimestre = (fum: Date, trimestre: 'primero' | 'segundo' | 'tercero'): Date => {
  const fechaInicio = new Date(fum);
  let semanasAAgregar = 0;
  
  switch (trimestre) {
    case 'primero':
      semanasAAgregar = 6;
      break;
    case 'segundo':
      semanasAAgregar = 15;
      break;
    case 'tercero':
      semanasAAgregar = 29;
      break;
  }
  
  fechaInicio.setDate(fechaInicio.getDate() + (semanasAAgregar * 7));
  return fechaInicio;
};

export const crearEstudiosComplementarios = (fum: Date | null): EstudiosComplementarios => {
  const hoy = new Date();
  const edadGestacionalActual = fum ? calcularEdadGestacional(fum) : 0;
  const trimestreActual = determinarTrimestre(edadGestacionalActual);

  const crearEstudiosTrimestre = (trimestre: 'primero' | 'segundo' | 'tercero'): EstudioTrimestre => {
    const rangos = {
      primero: { inicio: 6, fin: 14 },
      segundo: { inicio: 15, fin: 28 },
      tercero: { inicio: 29, fin: 42 }
    };
    
    // Calcular fecha programada inteligente basada en edad gestacional actual
    let fechaProgramada: Date | null = null;
    if (fum) {
      if (trimestre === 'primero' && edadGestacionalActual <= 14) {
        // Si está en 1er trimestre o antes, programar para semana 6
        fechaProgramada = calcularFechaInicioTrimestre(fum, 'primero');
      } else if (trimestre === 'segundo' && edadGestacionalActual >= 6 && edadGestacionalActual <= 28) {
        // Si está en 2do trimestre, programar para semana 15 o ahora si ya pasó
        const fechaInicio = calcularFechaInicioTrimestre(fum, 'segundo');
        fechaProgramada = fechaInicio < hoy ? hoy : fechaInicio;
      } else if (trimestre === 'tercero' && edadGestacionalActual >= 15) {
        // Si está en 3er trimestre, programar para semana 29 o ahora si ya pasó
        const fechaInicio = calcularFechaInicioTrimestre(fum, 'tercero');
        fechaProgramada = fechaInicio < hoy ? hoy : fechaInicio;
      } else {
        // Para trimestres futuros, usar fecha de inicio normal
        fechaProgramada = calcularFechaInicioTrimestre(fum, trimestre);
      }
    }
    
    const estudios: EstudioIndividual[] = ESTUDIOS_ESTANDAR.map((estudio, index) => ({
      id: `${trimestre}_${index}_${Date.now()}_${Math.random()}`,
      nombre: estudio.nombre,
      abreviatura: estudio.abreviatura,
      fechaProgramada,
      fechaRealizada: null,
      resultado: '',
      realizado: false,
    }));

    const ptg: PTGData[] = [];
    if (trimestre === 'segundo') {
      ptg.push({
        id: `ptg_segundo_${Date.now()}_${Math.random()}`,
        tipo: 'segundo_trimestre',
        semanaMinima: 24,
        semanaMaxima: 26,
        fechaProgramada: null, // Se programa manualmente
        fechaRealizada: null,
        resultado: '',
        realizado: false,
      });
    } else if (trimestre === 'tercero') {
      ptg.push({
        id: `ptg_tercero_${Date.now()}_${Math.random()}`,
        tipo: 'tercer_trimestre',
        semanaMinima: 30,
        semanaMaxima: 32,
        fechaProgramada: null, // Se programa manualmente
        fechaRealizada: null,
        resultado: '',
        realizado: false,
      });
    }

    return {
      semanaInicio: rangos[trimestre].inicio,
      semanaFin: rangos[trimestre].fin,
      estudios,
      ptg: ptg.length > 0 ? ptg : undefined,
    };
  };

  return {
    primerTrimestre: crearEstudiosTrimestre('primero'),
    segundoTrimestre: crearEstudiosTrimestre('segundo'),
    tercerTrimestre: crearEstudiosTrimestre('tercero'),
  };
};
