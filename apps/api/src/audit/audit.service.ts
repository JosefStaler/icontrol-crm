import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function env(name: string, def: string) {
  return process.env[name] ?? def;
}

const AUDIT_TABLE = env('AUDIT_LOG_TABLE', '');
const COL_USER = env('AUDIT_LOG_USERID_COLUMN', 'UserId');
const COL_ACTION = env('AUDIT_LOG_ACTION_COLUMN', 'Action');
const COL_ENTITY = env('AUDIT_LOG_ENTITY_COLUMN', 'Entity');
const COL_ENTITYID = env('AUDIT_LOG_ENTITYID_COLUMN', 'EntityId');
const COL_TS = env('AUDIT_LOG_TIMESTAMP_COLUMN', 'CreatedAt');

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: string | number | null, action: string, entity: string, entityId: string | number | null) {
    const ts = new Date();
    if (!AUDIT_TABLE) {
      // eslint-disable-next-line no-console
      console.log('[AUDIT]', { userId, action, entity, entityId, timestamp: ts.toISOString() });
      return;
    }
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO ${AUDIT_TABLE} (${COL_USER}, ${COL_ACTION}, ${COL_ENTITY}, ${COL_ENTITYID}, ${COL_TS}) VALUES (@p0, @p1, @p2, @p3, @p4)`,
      userId,
      action,
      entity,
      entityId,
      ts,
    );
  }
}






