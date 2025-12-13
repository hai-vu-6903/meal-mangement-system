const db = require('../config/db');

class Unit {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM units ORDER BY unit_name');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM units WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(unitData) {
    const [result] = await db.execute(
      'INSERT INTO units (unit_code, unit_name, description) VALUES (?, ?, ?)',
      [unitData.unit_code, unitData.unit_name, unitData.description]
    );
    return result.insertId;
  }

  static async update(id, unitData) {
    const fields = [];
    const params = [];

    Object.keys(unitData).forEach(key => {
      if (unitData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(unitData[key]);
      }
    });

    params.push(id);
    const [result] = await db.execute(
      `UPDATE units SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // First, set users' unit_id to NULL
    await db.execute(
      'UPDATE users SET unit_id = NULL WHERE unit_id = ?',
      [id]
    );

    const [result] = await db.execute(
      'DELETE FROM units WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getMembers(id) {
    const [rows] = await db.execute(
      'SELECT id, military_code, full_name, position, phone FROM users WHERE unit_id = ? AND is_active = 1 ORDER BY full_name',
      [id]
    );
    return rows;
  }

  static async getMemberCount(id) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE unit_id = ? AND is_active = 1',
      [id]
    );
    return rows[0].count;
  }
}

module.exports = Unit;