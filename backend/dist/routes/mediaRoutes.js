"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Get all published media
router.get('/', async (req, res) => {
    try {
        const connection = await database_1.default.getConnection();
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        let query = 'SELECT * FROM media_items WHERE is_published = true ORDER BY created_at DESC';
        if (limit) {
            query += ` LIMIT ${limit}`;
        }
        const [rows] = await connection.query(query);
        connection.release();
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});
// Get single media item by ID
router.get('/:id', async (req, res) => {
    try {
        const connection = await database_1.default.getConnection();
        const [rows] = await connection.query('SELECT * FROM media_items WHERE id = ? AND is_published = true', [req.params.id]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Media not found' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});
exports.default = router;
