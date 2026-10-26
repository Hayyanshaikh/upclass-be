import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryController } from './cloudinary.controller.ts';
import { CloudinaryService } from './cloudinary.service.ts';

@Module({
  imports: [ConfigModule],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
