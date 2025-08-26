import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private table() {
    const schema = process.env.ENTITIES_DEFAULT_SCHEMA || 'dbo';
    return `${schema}.DashboardSettings`;
  }

  private async exists(): Promise<boolean> {
    const t = this.table();
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT 1 AS x FROM sys.objects WHERE object_id = OBJECT_ID(N'${t}') AND type = N'U'`,
    );
    return Boolean(rows[0]);
  }

  private async createIfMissing(): Promise<boolean> {
    const t = this.table();
    const has = await this.exists();
    if (has) return false;
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE ${t} (
          [Id] INT IDENTITY(1,1) PRIMARY KEY,
          [Dashboard] NVARCHAR(100) NOT NULL,
          [Json] NVARCHAR(MAX) NOT NULL,
          [UpdatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
        );
        CREATE UNIQUE INDEX IX_DashboardSettings_Dashboard ON ${t}([Dashboard]);
      `);
      return true;
    } catch (e) {
      throw new ForbiddenException('Sem permissão para criar a tabela DashboardSettings. Crie manualmente ou conceda permissão de DDL.');
    }
  }

  async get(dashboard: string): Promise<any | null> {
    const has = await this.exists();
    if (!has) return null;
    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`SELECT TOP 1 [Json] FROM ${Prisma.raw(this.table())} WHERE [Dashboard] = ${dashboard}`,
    );
    if (!rows[0]) return null;
    try { return JSON.parse(rows[0].Json); } catch { return null; }
  }

  async set(dashboard: string, json: any): Promise<void> {
    await this.createIfMissing();
    const payload = JSON.stringify(json);
    await this.prisma.$executeRaw(
      Prisma.sql`
      MERGE ${Prisma.raw(this.table())} AS t
      USING (SELECT ${dashboard} AS Dashboard, ${payload} AS Json) AS s
      ON t.[Dashboard] = s.[Dashboard]
      WHEN MATCHED THEN UPDATE SET t.[Json] = s.[Json], t.[UpdatedAt] = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT ([Dashboard],[Json]) VALUES (s.[Dashboard], s.[Json]);
    `,
    );
  }
}


