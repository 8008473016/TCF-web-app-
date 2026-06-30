import fs from 'fs';
import path from 'path';
import { JWT } from 'google-auth-library';
import { drive as googleDrive } from '@googleapis/drive';
import { config, isGoogleConfigured } from './config';

let authClient: JWT | null = null;
let driveApi: any = null;

if (isGoogleConfigured) {
  try {
    authClient = new JWT({
      email: config.google.serviceAccountEmail,
      key: config.google.privateKey,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });
    driveApi = googleDrive({ version: 'v3', auth: authClient });
    console.log('Google Drive API successfully authenticated.');
  } catch (error) {
    console.error('Failed to authenticate Google Drive API, falling back to local storage:', error);
  }
}

export const driveService = {
  /**
   * Uploads a file to Google Drive or saves locally, returning a public URL.
   * @param localFilePath Path of the file on local disk (e.g. from multer/temp)
   * @param filename Desired name of the file in the cloud/storage
   * @param mimeType MIME type of the file
   */
  uploadFile: async (localFilePath: string, filename: string, mimeType: string): Promise<string> => {
    if (driveApi && config.google.driveFolderId) {
      try {
        const fileMetadata = {
          name: filename,
          parents: [config.google.driveFolderId],
        };
        const media = {
          mimeType: mimeType,
          body: fs.createReadStream(localFilePath),
        };

        const response = await driveApi.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink, webContentLink',
        });

        const fileId = response.data.id;
        if (!fileId) throw new Error('Failed to retrieve file ID from Google Drive response');

        await driveApi.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });

        const publicUrl = response.data.webContentLink || response.data.webViewLink || '';
        
        try {
          fs.unlinkSync(localFilePath);
        } catch (err) {
          console.error('Failed to delete temporary local upload file:', err);
        }

        return publicUrl;
      } catch (error) {
        console.error('Google Drive Upload failed, keeping file locally:', error);
        return getLocalFileUrl(localFilePath, filename);
      }
    } else {
      return getLocalFileUrl(localFilePath, filename);
    }
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
