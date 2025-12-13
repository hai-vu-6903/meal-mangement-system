const SystemConfig = require('../models/Config');
const Meal = require('../models/Meal');

const configController = {
  getAllConfigs: async (req, res) => {
    try {
      const configs = await SystemConfig.getAll();
      const meals = await SystemConfig.getMealConfig();
      
      res.json({
        success: true,
        data: {
          system_configs: configs,
          meals
        }
      });
    } catch (error) {
      console.error('Get all configs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  updateConfig: async (req, res) => {
    try {
      const { key, value, description } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin cấu hình'
        });
      }

      const updated = await SystemConfig.update(key, value, description);

      if (updated) {
        res.json({
          success: true,
          message: 'Cập nhật cấu hình thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Cập nhật thất bại'
        });
      }
    } catch (error) {
      console.error('Update config error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getMealConfigs: async (req, res) => {
    try {
      const meals = await SystemConfig.getMealConfig();
      
      res.json({
        success: true,
        data: meals
      });
    } catch (error) {
      console.error('Get meal configs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  updateMeal: async (req, res) => {
    try {
      const { id } = req.params;
      const mealData = req.body;

      const updated = await Meal.update(id, mealData);

      if (updated) {
        res.json({
          success: true,
          message: 'Cập nhật bữa ăn thành công'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy bữa ăn'
        });
      }
    } catch (error) {
      console.error('Update meal error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  createMeal: async (req, res) => {
    try {
      const mealData = req.body;

      // Validate required fields
      if (!mealData.meal_type || !mealData.meal_name) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bữa ăn'
        });
      }

      const mealId = await Meal.create(mealData);

      res.status(201).json({
        success: true,
        message: 'Tạo bữa ăn thành công',
        data: { id: mealId }
      });
    } catch (error) {
      console.error('Create meal error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  deleteMeal: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await Meal.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Xóa bữa ăn thành công'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy bữa ăn'
        });
      }
    } catch (error) {
      console.error('Delete meal error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getSystemSettings: async (req, res) => {
    try {
      const cancelDeadline = await SystemConfig.getCancelDeadline();
      const registrationDeadline = await SystemConfig.getRegistrationDeadline();
      const allowSameDayCancel = await SystemConfig.getAllowSameDayCancel();
      const systemTitle = await SystemConfig.get('system_title') || 'Hệ thống quản lý suất ăn';

      res.json({
        success: true,
        data: {
          cancel_deadline: cancelDeadline,
          registration_deadline: registrationDeadline,
          allow_same_day_cancel: allowSameDayCancel,
          system_title: systemTitle
        }
      });
    } catch (error) {
      console.error('Get system settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

module.exports = configController;