import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import crypto from 'node:crypto';
import { addMinutes } from 'date-fns';
import * as argon2 from 'argon2';
import { MailService } from '../mail/mail.service';

interface ResetTokenInfo {
  userId: string | number;
  expiresAt: Date;
}

@Injectable()
export class PasswordResetService {
  private tokens = new Map<string, ResetTokenInfo>();

  constructor(private readonly usersService: UsersService, private readonly mail: MailService) {}

  async requestReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // não vaza info
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = addMinutes(new Date(), 15);
    this.tokens.set(token, { userId: user.id, expiresAt });

    const resetUrl = `${process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    await this.mail.sendPasswordReset(email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const info = this.tokens.get(token);
    if (!info || info.expiresAt < new Date()) throw new UnauthorizedException('Token inválido');
    const hash = await argon2.hash(newPassword);
    await this.usersService.updatePassword(info.userId, hash);
    this.tokens.delete(token);
  }
}





