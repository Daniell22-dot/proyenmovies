// src/controllers/mediaController.js - COMPLETE VERSION
const pool = require('../config/database');
const fs = require('fs');

// Get all published media (public)
exports.getAllMedia = async (req, res) => {
  try {
    const { type, search, limit = 20, offset = 0 } = req.query;

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
            console.error('Failed to parse tags:', item.tags);
            item.tags = [];
          }
        }
      } else {
        item.tags = [];
      }
    });

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get media by ID (public)
exports.getMediaById = async (req, res) => {
  try {
    const [media] = await pool.query(
      'SELECT * FROM media_items WHERE id = ? AND is_published = true',
      [req.params.id]
    );

    if (media.length === 0) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    if (media[0].price !== undefined && media[0].price !== null) {
      media[0].price = parseFloat(media[0].price);
    } else {
      media[0].price = 0;
    }

    if (media[0].tags) {
      if (typeof media[0].tags === 'string') {
        try {
          media[0].tags = JSON.parse(media[0].tags);
        } catch (e) {
          console.error('Failed to parse tags:', media[0].tags);
          media[0].tags = [];
        }
      }
    } else {
      media[0].tags = [];
    }

    res.json({ success: true, data: media[0] });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get preview URL
exports.getPreview = async (req, res) => {
  try {
    const [media] = await pool.query(
      'SELECT preview_url FROM media_items WHERE id = ? AND is_published = true',
      [req.params.id]
    );

    if (media.length === 0 || !media[0].preview_url) {
      return res.status(404).json({ success: false, error: 'Preview not found' });
    }

    res.json({ success: true, preview_url: media[0].preview_url });
  } catch (error) {
    console.error('Error fetching preview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create media (admin)
exports.createMedia = async (req, res) => {
  try {
    const {
      title, description, media_type, price, artist,
      tags, is_free, access_type, file_path, file_name,
      file_size, mime_type, thumbnail_url, preview_url, trailer_url, hls_manifest_url,
      is_published = true
    } = req.body;

    const priceNum = parseFloat(price) || 0;

    const [result] = await pool.query(
      `INSERT INTO media_items 
      (title, description, is_live, media_type, price, artist, rating, release_date, tags, is_free, access_type, 
       file_path, file_name, file_size, mime_type, thumbnail_url, preview_url, trailer_url, hls_manifest_url, is_published) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, is_live || false, media_type, priceNum, artist, rating || 0.0, release_date,
        JSON.stringify(tags || []), is_free || false,
        access_type || 'paid', file_path, file_name, file_size, mime_type,
        thumbnail_url, preview_url, trailer_url, hls_manifest_url, is_published
      ]
    );

    // Get the inserted record
    const [newMedia] = await pool.query(
      'SELECT * FROM media_items WHERE id = ?',
      [result.insertId]
    );

    if (newMedia[0].price !== undefined && newMedia[0].price !== null) {
      newMedia[0].price = parseFloat(newMedia[0].price);
    }

    res.status(201).json({
      success: true,
      data: newMedia[0]
    });
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
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload file to disk (admin)
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.files.file;
    const uploadDir = __dirname + '/../../uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const uniqueName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const uploadPath = uploadDir + '/' + uniqueName;

    await file.mv(uploadPath);

    res.json({
      success: true,
      file_path: `/uploads/${uniqueName}`,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.mimetype
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload media with file (admin)
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.files.file;
    const {
      title, description, price, artist,
      media_type = 'song', tags = '', is_published = true
    } = req.body;

    const uploadDir = __dirname + '/../../uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const uniqueName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const uploadPath = uploadDir + '/' + uniqueName;

    await file.mv(uploadPath);

    const priceNum = parseFloat(price) || 0.99;
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const [result] = await pool.query(
      `INSERT INTO media_items 
      (title, description, media_type, price, artist, tags, file_path, file_name, 
       file_size, mime_type, is_published, is_live, rating, release_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || file.name,
        description || '',
        media_type,
        priceNum,
        artist || 'Unknown Artist',
        JSON.stringify(tagsArray),
        `/uploads/${uniqueName}`,
        file.name,
        file.size,
        file.mimetype,
        is_published,
        req.body.is_live === 'true',
        parseFloat(req.body.rating) || 0.0,
        req.body.release_date || null
      ]
    );

    const [newMedia] = await pool.query(
      'SELECT * FROM media_items WHERE id = ?',
      [result.insertId]
    );

    if (newMedia[0].price !== undefined && newMedia[0].price !== null) {
      newMedia[0].price = parseFloat(newMedia[0].price);
    }

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: newMedia[0]
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// NEW: Get media for admin (all media including drafts)
exports.getMediaForAdmin = async (req, res) => {
  try {
    const [media] = await pool.query(`
      SELECT id, title, artist, price, media_type, is_published, 
             purchase_count, play_count, created_at, updated_at
      FROM media_items 
      ORDER BY created_at DESC
    `);

    media.forEach(item => {
      if (item.price !== undefined && item.price !== null) {
        item.price = parseFloat(item.price);
      } else {
        item.price = 0;
      }
    });

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Error fetching media for admin:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// NEW: Increment play count
exports.incrementPlayCount = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE media_items SET play_count = play_count + 1 WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Play count incremented' });
  } catch (error) {
    console.error('Error incrementing play count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// NEW: Increment purchase count and revenue
exports.recordPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    await pool.query(
      'UPDATE media_items SET purchase_count = purchase_count + 1, revenue = revenue + ? WHERE id = ?',
      [parseFloat(amount) || 0, id]
    );

    res.json({ success: true, message: 'Purchase recorded' });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// NEW: Get file from database (if stored as BLOB)
exports.getMediaFile = async (req, res) => {
  try {
    const [media] = await pool.query(
      'SELECT file_name, mime_type FROM media_items WHERE id = ?',
      [req.params.id]
    );

    if (media.length === 0) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // If file is stored as BLOB, you would send the binary data
    // For now, redirect to the file path
    res.json({
      success: true,
      file_name: media[0].file_name,
      mime_type: media[0].mime_type
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};