const pool = require('../config/db');

const getAllProjects = async () => {
    const result = await pool.query('SELECT p.*, u.name as manager_name FROM projects p JOIN users u ON p.manager_id = u.id');
    return result.rows;
};

const getProjectById = async (id) => {
    const result = await pool.query('SELECT p.*, u.name as manager_name FROM projects p JOIN users u ON p.manager_id = u.id WHERE p.id = $1', [id]);
    return result.rows[0] || null;
};

const createProject = async (projectData) => {
    const { name, description, start_date, end_date, required_skills, team_size, status, manager_id } = projectData;
    const result = await pool.query(
        `INSERT INTO projects (name, description, start_date, end_date, required_skills, team_size, status, manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, description, start_date, end_date, required_skills, team_size, status, manager_id]
    );
    return result.rows[0];
};

const updateProject = async (id, updates) => {
    const { name, description, start_date, end_date, required_skills, team_size, status, manager_id } = updates;
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
        [name, description, start_date, end_date, required_skills, team_size, status, manager_id, id]
    );
    return result.rows[0] || null;
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject
};