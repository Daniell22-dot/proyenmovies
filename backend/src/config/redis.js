const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    try {
        await client.connect();
        console.log('Successfully connected to Redis Cloud! 🚀');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = client;
