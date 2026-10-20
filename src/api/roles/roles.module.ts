import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.ts';
import { RolesController } from './roles.controller.ts';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
