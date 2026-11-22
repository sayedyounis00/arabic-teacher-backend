'use strict';

const assert = require('assert');
const UserService = require('../../src/services/user.service');
const UserModel = require('../../src/models/user.model');

async function runUnitTests() {
  console.log('🧪 Running unit tests...');

  // Mock UserModel.findAll
  const originalFindAll = UserModel.findAll;
  UserModel.findAll = async () => [{ id: '1', full_name: 'Test Student' }];

  const users = await UserService.listUsers({ limit: 10, offset: 0 });
  assert.strictEqual(Array.isArray(users), true);
  assert.strictEqual(users.length, 1);
  assert.strictEqual(users[0].full_name, 'Test Student');

  // Restore
  UserModel.findAll = originalFindAll;

  console.log('✅ Unit tests passed.');
}

if (require.main === module) {
  runUnitTests().catch((err) => {
    console.error('❌ Unit test failed:', err);
    process.exit(1);
  });
}

module.exports = runUnitTests;
