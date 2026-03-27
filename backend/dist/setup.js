"use strict";
// backend/src/setup.ts
// Run this file ONCE to create your database and tables
const { initializeDatabase, testConnection } = require('./config/database');
async function setup() {
    console.log(' Starting database setup...\n');
    try {
        // Step 1: Create database and tables
        await initializeDatabase();
        // Step 2: Test the connection
        await testConnection();
        console.log('\n Setup complete! Your database is ready to use.');
        console.log(' You can now start the server with: npm run dev\n');
        process.exit(0);
    }
    catch (error) {
        console.error('\n Setup failed:', error);
        console.log('\n Please check:');
        console.log('   1. MySQL is running');
        console.log('   2. Your .env file has correct credentials');
        console.log('   3. The MySQL user has permission to create databases\n');
        process.exit(1);
    }
}
setup();
