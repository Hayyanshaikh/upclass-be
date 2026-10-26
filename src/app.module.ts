import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { AuthModule } from './api/auth/auth.module.ts';
import { UserModule } from './api/user/user.module.ts';
import { PrismaModule } from './database/prisma.module.ts';
import { RolesModule } from './api/roles/roles.module.ts';
import { PermissionsModule } from './api/permissions/permissions.module.ts';
import { TeachersModule } from './api/teachers/teachers.module.ts';
import { CloudinaryModule } from './api/cloudinary/cloudinary.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    RolesModule,
    PermissionsModule,
    TeachersModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
