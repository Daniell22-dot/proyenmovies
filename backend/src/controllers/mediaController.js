// src/controllers/mediaController.js
const pool = require('../config/database');
const fs = require('fs');
const redis = require('../config/redis');
const cloudinary = require('../config/cloudinary');

// Helper to clear media cache
async function clearMediaCache() {
  try {
    const keys = await redis.keys('media:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.error('Redis CLEAR error:', err);
  }
}

// Get all published media (public)
exports.getAllMedia = async (req, res) => {
  try {
    const { type, search, limit = 20, offset = 0 } = req.query;
    const cacheKey = `media:list:${type || 'all'}:${search || 'none'}:${limit}:${offset}`;

    // 1. Try to get from cache
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData), source: 'cache' });
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }

    let query = 'SELECT * FROM media_items WHERE is_published = true';
    const params = [];

    if (type) {
      query += ' AND media_type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (title LIKE ? OR artist LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [media] = await pool.query(query, params);

    // Parse JSON tags and ensure price is a number
    media.forEach(item => {
      if (item.price !== undefined && item.price !== null) {
        item.price = parseFloat(item.price);
      } else {
        item.price = 0;
      }

      if (item.tags) {
        if (typeof item.tags === 'string') {
          try {
            item.tags = JSON.parse(item.tags);
          } catch (e) {
            item.tags = [];
          }
        }
      } else {
        item.tags = [];
      }
    });

    // 2. Save to cache
    try {
      await redis.set(cacheKey, JSON.stringify(media), {
        EX: 3600 // 1 hour
      });
    } catch (err) {
      console.error('Redis SET error:', err);
    }

    res.json({ success: true, data: media, source: 'database' });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get media by ID (public)
exports.getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `media:item:${id}`;

    // 1. Try to get from cache
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData), source: 'cache' });
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }

    const [media] = await pool.query(
      'SELECT * FROM media_items WHERE id = ? AND is_published = true',
      [id]
    );

    if (media.length === 0) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    const item = media[0];

    // Format fields
    if (item.price !== undefined && item.price !== null) {
      item.price = parseFloat(item.price);
    }
    if (item.tags && typeof item.tags === 'string') {
      try {
        item.tags = JSON.parse(item.tags);
      } catch (e) {
        item.tags = [];
      }
    }

    // 2. Save to cache
    try {
      await redis.set(cacheKey, JSON.stringify(item), {
        EX: 3600 // 1 hour
      });
    } catch (err) {
      console.error('Redis SET error:', err);
    }

    res.json({ success: true, data: item, source: 'database' });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create media (admin)
