const ExcelJS = require('exceljs');
const db = require('../config/db');

const excelExport = {
  generateDailyReport: async (date) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Suất ăn ${date}`);

    // Tiêu đề
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').value = `BÁO CÁO SUẤT ĂN NGÀY ${date}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    // Lấy dữ liệu
    const [registrations] = await db.execute(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY un.unit_name, u.full_name) as stt,
        u.full_name as nguoi_dang_ky,
        u.position as chuc_vu,
        un.unit_name as don_vi,
        u.phone as so_dien_thoai,
        MAX(CASE WHEN m.meal_type = 'breakfast' THEN '✓' ELSE '' END) as bua_sang,
        MAX(CASE WHEN m.meal_type = 'lunch' THEN '✓' ELSE '' END) as bua_trua,
        MAX(CASE WHEN m.meal_type = 'dinner' THEN '✓' ELSE '' END) as bua_toi,
        GROUP_CONCAT(DISTINCT m.meal_name SEPARATOR ', ') as ghi_chu
      FROM meal_registrations mr
      JOIN users u ON mr.user_id = u.id
      LEFT JOIN units un ON u.unit_id = un.id
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.registration_date = ? AND mr.status = 'registered'
      GROUP BY u.id, u.full_name, u.position, un.unit_name, u.phone
      ORDER BY un.unit_name, u.full_name
    `, [date]);

    // Tổng kết
    const [summary] = await db.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as tong_nguoi,
        SUM(CASE WHEN m.meal_type = 'breakfast' THEN 1 ELSE 0 END) as tong_sang,
        SUM(CASE WHEN m.meal_type = 'lunch' THEN 1 ELSE 0 END) as tong_trua,
        SUM(CASE WHEN m.meal_type = 'dinner' THEN 1 ELSE 0 END) as tong_toi
      FROM meal_registrations mr
      JOIN users u ON mr.user_id = u.id
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.registration_date = ? AND mr.status = 'registered'
    `, [date]);

    // Header
    const headers = [
      'STT', 'Người đăng ký', 'Chức vụ', 'Đơn vị', 'Số điện thoại',
      'Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ghi chú'
    ];

    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Dữ liệu
    registrations.forEach(reg => {
      worksheet.addRow([
        reg.stt,
        reg.nguoi_dang_ky,
        reg.chuc_vu,
        reg.don_vi,
        reg.so_dien_thoai,
        reg.bua_sang,
        reg.bua_trua,
        reg.bua_toi,
        reg.ghi_chu
      ]);
    });

    // Tổng kết
    const summaryRow = worksheet.addRow([]);
    worksheet.addRow(['TỔNG SỐ:', '', '', '', '',
      summary[0].tong_sang,
      summary[0].tong_trua,
      summary[0].tong_toi,
      `Tổng số người: ${summary[0].tong_nguoi}`
    ]);

    // Format columns
    worksheet.columns = [
      { key: 'stt', width: 8 },
      { key: 'nguoi_dang_ky', width: 25 },
      { key: 'chuc_vu', width: 15 },
      { key: 'don_vi', width: 20 },
      { key: 'so_dien_thoai', width: 15 },
      { key: 'bua_sang', width: 10 },
      { key: 'bua_trua', width: 10 },
      { key: 'bua_toi', width: 10 },
      { key: 'ghi_chu', width: 30 }
    ];

    // Style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (rowNumber <= 3) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
        }
      });
    });

    return workbook;
  },

