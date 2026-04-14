import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
}

export const uploadToCloudinary = async (
  file: File | Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any[];
  } = {}
): Promise<UploadResult> => {
  const { folder = 'dd-ammini', public_id, transformation } = options;

  const uploadOptions: any = {
    folder,
    resource_type: 'auto',
  };

  if (public_id) uploadOptions.public_id = public_id;
  if (transformation) uploadOptions.transformation = transformation;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as UploadResult);
        }
      }
    );

    if (file instanceof File) {
      // Convert File to buffer
      file.arrayBuffer().then(arrayBuffer => {
        const buffer = Buffer.from(arrayBuffer);
        const { Readable } = require('stream');
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(uploadStream);
      }).catch(reject);
    } else {
      // File is already a buffer
      const { Readable } = require('stream');
      const readable = new Readable();
      readable.push(file);
      readable.push(null);
      readable.pipe(uploadStream);
    }
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export default cloudinary;