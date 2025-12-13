const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.use(authMiddleware);

router.get('/my-registrations', mealController.getMyRegistrations);
router.get('/meals', mealController.getAllMeals);
router.get('/stats', mealController.getMealStats);
router.get('/date/:date', mealController.getRegistrationsByDate);
router.get('/active', mealController.getActiveMeals);
router.post('/register', mealController.registerMeal);
router.post('/cancel/:registrationId', mealController.cancelMeal);

module.exports = router;