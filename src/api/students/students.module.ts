import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.ts';
import { StudentsController } from './students.controller.ts';
import { StudentsService } from './students.service.ts';

@Module({
  imports: [CloudinaryModule],
  controllers: [StudentsController],
  providers: [StudentsService, PermissionsGuard],
  exports: [StudentsService],
})
export class StudentsModule {}
