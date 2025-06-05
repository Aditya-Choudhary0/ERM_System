// const router = require('express').Router();
// const { login, getProfile } = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware');

// router.post('/login', login);
// router.get('/profile', protect, getProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.loginUser);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/register', authController.registerUser); // Keep for initial setup/testing, can be restricted later

module.exports = router;