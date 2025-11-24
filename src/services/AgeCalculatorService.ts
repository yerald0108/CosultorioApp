/**
 * Servicio para cálculo automático de edad basado en fecha de nacimiento
 */
export class AgeCalculatorService {
  /**
   * Calcula la edad actual basada en la fecha de nacimiento
   * @param fechaNacimiento - Fecha de nacimiento del integrante
   * @returns Edad en años completos
   */
  static calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    // Si aún no ha llegado el cumpleaños este año, restar 1
    if (mesActual < mesNacimiento || 
        (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return Math.max(0, edad); // Asegurar que la edad no sea negativa
  }

  /**
   * Valida si una fecha de nacimiento es válida
   * @param fechaNacimiento - Fecha a validar
   * @returns true si es válida, false si no
   */
  static validarFechaNacimiento(fechaNacimiento: Date): boolean {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    // No puede ser fecha futura
    if (nacimiento > hoy) {
      return false;
    }
    
    // No puede ser más de 150 años atrás (límite razonable)
    const hace150Anos = new Date();
    hace150Anos.setFullYear(hoy.getFullYear() - 150);
    
    if (nacimiento < hace150Anos) {
      return false;
    }
    
    return true;
  }

  /**
   * Convierte string de fecha DD/MM/YYYY a objeto Date
   * @param fechaString - String en formato DD/MM/YYYY
   * @returns Objeto Date o null si es inválido
   */
  static parsearFecha(fechaString: string): Date | null {
    try {
      // Validar formato DD/MM/YYYY
      const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = fechaString.match(regex);
      
      if (!match) {
        console.log('❌ Formato de fecha inválido:', fechaString);
        return null;
      }
      
      const dia = parseInt(match[1], 10);
      const mes = parseInt(match[2], 10) - 1; // Los meses en JS van de 0-11
      const año = parseInt(match[3], 10);
      
      const fecha = new Date(año, mes, dia);
      
      // Verificar que la fecha sea válida (no como 31/02/2023)
      if (fecha.getDate() !== dia || 
          fecha.getMonth() !== mes || 
          fecha.getFullYear() !== año) {
        console.log('❌ Fecha inválida después de crear objeto Date');
        return null;
      }
      
      return fecha;
    } catch (error) {
      console.log('❌ Error parseando fecha:', error);
      return null;
    }
  }

  /**
   * Convierte objeto Date a string DD/MM/YYYY
   * @param fecha - Objeto Date
   * @returns String en formato DD/MM/YYYY
   */
  static formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    
    return `${dia}/${mes}/${año}`;
  }

  /**
   * Actualiza la edad de un integrante basándose en su fecha de nacimiento
   * @param integrante - Datos del integrante
   * @returns Integrante con edad actualizada
   */
  static actualizarEdadIntegrante(integrante: any): any {
    if (!integrante.fechaNacimiento) {
      return integrante;
    }
    
    const fechaNacimiento = new Date(integrante.fechaNacimiento);
    const edadActual = this.calcularEdad(fechaNacimiento);
    
    return {
      ...integrante,
      edad: edadActual,
      fechaActualizacion: new Date()
    };
  }

  /**
   * Actualiza las edades de todos los integrantes en una lista
   * @param integrantes - Lista de integrantes
   * @returns Lista con edades actualizadas
   */
  static actualizarEdadesLista(integrantes: any[]): any[] {
    return integrantes.map(integrante => this.actualizarEdadIntegrante(integrante));
  }
}
