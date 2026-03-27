// backend/src/controllers/subscriptionController.js
const pool = require('../config/database');

exports.getPlans = async (req, res) => {
    try {
        const [plans] = await pool.query('SELECT * FROM plans');
        res.json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.subscribe = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user.id;

        // Get plan details
        const [plans] = await pool.query('SELECT * FROM plans WHERE id = ?', [planId]);
        if (plans.length === 0) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        const plan = plans[0];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

        // Deactivate existing active subscriptions
        await pool.query(
            'UPDATE user_subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"',
            [userId]
        );

        // Create new subscription
        const [result] = await pool.query(
            'INSERT INTO user_subscriptions (user_id, plan_id, expires_at) VALUES (?, ?, ?)',
            [userId, planId, expiresAt]
        );

        res.status(201).json({
            success: true,
            message: 'Subscribed successfully',
            data: { id: result.insertId, expires_at: expiresAt }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.checkSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const [subs] = await pool.query(
            `SELECT s.*, p.name as plan_name 
       FROM user_subscriptions s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.user_id = ? AND s.status = "active" AND s.expires_at > NOW()`,
            [userId]
        );

        if (subs.length === 0) {
            return res.json({ success: true, subscribed: false });
        }

        res.json({ success: true, subscribed: true, subscription: subs[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
