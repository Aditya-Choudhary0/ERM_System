const User = require('../models/User');
const { getEngineerCurrentAllocation, findSuitableEngineers } = require('../utils/capacityUtils');

const getEngineers = async (req, res) => {
    try {
        const engineers = await User.getAllEngineers();
        res.json(engineers);
    } catch (error) {
        console.error('Error in getEngineers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getEngineerById = async (req, res) => {
    const { id } = req.params;
    try {
        const engineer = await User.getEngineerById(id);
        if (!engineer) {
            return res.status(404).json({ message: 'Engineer not found' });
        }
        res.json(engineer);
    } catch (error) {
        console.error('Error in getEngineerById:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getEngineerCapacity = async (req, res) => {
    const { id } = req.params;
    try {
        const engineer = await User.getEngineerById(id);
        if (!engineer) {
            return res.status(404).json({ message: 'Engineer not found' });
        }

        const totalAllocated = await getEngineerCurrentAllocation(id);
        const availableCapacity = engineer.max_capacity - totalAllocated;

        res.json({
            engineer_id: id,
            maxCapacity: engineer.max_capacity,
            totalAllocated: totalAllocated,
            availableCapacity: availableCapacity
        });
    } catch (error) {
        console.error('Error in getEngineerCapacity:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateEngineerProfile = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedEngineer = await User.updateEngineer(id, updates);
        if (!updatedEngineer) {
            return res.status(404).json({ message: 'Engineer not found or update failed.' });
        }
        res.json({ message: 'Engineer profile updated successfully', engineer: updatedEngineer });
    } catch (error) {
        console.error('Error in updateEngineerProfile:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSuitableEngineers = async (req, res) => {
    const skillsString = req.query.skills;
    const requiredSkills = skillsString ? skillsString.split(',').map(s => s.trim()) : [];

    try {
        const suitableEngineers = await findSuitableEngineers(requiredSkills);
        res.json(suitableEngineers);
    } catch (error) {
        console.error('Error in getSuitableEngineers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getEngineers,
    getEngineerById,
    getEngineerCapacity,
    updateEngineerProfile,
    getSuitableEngineers
};