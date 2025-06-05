const Project = require('../models/Project');
const User = require('../models/User');

const getProjects = async (req, res) => {
    try {
        const projects = await Project.getAllProjects();
        res.json(projects);
    } catch (error) {
        console.error('Error in getProjects:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project.getProjectById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Error in getProjectById:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const createProject = async (req, res) => {
    const { name, description, startDate, endDate, requiredSkills, teamSize, status, managerId } = req.body;

    // Basic validation
    if (!name || !startDate || !endDate || !status || !managerId) {
        return res.status(400).json({ message: 'Missing required project fields.' });
    }

    try {
        // Validate managerId
        const manager = await User.findUserById(managerId);
        if (!manager || manager.role !== 'manager') {
            return res.status(400).json({ message: 'Invalid manager ID or not a manager.' });
        }

        const newProject = await Project.createProject({
            name, description, startDate, endDate, requiredSkills, teamSize, status, managerId
        });
        res.status(201).json({ message: 'Project created successfully', project: newProject });
    } catch (error) {
        console.error('Error in createProject:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // If managerId is being updated, validate it
        if (updates.managerId) {
            const manager = await User.findUserById(updates.managerId);
            if (!manager || manager.role !== 'manager') {
                return res.status(400).json({ message: 'Invalid manager ID or not a manager.' });
            }
        }

        const updatedProject = await Project.updateProject(id, updates);
        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found or update failed.' });
        }
        res.json({ message: 'Project updated successfully', project: updatedProject });
    } catch (error) {
        console.error('Error in updateProject:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject
}