import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller.ts';
import { CloudinaryService } from './cloudinary.service.ts';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
