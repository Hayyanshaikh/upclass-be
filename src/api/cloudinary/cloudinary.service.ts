import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.getOrThrow('CLOUDINARY_API_KEY'),
      api_secret: this.config.getOrThrow('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new InternalServerErrorException('Valid image required');
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'school-uploads', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            url: result?.secure_url,
            publicId: result?.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
  }

  // Common method: Safely delete Cloudinary image
  async deleteImageSafely(publicId: string | null | undefined): Promise<void> {
    if (!publicId) return;

    try {
      await this.deleteImage(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to delete Cloudinary image "${publicId}".`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  // Common method: Extract Cloudinary public ID from image URL
  extractPublicIdFromImageUrl(
    imageUrl: string | null | undefined,
  ): string | null {
    if (!imageUrl) return null;

    try {
      const url = new URL(imageUrl);

      if (url.hostname !== 'res.cloudinary.com') return null;

      const uploadPath = '/image/upload/';
      const uploadPathIndex = url.pathname.indexOf(uploadPath);

      if (uploadPathIndex === -1) return null;

      const assetPath = url.pathname.slice(uploadPathIndex + uploadPath.length);

      // Remove transformations, if present
      const pathWithoutTransformations = assetPath.replace(
        /^[^/]+\/(?=v\d+\/|[^/]+$)/,
        '',
      );

      const versionMatch = pathWithoutTransformations.match(/(?:^|\/)v\d+\//);

      const publicIdPath =
        versionMatch?.index !== undefined
          ? pathWithoutTransformations.slice(
              versionMatch.index + versionMatch[0].length,
            )
          : pathWithoutTransformations;

      return decodeURIComponent(publicIdPath).replace(/\.[^/.]+$/, '') || null;
    } catch {
      return null;
    }
  }
}
