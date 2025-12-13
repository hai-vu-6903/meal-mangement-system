const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Tất cả routes đều cần auth và role admin
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/', configController.getAllConfigs);
router.get('/system', configController.getSystemSettings);
router.get('/meals', configController.getMealConfigs);
router.put('/', configController.updateConfig);
router.post('/meals', configController.createMeal);
router.put('/meals/:id', configController.updateMeal);
router.delete('/meals/:id', configController.deleteMeal);

module.exports = router;