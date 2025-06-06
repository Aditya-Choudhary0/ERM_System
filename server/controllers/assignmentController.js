const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Project = require('../models/Project');
const { checkAllocationOverlap } = require('../utils/capacityUtils');

const getAssignments = async (req, res) => {
    const { engineer_id, project_id } = req.query; // Filters
    try {
        const assignments = await Assignment.getAssignments({ engineer_id, project_id });
        res.json(assignments);
    } catch (error) {
        console.error('Error in getAssignments:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const createAssignment = async (req, res) => {
    const { engineer_id, project_id, allocation_percentage, start_date, end_date, role } = req.body;

    // Basic validation
    if (!engineer_id || !project_id || allocation_percentage === undefined || !start_date || !end_date) {
        return res.status(400).json({ message: 'Missing required assignment fields.' });
    }
    if (allocation_percentage < 0 || allocation_percentage > 100) {
        return res.status(400).json({ message: 'Allocation percentage must be between 0 and 100.' });
    }

    try {
        // Validate engineer and project existence
        const engineer = await User.getEngineerById(engineer_id);
        if (!engineer) {
            return res.status(400).json({ message: 'Invalid engineer ID' });
        }
        const project = await Project.getProjectById(project_id);
        if (!project) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        // Perform capacity check for the new assignment
        const { isOverAllocated, currentAllocated, maxCapacity } = await checkAllocationOverlap(
            engineer_id, allocation_percentage, start_date, end_date
        );

        if (isOverAllocated) {
            return res.status(400).json({
                message: `Engineer is over-allocated for this period. Current allocated: ${currentAllocated}%, Max capacity: ${maxCapacity}%`
            });
        }

        const newAssignment = await Assignment.createAssignment({
            engineer_id, project_id, allocation_percentage, start_date, end_date, role
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

    if (updates.allocation_percentage !== undefined && (updates.allocation_percentage < 0 || updates.allocation_percentage > 100)) {
        return res.status(400).json({ message: 'Allocation percentage must be between 0 and 100.' });
    }

    try {
        const currentAssignment = await Assignment.getAssignmentById(id);
        if (!currentAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Use current values if updates are not provided
        const engineer_id = updates.engineer_id || currentAssignment.engineer_id;
        const project_id = updates.project_id || currentAssignment.project_id;
        const allocation_percentage = updates.allocation_percentage !== undefined ? updates.allocation_percentage : currentAssignment.allocation_percentage;
        const start_date = updates.start_date || currentAssignment.start_date;
        const end_date = updates.end_date || currentAssignment.end_date;

        // Re-validate engineer and project existence if their IDs are changed
        if (updates.engineer_id) {
            const engineer = await User.getEngineerById(engineer_id);
            if (!engineer) {
                return res.status(400).json({ message: 'Invalid engineer ID' });
            }
        }
        if (updates.project_id) {
            const project = await Project.getProjectById(project_id);
            if (!project) {
                return res.status(400).json({ message: 'Invalid project ID' });
            }
        }

        // Perform capacity check for the updated assignment
        const { isOverAllocated, currentAllocated, maxCapacity } = await checkAllocationOverlap(
            engineer_id, allocation_percentage, start_date, end_date, id // Exclude current assignment
        );

        if (isOverAllocated) {
            return res.status(400).json({
                message: `Engineer is over-allocated for this period with the updated assignment. Current allocated: ${currentAllocated}%, Max capacity: ${maxCapacity}%`
            });
        }

        const updatedAssignment = await Assignment.updateAssignment(id, {
            engineer_id, project_id, allocation_percentage, start_date, end_date, role: updates.role
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