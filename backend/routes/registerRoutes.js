const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const authMiddleware = require('../middleware/authMiddleware');

// Tất cả routes đều cần auth
router.use(authMiddleware);

// Đăng ký/hủy suất ăn
router.post('/register', registerController.registerMeal);
router.post('/cancel/:registrationId', registerController.cancelMeal);

// Xem đăng ký
router.get('/my-registrations', registerController.getUserRegistrations);
router.get('/date/:date', registerController.getRegistrationsByDate);
router.get('/check-status', registerController.checkRegistrationStatus);

// Thống kê
router.get('/stats', registerController.getRegistrationStats);

// Lịch sử
router.get('/history', registerController.getRegistrationHistory);

// Cập nhật
router.put('/:registrationId/notes', registerController.updateRegistrationNotes);

// Thống kê tháng cho user
router.get('/my-monthly-registrations', registerController.getMonthlyUserRegistrations);

// routes/registerRoutes.js

// Dưới các route hiện có
router.get('/my-monthly-registrations', registerController.getMyMonthlyRegistrations);

module.exports = router;