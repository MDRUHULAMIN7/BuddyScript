import { v2 as cloudinary } from 'cloudinary';
import type { Express } from 'express';
import config from './index.js';
import AppError from '../errors/AppError.js';

if (config.hasCompleteCloudinaryConfig) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    secure: true,
  });
}

const ensureCloudinaryConfig = () => {
  if (!config.hasCompleteCloudinaryConfig) {
    throw new AppError(500, 'Cloudinary is not configured on the server.');
  }
};

export const uploadImageToCloudinary = async (file: Express.Multer.File) => {
  ensureCloudinaryConfig();

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'buddyscript/posts',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(new AppError(502, 'Image upload failed. Please try again.'));
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });
};
