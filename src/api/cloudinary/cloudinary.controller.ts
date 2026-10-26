import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service.ts';
import type { Express } from 'express';
import { ImageUploadInterceptor } from '../../common/interceptors/image-upload.interceptor.ts';

@ApiTags('Uploads')
@Controller('uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload an image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(ImageUploadInterceptor())
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file required');
    const returnFile = this.cloudinaryService.uploadImage(file);
    console.log({ returnFile });

    return returnFile;
  }
}
