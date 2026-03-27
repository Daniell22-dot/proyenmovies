// backend/test-db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Port:', process.env.DB_PORT);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log(' Connected successfully!');
    
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log(' Query test:', rows);
    
    await connection.end();
  } catch (error) {
    console.error(' Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();