import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard-settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  @Get(':dashboard')
  async get(@Param('dashboard') dashboard: string) {
    const json = await this.svc.get(dashboard);
    return { dashboard, settings: json };
  }

  @Post(':dashboard')
  async set(@Param('dashboard') dashboard: string, @Body() body: any) {
    await this.svc.set(dashboard, body ?? {});
    return { success: true };
  }
}


