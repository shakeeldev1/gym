import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('uploads/:type/:filename')
  async serveFile(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = join(process.cwd(), 'uploads', type, filename);
      
      // Security: prevent directory traversal
      const baseDir = join(process.cwd(), 'uploads');
      const normalizedPath = join(filePath);
      
      if (!normalizedPath.startsWith(baseDir)) {
        console.error('🚫 Directory traversal attempt:', filePath);
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (!existsSync(filePath)) {
        console.error('📁 File not found:', filePath);
        return res.status(404).json({ error: 'File not found' });
      }

      // Determine MIME type based on file extension
      const mimeTypes = {
        '.webm': 'audio/webm',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
      };

      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      console.log(`📤 Serving file: ${filename}, MIME: ${mimeType}`);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Accept-Ranges', 'bytes');

      const stream = createReadStream(filePath);
      
      stream.on('error', (error) => {
        console.error('❌ Stream error:', error);
        res.status(500).json({ error: 'Error reading file' });
      });

      stream.pipe(res);
    } catch (error) {
      console.error('❌ Error serving file:', error);
      res.status(500).json({ error: 'Error serving file' });
    }
  }
}
