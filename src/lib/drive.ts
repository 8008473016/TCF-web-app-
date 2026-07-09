import fs from 'fs';
import path from 'path';

export const driveService = {
  /**
   * Uploads a file by saving it locally, returning a public URL.
   * @param localFilePath Path of the file on local disk (e.g. from multer/temp)
   * @param filename Desired name of the file in the cloud/storage
   * @param mimeType MIME type of the file
   */
  uploadFile: async (localFilePath: string, filename: string, mimeType: string): Promise<string> => {
    return getLocalFileUrl(localFilePath, filename);
  }
};

function getLocalFileUrl(tempPath: string, filename: string): string {
  const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const destinationPath = path.join(uploadsDir, filename);
  
  fs.renameSync(tempPath, destinationPath);

  return `/uploads/${filename}`;
}
