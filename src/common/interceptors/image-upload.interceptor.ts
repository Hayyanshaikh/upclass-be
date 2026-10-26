import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const ImageUploadInterceptor = () =>
  FileInterceptor('file', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter: (_req, file, callback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException('Unsupported image format'),
          false,
        );
      }

      callback(null, true);
    },
  });
