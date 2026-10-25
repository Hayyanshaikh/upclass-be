import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service.ts';
import { TeachersController } from './teachers.controller.ts';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
