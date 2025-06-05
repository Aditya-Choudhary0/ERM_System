const express = require('express');
const router = express.Router();
const engineerController = require('../controllers/engineerController');
const { authenticateToken, authorizeManager } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, engineerController.getEngineers);
router.get('/suitable', authenticateToken, engineerController.getSuitableEngineers);
router.get('/:id', authenticateToken, engineerController.getEngineerById);
router.get('/:id/capacity', authenticateToken, engineerController.getEngineerCapacity);
router.put('/:id', authenticateToken, authorizeManager, engineerController.updateEngineerProfile);

module.exports = router;