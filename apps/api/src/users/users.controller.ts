import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditService } from '../audit/audit.service';
import * as argon2 from 'argon2';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService, private readonly audit: AuditService) {}

  @Get()
  @Roles('admin')
  async list(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    return this.users.list(p, ps);
  }

  @Post()
  @Roles('admin')
  async create(@Req() req: any, @Body() body: { email: string; password?: string; roles?: string[]; active?: boolean }) {
    const passwordHash = body.password ? await argon2.hash(body.password) : undefined;
    await this.users.create({
      email: body.email,
      passwordHash,
      roles: body.roles,
      active: body.active,
    });
    await this.audit.log(req.user?.sub ?? null, 'create', 'User', body.email);
    return { success: true };
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: Partial<{ email: string; roles: string[]; active: boolean }>,
  ) {
    await this.users.update(id, body);
    await this.audit.log(req.user?.sub ?? null, 'update', 'User', id);
    return { success: true };
  }

  @Post(':id/force-reset')
  @Roles('admin')
  async forceReset(@Req() req: any, @Param('id') id: string) {
    await this.users.updatePassword(id, null as unknown as string);
    await this.audit.log(req.user?.sub ?? null, 'force_reset', 'User', id);
    return { success: true };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.users.remove(id);
    await this.audit.log(req.user?.sub ?? null, 'delete', 'User', id);
    return { success: true };
  }
}
