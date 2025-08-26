import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('retiradas')
  async retiradas(@Query('month') month?: string, @Query('year') year?: string) {
    return this.svc.retiradasByMonthYear(month, year);
  }
}


