import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { JWTUtils, Logger } from '@shared/utils';
import { AuthTokens } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private logger = Logger.getInstance('AuthService');

  async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no configurado');
    }

    const tokens = JWTUtils.generateTokens(payload, secret);
    
    // Guardar refresh token en la base de datos
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer'
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const refreshTokenRepository = getRepository(RefreshToken);
    const tokenRecord = await refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user']
    });

    if (!tokenRecord || !tokenRecord.isValid()) {
      throw new Error('Refresh token inválido o expirado');
    }

    // Revocar el token actual
    tokenRecord.revoke();
    await refreshTokenRepository.save(tokenRecord);

    // Generar nuevos tokens
    return this.generateTokens(tokenRecord.user);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const refreshTokenRepository = getRepository(RefreshToken);
    const tokenRecord = await refreshTokenRepository.findOne({
      where: { token: refreshToken }
    });

    if (tokenRecord) {
      tokenRecord.revoke();
      await refreshTokenRepository.save(tokenRecord);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const refreshTokenRepository = getRepository(RefreshToken);
    const tokens = await refreshTokenRepository.find({
      where: { userId, isRevoked: false }
    });

    for (const token of tokens) {
      token.revoke();
    }

    await refreshTokenRepository.save(tokens);
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const refreshTokenRepository = getRepository(RefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    const refreshToken = refreshTokenRepository.create({
      token,
      userId,
      expiresAt
    });

    await refreshTokenRepository.save(refreshToken);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    // Implementación simplificada - en producción usar servicio de email
    this.logger.info(`Enviando email de recuperación a: ${email}`);
    // Aquí se implementaría el envío real del email
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Implementación simplificada - en producción validar token
    this.logger.info(`Reseteando contraseña con token: ${token}`);
    // Aquí se implementaría la lógica real de reset
  }
}