exports.createMedia = async (req, res) => {
  try {
    const {
      title, description, media_type, price, artist,
      tags, is_free, access_type, file_path, file_name,
      file_size, mime_type, thumbnail_url, preview_url, is_published = true
    } = req.body;

    const priceNum = parseFloat(price) || 0;

    const [result] = await pool.query(
      `INSERT INTO media_items 
      (title, description, media_type, price, artist, tags, is_free, access_type, 
       file_path, file_name, file_size, mime_type, thumbnail_url, preview_url, is_published) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, media_type, priceNum, artist,
        JSON.stringify(tags || []), is_free || false,
        access_type || 'paid', file_path, file_name, file_size, mime_type,
        thumbnail_url, preview_url, is_published
      ]
    );

    // Clear cache
    await clearMediaCache();

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update media (admin)
exports.updateMedia = async (req, res) => {
  try {
    const updates = [];
    const values = [];

    Object.keys(req.body).forEach(key => {
      if (key === 'tags') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(req.body[key]));
      } else if (key === 'price') {
        updates.push(`${key} = ?`);
        values.push(parseFloat(req.body[key]) || 0);
      } else {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    });

    values.push(req.params.id);

    await pool.query(
      `UPDATE media_items SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Clear cache
    await clearMediaCache();

    res.json({ success: true, message: 'Media updated successfully' });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete media (admin)
exports.deleteMedia = async (req, res) => {
  try {
    await pool.query('DELETE FROM media_items WHERE id = ?', [req.params.id]);
    
    // Clear cache
    await clearMediaCache();

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin specific analytics/management
exports.getMediaForAdmin = async (req, res) => {
  try {
    const [media] = await pool.query(`
      SELECT id, title, artist, price, media_type, is_published, 
             purchase_count, play_count, created_at, updated_at
      FROM media_items 
      ORDER BY created_at DESC
    `);
    media.forEach(item => { item.price = parseFloat(item.price) || 0; });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.incrementPlayCount = async (req, res) => {
  try {
    await pool.query('UPDATE media_items SET play_count = play_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Play recorded' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.recordPurchase = async (req, res) => {
  try {
    const { amount } = req.body;
    await pool.query('UPDATE media_items SET purchase_count = purchase_count + 1, revenue = revenue + ? WHERE id = ?', [parseFloat(amount) || 0, req.params.id]);
    res.json({ success: true, message: 'Purchase recorded' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload media to Cloudinary (admin)
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.files.file;
    const {
      title, description, price, artist,
      media_type = 'movie', tags = '', is_published = true
    } = req.body;

    // Use a temp path locally before uploading to Cloudinary
    const uploadDir = __dirname + '/../../uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const uniqueName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const tempPath = uploadDir + '/' + uniqueName;

    await file.mv(tempPath);

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const result_cloud = await cloudinary.uploader.upload(tempPath, {
        folder: 'proyenmovies',
        resource_type: media_type === 'video' || file.mimetype.startsWith('video') ? 'video' : 'auto'
    });

    // Cleanup local temp file
    fs.unlinkSync(tempPath);

    const priceNum = parseFloat(price) || 0.99;
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : tags;

    const [result] = await pool.query(
      `INSERT INTO media_items 
      (title, description, media_type, price, artist, tags, file_path, file_name, 
       file_size, mime_type, is_published) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || file.name,
        description || '',
        media_type,
        priceNum,
        artist || 'ProyenMovies Artist',
        JSON.stringify(tagsArray),
        result_cloud.secure_url, // Store Cloudinary URL
        file.name,
        file.size,
        file.mimetype,
        is_published === 'true' || is_published === true
      ]
    );

    // Clear cache
    await clearMediaCache();

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully to Cloudinary',
      data: { id: result.insertId, url: result_cloud.secure_url }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Secure Download with Purchase/Subscription verification
exports.downloadMedia = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [media] = await pool.query('SELECT * FROM media_items WHERE id = ?', [id]);
    if (media.length === 0) return res.status(404).json({ success: false, error: 'Media not found' });

    const item = media[0];

    if (item.is_free) return serveFile(item, res);

    const [subs] = await pool.query(
      'SELECT id FROM user_subscriptions WHERE user_id = ? AND status = "active" AND expires_at > NOW()',
      [userId]
    );

    const [purchases] = await pool.query(
      'SELECT id FROM media_purchases WHERE user_id = ? AND media_id = ?',
      [userId, id]
    );

    if (subs.length > 0 || purchases.length > 0) {
      return serveFile(item, res);
    }

    res.status(403).json({ 
      success: false, 
      error: 'Access Denied', 
      message: 'Active subscription or purchase required.' 
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper to serve file (Handles Cloudinary URLs)
function serveFile(item, res) {
  if (item.file_path.startsWith('http')) {
    // Redirect to Cloudinary secure URL for download
    return res.redirect(item.file_path);
  }
  
  const filePath = __dirname + '/../../' + item.file_path;
  if (fs.existsSync(filePath)) {
    return res.download(filePath, item.file_name);
  } else {
    return res.status(404).json({ success: false, error: 'Media file not found' });
  }
}

// Check if user has access to media (frontend helper)
exports.checkAccess = async (req, res) => {
  try {
    if (!req.user) return res.json({ success: true, hasAccess: false });
    
    const userId = req.user.id;
    const { id } = req.params;

    const [media] = await pool.query('SELECT is_free FROM media_items WHERE id = ?', [id]);
    if (media.length === 0) return res.status(404).json({ success: false, error: 'Media not found' });
    
    if (media[0].is_free) return res.json({ success: true, hasAccess: true });

    const [subs] = await pool.query(
      'SELECT id FROM user_subscriptions WHERE user_id = ? AND status = "active" AND expires_at > NOW()',
      [userId]
    );
    if (subs.length > 0) return res.json({ success: true, hasAccess: true });

    const [purchases] = await pool.query(
      'SELECT id FROM media_purchases WHERE user_id = ? AND media_id = ?',
      [userId, id]
    );
    if (purchases.length > 0) return res.json({ success: true, hasAccess: true });

    res.json({ success: true, hasAccess: false });
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};