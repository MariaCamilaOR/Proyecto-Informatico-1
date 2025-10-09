import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '@shared/utils';
import { ResponseUtils, UserRole } from '@shared/types';

export class AuthMiddleware {
  private logger = Logger.getInstance('AuthMiddleware');

  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      this.logger.warn('Intento de acceso sin token', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        path: req.path 
      });
      res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Token de acceso requerido'));
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET no configurado');
      }

      const decoded = jwt.verify(token, secret) as any;
      
      // Validar que el token no esté expirado
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Token expirado'));
        return;
      }

      // Agregar información del usuario al request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      };

      // Agregar headers para el servicio downstream
      req.headers['x-user-id'] = decoded.id;
      req.headers['x-user-role'] = decoded.role;
      req.headers['x-user-email'] = decoded.email;

      this.logger.debug('Usuario autenticado', { 
        userId: decoded.id, 
        role: decoded.role,
        path: req.path 
      });

      next();
    } catch (error) {
      this.logger.error('Error en autenticación', error as Error, { 
        ip: req.ip,
        path: req.path 
      });
      res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Token inválido o expirado'));
    }
  };

  authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Usuario no autenticado'));
        return;
      }

      const userRole = req.user.role as UserRole;
      if (!allowedRoles.includes(userRole)) {
        this.logger.warn('Intento de acceso con rol insuficiente', {
          userId: req.user.id,
          userRole,
          allowedRoles,
          path: req.path
        });
        res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Permisos insuficientes'));
        return;
      }

      this.logger.debug('Autorización exitosa', {
        userId: req.user.id,
        role: userRole,
        path: req.path
      });

      next();
    };
  };

  requirePatientAccess = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Usuario no autenticado'));
      return;
    }

    const userRole = req.user.role as UserRole;
    const patientId = req.params.patientId || req.body.patientId || req.query.patientId;

    if (!patientId) {
      res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'ID de paciente requerido'));
      return;
    }

    // Los administradores pueden acceder a cualquier paciente
    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    // Los pacientes solo pueden acceder a sus propios datos
    if (userRole === UserRole.PATIENT && req.user.id !== patientId) {
      this.logger.warn('Paciente intentó acceder a datos de otro paciente', {
        userId: req.user.id,
        requestedPatientId: patientId,
        path: req.path
      });
      res.status(403).json(ResponseUtils.error('FORBIDDEN', 'No puede acceder a datos de otros pacientes'));
      return;
    }

    // Los doctores y cuidadores necesitan verificación adicional
    // Esta verificación se haría consultando la base de datos
    // Por ahora, permitimos el acceso
    next();
  };

  requireDoctorAccess = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Usuario no autenticado'));
      return;
    }

    const userRole = req.user.role as UserRole;
    
    if (![UserRole.DOCTOR, UserRole.ADMIN].includes(userRole)) {
      this.logger.warn('Usuario no autorizado intentó acceder a funcionalidad de doctor', {
        userId: req.user.id,
        role: userRole,
        path: req.path
      });
      res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Solo los doctores pueden acceder a esta funcionalidad'));
      return;
    }

    next();
  };

  requireCaregiverAccess = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Usuario no autenticado'));
      return;
    }

    const userRole = req.user.role as UserRole;
    
    if (![UserRole.CAREGIVER, UserRole.ADMIN].includes(userRole)) {
      this.logger.warn('Usuario no autorizado intentó acceder a funcionalidad de cuidador', {
        userId: req.user.id,
        role: userRole,
        path: req.path
      });
      res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Solo los cuidadores pueden acceder a esta funcionalidad'));
      return;
    }

    next();
  };
}
