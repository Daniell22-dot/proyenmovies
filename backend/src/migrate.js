// backend/src/migrate.js
const pool = require('./config/database');

async function migrate() {
  console.log(' Starting database migration...\n');

  const connection = await pool.getConnection();
  try {
    console.log(' Updating media_items table...');

    // Add columns to media_items if they don't exist
    const [columns] = await connection.query('SHOW COLUMNS FROM media_items');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('is_live')) {
      await connection.query('ALTER TABLE media_items ADD COLUMN is_live BOOLEAN DEFAULT false AFTER description');
      console.log('  Added is_live');
    }
    if (!columnNames.includes('trailer_url')) {
      await connection.query('ALTER TABLE media_items ADD COLUMN trailer_url VARCHAR(500) AFTER preview_url');
      console.log('  Added trailer_url');
    }
    if (!columnNames.includes('rating')) {
      await connection.query('ALTER TABLE media_items ADD COLUMN rating DECIMAL(3,1) DEFAULT 0.0 AFTER artist');
      console.log('  Added rating');
    }
    if (!columnNames.includes('release_date')) {
      await connection.query('ALTER TABLE media_items ADD COLUMN release_date DATE AFTER rating');
      console.log('  Added release_date');
    }
    if (!columnNames.includes('hls_manifest_url')) {
      await connection.query('ALTER TABLE media_items ADD COLUMN hls_manifest_url VARCHAR(500) AFTER trailer_url');
      console.log('  Added hls_manifest_url');
    }

    console.log('\n Creating new tables...');

    // 1. General Users Table (for viewers)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_banned BOOLEAN DEFAULT false,
        account_status ENUM('active', 'suspended', 'deactivated') DEFAULT 'active',
        role ENUM('viewer', 'admin') DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username)
      )
    `);
    console.log('  Table created/verified: users');

    // 2. Subscription Plans Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration_days INT NOT NULL,
        features JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  Table created/verified: plans');

    // 3. User Subscriptions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        plan_id VARCHAR(36) NOT NULL,
        status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
        INDEX idx_user_status (user_id, status)
      )
    `);
    console.log('  Table created/verified: user_subscriptions');

    // Insert default plans if they don't exist
    const [planCount] = await connection.query('SELECT COUNT(*) as count FROM plans');
    if (planCount[0].count === 0) {
      await connection.query(`
        INSERT INTO plans (name, price, duration_days, features) VALUES
        ('Free', 0.00, 3650, '["Watch free movies", "Standard quality"]'),
        ('Premium', 9.99, 30, '["No ads", "HD quality", "Access all movies"]'),
        ('VIP', 19.99, 30, '["4K quality", "Live shows access", "Early access to new movies"]')
      `);
      console.log('  Inserted default plans');
    }

    console.log('\n Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrate();
