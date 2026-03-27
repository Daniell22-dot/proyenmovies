// backend/src/config/database.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'media_site',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection function
export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log(' Database connected successfully!');
    console.log(` Connected to database: ${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error(' Database connection failed:', error);
    throw error;
  }
}

// Initialize database with schema
export async function initializeDatabase(): Promise<void> {
  try {
    console.log(' Initializing database...');
    
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'media_site'}`);
    console.log(` Database '${process.env.DB_NAME || 'media_site'}' ready`);
    await connection.end();

    // Now create tables using the pool connection
    await createTables();
    await insertSampleData();
    
    console.log(' Database initialization complete!');
  } catch (error) {
    console.error(' Database initialization failed:', error);
    throw error;
  }
}

// Create all tables
async function createTables(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    // 1. Media Items Table
    await connection.query(`
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
    await connection.query(`
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
    await connection.query(`
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
    await connection.query(`
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

    // 5. Create Stored Procedure
    await connection.query('DROP PROCEDURE IF EXISTS verify_access_token');
    await connection.query(`
      CREATE PROCEDURE verify_access_token(
        IN p_access_token VARCHAR(36),
        IN p_media_id VARCHAR(36)
      )
      BEGIN
        DECLARE v_purchase_id VARCHAR(36);
        DECLARE v_max_plays INT;
        DECLARE v_play_count INT;
        DECLARE v_payment_status VARCHAR(20);
        DECLARE v_expires_at TIMESTAMP;
        
        SELECT id, max_plays, payment_status, access_token_expires_at
        INTO v_purchase_id, v_max_plays, v_payment_status, v_expires_at
        FROM purchases
        WHERE access_token = p_access_token AND media_id = p_media_id
        LIMIT 1;
        
        IF v_purchase_id IS NULL THEN
          SELECT JSON_OBJECT('access_granted', false, 'reason', 'Invalid token') AS result;
        ELSEIF v_payment_status != 'completed' THEN
          SELECT JSON_OBJECT('access_granted', false, 'reason', 'Payment not completed') AS result;
        ELSEIF v_expires_at < NOW() THEN
          SELECT JSON_OBJECT('access_granted', false, 'reason', 'Token expired') AS result;
        ELSE
          SELECT COUNT(*) INTO v_play_count
          FROM access_logs
          WHERE purchase_id = v_purchase_id AND action = 'play';
          
          IF v_play_count >= v_max_plays THEN
            SELECT JSON_OBJECT('access_granted', false, 'reason', 'Max plays reached') AS result;
          ELSE
            INSERT INTO access_logs (purchase_id, media_id, access_token, action)
            VALUES (v_purchase_id, p_media_id, p_access_token, 'play');
            
            UPDATE media_items SET play_count = play_count + 1 WHERE id = p_media_id;
            
            SELECT JSON_OBJECT(
              'access_granted', true,
              'remaining_plays', v_max_plays - v_play_count - 1
            ) AS result;
          END IF;
        END IF;
      END
    `);
    console.log(' Stored procedure created: verify_access_token');

  } finally {
    connection.release();
  }
}

// Insert sample data
async function insertSampleData(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    // Check if data already exists
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM media_items');
    const count = (rows as any)[0].count;
    
    if (count > 0) {
      console.log('⏭  Sample data already exists, skipping...');
      return;
    }

    // Insert sample media items
    await connection.query(`
      INSERT INTO media_items (title, description, media_type, price, artist, thumbnail_url, preview_url, tags, is_published) VALUES
      ('Summer Vibes', 'Chill summer anthem perfect for beach days', 'song', 1.99, 'Your Artist', 'https://picsum.photos/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', JSON_ARRAY('pop', 'summer', 'chill'), true),
      ('Midnight Drive', 'Late night driving music with smooth beats', 'song', 2.49, 'Your Artist', 'https://picsum.photos/400/401', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', JSON_ARRAY('rnb', 'night', 'drive'), true),
      ('Morning Coffee', 'Perfect acoustic track for your morning routine', 'song', 1.49, 'Your Artist', 'https://picsum.photos/400/402', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', JSON_ARRAY('acoustic', 'morning', 'calm'), true),
      ('Electric Dreams', 'Upbeat electronic track to get you moving', 'song', 2.99, 'Your Artist', 'https://picsum.photos/400/403', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', JSON_ARRAY('electronic', 'dance', 'energy'), true),
      ('Sunset Boulevard', 'Smooth jazz for evening relaxation', 'song', 2.49, 'Your Artist', 'https://picsum.photos/400/404', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', JSON_ARRAY('jazz', 'evening', 'smooth'), true)
    `);
    console.log(' Sample data inserted successfully');

  } finally {
    connection.release();
  }
}

// Export pool as default
export default pool;