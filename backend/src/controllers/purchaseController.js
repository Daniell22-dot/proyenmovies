const pool = require('../config/database');

exports.createPurchase = async (req, res) => {
  try {
    const {
      media_id, amount_paid, payment_provider, payment_id,
      customer_email, customer_phone
    } = req.body;
    
    const session_id = req.sessionID || req.body.session_id;
    const ip_address = req.ip;
    const user_agent = req.get('user-agent');
    
    const [result] = await pool.query(
      `INSERT INTO purchases 
      (session_id, ip_address, user_agent, media_id, amount_paid, 
       payment_provider, payment_id, customer_email, customer_phone, payment_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [session_id, ip_address, user_agent, media_id, amount_paid,
       payment_provider, payment_id, customer_email, customer_phone]
    );
    
    // Get the created purchase with access token
    const [purchase] = await pool.query(
      'SELECT * FROM purchases WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ 
      success: true, 
      data: purchase[0]
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyAccess = async (req, res) => {
  try {
    const { access_token, media_id } = req.body;
    
    const [result] = await pool.query(
      'CALL verify_access_token(?, ?)',
      [access_token, media_id]
    );
    
    const verification = JSON.parse(result[0][0].result);
    
    res.json({ success: true, ...verification });
  } catch (error) {
    console.error('Error verifying access:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const [purchase] = await pool.query(
      'SELECT * FROM purchases WHERE id = ?',
      [req.params.id]
    );
    
    if (purchase.length === 0) {
      return res.status(404).json({ success: false, error: 'Purchase not found' });
    }
    
    res.json({ success: true, data: purchase[0] });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { payment_id, status } = req.body;
    
    await pool.query(
      'UPDATE purchases SET payment_status = ? WHERE payment_id = ?',
      [status, payment_id]
    );
    
    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};