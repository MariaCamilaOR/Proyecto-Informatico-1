import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Patient } from '../entities/Patient';
import { Caregiver } from '../entities/Caregiver';
import { Doctor } from '../entities/Doctor';
import { RefreshToken } from '../entities/RefreshToken';
import { UserRole, LoginRequest, RegisterRequest, AuthTokens } from '@shared/types';
import { JWTUtils, PasswordUtils, ResponseUtils, ValidationUtils, Logger } from '@shared/utils';
import { AuthService } from '../services/AuthService';
import { TwoFactorService } from '../services/TwoFactorService';
import { EmailService } from '../services/EmailService';

export class AuthController {
  private authService = new AuthService();
  private twoFactorService = new TwoFactorService();
  private emailService = new EmailService();
  private logger = Logger.getInstance('AuthController');

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, twoFactorCode }: LoginRequest = req.body;

      // Validar entrada
      if (!email || !password) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Email y contraseña son requeridos'));
        return;
      }

      if (!ValidationUtils.isValidEmail(email)) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Email inválido'));
        return;
      }

      // Buscar usuario
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ 
        where: { email: email.toLowerCase() },
        relations: ['refreshTokens']
      });

      if (!user) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Credenciales inválidas'));
        return;
      }

      if (!user.isActive) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Cuenta desactivada'));
        return;
      }

      // Verificar contraseña
      const isPasswordValid = await PasswordUtils.comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Credenciales inválidas'));
        return;
      }

      // Verificar 2FA si está habilitado
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          res.status(200).json(ResponseUtils.success({
            requiresTwoFactor: true,
            message: 'Código 2FA requerido'
          }));
          return;
        }

        const isTwoFactorValid = this.twoFactorService.verifyToken(user.twoFactorSecret!, twoFactorCode);
        if (!isTwoFactorValid) {
          res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Código 2FA inválido'));
          return;
        }
      }

      // Generar tokens
      const tokens = await this.authService.generateTokens(user);
      
      // Actualizar último login
      user.lastLoginAt = new Date();
      await userRepository.save(user);

      this.logger.info('Login exitoso', { userId: user.id, email: user.email });

      res.json(ResponseUtils.success({
        user: user.toJSON(),
        tokens
      }));

    } catch (error) {
      this.logger.error('Error en login', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, dateOfBirth, medicalRecordNumber, licenseNumber, specialization }: RegisterRequest = req.body;

      // Validar entrada
      if (!email || !password || !firstName || !lastName || !role) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Todos los campos son requeridos'));
        return;
      }

      if (!ValidationUtils.isValidEmail(email)) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Email inválido'));
        return;
      }

      const passwordValidation = PasswordUtils.validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', passwordValidation.errors.join(', ')));
        return;
      }

      // Verificar si el usuario ya existe
      const userRepository = getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        res.status(409).json(ResponseUtils.error('CONFLICT', 'El email ya está registrado'));
        return;
      }

      // Crear usuario
      const hashedPassword = await PasswordUtils.hashPassword(password);
      const user = userRepository.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role
      });

      const savedUser = await userRepository.save(user);

      // Crear perfil específico según el rol
      await this.createUserProfile(savedUser, {
        dateOfBirth,
        medicalRecordNumber,
        licenseNumber,
        specialization
      });

      // Generar tokens
      const tokens = await this.authService.generateTokens(savedUser);

      this.logger.info('Registro exitoso', { userId: savedUser.id, email: savedUser.email, role });

      res.status(201).json(ResponseUtils.success({
        user: savedUser.toJSON(),
        tokens
      }));

    } catch (error) {
      this.logger.error('Error en registro', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;
      
      if (refreshToken) {
        await this.authService.revokeRefreshToken(refreshToken);
      }

      this.logger.info('Logout exitoso', { userId: req.user?.id });

      res.json(ResponseUtils.success({ message: 'Logout exitoso' }));

    } catch (error) {
      this.logger.error('Error en logout', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Refresh token requerido'));
        return;
      }

      const tokens = await this.authService.refreshAccessToken(refreshToken);

      res.json(ResponseUtils.success({ tokens }));

    } catch (error) {
      this.logger.error('Error en refresh token', error as Error);
      res.status(401).json(ResponseUtils.error('UNAUTHORIZED', 'Refresh token inválido'));
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || !ValidationUtils.isValidEmail(email)) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Email válido requerido'));
        return;
      }

      await this.authService.sendPasswordResetEmail(email);

      res.json(ResponseUtils.success({ 
        message: 'Si el email existe, se enviará un enlace de recuperación' 
      }));

    } catch (error) {
      this.logger.error('Error en forgot password', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Token y nueva contraseña son requeridos'));
        return;
      }

      const passwordValidation = PasswordUtils.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', passwordValidation.errors.join(', ')));
        return;
      }

      await this.authService.resetPassword(token, newPassword);

      res.json(ResponseUtils.success({ message: 'Contraseña actualizada exitosamente' }));

    } catch (error) {
      this.logger.error('Error en reset password', error as Error);
      res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', (error as Error).message));
    }
  }

  async setup2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { secret, qrCodeUrl } = this.twoFactorService.generateSecret(userId);

      // Guardar secret temporalmente (en producción, usar Redis)
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json(ResponseUtils.error('NOT_FOUND', 'Usuario no encontrado'));
        return;
      }

      user.twoFactorSecret = secret;
      await userRepository.save(user);

      res.json(ResponseUtils.success({
        secret,
        qrCodeUrl
      }));

    } catch (error) {
      this.logger.error('Error en setup 2FA', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { token } = req.body;

      if (!token) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Token 2FA requerido'));
        return;
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user || !user.twoFactorSecret) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', '2FA no configurado'));
        return;
      }

      const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, token);
      if (!isValid) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Token 2FA inválido'));
        return;
      }

      user.twoFactorEnabled = true;
      await userRepository.save(user);

      res.json(ResponseUtils.success({ message: '2FA habilitado exitosamente' }));

    } catch (error) {
      this.logger.error('Error en verify 2FA', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  async disable2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { password } = req.body;

      if (!password) {
        res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', 'Contraseña requerida'));
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

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await userRepository.save(user);

      res.json(ResponseUtils.success({ message: '2FA deshabilitado exitosamente' }));

    } catch (error) {
      this.logger.error('Error en disable 2FA', error as Error);
      res.status(500).json(ResponseUtils.error('INTERNAL_ERROR', 'Error interno del servidor'));
    }
  }

  private async createUserProfile(user: User, profileData: any): Promise<void> {
    const { dateOfBirth, medicalRecordNumber, licenseNumber, specialization } = profileData;

    switch (user.role) {
      case UserRole.PATIENT:
        if (!dateOfBirth || !medicalRecordNumber) {
          throw new Error('Fecha de nacimiento y número de expediente médico son requeridos para pacientes');
        }
        const patientRepository = getRepository(Patient);
        const patient = patientRepository.create({
          user,
          dateOfBirth: new Date(dateOfBirth),
          medicalRecordNumber
        });
        await patientRepository.save(patient);
        break;

      case UserRole.CAREGIVER:
        const caregiverRepository = getRepository(Caregiver);
        const caregiver = caregiverRepository.create({
          user,
          relationship: 'Familiar' // Valor por defecto
        });
        await caregiverRepository.save(caregiver);
        break;

      case UserRole.DOCTOR:
        if (!licenseNumber || !specialization) {
          throw new Error('Número de licencia y especialización son requeridos para doctores');
        }
        const doctorRepository = getRepository(Doctor);
        const doctor = doctorRepository.create({
          user,
          licenseNumber,
          specialization
        });
        await doctorRepository.save(doctor);
        break;
    }
  }
}
