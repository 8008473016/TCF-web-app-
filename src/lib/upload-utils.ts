import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { Client } from 'basic-ftp';
import { Readable } from 'stream';

export async function uploadFile(
  buffer: Buffer, 
  subDir: string, // e.g., 'products/sofas'
  fileName: string // e.g., 'my-image.jpg'
): Promise<string> {
  const ftpHost = process.env.FTP_HOST;
  const ftpUser = process.env.FTP_USER;
  const ftpPass = process.env.FTP_PASSWORD;
  
  const publicUrl = `/uploads/${subDir}/${fileName}`.replace(/\\/g, '/');

  // Use FTP if credentials are provided
  if (ftpHost && ftpUser && ftpPass) {
    const client = new Client();
    client.ftp.verbose = process.env.NODE_ENV !== 'production';

    try {
      await client.access({
        host: ftpHost,
        user: ftpUser,
        password: ftpPass,
        secure: false, 
      });

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      // FTP root is usually public_html (as per Hostinger screenshot)
      const ftpDir = `/public_html/uploads/${subDir}`.replace(/\\/g, '/');
      await client.ensureDir(ftpDir);
      await client.uploadFrom(stream, fileName);

      return publicUrl;
    } catch (err) {
      console.error('[FTP UPLOAD ERROR]:', err);
      throw new Error('Failed to upload file via FTP: ' + String(err));
    } finally {
      client.close();
    }
  }

  // Fallback to local file system
  const uploadRoot = process.env.UPLOADS_BASE_DIR || path.join(process.cwd(), "public", "uploads");
  const targetDir = path.join(uploadRoot, subDir);
  
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const targetFilePath = path.join(targetDir, fileName);
  await writeFile(targetFilePath, buffer);

  return publicUrl;
}
