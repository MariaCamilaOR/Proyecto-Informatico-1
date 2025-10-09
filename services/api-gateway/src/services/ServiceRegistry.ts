import axios from 'axios';
import { Logger } from '@shared/utils';
import { ServiceConfig, HealthCheck } from '@shared/types';

export class ServiceRegistry {
  private services: Map<string, ServiceConfig> = new Map();
  private logger = Logger.getInstance('ServiceRegistry');

  register(name: string, url: string, healthCheckPath: string = '/health'): void {
    const service: ServiceConfig = {
      name,
      port: this.extractPort(url),
      host: this.extractHost(url),
      url,
      healthCheck: `${url}${healthCheckPath}`
    };

    this.services.set(name, service);
    this.logger.info(`Servicio registrado: ${name} en ${url}`);
  }

  unregister(name: string): void {
    if (this.services.delete(name)) {
      this.logger.info(`Servicio desregistrado: ${name}`);
    }
  }

  getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  getServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  async healthCheck(serviceName: string): Promise<HealthCheck> {
    const service = this.services.get(serviceName);
    if (!service) {
      return {
        service: serviceName,
        status: 'unhealthy',
        timestamp: new Date(),
        details: { error: 'Servicio no registrado' }
      };
    }

    const startTime = Date.now();
    try {
      const response = await axios.get(service.healthCheck, { timeout: 5000 });
      const responseTime = Date.now() - startTime;

      return {
        service: serviceName,
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        timestamp: new Date(),
        responseTime,
        details: response.data
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`Health check falló para ${serviceName}`, error as Error);

      return {
        service: serviceName,
        status: 'unhealthy',
        timestamp: new Date(),
        responseTime,
        details: { error: (error as Error).message }
      };
    }
  }

  async healthCheckAll(): Promise<Record<string, HealthCheck>> {
    const healthChecks: Record<string, HealthCheck> = {};
    const promises = Array.from(this.services.keys()).map(async (serviceName) => {
      const healthCheck = await this.healthCheck(serviceName);
      healthChecks[serviceName] = healthCheck;
    });

    await Promise.all(promises);
    return healthChecks;
  }

  isServiceHealthy(serviceName: string): boolean {
    const service = this.services.get(serviceName);
    return service !== undefined;
  }

  private extractHost(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'localhost';
    }
  }

  private extractPort(url: string): number {
    try {
      const urlObj = new URL(url);
      return parseInt(urlObj.port) || (urlObj.protocol === 'https:' ? 443 : 80);
    } catch {
      return 3000;
    }
  }
}
