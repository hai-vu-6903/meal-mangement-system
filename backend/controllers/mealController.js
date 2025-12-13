const MealRegister = require('../models/MealRegister');
const Meal = require('../models/Meal');
const User = require('../models/User');

const mealController = {
  registerMeal: async (req, res) => {
    try {
      const { meal_id, date, notes } = req.body;
      const userId = req.user.id;

      // Kiểm tra ngày đăng ký (không cho đăng ký ngày đã qua)
      const today = new Date().toISOString().split('T')[0];
      if (date < today) {
        return res.status(400).json({
          success: false,
          message: 'Không thể đăng ký suất ăn cho ngày đã qua'
        });
      }

      const registrationId = await MealRegister.register(userId, meal_id, date, notes);

      res.json({
        success: true,
        message: 'Đăng ký suất ăn thành công',
        data: { registrationId }
      });
    } catch (error) {
      console.error('Register meal error:', error);
      if (error.message === 'Đã đăng ký suất ăn này rồi') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  cancelMeal: async (req, res) => {
    try {
      const { registrationId } = req.params;
      const userId = req.user.id;

      // Kiểm tra quyền hủy (quân nhân chỉ hủy của mình, admin hủy được mọi người)
      let isAdmin = req.user.role === 'admin';
      const cancelled = await MealRegister.cancel(registrationId, isAdmin ? null : userId);

      if (!cancelled) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đăng ký hoặc không có quyền hủy'
        });
      }

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

  getMyRegistrations: async (req, res) => {
    try {
      const { start_date, end_date, meal_type } = req.query;
      const userId = req.user.id;

      const filters = {};
      if (start_date) filters.startDate = start_date;
      if (end_date) filters.endDate = end_date;
      if (meal_type) filters.mealType = meal_type;

      const registrations = await MealRegister.getByUser(userId, filters);

      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Get registrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getRegistrationsByDate: async (req, res) => {
    try {
      const { date } = req.params;
      const { unit_id, meal_type } = req.query;

      const filters = {};
      if (unit_id) filters.unit_id = unit_id;
      if (meal_type) filters.meal_type = meal_type;

      const registrations = await MealRegister.getByDate(date, filters);
      const summary = await MealRegister.getRegistrationSummary(date);

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

  getMealStats: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const userId = req.user.id;

      const stats = req.user.role === 'admin'
        ? await MealRegister.getStatsByDateRange(start_date, end_date)
        : await MealRegister.getUserStats(userId, start_date, end_date);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get meal stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },
  getActiveMeals: async (req, res) => {
  try {
    const db = require('../config/db');
    const [meals] = await db.execute(
      'SELECT * FROM meals WHERE is_active = 1 ORDER BY meal_type'
    );
    res.json({ success: true, data: meals });
  } catch (error) {
    console.error('Error fetching active meals:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
},
  getAllMeals: async (req, res) => {
    try {
      const db = require('../config/db');
      const [meals] = await db.execute('SELECT * FROM meals WHERE is_active = 1 ORDER BY meal_type');
      
      res.json({
        success: true,
        data: meals
      });
    } catch (error) {
      console.error('Get all meals error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

module.exports = mealController;