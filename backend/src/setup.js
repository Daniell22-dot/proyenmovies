// backend/src/setup.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  console.log(' Starting database setup...\n');
  
  try {
    // Step 1: Create database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'media_site'}`);
    console.log(` Database '${process.env.DB_NAME || 'media_site'}' created/verified`);
    await connection.end();

    // Step 2: Connect to the database and create tables
    const pool = require('./config/database');
    
    await createTables(pool);
    await insertSampleData(pool);
    
    console.log('\n Setup complete! Your database is ready to use.');
    console.log(' You can now start the server with: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n Setup failed:', error);
    console.log('\n Please check:');
    console.log('   1. MySQL is running');
    console.log('   2. Your .env file has correct credentials (password: mysql@254)');
    console.log('   3. The MySQL user has permission to create databases\n');
    process.exit(1);
  }
}

async function createTables(pool) {
  console.log('\n Creating tables...');
  
  // 1. Media Items Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_items (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      media_type ENUM('song', 'album', 'video', 'image', 'content') NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      currency VARCHAR(3) DEFAULT 'USD',
      is_free BOOLEAN DEFAULT false,
      preview_url VARCHAR(500),
      preview_duration INT,
      access_type ENUM('free', 'paid', 'subscription') NOT NULL DEFAULT 'paid',
      storage_bucket VARCHAR(100) NOT NULL DEFAULT 'media',
      file_path VARCHAR(500) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_size BIGINT,
      mime_type VARCHAR(100),
      artist VARCHAR(255),
      duration_seconds INT,
      thumbnail_url VARCHAR(500),
      tags JSON,
      play_count INT DEFAULT 0,
      purchase_count INT DEFAULT 0,
      revenue DECIMAL(15,2) DEFAULT 0.00,
      is_published BOOLEAN DEFAULT false,
      published_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_published (is_published, created_at),
      INDEX idx_media_type (media_type),
      INDEX idx_artist (artist)
    )
  `);
  console.log(' Table created: media_items');

  // 2. Purchases Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      session_id VARCHAR(255),
      device_fingerprint VARCHAR(255),
      ip_address VARCHAR(45),
      user_agent TEXT,
      media_id VARCHAR(36),
      amount_paid DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      payment_provider VARCHAR(50) NOT NULL,
      payment_id VARCHAR(255) UNIQUE,
      payment_status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
      access_token VARCHAR(36) UNIQUE DEFAULT (UUID()),
      access_token_expires_at TIMESTAMP DEFAULT (DATE_ADD(NOW(), INTERVAL 24 HOUR)),
      max_plays INT DEFAULT 10,
      customer_email VARCHAR(255),
      customer_phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (media_id) REFERENCES media_items(id) ON DELETE SET NULL,
      INDEX idx_access_token (access_token),
      INDEX idx_payment_id (payment_id),
      INDEX idx_media_id (media_id),
      INDEX idx_payment_status (payment_status)
    )
  `);
  console.log(' Table created: purchases');

  // 3. Access Logs Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      purchase_id VARCHAR(36),
      media_id VARCHAR(36),
      access_token VARCHAR(36),
      action ENUM('play', 'download', 'preview') NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
      FOREIGN KEY (media_id) REFERENCES media_items(id) ON DELETE CASCADE,
      INDEX idx_access_token_media (access_token, media_id),
      INDEX idx_purchase_id (purchase_id)
    )
  `);
  console.log(' Table created: access_logs');

  // 4. Admin Users Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_username (username)
    )
  `);
  console.log(' Table created: admin_users');
}

async function insertSampleData(pool) {
  console.log('\n Inserting sample data...');
  
  // Check if data already exists
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM media_items');
  const count = rows[0].count;
  
  if (count > 0) {
    console.log('⏭  Sample data already exists, skipping...');
    return;
  }

  // Insert sample media items
  await pool.query(`
    INSERT INTO media_items (title, description, media_type, price, artist, thumbnail_url, preview_url, tags, is_published, file_path, file_name) VALUES
    ('Summer Vibes', 'Chill summer anthem perfect for beach days', 'song', 1.99, 'Your Artist', 'https://picsum.photos/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', JSON_ARRAY('pop', 'summer', 'chill'), true, 'media/summer-vibes.mp3', 'summer-vibes.mp3'),
    ('Midnight Drive', 'Late night driving music with smooth beats', 'song', 2.49, 'Your Artist', 'https://picsum.photos/400/401', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', JSON_ARRAY('rnb', 'night', 'drive'), true, 'media/midnight-drive.mp3', 'midnight-drive.mp3'),
    ('Morning Coffee', 'Perfect acoustic track for your morning routine', 'song', 1.49, 'Your Artist', 'https://picsum.photos/400/402', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', JSON_ARRAY('acoustic', 'morning', 'calm'), true, 'media/morning-coffee.mp3', 'morning-coffee.mp3'),
    ('Electric Dreams', 'Upbeat electronic track to get you moving', 'song', 2.99, 'Your Artist', 'https://picsum.photos/400/403', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', JSON_ARRAY('electronic', 'dance', 'energy'), true, 'media/electric-dreams.mp3', 'electric-dreams.mp3'),
    ('Sunset Boulevard', 'Smooth jazz for evening relaxation', 'song', 2.49, 'Your Artist', 'https://picsum.photos/400/404', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', JSON_ARRAY('jazz', 'evening', 'smooth'), true, 'media/sunset-boulevard.mp3', 'sunset-boulevard.mp3')
  `);
  console.log(' Sample data inserted (5 songs)');
}

setup();