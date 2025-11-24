import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoctorData } from '../types';

export interface AuthState {
  // Estado
  user: DoctorData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastLoginTime: number | null;
  
  // Acciones
  login: (user: DoctorData) => void;
  logout: () => void;
  updateUser: (userData: Partial<DoctorData>) => void;
  setLoading: (loading: boolean) => void;
  
  // Getters
  getUserName: () => string;
  isSessionValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastLoginTime: null,

      // Acciones
      login: (user: DoctorData) => {
        set({
          user,
          isAuthenticated: true,
          lastLoginTime: Date.now(),
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          lastLoginTime: null,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<DoctorData>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Getters
      getUserName: () => {
        const user = get().user;
        return user ? `Dr. ${user.nombreCompleto}` : 'Usuario';
      },

      isSessionValid: () => {
        const { lastLoginTime, isAuthenticated } = get();
        if (!isAuthenticated || !lastLoginTime) return false;
        
        // Sesión válida por 24 horas
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas en ms
        return Date.now() - lastLoginTime < sessionDuration;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
      }),
    }
  )
);
