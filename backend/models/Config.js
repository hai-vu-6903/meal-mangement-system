const db = require('../config/db');

class SystemConfig {
  static async get(key) {
    const [rows] = await db.execute(
      'SELECT config_value FROM system_configs WHERE config_key = ?',
      [key]
    );
    return rows[0]?.config_value || null;
  }

  static async set(key, value) {
    const [result] = await db.execute(
      'INSERT INTO system_configs (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
      [key, value, value]
    );
    return result.affectedRows > 0;
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM system_configs ORDER BY config_key');
    return rows;
  }

  static async update(key, value, description = null) {
    const [result] = await db.execute(
      'UPDATE system_configs SET config_value = ?, description = COALESCE(?, description) WHERE config_key = ?',
      [value, description, key]
    );
    return result.affectedRows > 0;
  }

  static async delete(key) {
    const [result] = await db.execute(
      'DELETE FROM system_configs WHERE config_key = ?',
      [key]
    );
    return result.affectedRows > 0;
  }

  static async getCancelDeadline() {
    const value = await this.get('cancel_deadline');
    return parseInt(value) || 1;
  }

  static async getRegistrationDeadline() {
    const value = await this.get('registration_deadline');
    return value || '18:00';
  }

  static async getAllowSameDayCancel() {
    const value = await this.get('allow_same_day_cancel');
    return value === 'true';
  }

  static async getMealConfig() {
    const [rows] = await db.execute(
      'SELECT * FROM meals WHERE is_active = 1 ORDER BY meal_type'
    );
    return rows;
  }
}

module.exports = SystemConfig;