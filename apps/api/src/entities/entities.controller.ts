import { Controller, Get, Param, Patch, Query, Body, UseGuards, Req } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('entities')
@UseGuards(JwtAuthGuard)
export class EntitiesController {
  constructor(private readonly service: EntitiesService) {}

  @Get(':name')
  async list(
    @Param('name') name: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
  ) {
    return this.service.list(name, { page: Number(page) || 1, pageSize: Number(pageSize) || 20, sort, filter });
  }

  @Get(':name/:id')
  async getById(@Param('name') name: string, @Param('id') id: string) {
    return this.service.getById(name, id);
  }

  @Patch(':name/:id')
  async update(
    @Req() req: any,
    @Param('name') name: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    await this.service.update(name, id, body, req.user);
    return { success: true };
  }
}
