import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class BiometricService {
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

  /**
   * Verificar si el dispositivo soporta autenticación biométrica
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.warn('Error verificando disponibilidad biométrica:', error);
      return false;
    }
  }

  /**
   * Obtener tipos de autenticación disponibles
   */
  static async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.warn('Error obteniendo tipos de autenticación:', error);
      return [];
    }
  }

  /**
   * Verificar si la huella digital está disponible específicamente
   */
  static async isFingerprintAvailable(): Promise<boolean> {
    try {
      const supportedTypes = await this.getSupportedTypes();
      return supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    } catch (error) {
      console.warn('Error verificando huella digital:', error);
      return false;
    }
  }

  /**
   * Autenticar con huella digital
   */
  static async authenticate(reason: string = 'Verificar identidad'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verificar disponibilidad
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Autenticación biométrica no disponible'
        };
      }

      // Realizar autenticación
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        let errorMessage = 'Autenticación fallida';
        
        if (result.error === 'user_cancel') {
          errorMessage = 'Autenticación cancelada por el usuario';
        } else if (result.error === 'app_cancel') {
          errorMessage = 'Autenticación cancelada por la aplicación';
        } else if (result.error === 'not_available') {
          errorMessage = 'Autenticación biométrica no disponible';
        } else if (result.error === 'not_enrolled') {
          errorMessage = 'No hay huellas registradas en el dispositivo';
        } else if (result.error === 'user_fallback') {
          errorMessage = 'Usuario eligió usar contraseña';
        } else if (result.error === 'authentication_failed') {
          errorMessage = 'Autenticación fallida';
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.warn('Error en autenticación biométrica:', error);
      return {
        success: false,
        error: 'Error técnico en la autenticación'
      };
    }
  }

  /**
   * Verificar si la autenticación biométrica está habilitada en la app
   */
  static async isEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.warn('Error verificando estado biométrico:', error);
      return false;
    }
  }

  /**
   * Habilitar autenticación biométrica
   */
  static async enable(): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar disponibilidad
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Autenticación biométrica no disponible en este dispositivo'
        };
      }

      // Probar autenticación antes de habilitar
      const authResult = await this.authenticate('Confirmar habilitación de huella digital');
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'No se pudo verificar la huella digital'
        };
      }

      // Guardar configuración
      await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
      return { success: true };
    } catch (error) {
      console.warn('Error habilitando autenticación biométrica:', error);
      return {
        success: false,
        error: 'Error técnico al habilitar la autenticación'
      };
    }
  }

  /**
   * Deshabilitar autenticación biométrica
   */
  static async disable(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'false');
    } catch (error) {
      console.warn('Error deshabilitando autenticación biométrica:', error);
    }
  }

  /**
   * Obtener información del estado biométrico
   */
  static async getStatus(): Promise<{
    available: boolean;
    enabled: boolean;
    fingerprintSupported: boolean;
    supportedTypes: string[];
  }> {
    try {
      const available = await this.isAvailable();
      const enabled = await this.isEnabled();
      const fingerprintSupported = await this.isFingerprintAvailable();
      const supportedTypesRaw = await this.getSupportedTypes();
      
      const supportedTypes = supportedTypesRaw.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Huella digital';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Reconocimiento facial';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Desconocido';
        }
      });

      return {
        available,
        enabled,
        fingerprintSupported,
        supportedTypes
      };
    } catch (error) {
      console.warn('Error obteniendo estado biométrico:', error);
      return {
        available: false,
        enabled: false,
        fingerprintSupported: false,
        supportedTypes: []
      };
    }
  }
}
