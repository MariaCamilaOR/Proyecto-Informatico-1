import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Patient } from '../entities/Patient';
import { Caregiver } from '../entities/Caregiver';
import { Doctor } from '../entities/Doctor';
import { ResponseUtils, PasswordUtils, Logger } from '@shared/utils';

export class UserController {
  private logger = Logger.getInstance('UserController');

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRepository = getRepository(User);
      
      const user = await userRepository.findOne({ 
        where: { id: userId },
        relations: ['refreshTokens']
      });

      if (!user) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Usuario no encontrado'));
        return;
      }

      res.json(ResponseUtils.success({ user: user.toJSON() }));
    } catch (error) {
      this.logger.error('Error al obtener perfil', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, profilePicture } = req.body;
      
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Usuario no encontrado'));
        return;
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (profilePicture) user.profilePicture = profilePicture;

      await userRepository.save(user);

      res.json(ResponseUtils.success({ user: user.toJSON() }));
    } catch (error) {
      this.logger.error('Error al actualizar perfil', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Contraseña actual y nueva son requeridas'));
        return;
      }

      const passwordValidation = PasswordUtils.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', passwordValidation.errors.join(', ')));
        return;
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Usuario no encontrado'));
        return;
      }

      const isCurrentPasswordValid = await PasswordUtils.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Contraseña actual incorrecta'));
        return;
      }

      user.password = await PasswordUtils.hashPassword(newPassword);
      await userRepository.save(user);

      res.json(ResponseUtils.success({ message: 'Contraseña actualizada exitosamente' }));
    } catch (error) {
      this.logger.error('Error al cambiar contraseña', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { password } = req.body;

      if (!password) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Contraseña requerida para eliminar cuenta'));
        return;
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Usuario no encontrado'));
        return;
      }

      const isPasswordValid = await PasswordUtils.comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Contraseña incorrecta'));
        return;
      }

      user.isActive = false;
      await userRepository.save(user);

      res.json(ResponseUtils.success({ message: 'Cuenta eliminada exitosamente' }));
    } catch (error) {
      this.logger.error('Error al eliminar cuenta', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async linkPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.body;
      const userId = req.user!.id;

      if (!patientId) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'ID de paciente requerido'));
        return;
      }

      // Implementar lógica de vinculación
      res.json(ResponseUtils.success({ message: 'Paciente vinculado exitosamente' }));
    } catch (error) {
      this.logger.error('Error al vincular paciente', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async unlinkPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const userId = req.user!.id;

      // Implementar lógica de desvinculación
      res.json(ResponseUtils.success({ message: 'Paciente desvinculado exitosamente' }));
    } catch (error) {
      this.logger.error('Error al desvincular paciente', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async getLinkedPatients(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Implementar lógica para obtener pacientes vinculados
      res.json(ResponseUtils.success({ patients: [] }));
    } catch (error) {
      this.logger.error('Error al obtener pacientes vinculados', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }
}
