import { Logger } from '@shared/utils';

export class EmailService {
  private logger = Logger.getInstance('EmailService');

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    // Implementación simplificada - en producción usar nodemailer
    this.logger.info(`Enviando email a: ${to}, Asunto: ${subject}`);
    // Aquí se implementaría el envío real del email
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Recuperación de Contraseña</h2>
      <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
    `;

    await this.sendEmail(email, 'Recuperación de Contraseña - DoYouRemember', html);
  }

  async sendInvitationEmail(email: string, invitationCode: string): Promise<void> {
    const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?code=${invitationCode}`;
    const html = `
      <h2>Invitación a DoYouRemember</h2>
      <p>Ha sido invitado a unirse a DoYouRemember como cuidador.</p>
      <a href="${invitationUrl}">Aceptar Invitación</a>
      <p>Este enlace expirará en 24 horas.</p>
    `;

    await this.sendEmail(email, 'Invitación a DoYouRemember', html);
  }
}
