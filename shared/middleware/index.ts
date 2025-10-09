// Middleware compartido para el sistema DoYouRemember

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { UserRole, ApiResponse, ErrorResponse } from '../types';
import { JWTUtils, ResponseUtils, ValidationUtils, Logger } from '../utils';

const logger = Logger.getInstance('Middleware');

// Middleware de autenticación
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const error = ResponseUtils.createErrorResponse(
      'UNAUTHORIZED',
      'Token de acceso requerido',
      req.path,
      req.method
    );
    res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Token de acceso requerido'));
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no configurado');
    }

    const decoded = JWTUtils.verifyToken(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Error en autenticación', error as Error);
    res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Token inválido o expirado'));
  }
};

// Middleware de autorización por roles
export const authorizeRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Usuario no autenticado'));
      return;
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Permisos insuficientes'));
      return;
    }

    next();
  };
};

// Middleware de validación de entrada
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', error.details[0].message));
        return;
      }
      next();
    } catch (err) {
      logger.error('Error en validación de request', err as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  };
};

// Middleware de rate limiting
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: ResponseUtils.error('RATE_LIMIT_EXCEEDED', 'Demasiadas solicitudes, intente más tarde'),
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Middleware de seguridad
export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
];

// Middleware de logging de requests
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    };
    
    if (res.statusCode >= 400) {
      logger.error(`Request failed: ${req.method} ${req.url}`, undefined, logData);
    } else {
      logger.info(`Request: ${req.method} ${req.url}`, logData);
    }
  });
  
  next();
};

// Middleware de manejo de errores
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error no manejado', error, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (error.name === 'ValidationError') {
    res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', error.message));
    return;
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Token inválido'));
    return;
  }

  if (error.name === 'ForbiddenError') {
    res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Acceso denegado'));
    return;
  }

  if (error.name === 'NotFoundError') {
    res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Recurso no encontrado'));
    return;
  }

  res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
};

// Middleware de validación de archivos
export const validateFileUpload = (allowedTypes: string[], maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file && !req.files) {
      res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Archivo requerido'));
      return;
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : [req.file];
    
    for (const file of files) {
      if (!file) continue;
      
      if (!ValidationUtils.validateFileType(file.mimetype, allowedTypes)) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Tipo de archivo no permitido'));
        return;
      }
      
      if (!ValidationUtils.validateFileSize(file.size, maxSize)) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Archivo demasiado grande'));
        return;
      }
    }
    
    next();
  };
};

// Middleware de sanitización de entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return ValidationUtils.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Middleware de validación de UUID
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.params[paramName];
    
    if (!ValidationUtils.isValidUUID(uuid)) {
      res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', `ID inválido: ${paramName}`));
      return;
    }
    
    next();
  };
};

// Middleware de compresión
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Implementación básica de compresión
  const originalSend = res.send;
  
  res.send = function(data: any) {
    if (typeof data === 'string' && data.length > 1024) {
      res.setHeader('Content-Encoding', 'gzip');
    }
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware de health check
export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
};

// Middleware de validación de paginación
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (page < 1) {
    res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Página debe ser mayor a 0'));
    return;
  }
  
  if (limit < 1 || limit > 100) {
    res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Límite debe estar entre 1 y 100'));
    return;
  }
  
  req.pagination = { page, limit };
  next();
};

// Extender tipos de Express
declare global {
  namespace Express {
    interface Request {
      user?: any;
      pagination?: {
        page: number;
        limit: number;
      };
    }
  }
}
