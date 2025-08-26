import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { TokenService } from './tokens/token.service';

export interface JwtPayload {
  sub: string | number;
  email: string;
  roles: string[];
  permissions?: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    // Apenas aceita hashes Argon2; evita lançar 500 com hashes legados inválidos
    if (!user.passwordHash.startsWith('$argon2')) return null;
    try {
      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid) return null;
    } catch {
      return null;
    }
    return user;
  }

  async login(userId: string | number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES_IN ?? '7d',
    });

    await this.tokenService.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) throw new UnauthorizedException('Refresh inválido');

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const newAccess = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, roles: user.roles, permissions: user.permissions },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' },
    );

    return { accessToken: newAccess };
  }

  async logout(userId: string | number, refreshToken: string) {
    await this.tokenService.revokeRefreshToken(userId, refreshToken);
    return { success: true };
  }
}

