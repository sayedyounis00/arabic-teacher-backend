'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config');

async function initializeDatabase() {
  console.log('🔄 Initializing database schema on PostgreSQL...');

  const schemaPath = path.resolve(__dirname, '../schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ schema.sql not found at: ${schemaPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  const client = await pool.connect();

  try {
    console.log('🚀 Running schema.sql migration...');
    await client.query('BEGIN');
    await client.query(sqlContent);
    await client.query('COMMIT');
    console.log('✅ schema.sql executed successfully.');

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📋 Created / Verified Public Tables:');
    tablesRes.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    console.log('\n🎉 Database setup complete and ready for Railway / Production.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize database:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();
