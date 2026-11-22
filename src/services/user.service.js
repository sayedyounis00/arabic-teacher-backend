'use strict';

const UserModel = require('../models/user.model');
const ApiError = require('../utils/ApiError');

class UserService {
  static async listUsers({ limit, offset }) {
    return UserModel.findAll({ limit, offset });
  }

  static async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw ApiError.notFound(`User with id ${id} not found`);
    }
    return user;
  }

  static async registerUser(userData) {
    const existing = await UserModel.findByPhone(userData.phone);
    if (existing) {
      throw ApiError.conflict(`User with phone ${userData.phone} already exists`);
    }
    return UserModel.create(userData);
  }

  static async deleteUser(id) {
    const deleted = await UserModel.deleteById(id);
    if (!deleted) {
      throw ApiError.notFound(`User with id ${id} not found`);
    }
    return deleted;
  }
}

module.exports = UserService;
