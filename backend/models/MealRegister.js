const db = require('../config/db');

class MealRegister {
  static async register(userId, mealId, date, notes = '') {
    try {
      const [result] = await db.execute(
        'INSERT INTO meal_registrations (user_id, meal_id, registration_date, notes) VALUES (?, ?, ?, ?)',
        [userId, mealId, date, notes]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Đã đăng ký suất ăn này rồi');
      }
      throw error;
    }
  }

  static async cancel(registrationId, userId = null) {
    let query = 'UPDATE meal_registrations SET status = "cancelled", cancelled_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [registrationId];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  }

  static async getByUser(userId, filters = {}) {
    let query = `
      SELECT mr.*, m.meal_type, m.meal_name 
      FROM meal_registrations mr
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.user_id = ? AND mr.status = 'registered'
    `;
    const params = [userId];

    if (filters.startDate) {
      query += ' AND mr.registration_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND mr.registration_date <= ?';
      params.push(filters.endDate);
    }

    if (filters.mealType) {
      query += ' AND m.meal_type = ?';
      params.push(filters.mealType);
    }

    query += ' ORDER BY mr.registration_date DESC, m.meal_type';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getByDate(date, filters = {}) {
    let query = `
      SELECT mr.*, u.full_name, u.military_code, u.position, units.unit_name, m.meal_type, m.meal_name
      FROM meal_registrations mr
      JOIN users u ON mr.user_id = u.id
      LEFT JOIN units ON u.unit_id = units.id
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.registration_date = ? AND mr.status = 'registered'
    `;
    const params = [date];

    if (filters.unit_id) {
      query += ' AND u.unit_id = ?';
      params.push(filters.unit_id);
    }

    if (filters.meal_type) {
      query += ' AND m.meal_type = ?';
      params.push(filters.meal_type);
    }

    query += ' ORDER BY units.unit_name, u.full_name, m.meal_type';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getStatsByDateRange(startDate, endDate) {
    const query = `
      SELECT 
        DATE(mr.registration_date) as date,
        m.meal_type,
        COUNT(*) as count
      FROM meal_registrations mr
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.registration_date BETWEEN ? AND ? 
        AND mr.status = 'registered'
      GROUP BY DATE(mr.registration_date), m.meal_type
      ORDER BY date, m.meal_type
    `;
    
    const [rows] = await db.execute(query, [startDate, endDate]);
    return rows;
  }

  static async getUserStats(userId, startDate, endDate) {
    const query = `
      SELECT 
        m.meal_type,
        COUNT(*) as count
      FROM meal_registrations mr
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.user_id = ? 
        AND mr.registration_date BETWEEN ? AND ? 
        AND mr.status = 'registered'
      GROUP BY m.meal_type
    `;
    
    const [rows] = await db.execute(query, [userId, startDate, endDate]);
    return rows;
  }

  static async getRegistrationSummary(date) {
    const query = `
      SELECT 
        m.meal_type,
        m.meal_name,
        COUNT(mr.id) as registered_count
      FROM meals m
      LEFT JOIN meal_registrations mr ON m.id = mr.meal_id 
        AND mr.registration_date = ? 
        AND mr.status = 'registered'
      GROUP BY m.id, m.meal_type, m.meal_name
      ORDER BY m.meal_type
    `;
    
    const [rows] = await db.execute(query, [date]);
    return rows;
  }
}

module.exports = MealRegister;