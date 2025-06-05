const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, authorizeManager } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, assignmentController.getAssignments);
router.post('/', authenticateToken, authorizeManager, assignmentController.createAssignment);
router.put('/:id', authenticateToken, authorizeManager, assignmentController.updateAssignment);
router.delete('/:id', authenticateToken, authorizeManager, assignmentController.deleteAssignment);

module.exports = router;