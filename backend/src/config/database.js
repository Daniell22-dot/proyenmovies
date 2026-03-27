const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'media_site',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Logic to initialize the database (Converted from your TS file)
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL. Ensuring tables exist...');

    // 1. Media Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS media_items (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255) NOT NULL,
        media_type ENUM('song', 'album', 'video', 'image', 'content') NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        artist VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ... (Add your other CREATE TABLE queries from the .ts file here)

    console.log('Database tables verified/created.');
    connection.release();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Run initialization
initializeDatabase();

module.exports = pool;