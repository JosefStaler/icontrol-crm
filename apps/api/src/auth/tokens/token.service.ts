import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  private userIdToRefreshTokens = new Map<string | number, Set<string>>();
  private tokenExpiryTimes = new Map<string, number>();
  
  constructor(private readonly jwtService: JwtService) {}

  async storeRefreshToken(userId: string | number, token: string): Promise<void> {
    const set = this.userIdToRefreshTokens.get(userId) ?? new Set<string>();
    set.add(token);
    this.userIdToRefreshTokens.set(userId, set);
    
    // Armazena o tempo de expiração do token (7 dias)
    const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    this.tokenExpiryTimes.set(token, expiryTime);
    
    // Limpa tokens expirados periodicamente
    this.cleanupExpiredTokens();
  }

  async revokeRefreshToken(userId: string | number, token: string): Promise<void> {
    const set = this.userIdToRefreshTokens.get(userId);
    if (set) {
      set.delete(token);
    }
    this.tokenExpiryTimes.delete(token);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      // Verifica se o token não expirou
      const expiryTime = this.tokenExpiryTimes.get(token);
      if (expiryTime && Date.now() > expiryTime) {
        this.tokenExpiryTimes.delete(token);
        return null;
      }

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

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, expiryTime] of this.tokenExpiryTimes.entries()) {
      if (now > expiryTime) {
        this.tokenExpiryTimes.delete(token);
        // Remove o token de todos os usuários
        for (const [userId, set] of this.userIdToRefreshTokens.entries()) {
          set.delete(token);
          if (set.size === 0) {
            this.userIdToRefreshTokens.delete(userId);
          }
        }
      }
    }
  }
}






