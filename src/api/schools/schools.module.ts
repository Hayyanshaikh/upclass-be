import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service.ts';
import { SchoolsController } from './schools.controller.ts';
import { SchoolDefaultsService } from './school-defaults.service.ts';
import { CloudinaryService } from '../cloudinary/cloudinary.service.ts';

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsService, SchoolDefaultsService, CloudinaryService],
})
export class SchoolsModule {}
