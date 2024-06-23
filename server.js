import { config } from 'dotenv';
import app from './app.js';
import mysql from 'mysql2';

config({ path: './config.env' });

console.log('Starting server...');

let pool;

async function connectToDB() {
  try {
    pool = mysql
      .createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
      })
      .promise(); // Use promise-based pool for async/await compatibility

    console.log('DB connection successful! ✅');

    // Start the app after successful database connection
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
}

connectToDB();

console.log('Server script finished execution.👀');

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export { pool };
