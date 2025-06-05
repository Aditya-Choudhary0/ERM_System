const pool = require('../config/db');

const getEngineerCurrentAllocation = async (engineerId) => {
    const today = new Date().toISOString().split('T')[0];

    const assignmentsResult = await pool.query(
        'SELECT allocation_percentage FROM assignments WHERE engineer_id = $1 AND end_date >= $2',
        [engineerId, today]
    );

    const totalAllocated = assignmentsResult.rows.reduce((sum, assignment) => sum + assignment.allocation_percentage, 0);
    return totalAllocated;
};

const checkAllocationOverlap = async (engineerId, newAllocationPercentage, startDate, endDate, excludeAssignmentId = null) => {

    const engineerResult = await pool.query('SELECT max_capacity FROM users WHERE id = $1 AND role = \'engineer\'', [engineerId]);
    const engineer = engineerResult.rows[0];

    if (!engineer) {
        throw new Error('Engineer not found or is not an engineer.');
    }

    const maxCapacity = engineer.max_capacity;

    let queryText = `
        SELECT allocation_percentage FROM assignments
        WHERE engineer_id = $1
          AND (
              ($2 <= end_date AND $3 >= start_date) -- Check for any overlap
          )
    `;
    const queryParams = [engineerId, startDate, endDate];

    if (excludeAssignmentId) {
        queryText += ` AND id != $${queryParams.length + 1}`;
        queryParams.push(excludeAssignmentId);
    }

    const overlappingAssignments = await pool.query(queryText, queryParams);

    const currentAllocated = overlappingAssignments.rows.reduce((sum, assignment) => sum + assignment.allocation_percentage, 0);
    const prospectiveTotalAllocated = currentAllocated + newAllocationPercentage;

    return {
        isOverAllocated: prospectiveTotalAllocated > maxCapacity,
        currentAllocated: currentAllocated,
        maxCapacity: maxCapacity,
        prospectiveTotalAllocated: prospectiveTotalAllocated
    };
};

const findSuitableEngineers = async (requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) {
        return [];
    }

    const queryText = `
        SELECT id, name, email, skills, seniority, max_capacity, department
        FROM users
        WHERE role = 'engineer' AND skills && $1;
    `;

    const result = await pool.query(queryText, [requiredSkills]);
    return result.rows;
};


module.exports = {
    getEngineerCurrentAllocation,
    checkAllocationOverlap,
    findSuitableEngineers
};