import dotenv from 'dotenv';
import path from 'path';

type TJwtExpiresIn = `${number}${'d' | 'h' | 'm' | 's'}`;

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const port = Number(process.env.PORT ?? 5000);
const databaseUrl = process.env.DATABASE_URL;
const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
const nodeEnv = process.env.NODE_ENV ?? 'development';
const frontendUrls = (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const frontendUrl = frontendUrls[0] ?? 'http://localhost:3000';
const authCookieName = process.env.AUTH_COOKIE_NAME ?? 'buddyscript_access_token';
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtAccessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '7d') as TJwtExpiresIn;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY?.trim();
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

const hasPartialCloudinaryConfig = [
  cloudinaryCloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
].some(Boolean);
const hasCompleteCloudinaryConfig = Boolean(
  cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret,
);

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing from backend/.env');
}

if (!jwtAccessSecret) {
  throw new Error('JWT_ACCESS_SECRET is missing from backend/.env');
}

if (hasPartialCloudinaryConfig && !hasCompleteCloudinaryConfig) {
  throw new Error(
    'Cloudinary configuration is incomplete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET together.',
  );
}

export default {
  authCookieName,
  bcryptSaltRounds,
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryCloudName,
  hasCompleteCloudinaryConfig,
  frontendUrl,
  frontendUrls,
  jwtAccessExpiresIn,
  jwtAccessSecret,
  nodeEnv,
  port,
  databaseUrl,
};
