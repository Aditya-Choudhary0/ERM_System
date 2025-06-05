// const router = require('express').Router();
// const { protect } = require('../middleware/authMiddleware');
// const { getEngineers, getEngineerCapacity, getEngineerMatches } = require('../controllers/engineerController');

// router.get('/', protect, getEngineers);
// router.get('/:id/capacity', protect, getEngineerCapacity);
// router.get('/match/:projectId', protect, getEngineerMatches);

// module.exports = router;

const express = require('express');
const router = express.Router();
const engineerController = require('../controllers/engineerController');
const { authenticateToken, authorizeManager } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, engineerController.getEngineers);
router.get('/suitable', authenticateToken, engineerController.getSuitableEngineers); // New route for skill matching
router.get('/:id', authenticateToken, engineerController.getEngineerById);
router.get('/:id/capacity', authenticateToken, engineerController.getEngineerCapacity);
router.put('/:id', authenticateToken, authorizeManager, engineerController.updateEngineerProfile);

module.exports = router;