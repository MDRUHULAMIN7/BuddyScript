import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AppError from '../errors/AppError.js';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads', 'posts');

fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_ROOT);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || '.jpg';
    const name = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${name}${safeExt}`);
  },
});

export const uploadPostImage = multer({
  storage,
  limits: {
    // Keep this conservative by default; tune via config if needed.
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError(400, 'Only image uploads are allowed.'));
      return;
    }
    cb(null, true);
  },
});

