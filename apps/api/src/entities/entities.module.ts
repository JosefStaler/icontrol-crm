import { Module } from '@nestjs/common';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EntitiesController],
  providers: [EntitiesService, PrismaService],
})
export class EntitiesModule {}





