// Exportar todos los stores
export { useAuthStore } from './authStore';
export { useFamiliesStore } from './familiesStore';
export { useGestantesStore } from './gestantesStore';
export { useAppStore } from './appStore';
export { useSearchStore } from './searchStore';
export { useStatsStore } from './statsStore';

// Tipos para TypeScript
export type { AuthState } from './authStore';
export type { FamiliesState } from './familiesStore';
export type { GestantesState } from './gestantesStore';
export type { AppState } from './appStore';
export type { SearchState } from './searchStore';
export type { StatsState } from './statsStore';
