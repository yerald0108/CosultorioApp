import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AccessLogEntry {
  id: string;
  timestamp: Date;
  type: 'login' | 'logout' | 'biometric_success' | 'biometric_failed' | 'biometric_error' | 'app_background' | 'app_foreground' | 'data_access' | 'security_event' | 'data_creation' | 'data_update' | 'data_deletion';
  description: string;
  userId?: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export class AccessLogService {
  private static readonly LOGS_KEY = 'access_logs';
  private static readonly MAX_LOGS = 500; // Máximo 500 entradas

  /**
   * Registrar un evento de acceso
   */
  static async logEvent(
    type: AccessLogEntry['type'], 
    description: string, 
    userId?: string,
    additionalInfo?: any
  ): Promise<void> {
    try {
      const logEntry: AccessLogEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        type,
        description,
        userId,
        deviceInfo: await this.getDeviceInfo(),
        ...additionalInfo
      };

      const existingLogs = await this.getAllLogs();
      const updatedLogs = [logEntry, ...existingLogs];

      // Mantener solo los últimos MAX_LOGS registros
      const trimmedLogs = updatedLogs.slice(0, this.MAX_LOGS);

      await AsyncStorage.setItem(this.LOGS_KEY, JSON.stringify(trimmedLogs));
      
      console.log(`📝 Log registrado: ${type} - ${description}`);
    } catch (error) {
      console.error('Error registrando log de acceso:', error);
    }
  }

  /**
   * Obtener todos los logs de acceso
   */
  static async getAllLogs(): Promise<AccessLogEntry[]> {
    try {
      const logsJson = await AsyncStorage.getItem(this.LOGS_KEY);
      if (!logsJson) return [];

      const logs = JSON.parse(logsJson);
      // Convertir timestamps de string a Date
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      console.error('Error obteniendo logs de acceso:', error);
      return [];
    }
  }

  /**
   * Obtener logs filtrados por tipo
   */
  static async getLogsByType(type: AccessLogEntry['type']): Promise<AccessLogEntry[]> {
    const allLogs = await this.getAllLogs();
    return allLogs.filter(log => log.type === type);
  }

  /**
   * Obtener logs de un período específico
   */
  static async getLogsByDateRange(startDate: Date, endDate: Date): Promise<AccessLogEntry[]> {
    const allLogs = await this.getAllLogs();
    return allLogs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  /**
   * Obtener logs recientes (últimas N entradas)
   */
  static async getRecentLogs(limit: number = 50): Promise<AccessLogEntry[]> {
    const allLogs = await this.getAllLogs();
    return allLogs.slice(0, limit);
  }

  /**
   * Obtener estadísticas de logs
   */
  static async getLogStats(): Promise<{
    totalLogs: number;
    loginAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    biometricAttempts: number;
    securityEvents: number;
    lastActivity: Date | null;
  }> {
    const allLogs = await this.getAllLogs();
    
    const stats = {
      totalLogs: allLogs.length,
      loginAttempts: 0,
      successfulLogins: 0,
      failedLogins: 0,
      biometricAttempts: 0,
      securityEvents: 0,
      lastActivity: allLogs.length > 0 ? allLogs[0].timestamp : null
    };

    allLogs.forEach(log => {
      switch (log.type) {
        case 'login':
          stats.loginAttempts++;
          stats.successfulLogins++;
          break;
        case 'biometric_success':
          stats.biometricAttempts++;
          stats.successfulLogins++;
          break;
        case 'biometric_failed':
        case 'biometric_error':
          stats.biometricAttempts++;
          stats.failedLogins++;
          break;
        case 'security_event':
          stats.securityEvents++;
          break;
      }
    });

    return stats;
  }

  /**
   * Limpiar logs antiguos (mantener solo los últimos N días)
   */
  static async cleanOldLogs(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const allLogs = await this.getAllLogs();
      const filteredLogs = allLogs.filter(log => log.timestamp >= cutoffDate);
      
      await AsyncStorage.setItem(this.LOGS_KEY, JSON.stringify(filteredLogs));
      
      const removedCount = allLogs.length - filteredLogs.length;
      console.log(`🧹 Limpiados ${removedCount} logs antiguos`);
      
      return removedCount;
    } catch (error) {
      console.error('Error limpiando logs antiguos:', error);
      return 0;
    }
  }

  /**
   * Exportar logs como texto
   */
  static async exportLogsAsText(): Promise<string> {
    const logs = await this.getAllLogs();
    
    let exportText = '📋 LOGS DE ACCESO - CONSULTORIO APP\n';
    exportText += `📅 Generado: ${new Date().toLocaleString()}\n`;
    exportText += `📊 Total de registros: ${logs.length}\n\n`;
    exportText += '─'.repeat(60) + '\n\n';

    logs.forEach((log, index) => {
      const timestamp = log.timestamp.toLocaleString();
      const typeEmoji = this.getTypeEmoji(log.type);
      
      exportText += `${index + 1}. ${typeEmoji} ${log.type.toUpperCase()}\n`;
      exportText += `   📅 ${timestamp}\n`;
      exportText += `   📝 ${log.description}\n`;
      if (log.userId) exportText += `   👤 Usuario: ${log.userId}\n`;
      if (log.deviceInfo) exportText += `   📱 Dispositivo: ${log.deviceInfo}\n`;
      exportText += '\n';
    });

    return exportText;
  }

  /**
   * Limpiar todos los logs
   */
  static async clearAllLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.LOGS_KEY);
      console.log('🗑️ Todos los logs han sido eliminados');
    } catch (error) {
      console.error('Error limpiando todos los logs:', error);
    }
  }

  /**
   * Generar ID único para log
   */
  private static generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener información básica del dispositivo
   */
  private static async getDeviceInfo(): Promise<string> {
    try {
      // En una implementación real, podrías usar expo-device o react-native-device-info
      return `Mobile Device - ${new Date().toISOString()}`;
    } catch (error) {
      return 'Unknown Device';
    }
  }

  /**
   * Obtener emoji para tipo de log
   */
  private static getTypeEmoji(type: AccessLogEntry['type']): string {
    const emojiMap = {
      login: '🟢',
      logout: '🔴',
      biometric_success: '✅',
      biometric_failed: '❌',
      biometric_error: '⚠️',
      app_background: '📱',
      app_foreground: '📱',
      data_access: '📊',
      security_event: '🛡️',
      data_creation: '➕',
      data_update: '✏️',
      data_deletion: '🗑️'
    };
    return emojiMap[type] || '📝';
  }

  /**
   * Registrar login exitoso
   */
  static async logLogin(userId: string): Promise<void> {
    await this.logEvent('login', `Login exitoso para usuario: ${userId}`, userId);
  }

  /**
   * Registrar logout
   */
  static async logLogout(userId: string): Promise<void> {
    await this.logEvent('logout', `Logout para usuario: ${userId}`, userId);
  }

  /**
   * Registrar acceso a datos sensibles
   */
  static async logDataAccess(action: string, userId?: string): Promise<void> {
    await this.logEvent('data_access', `Acceso a datos: ${action}`, userId);
  }

  /**
   * Registrar evento de seguridad
   */
  static async logSecurityEvent(event: string, userId?: string): Promise<void> {
    await this.logEvent('security_event', `Evento de seguridad: ${event}`, userId);
  }
}
