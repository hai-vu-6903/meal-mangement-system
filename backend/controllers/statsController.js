const db = require('../config/db');
const excelExport = require('../utils/excelExport');

const getMealsByUserAndDate = async (userId, startDate, endDate) => {
  const [rows] = await db.execute(
    `SELECT mr.id, mr.registration_date, m.meal_name, m.meal_type, mr.status
     FROM meal_registrations mr
     JOIN meals m ON mr.meal_id = m.id
     WHERE mr.user_id = ? AND mr.registration_date BETWEEN ? AND ?
     ORDER BY mr.registration_date, m.meal_type`,
    [userId, startDate, endDate]
  );
  return rows;
}


const statsController = {
  getDailyStats: async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const [stats] = await db.execute(`
        SELECT 
          mr.registration_date,
          m.meal_type,
          m.meal_name,
          COUNT(*) as registered_count,
          GROUP_CONCAT(DISTINCT u.full_name ORDER BY u.full_name) as users
        FROM meal_registrations mr
        JOIN meals m ON mr.meal_id = m.id
        JOIN users u ON mr.user_id = u.id
        WHERE mr.registration_date = ? AND mr.status = 'registered'
        GROUP BY mr.registration_date, m.id, m.meal_type, m.meal_name
        ORDER BY m.meal_type
      `, [targetDate]);

      const [summary] = await db.execute(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          SUM(CASE WHEN m.meal_type = 'breakfast' THEN 1 ELSE 0 END) as breakfast_count,
          SUM(CASE WHEN m.meal_type = 'lunch' THEN 1 ELSE 0 END) as lunch_count,
          SUM(CASE WHEN m.meal_type = 'dinner' THEN 1 ELSE 0 END) as dinner_count
        FROM meal_registrations mr
        JOIN meals m ON mr.meal_id = m.id
        JOIN users u ON mr.user_id = u.id
        WHERE mr.registration_date = ? AND mr.status = 'registered'
      `, [targetDate]);

      res.json({
        success: true,
        data: {
          date: targetDate,
          stats,
          summary: summary[0]
        }
      });
    } catch (error) {
      console.error('Get daily stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getMonthlyStats: async (req, res) => {
    try {
      const { year, month } = req.query;
      const targetYear = year || new Date().getFullYear();
      const targetMonth = month || new Date().getMonth() + 1;

      const [stats] = await db.execute(`
        SELECT 
          u.military_code,
          u.full_name,
          u.position,
          un.unit_name,
          u.phone,
          SUM(CASE WHEN m.meal_type = 'breakfast' THEN 1 ELSE 0 END) as breakfast_count,
          SUM(CASE WHEN m.meal_type = 'lunch' THEN 1 ELSE 0 END) as lunch_count,
          SUM(CASE WHEN m.meal_type = 'dinner' THEN 1 ELSE 0 END) as dinner_count,
          COUNT(*) as total_meals
        FROM meal_registrations mr
        JOIN users u ON mr.user_id = u.id
        LEFT JOIN units un ON u.unit_id = un.id
        JOIN meals m ON mr.meal_id = m.id
        WHERE YEAR(mr.registration_date) = ? 
          AND MONTH(mr.registration_date) = ?
          AND mr.status = 'registered'
        GROUP BY u.id, u.military_code, u.full_name, u.position, un.unit_name, u.phone
        ORDER BY un.unit_name, u.full_name
      `, [targetYear, targetMonth]);

      const [summary] = await db.execute(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          SUM(CASE WHEN m.meal_type = 'breakfast' THEN 1 ELSE 0 END) as breakfast_total,
          SUM(CASE WHEN m.meal_type = 'lunch' THEN 1 ELSE 0 END) as lunch_total,
          SUM(CASE WHEN m.meal_type = 'dinner' THEN 1 ELSE 0 END) as dinner_total
        FROM meal_registrations mr
        JOIN users u ON mr.user_id = u.id
        JOIN meals m ON mr.meal_id = m.id
        WHERE YEAR(mr.registration_date) = ? 
          AND MONTH(mr.registration_date) = ?
          AND mr.status = 'registered'
      `, [targetYear, targetMonth]);

      res.json({
        success: true,
        data: {
          year: targetYear,
          month: targetMonth,
          stats,
          summary: summary[0]
        }
      });
    } catch (error) {
      console.error('Get monthly stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  getTrendStats: async (req, res) => {
    try {
      const { period = 'week' } = req.query;
      let query;
      let params = [];

      if (period === 'week') {
        query = `
          SELECT 
            DATE(registration_date) as date,
            m.meal_type,
            COUNT(*) as count
          FROM meal_registrations mr
          JOIN meals m ON mr.meal_id = m.id
          WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            AND mr.status = 'registered'
          GROUP BY DATE(registration_date), m.meal_type
          ORDER BY date, m.meal_type
        `;
      } else if (period === 'month') {
        query = `
          SELECT 
            DATE_FORMAT(registration_date, '%Y-%m-%d') as date,
            m.meal_type,
            COUNT(*) as count
          FROM meal_registrations mr
          JOIN meals m ON mr.meal_id = m.id
          WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            AND mr.status = 'registered'
          GROUP BY DATE(registration_date), m.meal_type
          ORDER BY date, m.meal_type
        `;
      } else { // year
        query = `
          SELECT 
            DATE_FORMAT(registration_date, '%Y-%m') as month,
            m.meal_type,
            COUNT(*) as count
          FROM meal_registrations mr
          JOIN meals m ON mr.meal_id = m.id
          WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
            AND mr.status = 'registered'
          GROUP BY DATE_FORMAT(registration_date, '%Y-%m'), m.meal_type
          ORDER BY month, m.meal_type
        `;
      }

      const [trends] = await db.execute(query, params);

      // Process for chart data
      const chartData = {};
      trends.forEach(item => {
        const key = period === 'year' ? item.month : item.date;
        if (!chartData[key]) {
          chartData[key] = { date: key, breakfast: 0, lunch: 0, dinner: 0 };
        }
        chartData[key][item.meal_type] = item.count;
      });

      const chartArray = Object.values(chartData);

      res.json({
        success: true,
        data: {
          period,
          trends,
          chartData: chartArray
        }
      });
    } catch (error) {
      console.error('Get trend stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  exportDailyExcel: async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const workbook = await excelExport.generateDailyReport(targetDate);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=suat-an-${targetDate}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Export daily excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi tạo file Excel'
      });
    }
  },

  exportMonthlyExcel: async (req, res) => {
    try {
      const { year, month } = req.query;
      const targetYear = year || new Date().getFullYear();
      const targetMonth = month || new Date().getMonth() + 1;

      const workbook = await excelExport.generateMonthlyReport(targetYear, targetMonth);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=suat-an-${targetYear}-${targetMonth}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Export monthly excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi tạo file Excel'
      });
    }
  },

  exportPersonalExcel: async (req, res) => {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      const workbook = await excelExport.generatePersonalReport(userId, start_date, end_date);
      
      const filename = `suat-an-ca-nhan-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Export personal excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi tạo file Excel'
      });
    }
  },

  getPersonalStats : async function(req, res) {
  try {
    const { start_date, end_date } = req.query;
    const userId = req.user.id;

    const meals = await getMealsByUserAndDate(userId, start_date, end_date);

    // Tính tổng theo loại bữa
    const stats = [
      { meal_type: 'breakfast', count: 0 },
      { meal_type: 'lunch', count: 0 },
      { meal_type: 'dinner', count: 0 }
    ];

    meals.forEach(m => {
      const stat = stats.find(s => s.meal_type === m.meal_type);
      if (stat) stat.count++;
    });

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

};

module.exports = statsController;