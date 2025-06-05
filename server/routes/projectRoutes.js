// const router = require('express').Router();
// const { protect } = require('../middleware/authMiddleware');
// const { getProjects, getProjectById, createProject } = require('../controllers/projectController');

// router.get('/', protect, getProjects);
// router.get('/:id', protect, getProjectById);
// router.post('/', protect, createProject);

// module.exports = router;

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, authorizeManager } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, projectController.getProjects);
router.post('/', authenticateToken, authorizeManager, projectController.createProject);
router.get('/:id', authenticateToken, projectController.getProjectById);
router.put('/:id', authenticateToken, authorizeManager, projectController.updateProject);

module.exports = router;