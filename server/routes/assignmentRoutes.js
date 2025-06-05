// const router = require('express').Router();
// const { getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
// const { protect } = require('../middleware/authMiddleware');

// router.get('/', protect, getAssignments);
// router.post('/', protect, createAssignment);
// router.put('/:id', protect, updateAssignment);
// router.delete('/:id', protect, deleteAssignment);

// module.exports = router;


const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, authorizeManager } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, assignmentController.getAssignments);
router.post('/', authenticateToken, authorizeManager, assignmentController.createAssignment);
router.put('/:id', authenticateToken, authorizeManager, assignmentController.updateAssignment);
router.delete('/:id', authenticateToken, authorizeManager, assignmentController.deleteAssignment);

module.exports = router;