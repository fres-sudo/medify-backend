import { config } from 'dotenv';
import app from './app.js';
import mysql from 'mysql2';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

config({ path: './config.env' });

// Log that the script is starting...
console.log('Starting server script...');

// Connect to the database
console.log('Connecting to the database...');

async function connectToDB() {
  try {
    mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
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

// Log that the script has finished
console.log('Server script finished execution.👀');

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
