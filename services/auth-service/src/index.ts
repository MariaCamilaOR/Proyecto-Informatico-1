import express from 'express';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { 
  securityMiddleware, 
  requestLogger, 
  errorHandler, 
  healthCheck,
  createRateLimit 
} from '@shared/middleware';
import { Logger } from '@shared/utils';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { InvitationController } from './controllers/InvitationController';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { DatabaseConfig } from './config/DatabaseConfig';

// Cargar variables de entorno
dotenv.config();

const logger = Logger.getInstance('Auth-Service');
const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

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

// Inicializar controladores
const authController = new AuthController();
const userController = new UserController();
const invitationController = new InvitationController();
const authMiddleware = new AuthMiddleware();

// Rutas de autenticación
app.post('/login', authController.login);
app.post('/register', authController.register);
app.post('/logout', authMiddleware.authenticate, authController.logout);
app.post('/refresh', authController.refreshToken);
app.post('/forgot-password', authController.forgotPassword);
app.post('/reset-password', authController.resetPassword);

// Rutas de 2FA
app.post('/2fa/setup', authMiddleware.authenticate, authController.setup2FA);
app.post('/2fa/verify', authMiddleware.authenticate, authController.verify2FA);
app.post('/2fa/disable', authMiddleware.authenticate, authController.disable2FA);

// Rutas de usuario
app.get('/users/profile', authMiddleware.authenticate, userController.getProfile);
app.put('/users/profile', authMiddleware.authenticate, userController.updateProfile);
app.put('/users/password', authMiddleware.authenticate, userController.changePassword);
app.delete('/users/account', authMiddleware.authenticate, userController.deleteAccount);

// Rutas de invitaciones
app.post('/invitations', authMiddleware.authenticate, invitationController.createInvitation);
app.get('/invitations/:code', invitationController.getInvitation);
app.post('/invitations/:code/accept', invitationController.acceptInvitation);
app.post('/invitations/:code/reject', invitationController.rejectInvitation);
app.get('/invitations', authMiddleware.authenticate, invitationController.getUserInvitations);

// Rutas de vinculación paciente-cuidador
app.post('/link-patient', authMiddleware.authenticate, userController.linkPatient);
app.delete('/link-patient/:patientId', authMiddleware.authenticate, userController.unlinkPatient);
app.get('/linked-patients', authMiddleware.authenticate, userController.getLinkedPatients);

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

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await createConnection(DatabaseConfig);
    logger.info('Conexión a la base de datos establecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servicio de autenticación iniciado en puerto ${PORT}`);
      logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor', error as Error);
    process.exit(1);
  }
}

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;
