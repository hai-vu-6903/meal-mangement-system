const db = require('../config/db');

class Log {
  static async create(logData) {
    const [result] = await db.execute(
      'INSERT INTO logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [logData.user_id, logData.action, logData.description, logData.ip_address, logData.user_agent]
    );
    return result.insertId;
  }

  static async findByUserId(userId, limit = 50) {
    const [rows] = await db.execute(
      'SELECT l.*, u.full_name, u.military_code FROM logs l LEFT JOIN users u ON l.user_id = u.id WHERE l.user_id = ? ORDER BY l.created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT l.*, u.full_name, u.military_code 
      FROM logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND l.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.action) {
      query += ' AND l.action LIKE ?';
      params.push(`%${filters.action}%`);
    }

    if (filters.start_date) {
      query += ' AND DATE(l.created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(l.created_at) <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY l.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getStats(startDate, endDate) {
    const [rows] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_actions,
        COUNT(DISTINCT user_id) as unique_users
      FROM logs 
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [startDate, endDate]);

    return rows;
  }

  static async logAction(userId, action, description, req) {
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
    const userAgent = req?.headers?.['user-agent'] || 'unknown';

    await this.create({
      user_id: userId,
      action,
      description,
      ip_address: ip,
      user_agent: userAgent
    });
  }
}

module.exports = Log;