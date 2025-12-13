const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Routes cho cả admin và soldier (xem)
router.get('/', authMiddleware, unitController.getAllUnits);
router.get('/:id', authMiddleware, unitController.getUnitById);
router.get('/:id/members', authMiddleware, unitController.getUnitMembers);

// Routes chỉ cho admin
router.use(authMiddleware, roleMiddleware('admin'));
router.post('/', unitController.createUnit);
router.put('/:id', unitController.updateUnit);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;