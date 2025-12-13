const db = require('../config/db');
const Log = require('../models/Log');

const registerController = {
  // Đăng ký suất ăn
  registerMeal: async (req, res) => {
    try {
      const { meal_id, date, notes } = req.body;
      const userId = req.user.id;

      // Kiểm tra ngày đăng ký
      const today = new Date().toISOString().split('T')[0];
      if (date < today) {
        return res.status(400).json({
          success: false,
          message: 'Không thể đăng ký suất ăn cho ngày đã qua'
        });
      }

      // Kiểm tra đã đăng ký chưa
      const [existing] = await db.execute(
        `SELECT mr.id FROM meal_registrations mr
         WHERE mr.user_id = ? AND mr.meal_id = ? AND mr.registration_date = ? AND mr.status = 'registered'`,
        [userId, meal_id, date]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Đã đăng ký suất ăn này rồi'
        });
      }

      // Kiểm tra giờ đăng ký
      const config = await require('../models/Config').getRegistrationDeadline();
      const deadline = config || '18:00';
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      if (date === today && currentTime > deadline) {
        return res.status(400).json({
          success: false,
          message: `Đã quá giờ đăng ký (${deadline}) cho hôm nay`
        });
      }

      // Đăng ký suất ăn
      const [result] = await db.execute(
        'INSERT INTO meal_registrations (user_id, meal_id, registration_date, notes) VALUES (?, ?, ?, ?)',
        [userId, meal_id, date, notes || '']
      );

      // Log action
      await Log.logAction(userId, 'MEAL_REGISTER', 
        `Đăng ký suất ăn ID ${meal_id} cho ngày ${date}`, req);

      res.status(201).json({
        success: true,
        message: 'Đăng ký suất ăn thành công',
        data: { registrationId: result.insertId }
      });
    } catch (error) {
      console.error('Register meal error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Đã đăng ký suất ăn này rồi'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Hủy suất ăn
  cancelMeal: async (req, res) => {
    try {
      const { registrationId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      // Lấy thông tin đăng ký
      const [registration] = await db.execute(
        `SELECT mr.*, m.meal_type, m.meal_name, mr.registration_date 
         FROM meal_registrations mr
         JOIN meals m ON mr.meal_id = m.id
         WHERE mr.id = ? AND mr.status = 'registered'`,
        [registrationId]
      );

      if (registration.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đăng ký'
        });
      }

      const reg = registration[0];

      // Kiểm tra quyền hủy
      if (!isAdmin && reg.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền hủy suất ăn của người khác'
        });
      }

      // Kiểm tra thời gian hủy
      const today = new Date().toISOString().split('T')[0];
      const registrationDate = reg.registration_date;

      if (registrationDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy suất ăn của ngày đã qua'
        });
      }

      // Kiểm tra cấu hình hủy cùng ngày
      if (registrationDate === today) {
        const allowSameDayCancel = await require('../models/Config').getAllowSameDayCancel();
        if (!allowSameDayCancel) {
          return res.status(400).json({
            success: false,
            message: 'Không thể hủy suất ăn trong ngày'
          });
        }
      }

      // Hủy suất ăn
      const [result] = await db.execute(
        `UPDATE meal_registrations 
         SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND status = 'registered'`,
        [registrationId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy suất ăn'
        });
      }

      // Log action
      await Log.logAction(userId, 'MEAL_CANCEL', 
        `Hủy suất ăn ID ${registrationId} (${reg.meal_name}) cho ngày ${registrationDate}`, req);

      res.json({
        success: true,
        message: 'Hủy suất ăn thành công'
      });
    } catch (error) {
      console.error('Cancel meal error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy đăng ký theo người dùng
  getUserRegistrations: async (req, res) => {
    try {
      const userId = req.user.id;
      const { start_date, end_date, meal_type } = req.query;

      let query = `
        SELECT mr.*, m.meal_type, m.meal_name, m.start_time, m.end_time
        FROM meal_registrations mr
        JOIN meals m ON mr.meal_id = m.id
        WHERE mr.user_id = ? AND mr.status = 'registered'
      `;
      
      const params = [userId];

      if (start_date) {
        query += ' AND mr.registration_date >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND mr.registration_date <= ?';
        params.push(end_date);
      }

      if (meal_type) {
        query += ' AND m.meal_type = ?';
        params.push(meal_type);
      }

      query += ' ORDER BY mr.registration_date DESC, m.meal_type';

      const [registrations] = await db.execute(query, params);

      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Get user registrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy đăng ký theo ngày (cho admin)
  getRegistrationsByDate: async (req, res) => {
    try {
      const { date } = req.params;
      const { unit_id, meal_type, status = 'registered' } = req.query;

      let query = `
        SELECT 
          mr.*, 
          u.military_code, 
          u.full_name, 
          u.position, 
          u.phone,
          un.unit_name,
          m.meal_type,
          m.meal_name,
          m.start_time,
          m.end_time
        FROM meal_registrations mr
        JOIN users u ON mr.user_id = u.id
        LEFT JOIN units un ON u.unit_id = un.id
        JOIN meals m ON mr.meal_id = m.id
        WHERE mr.registration_date = ? AND mr.status = ?
      `;
      
      const params = [date, status];

      if (unit_id) {
        query += ' AND u.unit_id = ?';
        params.push(unit_id);
      }

      if (meal_type) {
        query += ' AND m.meal_type = ?';
        params.push(meal_type);
      }

      query += ' ORDER BY un.unit_name, u.full_name, m.meal_type';

      const [registrations] = await db.execute(query, params);

      // Thống kê
      const [summary] = await db.execute(`
        SELECT 
          m.meal_type,
          COUNT(*) as count
        FROM meal_registrations mr
        JOIN meals m ON mr.meal_id = m.id
        WHERE mr.registration_date = ? AND mr.status = ?
        GROUP BY m.meal_type
      `, [date, status]);

      res.json({
        success: true,
        data: {
          registrations,
          summary
        }
      });
    } catch (error) {
      console.error('Get registrations by date error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy thống kê đăng ký
  getRegistrationStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;
      const isAdmin = req.user.role === 'admin';

      if (isAdmin) {
        // Thống kê toàn hệ thống
        const [stats] = await db.execute(`
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
        `, [start_date || '2024-01-01', end_date || '2024-12-31']);
        
        res.json({
          success: true,
          data: stats
        });
      } else {
        // Thống kê cá nhân
        const [stats] = await db.execute(`
          SELECT 
            m.meal_type,
            COUNT(*) as count
          FROM meal_registrations mr
          JOIN meals m ON mr.meal_id = m.id
          WHERE mr.user_id = ? 
            AND mr.registration_date BETWEEN ? AND ? 
            AND mr.status = 'registered'
          GROUP BY m.meal_type
        `, [userId, start_date || '2024-01-01', end_date || '2024-12-31']);
        
        res.json({
          success: true,
          data: stats
        });
      }
    } catch (error) {
      console.error('Get registration stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Cập nhật ghi chú
  updateRegistrationNotes: async (req, res) => {
    try {
      const { registrationId } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      // Kiểm tra quyền
      let query = 'UPDATE meal_registrations SET notes = ? WHERE id = ?';
      const params = [notes || '', registrationId];

      if (!isAdmin) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      const [result] = await db.execute(query, params);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đăng ký hoặc không có quyền'
        });
      }

      // Log action
      await Log.logAction(userId, 'UPDATE_NOTES', 
        `Cập nhật ghi chú cho đăng ký ID ${registrationId}`, req);

      res.json({
        success: true,
        message: 'Cập nhật ghi chú thành công'
      });
    } catch (error) {
      console.error('Update registration notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Hàm kiểm tra trạng thái đăng ký
checkRegistrationStatus: async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    console.log('Checking registration status for:', { userId, date }); // Debug log

    // Lấy tất cả bữa ăn đang hoạt động
    const [meals] = await db.execute(
      'SELECT * FROM meals WHERE is_active = 1 ORDER BY meal_type'
    );

    console.log('Active meals:', meals.length); // Debug log

    // Lấy đăng ký của user cho ngày cụ thể
    const [registrations] = await db.execute(
      `SELECT 
        mr.meal_id,
        mr.id as registration_id,
        mr.status,
        m.meal_type,
        m.meal_name
      FROM meal_registrations mr
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.user_id = ? 
        AND mr.registration_date = ?
        AND mr.status = 'registered'`,
      [userId, date]
    );

    console.log('Found registrations:', registrations.length); // Debug log

    // Tạo map cho dễ truy xuất
    const registrationMap = {};
    registrations.forEach(reg => {
      registrationMap[reg.meal_id] = {
        registration_id: reg.registration_id,
        status: reg.status,
        meal_type: reg.meal_type,
        meal_name: reg.meal_name
      };
    });

    // Trả về trạng thái cho từng bữa ăn
    const result = meals.map(meal => ({
      meal_id: meal.id,
      meal_type: meal.meal_type,
      meal_name: meal.meal_name,
      registration_id: registrationMap[meal.id]?.registration_id || null,
      status: registrationMap[meal.id]?.status || 'not_registered',
      is_registered: !!registrationMap[meal.id]
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Check registration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
},

  // Lấy lịch sử đăng ký
  getRegistrationHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      const [history] = await db.execute(`
        SELECT 
          mr.*,
          m.meal_type,
          m.meal_name,
          CASE 
            WHEN mr.status = 'cancelled' THEN 'Đã hủy'
            ELSE 'Đã đăng ký'
          END as status_text
        FROM meal_registrations mr
        JOIN meals m ON mr.meal_id = m.id
        WHERE mr.user_id = ?
        ORDER BY mr.registration_date DESC, mr.registered_at DESC
        LIMIT ? OFFSET ?
      `, [userId, parseInt(limit), parseInt(offset)]);

      const [total] = await db.execute(
        'SELECT COUNT(*) as count FROM meal_registrations WHERE user_id = ?',
        [userId]
      );

      res.json({
        success: true,
        data: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total[0].count,
          pages: Math.ceil(total[0].count / limit)
        }
      });
    } catch (error) {
      console.error('Get registration history error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

module.exports = registerController;