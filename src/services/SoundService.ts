import { Vibration } from 'react-native';

export class SoundService {
  private static isEnabled: boolean = true;

  // Tipos de sonidos disponibles
  static readonly SOUND_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    CLICK: 'click',
    NOTIFICATION: 'notification',
    SAVE: 'save',
    DELETE: 'delete',
  };

  /**
   * Inicializar el servicio de sonidos
   */
  static async initialize() {
    // Para vibración no necesitamos inicialización especial
  }

  /**
   * Reproducir sonido del sistema (vibración como fallback)
   */
  static async playSystemSound(type: string) {
    if (!this.isEnabled) return;

    try {
      // Verificar si la vibración está disponible
      if (!Vibration) return;
      
      switch (type) {
        case this.SOUND_TYPES.SUCCESS:
          Vibration.vibrate(300);
          break;
        case this.SOUND_TYPES.ERROR:
          Vibration.vibrate([0, 200, 100, 200]);
          break;
        case this.SOUND_TYPES.CLICK:
          Vibration.vibrate(100);
          break;
        case this.SOUND_TYPES.SAVE:
          Vibration.vibrate(150);
          break;
        case this.SOUND_TYPES.DELETE:
          Vibration.vibrate(200);
          break;
        case this.SOUND_TYPES.NOTIFICATION:
          Vibration.vibrate([0, 100, 50, 100]);
          break;
        default:
          Vibration.vibrate(50);
      }
      
    } catch (error) {
      console.warn('Error reproduciendo feedback sonoro:', error);
    }
  }

  /**
   * Reproducir sonido de éxito
   */
  static async playSuccess() {
    await this.playSystemSound(this.SOUND_TYPES.SUCCESS);
  }

  /**
   * Reproducir sonido de error
   */
  static async playError() {
    await this.playSystemSound(this.SOUND_TYPES.ERROR);
  }

  /**
   * Reproducir sonido de click
   */
  static async playClick() {
    await this.playSystemSound(this.SOUND_TYPES.CLICK);
  }

  /**
   * Reproducir sonido de guardado
   */
  static async playSave() {
    await this.playSystemSound(this.SOUND_TYPES.SAVE);
  }

  /**
   * Reproducir sonido de eliminación
   */
  static async playDelete() {
    await this.playSystemSound(this.SOUND_TYPES.DELETE);
  }

  /**
   * Reproducir sonido de notificación
   */
  static async playNotification() {
    await this.playSystemSound(this.SOUND_TYPES.NOTIFICATION);
  }

  /**
   * Habilitar/deshabilitar sonidos
   */
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Verificar si los sonidos están habilitados
   */
  static isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Limpiar recursos de audio
   */
  static async cleanup() {
    // Para vibración no hay recursos que limpiar
  }
}

// Inicializar el servicio al importar
SoundService.initialize();
