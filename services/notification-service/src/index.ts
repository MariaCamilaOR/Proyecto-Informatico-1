import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { 
  securityMiddleware, 
  requestLogger, 
  errorHandler, 
  healthCheck,
  createRateLimit 
} from '@shared/middleware';
import { Logger } from '@shared/utils';
import { NotificationController } from './controllers/NotificationController';
import { NotificationService } from './services/NotificationService';

// Cargar variables de entorno
dotenv.config();

const logger = Logger.getInstance('Notification-Service');
const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;

// Middleware de seguridad
app.use(securityMiddleware);

// Middleware de logging
app.use(requestLogger);

// Middleware de compresión
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Health check
app.get('/health', healthCheck);

// Inicializar servicios
const notificationService = new NotificationService();
const notificationController = new NotificationController(notificationService);

// Rutas de notificaciones
app.post('/notifications', notificationController.createNotification);
app.get('/notifications', notificationController.getNotifications);
app.get('/notifications/:id', notificationController.getNotification);
app.put('/notifications/:id/read', notificationController.markAsRead);
app.delete('/notifications/:id', notificationController.deleteNotification);
app.post('/notifications/send', notificationController.sendNotification);
app.get('/notifications/user/:userId', notificationController.getUserNotifications);

// Configurar tareas programadas
cron.schedule('0 */6 * * *', () => {
  logger.info('Ejecutando tarea programada de notificaciones');
  notificationService.sendScheduledNotifications();
});

cron.schedule('0 9 * * *', () => {
  logger.info('Enviando recordatorios diarios');
  notificationService.sendDailyReminders();
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
  logger.info(`Servicio de notificaciones iniciado en puerto ${PORT}`);
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
