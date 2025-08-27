import { Inject, Injectable } from '@nestjs/common';
import { MailerAdapter, MAILER_ADAPTER } from './mailer';

@Injectable()
export class MailService {
  constructor(@Inject(MAILER_ADAPTER) private readonly mailer: MailerAdapter) {}

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    const html = `<p>Você solicitou redefinição de senha.</p><p>Clique no link para continuar (válido por 15 minutos):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`;
    await this.mailer.send({ to: email, subject: 'Redefinição de senha', html });
  }
}






