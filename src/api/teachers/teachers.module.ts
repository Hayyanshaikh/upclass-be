import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service.ts';
import { TeachersController } from './teachers.controller.ts';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.ts';

@Module({
  imports: [CloudinaryModule],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
