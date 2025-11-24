// Servicio de Analytics para monitorear uso de la aplicación
export class AnalyticsService {
  private static events: Array<{
    event: string;
    timestamp: Date;
    data?: any;
  }> = [];

  static trackEvent(eventName: string, data?: any) {
    this.events.push({
      event: eventName,
      timestamp: new Date(),
      data,
    });
    
    console.log(`📊 Analytics: ${eventName}`, data);
  }

  static trackScreenView(screenName: string) {
    this.trackEvent('screen_view', { screen: screenName });
  }

  static trackUserAction(action: string, details?: any) {
    this.trackEvent('user_action', { action, ...details });
  }

  static trackError(error: Error, context?: string) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  static trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.trackEvent('performance', {
      metric,
      value,
      unit,
    });
  }

  static getAnalyticsReport() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp >= last24h);
    
    return {
      totalEvents: this.events.length,
      last24hEvents: recentEvents.length,
      mostCommonEvents: this.getMostCommonEvents(recentEvents),
      errorRate: this.getErrorRate(recentEvents),
    };
  }

  private static getMostCommonEvents(events: typeof this.events) {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      counts[e.event] = (counts[e.event] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }

  private static getErrorRate(events: typeof this.events) {
    const errors = events.filter(e => e.event === 'error').length;
    return events.length > 0 ? (errors / events.length) * 100 : 0;
  }
}
