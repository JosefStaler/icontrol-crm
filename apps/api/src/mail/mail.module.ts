import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerAdapter, FakeMailerAdapter, SmtpMailerAdapter, MAILER_ADAPTER } from './mailer';

const MailerProvider = {
  provide: MAILER_ADAPTER,
  useFactory: () => {
    if (process.env.SMTP_HOST) {
      return new SmtpMailerAdapter({
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT ?? '587'),
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
        from: process.env.MAIL_FROM ?? 'noreply@example.com',
      });
    }
    return new FakeMailerAdapter();
  },
};

@Module({ providers: [MailerProvider, MailService], exports: [MailService] })
export class MailModule {}

