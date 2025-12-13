const db = require('../config/db');

class User {
  static async create(userData) {
    const [result] = await db.execute(
      'INSERT INTO users (military_code, full_name, password, email, phone, role, unit_id, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userData.military_code,
        userData.full_name,
        userData.password,
        userData.email || null,
        userData.phone || null,
        userData.role || 'soldier',
        userData.unit_id || null,
        userData.position || null
      ]
    );
    return result.insertId;
  }

  static async findByMilitaryCode(militaryCode) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE military_code = ?',
      [militaryCode]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT u.*, unit_name FROM users u LEFT JOIN units ON u.unit_id = units.id WHERE u.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT u.*, units.unit_name 
      FROM users u 
      LEFT JOIN units ON u.unit_id = units.id 
      WHERE u.is_active = 1
    `;
    const params = [];

    if (filters.role) {
      query += ' AND u.role = ?';
      params.push(filters.role);
    }

    if (filters.unit_id) {
      query += ' AND u.unit_id = ?';
      params.push(filters.unit_id);
    }

    if (filters.search) {
      query += ' AND (u.full_name LIKE ? OR u.military_code LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY u.created_at DESC';

    if (filters.limit && filters.offset !== undefined) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset));
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async update(id, userData) {
    const fields = [];
    const params = [];

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(userData[key]);
      }
    });

    params.push(id);
    const [result] = await db.execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'UPDATE users SET is_active = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM users WHERE is_active = 1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].count;
  }

  static async resetPassword(id, newPassword) {
    const [result] = await db.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPassword, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;