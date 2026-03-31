import app from './app.js';
import config from './app/config/index.js';
import mongoose from 'mongoose';

async function main() {
  try {
    await mongoose.connect(config.databaseUrl);
    app.listen(config.port, () => {
      console.log(`BuddyScript backend listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend server.', error);
    process.exit(1);
  }
}

main();
