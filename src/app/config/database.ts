import mongoose from 'mongoose';
import config from './index.js';

declare global {
  var __buddyscriptMongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!globalThis.__buddyscriptMongooseConnectionPromise) {
    globalThis.__buddyscriptMongooseConnectionPromise = mongoose.connect(config.databaseUrl);
  }

  try {
    await globalThis.__buddyscriptMongooseConnectionPromise;
    return mongoose;
  } catch (error) {
    globalThis.__buddyscriptMongooseConnectionPromise = undefined;
    throw error;
  }
};
