import dotenv from 'dotenv';
import path from 'path';

type TJwtExpiresIn = `${number}${'d' | 'h' | 'm' | 's'}`;

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const port = Number(process.env.PORT ?? 5000);
const databaseUrl = process.env.DATABASE_URL;
const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtAccessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '7d') as TJwtExpiresIn;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing from backend/.env');
}

if (!jwtAccessSecret) {
  throw new Error('JWT_ACCESS_SECRET is missing from backend/.env');
}

export default {
  bcryptSaltRounds,
  jwtAccessExpiresIn,
  jwtAccessSecret,
  port,
  databaseUrl,
};
