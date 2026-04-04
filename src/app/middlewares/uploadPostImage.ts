import multer from 'multer';
import AppError from '../errors/AppError.js';

const allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export const uploadPostImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    // Keep this under Vercel's practical serverless request ceiling.
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError(400, 'Only image uploads are allowed.'));
      return;
    }
    cb(null, true);
  },
});

