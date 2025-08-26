import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  private userIdToRefreshTokens = new Map<string | number, Set<string>>();
  constructor(private readonly jwtService: JwtService) {}

  async storeRefreshToken(userId: string | number, token: string): Promise<void> {
    const set = this.userIdToRefreshTokens.get(userId) ?? new Set<string>();
    set.add(token);
    this.userIdToRefreshTokens.set(userId, set);
  }

  async revokeRefreshToken(userId: string | number, token: string): Promise<void> {
    const set = this.userIdToRefreshTokens.get(userId);
    if (set) {
      set.delete(token);
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      })) as JwtPayload;
      const set = this.userIdToRefreshTokens.get(payload.sub);
      if (!set || !set.has(token)) return null;
      return payload;
    } catch {
      return null;
    }
  }
}





