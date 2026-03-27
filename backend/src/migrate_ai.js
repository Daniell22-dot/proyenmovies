// backend/src/migrate_ai.js
const pool = require('./config/database');

async function migrate() {
    console.log(' Starting AI Recommendations & Watchlists migration...\n');

    const connection = await pool.getConnection();
    try {
        console.log(' Creating new tables...');

        // 1. Viewing History Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS viewing_history (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        media_id VARCHAR(36) NOT NULL,
        last_position INT DEFAULT 0, -- in seconds
        watch_count INT DEFAULT 1,
        last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media_items(id) ON DELETE CASCADE,
        UNIQUE KEY idx_user_media (user_id, media_id)
      )
    `);
        console.log('  Table created/verified: viewing_history');

        // 2. Watchlists Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS watchlists (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        media_id VARCHAR(36) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media_items(id) ON DELETE CASCADE,
        UNIQUE KEY idx_user_watchlist (user_id, media_id)
      )
    `);
        console.log('  Table created/verified: watchlists');

        console.log('\n AI Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n Migration failed:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

migrate();
