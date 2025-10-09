import { Logger } from '@shared/utils';

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

export class CircuitBreaker {
  private breakers: Map<string, CircuitBreakerState> = new Map();
  private logger = Logger.getInstance('CircuitBreaker');
  
  private readonly failureThreshold = 5;
  private readonly timeout = 60000; // 1 minuto
  private readonly successThreshold = 3;

  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    const breaker = this.getBreaker(serviceName);
    
    if (breaker.state === 'OPEN') {
      if (Date.now() - breaker.lastFailureTime > this.timeout) {
        breaker.state = 'HALF_OPEN';
        breaker.successCount = 0;
        this.logger.info(`Circuit breaker para ${serviceName} cambió a HALF_OPEN`);
      } else {
        this.logger.warn(`Circuit breaker para ${serviceName} está OPEN, usando fallback`);
        if (fallback) {
          return fallback();
        }
        throw new Error(`Servicio ${serviceName} no disponible (circuit breaker abierto)`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess(serviceName);
      return result;
    } catch (error) {
      this.onFailure(serviceName);
      if (fallback) {
        this.logger.warn(`Error en ${serviceName}, usando fallback`, error as Error);
        return fallback();
      }
      throw error;
    }
  }

  private getBreaker(serviceName: string): CircuitBreakerState {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0
      });
    }
    return this.breakers.get(serviceName)!;
  }

  private onSuccess(serviceName: string): void {
    const breaker = this.getBreaker(serviceName);
    
    if (breaker.state === 'HALF_OPEN') {
      breaker.successCount++;
      if (breaker.successCount >= this.successThreshold) {
        breaker.state = 'CLOSED';
        breaker.failureCount = 0;
        this.logger.info(`Circuit breaker para ${serviceName} cambió a CLOSED`);
      }
    } else {
      breaker.failureCount = 0;
    }
  }

  private onFailure(serviceName: string): void {
    const breaker = this.getBreaker(serviceName);
    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= this.failureThreshold) {
      breaker.state = 'OPEN';
      this.logger.error(`Circuit breaker para ${serviceName} cambió a OPEN`);
    }
  }

  getState(serviceName: string): string {
    return this.getBreaker(serviceName).state;
  }

  reset(serviceName: string): void {
    this.breakers.delete(serviceName);
    this.logger.info(`Circuit breaker para ${serviceName} fue reseteado`);
  }

  getAllStates(): Record<string, string> {
    const states: Record<string, string> = {};
    for (const [serviceName, breaker] of this.breakers) {
      states[serviceName] = breaker.state;
    }
    return states;
  }
}
