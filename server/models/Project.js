const pool = require('../config/db');

/**
 * @function getAllProjects
 * @description Retrieves all projects, including the manager's name.
 * @returns {Promise<Array<Object>>} - An array of project objects.
 */
const getAllProjects = async () => {
    const result = await pool.query('SELECT p.*, u.name as manager_name FROM projects p JOIN users u ON p.manager_id = u.id');
    return result.rows;
};

/**
 * @function getProjectById
 * @description Retrieves a single project by its ID, including the manager's name.
 * @param {string} id - The project's UUID.
 * @returns {Promise<Object|null>} - Project object or null.
 */
const getProjectById = async (id) => {
    const result = await pool.query('SELECT p.*, u.name as manager_name FROM projects p JOIN users u ON p.manager_id = u.id WHERE p.id = $1', [id]);
    return result.rows[0] || null;
};

/**
 * @function createProject
 * @description Creates a new project in the database.
 * @param {Object} projectData - Project data (name, description, dates, skills, etc.).
 * @returns {Promise<Object>} - The newly created project object.
 */
const createProject = async (projectData) => {
    const { name, description, startDate, endDate, requiredSkills, teamSize, status, managerId } = projectData;
    const result = await pool.query(
        `INSERT INTO projects (name, description, start_date, end_date, required_skills, team_size, status, manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, description, startDate, endDate, requiredSkills, teamSize, status, managerId]
    );
    return result.rows[0];
};

/**
 * @function updateProject
 * @description Updates an existing project.
 * @param {string} id - Project's UUID.
 * @param {Object} updates - Fields to update.
 * @returns {Promise<Object|null>} - Updated project object or null if not found.
 */
const updateProject = async (id, updates) => {
    const { name, description, startDate, endDate, requiredSkills, teamSize, status, managerId } = updates;
    const result = await pool.query(
        `UPDATE projects
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             start_date = COALESCE($3, start_date),
             end_date = COALESCE($4, end_date),
             required_skills = COALESCE($5, required_skills),
             team_size = COALESCE($6, team_size),
             status = COALESCE($7, status),
             manager_id = COALESCE($8, manager_id)
         WHERE id = $9
         RETURNING *`,
        [name, description, startDate, endDate, requiredSkills, teamSize, status, managerId, id]
    );
    return result.rows[0] || null;
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject
};