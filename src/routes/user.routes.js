'use strict';

const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
} = require('../controllers/user.controller');
const {
  validateCreateUser,
  validateGetUserById,
} = require('../validators/user.validator');

const router = express.Router();

router.get('/', getUsers);
router.post('/', validateCreateUser, createUser);
router.get('/:id', validateGetUserById, getUserById);
router.delete('/:id', validateGetUserById, deleteUser);

module.exports = router;
