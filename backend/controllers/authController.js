const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Log = require('../models/Log');

const authController = {
  login: async (req, res) => {
    try {
      const { military_code, password } = req.body;

      if (!military_code || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mã quân nhân và mật khẩu'
        });
      }

      const user = await User.findByMilitaryCode(military_code);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Mã quân nhân hoặc mật khẩu không đúng'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản đã bị khóa'
        });
      }

      // So sánh mật khẩu (chưa hash - theo yêu cầu)
      if (password !== user.password) {
        return res.status(401).json({
          success: false,
          message: 'Mã quân nhân hoặc mật khẩu không đúng'
        });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Log login action
      await Log.logAction(user.id, 'LOGIN', 'Đăng nhập vào hệ thống', req);

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token,
          user: {
            id: user.id,
            military_code: user.military_code,
            full_name: user.full_name,
            role: user.role,
            unit_id: user.unit_id,
            unit_name: user.unit_name,
            position: user.position,
            email: user.email,
            phone: user.phone
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (userId) {
        // Log logout action
        await Log.logAction(userId, 'LOGOUT', 'Đăng xuất khỏi hệ thống', req);
      }

      res.json({
        success: true,
        message: 'Đăng xuất thành công'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      // Kiểm tra mật khẩu cũ
      if (oldPassword !== user.password) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu cũ không đúng'
        });
      }

      // Cập nhật mật khẩu mới
      const updated = await User.resetPassword(userId, newPassword);

      if (updated) {
        // Log password change
        await Log.logAction(userId, 'CHANGE_PASSWORD', 'Đổi mật khẩu', req);
        
        res.json({
          success: true,
          message: 'Đổi mật khẩu thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Đổi mật khẩu thất bại'
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          military_code: user.military_code,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          unit_id: user.unit_id,
          unit_name: user.unit_name,
          position: user.position,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { email, phone } = req.body;
      const userId = req.user.id;

      const updated = await User.update(userId, { email, phone });

      if (updated) {
        // Log profile update
        await Log.logAction(userId, 'UPDATE_PROFILE', 'Cập nhật thông tin cá nhân', req);
        
        res.json({
          success: true,
          message: 'Cập nhật thông tin thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Cập nhật thất bại'
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Optional: Validate token
  validateToken: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Token hợp lệ',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Validate token error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Optional: Refresh token
  refreshToken: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      const newToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: 'Refresh token thành công',
        data: {
          token: newToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

module.exports = authController;