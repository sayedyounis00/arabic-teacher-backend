'use strict';

const UserService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
  const offset = parseInt(req.query.offset || '0', 10);
  const users = await UserService.listUsers({ limit, offset });
  res.json({ success: true, count: users.length, data: users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.json({ success: true, data: user });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await UserService.registerUser(req.body);
  res.status(201).json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await UserService.deleteUser(req.params.id);
  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
};
