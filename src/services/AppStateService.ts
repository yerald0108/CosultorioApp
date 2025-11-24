import { AppState, AppStateStatus } from 'react-native';
import { BiometricService } from './BiometricService';
import { AgeUpdateService } from './AgeUpdateService';

export class AppStateService {
  private static instance: AppStateService;
  private static isAuthenticated: boolean = true;
  private static isLocked: boolean = false;
  private static backgroundTime: number = 0;
  private static readonly BACKGROUND_TIMEOUT = 1000; // 1 segundo
  private static lockStateChangeCallbacks: ((isLocked: boolean) => void)[] = [];
  private subscription: any;

  private constructor() {
    this.setupAppStateListener();
  }

  static getInstance(): AppStateService {
    if (!AppStateService.instance) {
      AppStateService.instance = new AppStateService();
    }
    return AppStateService.instance;
  }

  private setupAppStateListener() {
    const subscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.subscription = subscription;
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App va a segundo plano
      AppStateService.backgroundTime = Date.now();
      
    } else if (nextAppState === 'active') {
      // App vuelve al primer plano
      const timeInBackground = Date.now() - AppStateService.backgroundTime;
      
      // Ejecutar actualización de edades cuando la app vuelve del background
      // (especialmente útil si la app estuvo cerrada por mucho tiempo)
      try {
        await AgeUpdateService.ejecutarActualizacionAutomatica();
      } catch (error) {
        console.error('Error actualizando edades al volver del background:', error);
      }
      
      // Si estuvo en segundo plano más del tiempo límite Y no está ya bloqueada, bloquear
      if (timeInBackground > AppStateService.BACKGROUND_TIMEOUT && !AppStateService.isLocked) {
        await this.lockApp();
      }
    }
  };

  private async lockApp() {
    // Verificar si la autenticación biométrica está habilitada
    const isEnabled = await BiometricService.isEnabled();
    
    if (!isEnabled) {
      return; // No bloquear si no está habilitada la biometría
    }

    // Marcar como bloqueada y no autenticada
    AppStateService.isLocked = true;
    AppStateService.isAuthenticated = false;
    
    // Notificar a todos los listeners
    this.notifyLockStateChange(true);
  }

  private notifyLockStateChange(isLocked: boolean) {
    AppStateService.lockStateChangeCallbacks.forEach(callback => {
      try {
        callback(isLocked);
      } catch (error) {
        console.warn('Error en callback de cambio de estado de bloqueo:', error);
      }
    });
  }

  static isUserAuthenticated(): boolean {
    return AppStateService.isAuthenticated;
  }

  static setAuthenticated(authenticated: boolean) {
    AppStateService.isAuthenticated = authenticated;
  }

  static isAppLocked(): boolean {
    return AppStateService.isLocked;
  }

  static unlockApp() {
    AppStateService.isLocked = false;
    AppStateService.isAuthenticated = true;
    
    // Notificar cambio de estado
    if (AppStateService.instance) {
      AppStateService.instance.notifyLockStateChange(false);
    }
  }

  static forceUnlock() {
    AppStateService.isLocked = false;
    AppStateService.isAuthenticated = true;
  }

  static addLockStateChangeListener(callback: (isLocked: boolean) => void) {
    AppStateService.lockStateChangeCallbacks.push(callback);
  }

  static removeLockStateChangeListener(callback: (isLocked: boolean) => void) {
    const index = AppStateService.lockStateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      AppStateService.lockStateChangeCallbacks.splice(index, 1);
    }
  }

  static cleanup() {
    if (AppStateService.instance?.subscription) {
      AppStateService.instance.subscription.remove();
    }
    AppStateService.lockStateChangeCallbacks = [];
  }
}
