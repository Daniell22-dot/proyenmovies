// routes/dashboardRoutes.js - UPDATED
const express = require('express');
const pool = require('../src/config/database');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get total revenue
    const [revenueRows] = await connection.query(`
      SELECT COALESCE(SUM(revenue), 0) as totalRevenue 
      FROM media_items 
      WHERE is_published = true
    `);
    
    // Get total plays and purchases
    const [mediaRows] = await connection.query(`
      SELECT 
        COALESCE(SUM(play_count), 0) as totalPlays,
        COALESCE(SUM(purchase_count), 0) as totalPurchases,
        COUNT(*) as totalMedia
      FROM media_items 
      WHERE is_published = true
    `);
    
    // Get recent purchases for chart (last 30 days) - UPDATED TO INCLUDE COUNT
    const [salesRows] = await connection.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as purchase_count,
        COALESCE(SUM(amount_paid), 0) as revenue
      FROM purchases 
      WHERE payment_status = 'completed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `);
    
    // Get top selling media
    const [topMediaRows] = await connection.query(`
      SELECT 
        title,
        purchase_count,
        revenue
      FROM media_items 
      WHERE is_published = true
      ORDER BY purchase_count DESC
      LIMIT 5
    `);
    
    connection.release();
    
    // Format dates and ensure numbers
    const formattedSales = salesRows.reverse().map(row => ({
      date: new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: parseInt(row.purchase_count) || 0,
      revenue: parseFloat(row.revenue) || 0
    }));
    
    // Ensure top media has proper numbers
    const formattedTopMedia = topMediaRows.map(row => ({
      title: row.title || 'Untitled',
      purchase_count: parseInt(row.purchase_count) || 0,
      revenue: parseFloat(row.revenue) || 0
    }));
    
    res.json({
      totalRevenue: parseFloat(revenueRows[0].totalRevenue) || 0,
      totalPlays: parseInt(mediaRows[0].totalPlays) || 0,
      totalPurchases: parseInt(mediaRows[0].totalPurchases) || 0,
      totalMedia: parseInt(mediaRows[0].totalMedia) || 0,
      dailySales: formattedSales,
      topMedia: formattedTopMedia
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;