"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const connection = await database_1.default.getConnection();
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
        // Get recent purchases for chart (last 30 days)
        const [salesRows] = await connection.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(amount_paid) as revenue
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
        res.json({
            totalRevenue: parseFloat(revenueRows[0].totalRevenue) || 0,
            totalPlays: mediaRows[0].totalPlays,
            totalPurchases: mediaRows[0].totalPurchases,
            totalMedia: mediaRows[0].totalMedia,
            dailySales: salesRows.reverse(), // Reverse to show oldest first
            topMedia: topMediaRows
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
exports.default = router;
