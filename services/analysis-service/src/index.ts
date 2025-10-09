import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { 
  securityMiddleware, 
  requestLogger, 
  errorHandler, 
  healthCheck,
  createRateLimit 
} from '@shared/middleware';
import { Logger } from '@shared/utils';
import { AnalysisController } from './controllers/AnalysisController';

// Cargar variables de entorno
dotenv.config();

const logger = Logger.getInstance('Analysis-Service');
const app = express();
const PORT = process.env.ANALYSIS_SERVICE_PORT || 3003;

// Configurar multer para subida de archivos de audio
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') // 50MB para audio
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo de audio no permitido'));
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
app.use(createRateLimit(15 * 60 * 1000, 50)); // 50 requests per 15 minutes

// Health check
app.get('/health', healthCheck);

// Inicializar controlador
const analysisController = new AnalysisController();

// Rutas de análisis
app.post('/transcribe', upload.single('audio'), analysisController.transcribeAudio);
app.post('/analyze', analysisController.analyzeText);
app.post('/sessions', analysisController.createSession);
app.get('/sessions/:id', analysisController.getSession);
app.put('/sessions/:id/complete', analysisController.completeSession);
app.get('/sessions/patient/:patientId', analysisController.getPatientSessions);

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
  logger.info(`Servicio de análisis iniciado en puerto ${PORT}`);
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
