const User = require('../models/User');
const Unit = require('../models/Unit');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, unit_id, search } = req.query;
      const offset = (page - 1) * limit;

      const filters = {};
      if (role) filters.role = role;
      if (unit_id) filters.unit_id = unit_id;
      if (search) filters.search = search;

      const users = await User.findAll({ ...filters, limit, offset });
      const total = await User.count(filters);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const userData = req.body;

      // Kiểm tra mã quân nhân đã tồn tại
      const existingUser = await User.findByMilitaryCode(userData.military_code);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Mã quân nhân đã tồn tại'
        });
      }

      const userId = await User.create(userData);

      res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
        data: { id: userId }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;

      // Kiểm tra người dùng tồn tại
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Kiểm tra mã quân nhân trùng (nếu có thay đổi)
      if (userData.military_code && userData.military_code !== existingUser.military_code) {
        const userWithSameCode = await User.findByMilitaryCode(userData.military_code);
        if (userWithSameCode && userWithSameCode.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Mã quân nhân đã tồn tại'
          });
        }
      }

      const updated = await User.update(id, userData);

      if (updated) {
        res.json({
          success: true,
          message: 'Cập nhật người dùng thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Cập nhật thất bại'
        });
      }
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Không cho xóa chính mình
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa tài khoản của chính mình'
        });
      }

      const deleted = await User.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Xóa người dùng thành công'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { new_password } = req.body;

      const reset = await User.resetPassword(id, new_password);

      if (reset) {
        res.json({
          success: true,
          message: 'Reset mật khẩu thành công'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getDashboardStats: async (req, res) => {
    try {
      const db = require('../config/db');

      // Tổng số người dùng theo role
      const [userStats] = await db.execute(`
        SELECT role, COUNT(*) as count 
        FROM users 
        WHERE is_active = 1 
        GROUP BY role
      `);

      // Tổng số suất ăn hôm nay
      const today = new Date().toISOString().split('T')[0];
      const [todayMeals] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM meal_registrations 
        WHERE registration_date = ? AND status = 'registered'
      `, [today]);

      // Thống kê suất ăn 7 ngày gần nhất
      const [weeklyStats] = await db.execute(`
        SELECT 
          DATE(registration_date) as date,
          COUNT(*) as count
        FROM meal_registrations 
        WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          AND status = 'registered'
        GROUP BY DATE(registration_date)
        ORDER BY date
      `);

      // Thống kê theo đơn vị
      const [unitStats] = await db.execute(`
        SELECT 
          u.unit_name,
          COUNT(DISTINCT mr.user_id) as user_count,
          COUNT(mr.id) as meal_count
        FROM meal_registrations mr
        JOIN users us ON mr.user_id = us.id
        LEFT JOIN units u ON us.unit_id = u.id
        WHERE mr.registration_date = ? AND mr.status = 'registered'
        GROUP BY u.id, u.unit_name
      `, [today]);

      res.json({
        success: true,
        data: {
          user_stats: userStats,
          today_meals: todayMeals[0]?.count || 0,
          weekly_stats: weeklyStats,
          unit_stats: unitStats
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

module.exports = userController;