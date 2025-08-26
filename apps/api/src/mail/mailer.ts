import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export abstract class MailerAdapter {
  abstract send(options: SendMailOptions): Promise<void>;
}

export const MAILER_ADAPTER = 'MAILER_ADAPTER' as const;

export class FakeMailerAdapter extends MailerAdapter {
  async send(options: SendMailOptions): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('[FAKE MAIL]', options.subject, options.to);
    // eslint-disable-next-line no-console
    console.log(options.html);
  }
}

export class SmtpMailerAdapter extends MailerAdapter {
  constructor(private readonly cfg: { host: string; port: number; user: string; pass: string; from: string }) {
    super();
  }

  async send(options: SendMailOptions): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.cfg.host,
      port: this.cfg.port,
      auth: { user: this.cfg.user, pass: this.cfg.pass },
    });
    await transporter.sendMail({ from: this.cfg.from, to: options.to, subject: options.subject, html: options.html });
  }
}





