const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes cho export
router.get('/export/personal', authMiddleware, statsController.exportPersonalExcel);

// Routes cần auth
router.use(authMiddleware);

router.get('/daily', statsController.getDailyStats);
router.get('/monthly', statsController.getMonthlyStats);
router.get('/trends', statsController.getTrendStats);
router.get('/export/daily', statsController.exportDailyExcel);
router.get('/export/monthly', statsController.exportMonthlyExcel);
// Route cần auth
router.get('/personal', statsController.getPersonalStats);


module.exports = router;