const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Project = require('../models/Project');
const { checkAllocationOverlap } = require('../utils/capacityUtils');

const getAssignments = async (req, res) => {
    const { engineerId, projectId } = req.query; // Filters
    try {
        const assignments = await Assignment.getAssignments({ engineerId, projectId });
        res.json(assignments);
    } catch (error) {
        console.error('Error in getAssignments:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const createAssignment = async (req, res) => {
    const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = req.body;

    // Basic validation
    if (!engineerId || !projectId || allocationPercentage === undefined || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required assignment fields.' });
    }
    if (allocationPercentage < 0 || allocationPercentage > 100) {
        return res.status(400).json({ message: 'Allocation percentage must be between 0 and 100.' });
    }

    try {
        // Validate engineer and project existence
        const engineer = await User.getEngineerById(engineerId);
        if (!engineer) {
            return res.status(400).json({ message: 'Invalid engineer ID' });
        }
        const project = await Project.getProjectById(projectId);
        if (!project) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        // Perform capacity check for the new assignment
        const { isOverAllocated, currentAllocated, maxCapacity } = await checkAllocationOverlap(
            engineerId, allocationPercentage, startDate, endDate
        );

        if (isOverAllocated) {
            return res.status(400).json({
                message: `Engineer is over-allocated for this period. Current allocated: ${currentAllocated}%, Max capacity: ${maxCapacity}%`
            });
        }

        const newAssignment = await Assignment.createAssignment({
            engineerId, projectId, allocationPercentage, startDate, endDate, role
        });
        res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
    } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(400).json({ message: 'An assignment for this engineer to this project already exists for the specified dates.' });
        }
        console.error('Error in createAssignment:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAssignment = async (req, res) => {
    const { id } = req.params;
    const updates = req.body; // Can contain partial updates

    if (updates.allocationPercentage !== undefined && (updates.allocationPercentage < 0 || updates.allocationPercentage > 100)) {
        return res.status(400).json({ message: 'Allocation percentage must be between 0 and 100.' });
    }

    try {
        const currentAssignment = await Assignment.getAssignmentById(id);
        if (!currentAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Use current values if updates are not provided
        const engineerId = updates.engineerId || currentAssignment.engineer_id;
        const projectId = updates.projectId || currentAssignment.project_id;
        const allocationPercentage = updates.allocationPercentage !== undefined ? updates.allocationPercentage : currentAssignment.allocation_percentage;
        const startDate = updates.startDate || currentAssignment.start_date;
        const endDate = updates.endDate || currentAssignment.end_date;

        // Re-validate engineer and project existence if their IDs are changed
        if (updates.engineerId) {
            const engineer = await User.getEngineerById(engineerId);
            if (!engineer) {
                return res.status(400).json({ message: 'Invalid engineer ID' });
            }
        }
        if (updates.projectId) {
            const project = await Project.getProjectById(projectId);
            if (!project) {
                return res.status(400).json({ message: 'Invalid project ID' });
            }
        }

        // Perform capacity check for the updated assignment
        const { isOverAllocated, currentAllocated, maxCapacity } = await checkAllocationOverlap(
            engineerId, allocationPercentage, startDate, endDate, id // Exclude current assignment
        );

        if (isOverAllocated) {
            return res.status(400).json({
                message: `Engineer is over-allocated for this period with the updated assignment. Current allocated: ${currentAllocated}%, Max capacity: ${maxCapacity}%`
            });
        }

        const updatedAssignment = await Assignment.updateAssignment(id, {
            engineerId, projectId, allocationPercentage, startDate, endDate, role: updates.role
        });

        if (!updatedAssignment) {
            return res.status(404).json({ message: 'Assignment not found or update failed.' });
        }
        res.json({ message: 'Assignment updated successfully', assignment: updatedAssignment });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'An assignment for this engineer to this project already exists for the specified dates.' });
        }
        console.error('Error in updateAssignment:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAssignment = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Assignment.deleteAssignment(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json({ message: 'Assignment deleted successfully', assignmentId: id });
    } catch (error) {
        console.error('Error in deleteAssignment:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
};