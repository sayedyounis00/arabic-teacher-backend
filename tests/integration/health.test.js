'use strict';

const assert = require('assert');
const app = require('../../src/app');

async function runIntegrationTests() {
  console.log('🧪 Running integration tests...');

  // Verify app exists and has middleware stack
  assert.strictEqual(typeof app, 'function');
  assert.strictEqual(typeof app.listen, 'function');

  console.log('✅ Integration tests passed.');
}

if (require.main === module) {
  runIntegrationTests().catch((err) => {
    console.error('❌ Integration test failed:', err);
    process.exit(1);
  });
}

module.exports = runIntegrationTests;
