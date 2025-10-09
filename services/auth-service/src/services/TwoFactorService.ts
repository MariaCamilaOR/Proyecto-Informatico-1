import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { Logger } from '@shared/utils';

export class TwoFactorService {
  private logger = Logger.getInstance('TwoFactorService');

  generateSecret(userId: string): { secret: string; qrCodeUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `DoYouRemember (${userId})`,
      issuer: 'DoYouRemember',
      length: 32
    });

    const qrCodeUrl = QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Permitir tokens de los últimos 2 períodos
    });
  }

  generateToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32'
    });
  }
}
