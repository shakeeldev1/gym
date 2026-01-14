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
        chunk_size: 6000000, // 6MB chunks for large files
      };

      // For audio files, specify video resource type (Cloudinary convention)
      if (file.mimetype.startsWith('audio/')) {
        uploadOptions.resource_type = 'video';
      }

      // For video files, ensure proper resource type
      if (file.mimetype.startsWith('video/')) {
        uploadOptions.resource_type = 'video';
        uploadOptions.quality = 'auto'; // Optimize video quality
      }

      // For images, optimize
      if (file.mimetype.startsWith('image/')) {
        uploadOptions.resource_type = 'image';
        uploadOptions.quality = 'auto';
        uploadOptions.fetch_format = 'auto';
      }

      console.log('📤 Uploading to Cloudinary with options:', {
        folder: uploadOptions.folder,
        resourceType: uploadOptions.resource_type,
        fileSize: file.size,
        mimeType: file.mimetype,
      });

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            console.log('✅ File uploaded to Cloudinary:', result.secure_url);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              resourceType: result.resource_type,
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
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
