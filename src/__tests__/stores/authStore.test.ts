import { useAuthStore } from '../../stores/authStore';
import { DoctorData } from '../../types';

// Mock de datos de prueba
const mockDoctor: DoctorData = {
  id: 'test-id',
  nombreUsuario: 'test-user',
  nombreCompleto: 'Dr. Test User',
  password: 'test-password',
  poblacion: 'Test City',
  consultorio: 'Test Clinic',
  fechaCreacion: new Date(),
  fechaUltimoAcceso: new Date(),
};

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
  });

  describe('login', () => {
    it('should set user and authentication state on login', () => {
      const { login, user, isAuthenticated, lastLoginTime } = useAuthStore.getState();
      
      // Verificar estado inicial
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
      expect(lastLoginTime).toBeNull();
      
      // Realizar login
      login(mockDoctor);
      
      // Verificar estado después del login
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockDoctor);
      expect(state.isAuthenticated).toBe(true);
      expect(state.lastLoginTime).toBeTruthy();
    });
  });

  describe('logout', () => {
    it('should clear user data on logout', () => {
      const { login, logout } = useAuthStore.getState();
      
      // Hacer login primero
      login(mockDoctor);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      
      // Hacer logout
      logout();
      
      // Verificar estado después del logout
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.lastLoginTime).toBeNull();
    });
  });

  describe('getUserName', () => {
    it('should return formatted doctor name when user exists', () => {
      const { login, getUserName } = useAuthStore.getState();
      
      login(mockDoctor);
      
      const userName = getUserName();
      expect(userName).toBe(`Dr. ${mockDoctor.nombreCompleto}`);
    });

    it('should return default name when no user', () => {
      const { getUserName } = useAuthStore.getState();
      
      const userName = getUserName();
      expect(userName).toBe('Usuario');
    });
  });

  describe('isSessionValid', () => {
    it('should return true for recent login', () => {
      const { login, isSessionValid } = useAuthStore.getState();
      
      login(mockDoctor);
      
      const isValid = isSessionValid();
      expect(isValid).toBe(true);
    });

    it('should return false when not authenticated', () => {
      const { isSessionValid } = useAuthStore.getState();
      
      const isValid = isSessionValid();
      expect(isValid).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user data when user exists', () => {
      const { login, updateUser } = useAuthStore.getState();
      
      login(mockDoctor);
      
      const updates = { poblacion: 'Updated City' };
      updateUser(updates);
      
      const state = useAuthStore.getState();
      expect(state.user?.poblacion).toBe('Updated City');
      expect(state.user?.nombreCompleto).toBe(mockDoctor.nombreCompleto); // Otros campos sin cambios
    });

    it('should not update when no user exists', () => {
      const { updateUser } = useAuthStore.getState();
      
      const updates = { poblacion: 'Updated City' };
      updateUser(updates);
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });
});
