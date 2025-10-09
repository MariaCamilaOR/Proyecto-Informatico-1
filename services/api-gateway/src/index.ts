import express from 'express';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { 
  securityMiddleware, 
  requestLogger, 
  errorHandler, 
  healthCheck,
  createRateLimit 
} from '@shared/middleware';
import { Logger } from '@shared/utils';
import { ServiceRegistry } from './services/ServiceRegistry';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { CircuitBreaker } from './middleware/CircuitBreaker';

// Cargar variables de entorno
dotenv.config();

const logger = Logger.getInstance('API-Gateway');
const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Middleware de seguridad
app.use(securityMiddleware);

// Middleware de logging
app.use(requestLogger);

// Middleware de compresión
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use(createRateLimit(15 * 60 * 1000, 1000)); // 1000 requests per 15 minutes

// Health check
app.get('/health', healthCheck);

// Inicializar servicios
const serviceRegistry = new ServiceRegistry();
const authMiddleware = new AuthMiddleware();
const circuitBreaker = new CircuitBreaker();

// Configurar servicios
const services = {
  auth: {
    url: `http://${process.env.AUTH_SERVICE_HOST || 'localhost'}:${process.env.AUTH_SERVICE_PORT || 3001}`,
    healthCheck: '/health'
  },
  photo: {
    url: `http://${process.env.PHOTO_SERVICE_HOST || 'localhost'}:${process.env.PHOTO_SERVICE_PORT || 3002}`,
    healthCheck: '/health'
  },
  analysis: {
    url: `http://${process.env.ANALYSIS_SERVICE_HOST || 'localhost'}:${process.env.ANALYSIS_SERVICE_PORT || 3003}`,
    healthCheck: '/health'
  },
  report: {
    url: `http://${process.env.REPORT_SERVICE_HOST || 'localhost'}:${process.env.REPORT_SERVICE_PORT || 3004}`,
    healthCheck: '/health'
  },
  notification: {
    url: `http://${process.env.NOTIFICATION_SERVICE_HOST || 'localhost'}:${process.env.NOTIFICATION_SERVICE_PORT || 3005}`,
    healthCheck: '/health'
  }
};

// Registrar servicios
Object.entries(services).forEach(([name, config]) => {
  serviceRegistry.register(name, config.url, config.healthCheck);
});

// Middleware de autenticación para rutas protegidas
const protectedRoutes = ['/api/photo', '/api/analysis', '/api/report', '/api/notification'];

// Proxy para Auth Service
app.use('/api/auth', 
  createProxyMiddleware({
    target: services.auth.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': ''
    },
    onError: (err, req, res) => {
      logger.error('Error en Auth Service', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Servicio de autenticación no disponible'
        }
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying request to Auth Service: ${req.method} ${req.url}`);
    }
  })
);

// Proxy para Photo Service
app.use('/api/photo',
  authMiddleware.authenticate,
  createProxyMiddleware({
    target: services.photo.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/photo': ''
    },
    onError: (err, req, res) => {
      logger.error('Error en Photo Service', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Servicio de fotos no disponible'
        }
      });
    }
  })
);

// Proxy para Analysis Service
app.use('/api/analysis',
  authMiddleware.authenticate,
  createProxyMiddleware({
    target: services.analysis.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/analysis': ''
    },
    onError: (err, req, res) => {
      logger.error('Error en Analysis Service', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Servicio de análisis no disponible'
        }
      });
    }
  })
);

// Proxy para Report Service
app.use('/api/report',
  authMiddleware.authenticate,
  createProxyMiddleware({
    target: services.report.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/report': ''
    },
    onError: (err, req, res) => {
      logger.error('Error en Report Service', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Servicio de reportes no disponible'
        }
      });
    }
  })
);

// Proxy para Notification Service
app.use('/api/notification',
  authMiddleware.authenticate,
  createProxyMiddleware({
    target: services.notification.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/notification': ''
    },
    onError: (err, req, res) => {
      logger.error('Error en Notification Service', err);
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Servicio de notificaciones no disponible'
        }
      });
    }
  })
);

// Ruta para obtener información de servicios
app.get('/api/services', (req, res) => {
  const servicesInfo = serviceRegistry.getServices();
  res.json({
    success: true,
    data: servicesInfo
  });
});

// Ruta para health check de todos los servicios
app.get('/api/services/health', async (req, res) => {
  try {
    const healthChecks = await serviceRegistry.healthCheckAll();
    const allHealthy = Object.values(healthChecks).every(status => status.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: healthChecks
    });
  } catch (error) {
    logger.error('Error en health check de servicios', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_ERROR',
        message: 'Error al verificar el estado de los servicios'
      }
    });
  }
});

// Ruta de documentación de API
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'DoYouRemember API Gateway',
      version: '1.0.0',
      description: 'API Gateway para el sistema de evaluación cognitiva DoYouRemember',
      endpoints: {
        auth: '/api/auth',
        photo: '/api/photo',
        analysis: '/api/analysis',
        report: '/api/report',
        notification: '/api/notification'
      },
      documentation: '/docs'
    }
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Ruta no encontrada'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`API Gateway iniciado en puerto ${PORT}`);
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Iniciar health checks periódicos
  setInterval(async () => {
    try {
      await serviceRegistry.healthCheckAll();
    } catch (error) {
      logger.error('Error en health check periódico', error as Error);
    }
  }, 30000); // Cada 30 segundos
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

export default app;
