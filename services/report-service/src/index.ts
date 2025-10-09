import express from 'express';
import dotenv from 'dotenv';
import { 
  securityMiddleware, 
  requestLogger, 
  errorHandler, 
  healthCheck,
  createRateLimit 
} from '@shared/middleware';
import { Logger } from '@shared/utils';
import { ReportController } from './controllers/ReportController';

// Cargar variables de entorno
dotenv.config();

const logger = Logger.getInstance('Report-Service');
const app = express();
const PORT = process.env.REPORT_SERVICE_PORT || 3004;

// Middleware de seguridad
app.use(securityMiddleware);

// Middleware de logging
app.use(requestLogger);

// Middleware de compresión
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(createRateLimit(15 * 60 * 1000, 50)); // 50 requests per 15 minutes

// Health check
app.get('/health', healthCheck);

// Inicializar controlador
const reportController = new ReportController();

// Rutas de reportes
app.post('/reports', reportController.generateReport);
app.get('/reports/:id', reportController.getReport);
app.get('/reports/patient/:patientId', reportController.getPatientReports);
app.get('/reports/:id/pdf', reportController.generatePDF);
app.get('/reports/:id/export', reportController.exportReport);

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
  logger.info(`Servicio de reportes iniciado en puerto ${PORT}`);
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
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
