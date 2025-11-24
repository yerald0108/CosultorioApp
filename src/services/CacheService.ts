import { FamiliaData, IntegranteData } from '../types';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

interface CacheStats {
  totalItems: number;
  memoryUsage: number;
  hitRate: number;
  mostAccessed: string[];
}

export class CacheService {
  private static cache: Map<string, CacheItem<any>> = new Map();
  private static maxSize: number = 100; // Máximo 100 items en cache
  private static maxAge: number = 30 * 60 * 1000; // 30 minutos
  private static hits: number = 0;
  private static misses: number = 0;

  // Prefijos para diferentes tipos de datos
  private static readonly PREFIXES = {
    FAMILIA: 'familia_',
    INTEGRANTE: 'integrante_',
    ESTADISTICAS: 'stats_',
    BUSQUEDA: 'search_',
    LISTA_FAMILIAS: 'familias_list',
    LISTA_INTEGRANTES: 'integrantes_list',
  };

  /**
   * Obtener datos del cache
   */
  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }

    // Verificar si el item ha expirado
    const now = Date.now();
    if (now - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Actualizar estadísticas de acceso
    item.accessCount++;
    item.lastAccess = now;
    this.hits++;

    return item.data;
  }

  /**
   * Guardar datos en el cache
   */
  static set<T>(key: string, data: T): void {
    const now = Date.now();
    
    // Si el cache está lleno, eliminar el item menos usado
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLeastUsed();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccess: now,
    };

    this.cache.set(key, item);
  }

  /**
   * Cache específico para familias
   */
  static setFamilia(familia: FamiliaData): void {
    this.set(`${this.PREFIXES.FAMILIA}${familia.id}`, familia);
  }

  static getFamilia(familiaId: string): FamiliaData | null {
    return this.get<FamiliaData>(`${this.PREFIXES.FAMILIA}${familiaId}`);
  }

  /**
   * Cache específico para integrantes
   */
  static setIntegrante(integrante: IntegranteData): void {
    this.set(`${this.PREFIXES.INTEGRANTE}${integrante.id}`, integrante);
  }

  static getIntegrante(integranteId: string): IntegranteData | null {
    return this.get<IntegranteData>(`${this.PREFIXES.INTEGRANTE}${integranteId}`);
  }

  /**
   * Cache para listas completas
   */
  static setFamiliasList(familias: FamiliaData[]): void {
    this.set(this.PREFIXES.LISTA_FAMILIAS, familias);
  }

  static getFamiliasList(): FamiliaData[] | null {
    return this.get<FamiliaData[]>(this.PREFIXES.LISTA_FAMILIAS);
  }

  static setIntegrantesList(integrantes: IntegranteData[]): void {
    this.set(this.PREFIXES.LISTA_INTEGRANTES, integrantes);
  }

  static getIntegrantesList(): IntegranteData[] | null {
    return this.get<IntegranteData[]>(this.PREFIXES.LISTA_INTEGRANTES);
  }

  /**
   * Cache para estadísticas
   */
  static setEstadisticas(stats: any): void {
    this.set(this.PREFIXES.ESTADISTICAS + 'general', stats);
  }

  static getEstadisticas(): any | null {
    return this.get(this.PREFIXES.ESTADISTICAS + 'general');
  }

  /**
   * Cache para resultados de búsqueda
   */
  static setBusquedaResultados(filtros: any, resultados: any[]): void {
    const key = this.PREFIXES.BUSQUEDA + this.generateSearchKey(filtros);
    this.set(key, resultados);
  }

  static getBusquedaResultados(filtros: any): any[] | null {
    const key = this.PREFIXES.BUSQUEDA + this.generateSearchKey(filtros);
    return this.get<any[]>(key);
  }

  /**
   * Generar clave única para búsqueda
   */
  private static generateSearchKey(filtros: any): string {
    return JSON.stringify(filtros);
  }

  /**
   * Eliminar el item menos usado cuando el cache está lleno
   */
  private static evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastAccessCount = Infinity;
    let oldestAccess = Infinity;

    for (const [key, item] of this.cache.entries()) {
      // Priorizar por menor uso, luego por más antiguo
      if (item.accessCount < leastAccessCount || 
          (item.accessCount === leastAccessCount && item.lastAccess < oldestAccess)) {
        leastUsedKey = key;
        leastAccessCount = item.accessCount;
        oldestAccess = item.lastAccess;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Invalidar cache específico
   */
  static invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidar cache de familia y sus integrantes
   */
  static invalidateFamilia(familiaId: string): void {
    this.invalidate(`${this.PREFIXES.FAMILIA}${familiaId}`);
    this.invalidate(this.PREFIXES.LISTA_FAMILIAS);
    this.invalidate(this.PREFIXES.ESTADISTICAS + 'general');
    
    // Invalidar búsquedas relacionadas
    for (const key of this.cache.keys()) {
      if (key.startsWith(this.PREFIXES.BUSQUEDA)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidar cache de integrante
   */
  static invalidateIntegrante(integranteId: string): void {
    this.invalidate(`${this.PREFIXES.INTEGRANTE}${integranteId}`);
    this.invalidate(this.PREFIXES.LISTA_INTEGRANTES);
    this.invalidate(this.PREFIXES.ESTADISTICAS + 'general');
    
    // Invalidar búsquedas relacionadas
    for (const key of this.cache.keys()) {
      if (key.startsWith(this.PREFIXES.BUSQUEDA)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpiar todo el cache
   */
  static clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Limpiar items expirados
   */
  static cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Obtener estadísticas del cache
   */
  static getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    // Obtener los items más accedidos
    const sortedItems = Array.from(this.cache.entries())
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, 5)
      .map(([key]) => key);

    return {
      totalItems: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      hitRate: Math.round(hitRate * 100) / 100,
      mostAccessed: sortedItems,
    };
  }

  /**
   * Estimar uso de memoria (aproximado)
   */
  private static estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // Aproximación para string
      size += JSON.stringify(item.data).length * 2; // Aproximación para datos
      size += 32; // Overhead del objeto CacheItem
    }
    return Math.round(size / 1024); // Retornar en KB
  }

  /**
   * Configurar tamaño máximo del cache
   */
  static setMaxSize(size: number): void {
    this.maxSize = size;
    
    // Si el cache actual es más grande, limpiar items menos usados
    while (this.cache.size > this.maxSize) {
      this.evictLeastUsed();
    }
  }

  /**
   * Configurar tiempo máximo de vida de items
   */
  static setMaxAge(ageInMinutes: number): void {
    this.maxAge = ageInMinutes * 60 * 1000;
  }

  /**
   * Precarga datos frecuentemente usados
   */
  static async preloadFrequentData(): Promise<void> {
    try {
      // Esta función se puede llamar al iniciar la app
      // para precargar datos que se usan frecuentemente
      console.log('🔄 Precargando datos frecuentes en cache...');
      
      // Aquí se pueden precargar estadísticas, listas, etc.
      // Ejemplo: await StorageService.obtenerEstadisticas();
      
    } catch (error) {
      console.warn('Error precargando datos en cache:', error);
    }
  }
}

// Limpiar items expirados cada 5 minutos
setInterval(() => {
  CacheService.cleanExpired();
}, 5 * 60 * 1000);
