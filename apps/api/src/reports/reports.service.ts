import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseMonthToNumber(month?: string | number): number | null {
    if (month === undefined || month === null) return null;
    if (typeof month === 'number') return month;
    const trimmed = String(month).trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    const normalized = trimmed
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const map: Record<string, number> = {
      JANEIRO: 1,
      FEVEREIRO: 2,
      MARCO: 3,
      ABRIL: 4,
      MAIO: 5,
      JUNHO: 6,
      JULHO: 7,
      AGOSTO: 8,
      SETEMBRO: 9,
      OUTUBRO: 10,
      NOVEMBRO: 11,
      DEZEMBRO: 12,
    };
    return map[normalized] ?? null;
  }

  async retiradasByMonthYear(month?: string | number, year?: string | number) {
    const y = Number(year);
    if (!month || !y) throw new BadRequestException('Parâmetros obrigatórios: month (nome ou número), year');
    // Se o SP espera o mês por nome, mapeamos número->nome canônico PT-BR; se já veio nome, normalizamos para o canônico
    const canonicalMonths = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'] as const;
    let monthArg: string | number = month as any;
    if (typeof month === 'number' || (/^\d+$/.test(String(month)))) {
      const num = Number(month);
      if (num < 1 || num > 12) throw new BadRequestException('month inválido');
      monthArg = canonicalMonths[num - 1];
    } else {
      const mNum = this.parseMonthToNumber(month);
      if (!mNum) throw new BadRequestException('month inválido');
      monthArg = canonicalMonths[mNum - 1];
    }
    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`EXEC dbo.ControleRetiradas_api3 ${monthArg}, ${y}`);
    // Normaliza valores de data para evitar "virada" por fuso (UTC->local)
    // Converte Date para string YYYY-MM-DD (sem timezone) preservando o dia correto
    const normalized = rows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        if (v instanceof Date) {
          // Usa toISOString (UTC) e corta a parte da data
          out[k] = v.toISOString().slice(0, 10);
        } else {
          out[k] = v as unknown;
        }
      }
      return out;
    });
    return normalized;
  }
}


