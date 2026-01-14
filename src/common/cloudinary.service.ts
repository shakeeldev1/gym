import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'chat',
  ): Promise<{
    url: string;
    publicId: string;
    format: string;
    resourceType: string;
  }> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder: `thrive/${folder}`,
        resource_type: 'auto', // Automatically detect file type (image, video, audio, etc.)
      };

      // For audio files, specify audio resource type
      if (file.mimetype.startsWith('audio/')) {
        uploadOptions.resource_type = 'video'; // Cloudinary stores audio as video
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ File uploaded to Cloudinary:', result.secure_url);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              resourceType: result.resource_type,
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video', // For audio files
      });
      console.log('🗑️ File deleted from Cloudinary:', publicId);
      return result;
    } catch (error) {
      console.error('❌ Error deleting file from Cloudinary:', error);
      throw error;
    }
  }
}
