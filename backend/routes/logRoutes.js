const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Tất cả routes đều cần auth và role admin
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/', logController.getLogs);
router.get('/stats', logController.getLogStats);
router.get('/user/:id', logController.getUserLogs);
router.delete('/clear', logController.clearOldLogs);

module.exports = router;