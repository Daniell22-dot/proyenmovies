// backend/src/controllers/recommendationController.js
const pool = require('../config/database');

// Track viewing history
exports.trackHistory = async (req, res) => {
    try {
        const { mediaId, position } = req.body;
        const userId = req.user.id;

        // Insert or update history
        await pool.query(`
      INSERT INTO viewing_history (user_id, media_id, last_position, watch_count)
      VALUES (?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE 
        last_position = ?, 
        watch_count = watch_count + 1,
        last_watched_at = CURRENT_TIMESTAMP
    `, [userId, mediaId, position, position]);

        res.status(200).json({ success: true, message: 'History tracked' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add to watchlist
exports.addToWatchlist = async (req, res) => {
    try {
        const { mediaId } = req.body;
        const userId = req.user.id;

        await pool.query(
            'INSERT IGNORE INTO watchlists (user_id, media_id) VALUES (?, ?)',
            [userId, mediaId]
        );

        res.status(201).json({ success: true, message: 'Added to watchlist' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Remove from watchlist
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { mediaId } = req.params;
        const userId = req.user.id;

        await pool.query(
            'DELETE FROM watchlists WHERE user_id = ? AND media_id = ?',
            [userId, mediaId]
        );

        res.status(200).json({ success: true, message: 'Removed from watchlist' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get user watchlist
exports.getWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query(`
      SELECT m.* FROM media_items m
      JOIN watchlists w ON m.id = w.media_id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `, [userId]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get personalized recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get user's preferred genres based on history (tags)
        const [history] = await pool.query(`
      SELECT m.tags FROM media_items m
      JOIN viewing_history v ON m.id = v.media_id
      WHERE v.user_id = ?
    `, [userId]);

        // Flatten and count tags
        const tagCounts = {};
        history.forEach(row => {
            const tags = JSON.parse(row.tags || '[]');
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const topGenres = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);

        // 2. Find movies in these genres that user hasn't seen recently
        let recommendations = [];
        if (topGenres.length > 0) {
            // Build LIKE clauses for genres
            const genrePlaceholders = topGenres.map(() => 'tags LIKE ?').join(' OR ');
            const searchTerms = topGenres.map(g => `%${g}%`);

            const [rows] = await pool.query(`
        SELECT * FROM media_items 
        WHERE (${genrePlaceholders})
        AND id NOT IN (SELECT media_id FROM viewing_history WHERE user_id = ?)
        LIMIT 10
      `, [...searchTerms, userId]);

            recommendations = rows;
        }

        // 3. Fallback: Get trending if no history
        if (recommendations.length < 5) {
            const [trending] = await pool.query(`
        SELECT * FROM media_items 
        WHERE id NOT IN (SELECT media_id FROM viewing_history WHERE user_id = ?)
        ORDER BY rating DESC 
        LIMIT 10
      `, [userId]);

            // Combine and remove duplicates
            const existingIds = new Set(recommendations.map(r => r.id));
            trending.forEach(item => {
                if (!existingIds.has(item.id)) {
                    recommendations.push(item);
                }
            });
        }

        res.status(200).json({ success: true, data: recommendations.slice(0, 10) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
