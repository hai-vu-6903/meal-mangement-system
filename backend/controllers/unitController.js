const db = require('../config/db');

const unitController = {
  getAllUnits: async (req, res) => {
    try {
      const [units] = await db.execute(`
        SELECT u.*, COUNT(us.id) as member_count
        FROM units u
        LEFT JOIN users us ON u.id = us.unit_id AND us.is_active = 1
        GROUP BY u.id, u.unit_code, u.unit_name, u.description, u.created_at, u.updated_at
        ORDER BY u.unit_name
      `);

      res.json({
        success: true,
        data: units
      });
    } catch (error) {
      console.error('Get all units error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getUnitById: async (req, res) => {
    try {
      const { id } = req.params;

      const [units] = await db.execute(
        'SELECT * FROM units WHERE id = ?',
        [id]
      );

      if (units.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn vị'
        });
      }

      const [members] = await db.execute(`
        SELECT id, military_code, full_name, position, phone
        FROM users
        WHERE unit_id = ? AND is_active = 1
        ORDER BY full_name
      `, [id]);

      res.json({
        success: true,
        data: {
          ...units[0],
          members
        }
      });
    } catch (error) {
      console.error('Get unit by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  createUnit: async (req, res) => {
    try {
      const { unit_code, unit_name, description } = req.body;

      // Kiểm tra mã đơn vị đã tồn tại
      const [existing] = await db.execute(
        'SELECT id FROM units WHERE unit_code = ?',
        [unit_code]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Mã đơn vị đã tồn tại'
        });
      }

      const [result] = await db.execute(
        'INSERT INTO units (unit_code, unit_name, description) VALUES (?, ?, ?)',
        [unit_code, unit_name, description]
      );

      res.status(201).json({
        success: true,
        message: 'Tạo đơn vị thành công',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Create unit error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  updateUnit: async (req, res) => {
    try {
      const { id } = req.params;
      const { unit_code, unit_name, description } = req.body;

      // Kiểm tra đơn vị tồn tại
      const [units] = await db.execute(
        'SELECT id FROM units WHERE id = ?',
        [id]
      );

      if (units.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn vị'
        });
      }

      // Kiểm tra mã đơn vị trùng
      if (unit_code) {
        const [existing] = await db.execute(
          'SELECT id FROM units WHERE unit_code = ? AND id != ?',
          [unit_code, id]
        );

        if (existing.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Mã đơn vị đã tồn tại'
          });
        }
      }

      const [result] = await db.execute(
        'UPDATE units SET unit_code = COALESCE(?, unit_code), unit_name = COALESCE(?, unit_name), description = COALESCE(?, description) WHERE id = ?',
        [unit_code, unit_name, description, id]
      );

      res.json({
        success: true,
        message: 'Cập nhật đơn vị thành công'
      });
    } catch (error) {
      console.error('Update unit error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  deleteUnit: async (req, res) => {
    try {
      const { id } = req.params;

      // Kiểm tra đơn vị có thành viên không
      const [members] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE unit_id = ? AND is_active = 1',
        [id]
      );

      if (members[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa đơn vị đang có thành viên'
        });
      }

      const [result] = await db.execute(
        'DELETE FROM units WHERE id = ?',
        [id]
      );

      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: 'Xóa đơn vị thành công'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn vị'
        });
      }
    } catch (error) {
      console.error('Delete unit error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getUnitMembers: async (req, res) => {
    try {
      const { id } = req.params;

      const [members] = await db.execute(`
        SELECT 
          u.id, u.military_code, u.full_name, u.position, u.phone, u.role,
          COUNT(mr.id) as registered_meals
        FROM users u
        LEFT JOIN meal_registrations mr ON u.id = mr.user_id 
          AND mr.registration_date = CURDATE() 
          AND mr.status = 'registered'
        WHERE u.unit_id = ? AND u.is_active = 1
        GROUP BY u.id, u.military_code, u.full_name, u.position, u.phone, u.role
        ORDER BY u.full_name
      `, [id]);

      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Get unit members error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

module.exports = unitController;