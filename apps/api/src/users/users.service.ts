import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface UserModel {
  id: string | number;
  email: string;
  passwordHash?: string | null;
  roles: string[];
  permissions: string[];
  active?: boolean;
}

function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

const TABLE = env('LEGACY_USER_TABLE', 'Users');
const COL_ID = env('USER_ID_COLUMN', 'Id');
const COL_EMAIL = env('USER_EMAIL_COLUMN', 'Email');
const COL_PASSWORD = env('USER_PASSWORD_COLUMN', 'PasswordHash');
const COL_ROLE = env('USER_ROLE_COLUMN', 'Role');
const COL_ACTIVE = env('USER_ACTIVE_COLUMN', 'Active');

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(row: any): UserModel {
    const roleValue = row[COL_ROLE];
    const roles = Array.isArray(roleValue)
      ? roleValue
      : typeof roleValue === 'string'
      ? roleValue.split(',').map((r: string) => r.trim()).filter(Boolean)
      : [];
    return {
      id: row[COL_ID],
      email: row[COL_EMAIL],
      passwordHash: row[COL_PASSWORD] ?? null,
      roles,
      permissions: [],
      active: row[COL_ACTIVE] ?? true,
    };
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const result = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`SELECT * FROM ${Prisma.raw(TABLE)} WHERE ${Prisma.raw(COL_EMAIL)} = ${email}`,
    );
    if (!result[0]) return null;
    return this.mapRow(result[0]);
  }

  async findById(id: string | number): Promise<UserModel | null> {
    const result = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`SELECT * FROM ${Prisma.raw(TABLE)} WHERE ${Prisma.raw(COL_ID)} = ${id}`,
    );
    if (!result[0]) return null;
    return this.mapRow(result[0]);
  }

  async list(page = 1, pageSize = 20): Promise<{ data: UserModel[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
        SELECT * FROM ${Prisma.raw(TABLE)}
        ORDER BY ${Prisma.raw(COL_ID)}
        OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
      `,
    );
    const count = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`SELECT COUNT(1) as total FROM ${Prisma.raw(TABLE)}`,
    );
    return { data: rows.map((r) => this.mapRow(r)), total: Number(count[0]?.total ?? 0) };
  }

  async create(data: { email: string; passwordHash?: string; roles?: string[]; active?: boolean }) {
    const roles = (data.roles ?? []).join(',');
    await this.prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO ${Prisma.raw(TABLE)} (${Prisma.raw(COL_EMAIL)}, ${Prisma.raw(COL_PASSWORD)}, ${Prisma.raw(COL_ROLE)}, ${Prisma.raw(COL_ACTIVE)})
        VALUES (${data.email}, ${data.passwordHash ?? null}, ${roles}, ${data.active ?? true})
      `,
    );
  }

  async update(id: string | number, data: Partial<{ email: string; roles: string[]; active: boolean }>) {
    const sets: Prisma.Sql[] = [];
    if (data.email !== undefined) {
      sets.push(Prisma.sql`${Prisma.raw(COL_EMAIL)} = ${data.email}`);
    }
    if (data.roles !== undefined) {
      sets.push(Prisma.sql`${Prisma.raw(COL_ROLE)} = ${data.roles.join(',')}`);
    }
    if (data.active !== undefined) {
      sets.push(Prisma.sql`${Prisma.raw(COL_ACTIVE)} = ${data.active}`);
    }
    if (!sets.length) return;
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE ${Prisma.raw(TABLE)} SET ${Prisma.join(sets, Prisma.sql`, `)} WHERE ${Prisma.raw(COL_ID)} = ${id}`,
    );
  }

  async updatePassword(id: string | number, passwordHash: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE ${Prisma.raw(TABLE)} SET ${Prisma.raw(COL_PASSWORD)} = ${passwordHash} WHERE ${Prisma.raw(COL_ID)} = ${id}`,
    );
  }

  async remove(id: string | number) {
    await this.prisma.$executeRaw(
      Prisma.sql`DELETE FROM ${Prisma.raw(TABLE)} WHERE ${Prisma.raw(COL_ID)} = ${id}`,
    );
  }
}

