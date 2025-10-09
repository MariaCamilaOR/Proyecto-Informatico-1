import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { JWTUtils, ResponseUtils, Logger } from '@shared/utils';

export class AuthMiddleware {
  private logger = Logger.getInstance('AuthMiddleware');

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Token de acceso requerido'));
        return;
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET no configurado');
      }

      const decoded = JWTUtils.verifyToken(token, secret);
      
      // Verificar que el usuario existe y está activo
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });
      
      if (!user || !user.isActive) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Usuario no válido'));
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      this.logger.error('Error en autenticación', error as Error);
      res.status(403).json(ResponseUtils.error('FORBIDDEN', 'Token inválido o expirado'));
    }
  };
}
