import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { AuthModule } from './api/auth/auth.module.ts';
import { UserModule } from './api/user/user.module.ts';
import { PrismaModule } from './database/prisma.module.ts';
import { RolesModule } from './api/roles/roles.module.ts';
import { PermissionsModule } from './api/permissions/permissions.module.ts';
import { TeachersModule } from './api/teachers/teachers.module.ts';
import { SubjectsModule } from './api/subjects/subjects.module.ts';
import { ClassesModule } from './api/classes/classes.module.ts';
import { AcademicYearsModule } from './api/academic-years/academic-years.module.ts';
import { AcademicTermsModule } from './api/academic-terms/academic-terms.module.ts';
import { AcademicYearTermsModule } from './api/academic-year-terms/academic-year-terms.module.ts';
import { CloudinaryModule } from './api/cloudinary/cloudinary.module.js';
import { SchoolsModule } from './api/schools/schools.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RolesModule,
    PermissionsModule,
    TeachersModule,
    SubjectsModule,
    ClassesModule,
    AcademicYearsModule,
    AcademicTermsModule,
    AcademicYearTermsModule,
    CloudinaryModule,
    SchoolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
