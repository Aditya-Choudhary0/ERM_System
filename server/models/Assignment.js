const pool = require('../config/db');

const getAssignments = async (filters = {}) => {
    const { engineerId, projectId } = filters;
    let queryText = `
        SELECT
            a.id,
            a.engineer_id,
            u.name AS engineer_name,
            u.email AS engineer_email,
            a.project_id,
            p.name AS project_name,
            a.allocation_percentage,
            a.start_date,
            a.end_date,
            a.role AS assignment_role
        FROM assignments a
        JOIN users u ON a.engineer_id = u.id
        JOIN projects p ON a.project_id = p.id
    `;
    const queryParams = [];
    const conditions = [];

    if (engineerId) {
        conditions.push(`a.engineer_id = $${queryParams.length + 1}`);
        queryParams.push(engineerId);
    }
    if (projectId) {
        conditions.push(`a.project_id = $${queryParams.length + 1}`);
        queryParams.push(projectId);
    }

    if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
    }
    queryText += ' ORDER BY a.start_date DESC';

    const result = await pool.query(queryText, queryParams);
    return result.rows;
};

const getAssignmentById = async (id) => {
    const result = await pool.query('SELECT * FROM assignments WHERE id = $1', [id]);
    return result.rows[0] || null;
};

const createAssignment = async (assignmentData) => {
    const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = assignmentData;
    const result = await pool.query(
        `INSERT INTO assignments (engineer_id, project_id, allocation_percentage, start_date, end_date, role)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [engineerId, projectId, allocationPercentage, startDate, endDate, role]
    );
    return result.rows[0];
};

const updateAssignment = async (id, updates) => {
    const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = updates;
    const result = await pool.query(
        `UPDATE assignments
         SET engineer_id = COALESCE($1, engineer_id),
             project_id = COALESCE($2, project_id),
             allocation_percentage = COALESCE($3, allocation_percentage),
             start_date = COALESCE($4, start_date),
             end_date = COALESCE($5, end_date),
             role = COALESCE($6, role)
         WHERE id = $7
         RETURNING *`,
        [engineerId, projectId, allocationPercentage, startDate, endDate, role, id]
    );
    return result.rows[0] || null;
};

const deleteAssignment = async (id) => {
    const result = await pool.query('DELETE FROM assignments WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
};

module.exports = {
    getAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment
};