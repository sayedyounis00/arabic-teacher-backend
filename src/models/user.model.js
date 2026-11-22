'use strict';

const { query } = require('../config');

class UserModel {
  static async findAll({ limit = 50, offset = 0 } = {}) {
    const sql = `
      SELECT id, full_name, email, phone, student_id, current_year_id, governorate_name, center_name, created_at, updated_at
      FROM profiles
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const res = await query(sql, [limit, offset]);
    return res.rows;
  }

  static async findById(id) {
    const sql = `
      SELECT id, full_name, email, phone, student_id, current_year_id, governorate_name, center_name, parent_phone_number, created_at, updated_at
      FROM profiles
      WHERE id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByPhone(phone) {
    const sql = `
      SELECT id, full_name, email, phone, password, student_id
      FROM profiles
      WHERE phone = $1;
    `;
    const res = await query(sql, [phone]);
    return res.rows[0] || null;
  }

  static async create({
    full_name,
    email,
    phone,
    password,
    student_id,
    current_year_id,
    governorate_name,
    center_name,
    parent_phone_number,
  }) {
    const sql = `
      INSERT INTO profiles (
        full_name, email, phone, password, student_id, current_year_id, governorate_name, center_name, parent_phone_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, full_name, email, phone, student_id, current_year_id, governorate_name, center_name, created_at;
    `;
    const values = [
      full_name,
      email || null,
      phone,
      password,
      student_id || null,
      current_year_id || null,
      governorate_name || null,
      center_name || null,
      parent_phone_number || null,
    ];
    const res = await query(sql, values);
    return res.rows[0];
  }

  static async deleteById(id) {
    const sql = `DELETE FROM profiles WHERE id = $1 RETURNING id;`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}

module.exports = UserModel;