generateMonthlyReport: async (year, month) => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Tháng ${month} - ${year}`);

  // ===== TITLE =====
  worksheet.mergeCells('A1:I1');
  worksheet.getCell('A1').value = `BÁO CÁO SUẤT ĂN THÁNG ${month} - ${year}`;
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]); // row 2 trống

  // ===== HEADER =====
  const headers = [
    'STT',
    'Người đăng ký',
    'Chức vụ',
    'Đơn vị',
    'Số điện thoại',
    'Sáng/tháng',
    'Trưa/tháng',
    'Tối/tháng',
    'Ngày đăng ký'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // ===== QUERY =====
  const [rows] = await db.execute(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY un.unit_name, u.full_name) AS stt,
      u.full_name,
      u.position,
      un.unit_name,
      u.phone,
      SUM(CASE WHEN m.meal_type = 'breakfast' THEN 1 ELSE 0 END) AS sang,
      SUM(CASE WHEN m.meal_type = 'lunch' THEN 1 ELSE 0 END) AS trua,
      SUM(CASE WHEN m.meal_type = 'dinner' THEN 1 ELSE 0 END) AS toi,
      GROUP_CONCAT(DISTINCT DATE_FORMAT(mr.registration_date, '%d/%m') ORDER BY mr.registration_date) AS ngay
    FROM meal_registrations mr
    JOIN users u ON mr.user_id = u.id
    LEFT JOIN units un ON u.unit_id = un.id
    JOIN meals m ON mr.meal_id = m.id
    WHERE YEAR(mr.registration_date) = ?
      AND MONTH(mr.registration_date) = ?
      AND mr.status = 'registered'
    GROUP BY u.id
    ORDER BY un.unit_name, u.full_name
  `, [year, month]);

  rows.forEach(r => {
    worksheet.addRow([
      r.stt,
      r.full_name,
      r.position,
      r.unit_name,
      r.phone,
      r.sang,
      r.trua,
      r.toi,
      r.ngay
    ]);
  });

  // ===== FORMAT =====
  worksheet.columns = [
    { width: 6 },
    { width: 25 },
    { width: 15 },
    { width: 20 },
    { width: 15 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 40 }
  ];

  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  return workbook;
},

  generatePersonalReport: async (userId, startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Suất ăn cá nhân');

    // Lấy thông tin người dùng
    const [users] = await db.execute(`
      SELECT u.*, un.unit_name
      FROM users u
      LEFT JOIN units un ON u.unit_id = un.id
      WHERE u.id = ?
    `, [userId]);

    const user = users[0];

    // Tiêu đề
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = `BÁO CÁO SUẤT ĂN CÁ NHÂN`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    // Thông tin cá nhân
    worksheet.addRow(['Họ tên:', user.full_name, '', 'Chức vụ:', user.position]);
    worksheet.addRow(['Mã quân nhân:', user.military_code, '', 'Đơn vị:', user.unit_name || '']);
    worksheet.addRow(['Số điện thoại:', user.phone || '', '', 'Email:', user.email || '']);
    worksheet.addRow(['Thời gian:', `${startDate || 'Đầu kỳ'} đến ${endDate || new Date().toISOString().split('T')[0]}`]);

    // Header dữ liệu
    worksheet.addRow([]);
    const headers = ['STT', 'Ngày', 'Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ghi chú'];
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(7);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Lấy dữ liệu
    let query = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY mr.registration_date) as stt,
        mr.registration_date as ngay,
        MAX(CASE WHEN m.meal_type = 'breakfast' THEN '✓' ELSE '' END) as sang,
        MAX(CASE WHEN m.meal_type = 'lunch' THEN '✓' ELSE '' END) as trua,
        MAX(CASE WHEN m.meal_type = 'dinner' THEN '✓' ELSE '' END) as toi,
        GROUP_CONCAT(DISTINCT m.meal_name SEPARATOR ', ') as ghi_chu
      FROM meal_registrations mr
      JOIN meals m ON mr.meal_id = m.id
      WHERE mr.user_id = ? AND mr.status = 'registered'
    `;

    const params = [userId];
    
    if (startDate) {
      query += ' AND mr.registration_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND mr.registration_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY mr.registration_date ORDER BY mr.registration_date';

    const [registrations] = await db.execute(query, params);

    // Dữ liệu
    let startRow = 8;
    registrations.forEach(reg => {
      worksheet.addRow([
        reg.stt,
        new Date(reg.ngay).toLocaleDateString('vi-VN'),
        reg.sang,
        reg.trua,
        reg.toi,
        reg.ghi_chu
      ]);
      startRow++;
    });

    // Tổng kết
    const totals = {
      breakfast: registrations.filter(r => r.sang === '✓').length,
      lunch: registrations.filter(r => r.trua === '✓').length,
      dinner: registrations.filter(r => r.toi === '✓').length,
      total: registrations.length * 3
    };

    worksheet.addRow([]);
    worksheet.addRow(['TỔNG SỐ:', '', 
      `Sáng: ${totals.breakfast}`, 
      `Trưa: ${totals.lunch}`, 
      `Tối: ${totals.dinner}`,
      `Tổng suất: ${totals.breakfast + totals.lunch + totals.dinner}`
    ]);

    // Format columns
    worksheet.columns = [
      { key: 'stt', width: 8 },
      { key: 'ngay', width: 15 },
      { key: 'sang', width: 12 },
      { key: 'trua', width: 12 },
      { key: 'toi', width: 12 },
      { key: 'ghi_chu', width: 30 }
    ];

    // Style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (rowNumber <= 7) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
        }
      });
    });

    return workbook;
  }
};

module.exports = excelExport;