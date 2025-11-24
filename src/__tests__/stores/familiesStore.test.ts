import { useFamiliesStore } from '../../stores/familiesStore';
import { FamiliaData, IntegranteData } from '../../types';

// Mock de datos de prueba
const mockFamilia: FamiliaData = {
  id: 'familia-1',
  numero: 'FAM-001',
  direccion: 'Test Address 123',
  poblacion: 'Test City',
  consultorio: 'Test Clinic',
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
};

const mockIntegrante: IntegranteData = {
  id: 'integrante-1',
  familiaId: 'familia-1',
  nombre: 'Juan Test',
  edad: 30,
  fechaNacimiento: new Date('1994-01-15'), // Fecha que corresponde a edad 30
  sexo: 'Masculino',
  raza: 'Mestizo',
  grupoDispensarial: 'I',
  enfermedades: [],
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
};

// Mock StorageService
jest.mock('../../services/StorageService', () => ({
  StorageService: {
    obtenerFamilias: jest.fn(() => Promise.resolve([mockFamilia])),
    obtenerIntegrantes: jest.fn(() => Promise.resolve([mockIntegrante])),
    eliminarIntegrante: jest.fn(() => Promise.resolve()),
  },
}));

describe('FamiliesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useFamiliesStore.getState();
    store.setFamilias([]);
    store.setIntegrantes([]);
    store.selectFamilia(null);
    store.setLoading(false);
  });

  describe('familias management', () => {
    it('should add familia to store', () => {
      const { addFamilia, familias } = useFamiliesStore.getState();
      
      expect(familias).toHaveLength(0);
      
      addFamilia(mockFamilia);
      
      const state = useFamiliesStore.getState();
      expect(state.familias).toHaveLength(1);
      expect(state.familias[0]).toEqual(mockFamilia);
    });

    it('should update familia in store', () => {
      const { setFamilias, updateFamilia } = useFamiliesStore.getState();
      
      setFamilias([mockFamilia]);
      
      const updates = { direccion: 'Updated Address' };
      updateFamilia(mockFamilia.id, updates);
      
      const state = useFamiliesStore.getState();
      expect(state.familias[0].direccion).toBe('Updated Address');
    });

    it('should delete familia and related integrantes', () => {
      const { setFamilias, setIntegrantes, deleteFamilia } = useFamiliesStore.getState();
      
      setFamilias([mockFamilia]);
      setIntegrantes([mockIntegrante]);
      
      deleteFamilia(mockFamilia.id);
      
      const state = useFamiliesStore.getState();
      expect(state.familias).toHaveLength(0);
      expect(state.integrantes).toHaveLength(0);
    });
  });

  describe('integrantes management', () => {
    it('should add integrante to store', () => {
      const { addIntegrante, integrantes } = useFamiliesStore.getState();
      
      expect(integrantes).toHaveLength(0);
      
      addIntegrante(mockIntegrante);
      
      const state = useFamiliesStore.getState();
      expect(state.integrantes).toHaveLength(1);
      expect(state.integrantes[0]).toEqual(mockIntegrante);
    });

    it('should update integrante in store', () => {
      const { setIntegrantes, updateIntegrante } = useFamiliesStore.getState();
      
      setIntegrantes([mockIntegrante]);
      
      const updates = { edad: 31 };
      updateIntegrante(mockIntegrante.id, updates);
      
      const state = useFamiliesStore.getState();
      expect(state.integrantes[0].edad).toBe(31);
    });
  });

  describe('selection management', () => {
    it('should select and deselect familia', () => {
      const { selectFamilia, selectedFamilia } = useFamiliesStore.getState();
      
      expect(selectedFamilia).toBeNull();
      
      selectFamilia(mockFamilia);
      expect(useFamiliesStore.getState().selectedFamilia).toEqual(mockFamilia);
      
      selectFamilia(null);
      expect(useFamiliesStore.getState().selectedFamilia).toBeNull();
    });
  });

  describe('statistics', () => {
    it('should calculate familia stats correctly', () => {
      const { setFamilias, setIntegrantes, getFamiliaStats } = useFamiliesStore.getState();
      
      const familias = [mockFamilia, { ...mockFamilia, id: 'familia-2' }];
      const integrantes = [
        mockIntegrante,
        { ...mockIntegrante, id: 'integrante-2', familiaId: 'familia-2' },
        { ...mockIntegrante, id: 'integrante-3', familiaId: 'familia-1' },
      ];
      
      setFamilias(familias);
      setIntegrantes(integrantes);
      
      const stats = getFamiliaStats();
      
      expect(stats.totalFamilias).toBe(2);
      expect(stats.totalIntegrantes).toBe(3);
      expect(stats.promedioIntegrantesPorFamilia).toBe(1.5);
    });
  });

  describe('data loading', () => {
    it('should load families from storage', async () => {
      const { loadFamilies, familias } = useFamiliesStore.getState();
      
      expect(familias).toHaveLength(0);
      
      await loadFamilies();
      
      const state = useFamiliesStore.getState();
      expect(state.familias).toHaveLength(1);
      expect(state.familias[0]).toEqual(mockFamilia);
    });

    it('should load integrantes from storage', async () => {
      const { loadIntegrantes, integrantes } = useFamiliesStore.getState();
      
      expect(integrantes).toHaveLength(0);
      
      await loadIntegrantes();
      
      const state = useFamiliesStore.getState();
      expect(state.integrantes).toHaveLength(1);
      expect(state.integrantes[0]).toEqual(mockIntegrante);
    });
  });
});
