const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.loginUser);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/register', authController.registerUser);

module.exports = router;