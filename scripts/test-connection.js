'use strict';

require('dotenv').config();
const { testConnection, pool } = require('../src/config');

async function run() {
  console.log('🔍 Testing PostgreSQL connection...');
  const result = await testConnection();
  if (result.ok) {
    console.log('✅ Connected successfully!');
    console.log(`   Database : ${result.database}`);
    console.log(`   Timestamp: ${result.timestamp}`);
  } else {
    console.error('❌ Connection failed:', result.error);
    process.exitCode = 1;
  }
  await pool.end();
}

run();
