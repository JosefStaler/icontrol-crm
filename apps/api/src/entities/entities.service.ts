import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface ListOptions {
  page: number;
  pageSize: number;
  sort?: string; // col:asc|desc
  filter?: string; // JSON string: { col: value }
}

@Injectable()
export class EntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private getQualifiedTable(name: string): string {
    const lower = name.toLowerCase();
    const schema = process.env.ENTITIES_DEFAULT_SCHEMA || 'dbo';
    // Override para Customers via .env (ex.: ENTITIES_CUSTOMERS_TABLE="dbo.customers_modelo")
    if (lower === 'customers') {
      const override = process.env.ENTITIES_CUSTOMERS_TABLE;
      if (override && override.trim()) {
        if (override.includes('.')) return override; // já qualificado
        return `${schema}.${override}`;
      }
    }
    if (name.includes('.')) return name;
    return `${schema}.${name}`;
  }

  private getIdColumn(name: string): string {
    const lower = name.toLowerCase();
    if (lower === 'customers') {
      return process.env.ENTITIES_CUSTOMERS_ID_COLUMN || process.env.ENTITIES_ID_COLUMN || 'Id';
    }
    return process.env.ENTITIES_ID_COLUMN || 'Id';
  }

  async list(name: string, opts: ListOptions) {
    const offset = (opts.page - 1) * opts.pageSize;
    const idCol = this.getIdColumn(name);
    const orderBy = this.parseSort(opts.sort, idCol) ?? Prisma.sql`${Prisma.raw(idCol)} ASC`;
    const filter = this.parseFilter(opts.filter);
    const whereSql = this.buildWhere(filter);
    const table = this.getQualifiedTable(name);

    const start = offset + 1;
    const end = offset + opts.pageSize;
    const rowsRaw = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
        WITH t AS (
          SELECT CAST(ROW_NUMBER() OVER (ORDER BY ${orderBy}) AS INT) AS rn, *
          FROM ${Prisma.raw(table)}
          ${whereSql}
        )
        SELECT * FROM t WHERE rn BETWEEN ${Prisma.raw(String(start))} AND ${Prisma.raw(String(end))}
      `,
    );
    const rows = rowsRaw.map((r) => this.normalizeRow(r));
    const count = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`SELECT COUNT(1) as total FROM ${Prisma.raw(table)} ${whereSql}`,
    );
    return { data: rows, total: Number(count[0]?.total ?? 0) };
  }

  async getById(name: string, id: string | number) {
    const table = this.getQualifiedTable(name);
    const idCol = this.getIdColumn(name);
    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`SELECT * FROM ${Prisma.raw(table)} WHERE ${Prisma.raw(idCol)} = ${id}`,
    );
    return rows[0] ? this.normalizeRow(rows[0]) : null;
  }

  async update(name: string, id: string | number, data: Record<string, unknown>, user?: any) {
    if (!this.canUpdate(name, user)) {
      throw new ForbiddenException('Sem permissão para atualizar');
    }
    const table = this.getQualifiedTable(name);
    const idCol = this.getIdColumn(name);
    const normalize = (v: unknown) => (typeof v === 'boolean' ? Number(v) : v);
    const idValue = typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id;

    // Caminho robusto e whitelista para Customers
    if (name.toLowerCase() === 'customers') {
      const nameVal = (data as any)['Name'];
      const emailVal = (data as any)['Email'];
      const activeRaw = (data as any)['Active'];
      const activeVal = activeRaw === undefined ? null : Number(Boolean(activeRaw));
      // Usa COALESCE para só alterar campos enviados, evitando SQL dinâmico de colunas
      await this.prisma.$executeRaw(
        Prisma.sql`
          UPDATE ${Prisma.raw(table)}
          SET [Name] = COALESCE(${nameVal ?? null}, [Name]),
              [Email] = COALESCE(${emailVal ?? null}, [Email]),
              [Active] = COALESCE(${activeVal}, [Active])
          WHERE ${Prisma.raw('[' + idCol + ']')} = ${idValue}
        `,
      );
      return;
    }

    // Genérico (mantido, mas agora após o caminho seguro acima)
    const entries = Object.entries(data).filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v as string));
    if (!entries.length) throw new BadRequestException('Nenhum campo válido');
    const setParts: Prisma.Sql[] = entries.map(([key, value]) => Prisma.sql`${Prisma.raw('[' + key + ']')} = ${normalize(value)}`);
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE ${Prisma.raw(table)} SET ${Prisma.join(setParts, Prisma.sql`, `)} WHERE ${Prisma.raw('[' + idCol + ']')} = ${normalize(idValue)}`,
    );
  }

  private parseSort(sort?: string): Prisma.Sql | null {
    if (!sort) return null;
    const [col, dir] = sort.split(':');
    if (!col) return null;
    const direction = dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return Prisma.sql`${Prisma.raw(col)} ${Prisma.raw(direction)}`;
  }

  private parseFilter(filter?: string): Record<string, string | number | boolean> {
    if (!filter) return {};
    try {
      const parsed = JSON.parse(filter);
      if (typeof parsed !== 'object' || parsed === null) return {};
      return parsed as Record<string, string | number | boolean>;
    } catch {
      return {};
    }
  }

  private buildWhere(filter: Record<string, string | number | boolean>): Prisma.Sql {
    const parts: Prisma.Sql[] = [];
    for (const [key, value] of Object.entries(filter)) {
      parts.push(Prisma.sql`${Prisma.raw(key)} = ${value as any}`);
    }
    if (!parts.length) return Prisma.empty;
    return Prisma.sql`WHERE ${Prisma.join(parts, Prisma.sql` AND `)}`;
  }

  private canUpdate(entityName: string, user?: any): boolean {
    if (!user) return false;
    const roles: string[] = user.roles ?? [];
    const perms: string[] = user.permissions ?? [];
    if (roles.includes('admin') || roles.includes('manager')) return true;
    return perms.includes(`${entityName}:update`);
  }

  private normalizeRow(row: any): any {
    const out: any = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === 'rn') continue; // remove coluna auxiliar de paginação
      if (typeof v === 'bigint') {
        const asNumber = Number(v);
        out[k] = Number.isSafeInteger(asNumber) ? asNumber : String(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
}
