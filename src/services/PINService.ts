import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

export class PINService {
  private static readonly PIN_ENABLED_KEY = 'pin_enabled';
  private static readonly PIN_HASH_KEY = 'pin_hash';
  private static readonly PIN_ATTEMPTS_KEY = 'pin_attempts';
  private static readonly PIN_LOCKED_UNTIL_KEY = 'pin_locked_until';
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCK_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Verificar si el PIN está habilitado
   */
  static async isEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.PIN_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error verificando PIN habilitado:', error);
      return false;
    }
  }

  /**
   * Verificar si hay un PIN configurado
   */
  static async hasPin(): Promise<boolean> {
    try {
      const hash = await AsyncStorage.getItem(this.PIN_HASH_KEY);
      return hash !== null;
    } catch (error) {
      console.error('Error verificando PIN configurado:', error);
      return false;
    }
  }

  /**
   * Crear/Cambiar PIN
   */
  static async setPin(pin: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validar PIN
      if (!this.isValidPin(pin)) {
        return {
          success: false,
          error: 'El PIN debe tener entre 4 y 6 dígitos'
        };
      }

      // Generar hash del PIN
      const hash = CryptoJS.SHA256(pin).toString();
      
      // Guardar hash y habilitar PIN
      await AsyncStorage.setItem(this.PIN_HASH_KEY, hash);
      await AsyncStorage.setItem(this.PIN_ENABLED_KEY, 'true');
      
      // Limpiar intentos fallidos
      await AsyncStorage.removeItem(this.PIN_ATTEMPTS_KEY);
      await AsyncStorage.removeItem(this.PIN_LOCKED_UNTIL_KEY);

      return { success: true };
    } catch (error) {
      console.error('Error configurando PIN:', error);
      return {
        success: false,
        error: 'Error técnico al configurar el PIN'
      };
    }
  }

  /**
   * Verificar PIN
   */
  static async verifyPin(pin: string): Promise<{
    success: boolean;
    error?: string;
    attemptsLeft?: number;
    lockedUntil?: Date;
  }> {
    try {
      // Verificar si está bloqueado temporalmente
      const lockCheck = await this.checkLockStatus();
      if (!lockCheck.canAttempt) {
        return {
          success: false,
          error: 'PIN bloqueado temporalmente',
          lockedUntil: lockCheck.lockedUntil
        };
      }

      // Obtener hash almacenado
      const storedHash = await AsyncStorage.getItem(this.PIN_HASH_KEY);
      if (!storedHash) {
        return {
          success: false,
          error: 'PIN no configurado'
        };
      }

      // Verificar PIN
      const inputHash = CryptoJS.SHA256(pin).toString();
      
      if (inputHash === storedHash) {
        // PIN correcto - limpiar intentos
        await AsyncStorage.removeItem(this.PIN_ATTEMPTS_KEY);
        await AsyncStorage.removeItem(this.PIN_LOCKED_UNTIL_KEY);
        return { success: true };
      } else {
        // PIN incorrecto - incrementar intentos
        const attempts = await this.incrementAttempts();
        const attemptsLeft = this.MAX_ATTEMPTS - attempts;

        if (attempts >= this.MAX_ATTEMPTS) {
          // Bloquear temporalmente
          const lockedUntil = new Date(Date.now() + this.LOCK_DURATION);
          await AsyncStorage.setItem(this.PIN_LOCKED_UNTIL_KEY, lockedUntil.toISOString());
          
          return {
            success: false,
            error: 'Demasiados intentos fallidos. PIN bloqueado temporalmente.',
            attemptsLeft: 0,
            lockedUntil
          };
        }

        return {
          success: false,
          error: 'PIN incorrecto',
          attemptsLeft
        };
      }
    } catch (error) {
      console.error('Error verificando PIN:', error);
      return {
        success: false,
        error: 'Error técnico en la verificación'
      };
    }
  }

  /**
   * Deshabilitar PIN
   */
  static async disable(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PIN_ENABLED_KEY);
      await AsyncStorage.removeItem(this.PIN_HASH_KEY);
      await AsyncStorage.removeItem(this.PIN_ATTEMPTS_KEY);
      await AsyncStorage.removeItem(this.PIN_LOCKED_UNTIL_KEY);
    } catch (error) {
      console.error('Error deshabilitando PIN:', error);
    }
  }

  /**
   * Obtener información del estado del PIN
   */
  static async getStatus(): Promise<{
    enabled: boolean;
    hasPin: boolean;
    isLocked: boolean;
    attemptsLeft: number;
    lockedUntil?: Date;
  }> {
    const enabled = await this.isEnabled();
    const hasPin = await this.hasPin();
    const lockStatus = await this.checkLockStatus();
    const attempts = await this.getAttempts();
    
    return {
      enabled,
      hasPin,
      isLocked: !lockStatus.canAttempt,
      attemptsLeft: Math.max(0, this.MAX_ATTEMPTS - attempts),
      lockedUntil: lockStatus.lockedUntil
    };
  }

  /**
   * Validar formato del PIN
   */
  private static isValidPin(pin: string): boolean {
    return /^\d{4,6}$/.test(pin);
  }

  /**
   * Verificar estado de bloqueo
   */
  private static async checkLockStatus(): Promise<{
    canAttempt: boolean;
    lockedUntil?: Date;
  }> {
    try {
      const lockedUntilStr = await AsyncStorage.getItem(this.PIN_LOCKED_UNTIL_KEY);
      if (!lockedUntilStr) {
        return { canAttempt: true };
      }

      const lockedUntil = new Date(lockedUntilStr);
      const now = new Date();

      if (now < lockedUntil) {
        return {
          canAttempt: false,
          lockedUntil
        };
      } else {
        // Bloqueo expirado - limpiar
        await AsyncStorage.removeItem(this.PIN_LOCKED_UNTIL_KEY);
        await AsyncStorage.removeItem(this.PIN_ATTEMPTS_KEY);
        return { canAttempt: true };
      }
    } catch (error) {
      console.error('Error verificando bloqueo:', error);
      return { canAttempt: true };
    }
  }

  /**
   * Incrementar contador de intentos
   */
  private static async incrementAttempts(): Promise<number> {
    try {
      const attemptsStr = await AsyncStorage.getItem(this.PIN_ATTEMPTS_KEY);
      const attempts = attemptsStr ? parseInt(attemptsStr) : 0;
      const newAttempts = attempts + 1;
      
      await AsyncStorage.setItem(this.PIN_ATTEMPTS_KEY, newAttempts.toString());
      return newAttempts;
    } catch (error) {
      console.error('Error incrementando intentos:', error);
      return 1;
    }
  }

  /**
   * Obtener número de intentos actuales
   */
  private static async getAttempts(): Promise<number> {
    try {
      const attemptsStr = await AsyncStorage.getItem(this.PIN_ATTEMPTS_KEY);
      return attemptsStr ? parseInt(attemptsStr) : 0;
    } catch (error) {
      console.error('Error obteniendo intentos:', error);
      return 0;
    }
  }
}
