import app from './app.js';
import config from './app/config/index.js';
import { connectToDatabase } from './app/config/database.js';

async function main() {
  try {
    await connectToDatabase();
    app.listen(config.port, () => {
      console.log(`BuddyScript backend listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend server.', error);
    process.exit(1);
  }
}

main();
