const Log = require('../models/Log');

const logController = {
  getLogs: async (req, res) => {
    try {
      const { 
        user_id, 
        action, 
        start_date, 
        end_date,
        limit = 100,
        page = 1 
      } = req.query;

      const offset = (page - 1) * limit;
      
      const filters = {};
      if (user_id) filters.user_id = user_id;
      if (action) filters.action = action;
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;
      filters.limit = parseInt(limit);

      const logs = await Log.findAll(filters);

      // Get total count for pagination
      const [countResult] = await require('../config/db').execute(
        'SELECT COUNT(*) as total FROM logs'
      );

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getUserLogs: async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;

      const logs = await Log.findByUserId(id, limit);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Get user logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getLogStats: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = end_date || new Date().toISOString().split('T')[0];

      const stats = await Log.getStats(startDate, endDate);

      // Get top actions
      const db = require('../config/db');
      const [topActions] = await db.execute(`
        SELECT action, COUNT(*) as count
        FROM logs
        WHERE created_at BETWEEN ? AND ?
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `, [startDate, endDate]);

      // Get top users
      const [topUsers] = await db.execute(`
        SELECT u.full_name, u.military_code, COUNT(l.id) as action_count
        FROM logs l
        JOIN users u ON l.user_id = u.id
        WHERE l.created_at BETWEEN ? AND ?
        GROUP BY l.user_id, u.full_name, u.military_code
        ORDER BY action_count DESC
        LIMIT 10
      `, [startDate, endDate]);

      res.json({
        success: true,
        data: {
          daily_stats: stats,
          top_actions: topActions,
          top_users: topUsers
        }
      });
    } catch (error) {
      console.error('Get log stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  clearOldLogs: async (req, res) => {
    try {
      const { days = 30 } = req.body;

      const db = require('../config/db');
      const [result] = await db.execute(
        'DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [days]
      );

      res.json({
        success: true,
        message: `Đã xóa ${result.affectedRows} log cũ`,
        deleted_count: result.affectedRows
      });
    } catch (error) {
      console.error('Clear old logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

module.exports = logController;