import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { TeachersController } from './teachers.controller.ts';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.ts';
import { TeachersService } from './teachers.service.ts';

@Module({
  imports: [CloudinaryModule],
  controllers: [TeachersController],
  providers: [TeachersService, PermissionsGuard],
  exports: [TeachersService],
})
export class TeachersModule {}
