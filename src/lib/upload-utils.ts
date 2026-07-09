import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary using the provided credentials
cloudinary.config({
  cloud_name: 'pqp0ihf2',
  api_key: '574596185212916',
  api_secret: '_6sxtzAG820pg2-qBZrIDlpA0jg'
});

export async function uploadFile(
  buffer: Buffer, 
  subDir: string, // e.g., 'media/general'
  fileName: string // e.g., 'my-image.jpg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Cloudinary automatically handles extensions, so we can strip it from public_id if desired, 
    // or keep it. It's safer to strip to avoid '.jpg.jpg'.
    const publicId = fileName.replace(/\.[^/.]+$/, "");
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `tcf/${subDir}`,
        public_id: publicId
      },
      (error, result) => {
        if (error || !result) {
          console.error('[CLOUDINARY UPLOAD ERROR]:', error);
          reject(new Error('Failed to upload file via Cloudinary: ' + String(error?.message || error)));
        } else {
          // Return the absolute HTTPS URL from Cloudinary
          resolve(result.secure_url);
        }
      }
    );

    // Write the buffer to the stream
    uploadStream.end(buffer);
  });
}
