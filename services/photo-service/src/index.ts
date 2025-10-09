import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { 
  securityMiddleware, 
  requestLogger, 
  errorHandler, 
  healthCheck,
  createRateLimit,
  validateFileUpload 
} from '@shared/middleware';
import { Logger } from '@shared/utils';
import { PhotoController } from './controllers/PhotoController';

// Cargar variables de entorno
dotenv.config();

const logger = Logger.getInstance('Photo-Service');
const app = express();
const PORT = process.env.PHOTO_SERVICE_PORT || 3002;

// Configurar multer para subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

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

// Inicializar controlador
const photoController = new PhotoController();

// Rutas de fotos
app.post('/photos', upload.single('photo'), photoController.uploadPhoto);
app.get('/photos/:id', photoController.getPhoto);
app.get('/photos/patient/:patientId', photoController.getPatientPhotos);
app.put('/photos/:id', photoController.updatePhoto);
app.delete('/photos/:id', photoController.deletePhoto);
app.post('/photos/:id/tags', photoController.addTag);
app.put('/photos/:id/tags/:tagId', photoController.updateTag);
app.delete('/photos/:id/tags/:tagId', photoController.deleteTag);

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
  logger.info(`Servicio de fotos iniciado en puerto ${PORT}`);
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
