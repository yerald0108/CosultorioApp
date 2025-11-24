import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppState {
  // Estado - Configuración
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  soundEnabled: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  
  // Estado - UI
  isLoading: boolean;
  currentScreen: string;
  navigationHistory: string[];
  
  // Estado - Notificaciones
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  
  // Acciones - Configuración
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'es' | 'en') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  
  // Acciones - UI
  setLoading: (loading: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  addToHistory: (screen: string) => void;
  clearHistory: () => void;
  
  // Acciones - Notificaciones
  setNotifications: (notifications: Partial<AppState['notifications']>) => void;
  
  // Acciones - Reset
  resetApp: () => void;
  
  // Getters
  getSecurityLevel: () => 'low' | 'medium' | 'high';
  canGoBack: () => boolean;
  getPreviousScreen: () => string | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial - Configuración
      theme: 'light',
      language: 'es',
      soundEnabled: true,
      biometricEnabled: false,
      pinEnabled: true,
      
      // Estado inicial - UI
      isLoading: false,
      currentScreen: 'Home',
      navigationHistory: [],
      
      // Estado inicial - Notificaciones
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
      },

      // Acciones - Configuración
      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        set({ theme });
      },

      setLanguage: (language: 'es' | 'en') => {
        set({ language });
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
      },

      setBiometricEnabled: (enabled: boolean) => {
        set({ biometricEnabled: enabled });
      },

      setPinEnabled: (enabled: boolean) => {
        set({ pinEnabled: enabled });
      },

      // Acciones - UI
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setCurrentScreen: (screen: string) => {
        set({ currentScreen: screen });
      },

      addToHistory: (screen: string) => {
        set((state) => ({
          navigationHistory: [...state.navigationHistory.slice(-9), screen], // Mantener solo últimas 10
        }));
      },

      clearHistory: () => {
        set({ navigationHistory: [] });
      },

      // Acciones - Notificaciones
      setNotifications: (newNotifications: Partial<AppState['notifications']>) => {
        set((state) => ({
          notifications: { ...state.notifications, ...newNotifications },
        }));
      },

      // Acciones - Reset
      resetApp: () => {
        set({
          theme: 'light',
          language: 'es',
          soundEnabled: true,
          biometricEnabled: false,
          pinEnabled: true,
          isLoading: false,
          currentScreen: 'Home',
          navigationHistory: [],
          notifications: {
            enabled: true,
            sound: true,
            vibration: true,
          },
        });
      },

      // Getters
      getSecurityLevel: () => {
        const { biometricEnabled, pinEnabled } = get();
        if (biometricEnabled && pinEnabled) return 'high';
        if (biometricEnabled || pinEnabled) return 'medium';
        return 'low';
      },

      canGoBack: () => {
        return get().navigationHistory.length > 0;
      },

      getPreviousScreen: () => {
        const history = get().navigationHistory;
        return history.length > 0 ? history[history.length - 1] : null;
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        soundEnabled: state.soundEnabled,
        biometricEnabled: state.biometricEnabled,
        pinEnabled: state.pinEnabled,
        notifications: state.notifications,
      }),
    }
  )
);
