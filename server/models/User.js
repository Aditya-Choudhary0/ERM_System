const pool = require('../config/db');

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};

const findUserById = async (id) => {
    const result = await pool.query('SELECT id, email, name, role, skills, seniority, max_capacity, department FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};

const createUser = async (userData) => {
    const { email, password_hash, name, role, skills, seniority, maxCapacity, department } = userData;
    const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, skills, seniority, max_capacity, department)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name, role`,
        [email, password_hash, name, role, skills || null, seniority || null, maxCapacity || null, department || null]
    );
    return result.rows[0];
};

const getAllEngineers = async () => {
    const result = await pool.query('SELECT id, name, email, skills, seniority, max_capacity, department FROM users WHERE role = \'engineer\'');
    return result.rows;
};

const getEngineerById = async (id) => {
    const result = await pool.query('SELECT id, name, email, skills, seniority, max_capacity, department FROM users WHERE id = $1 AND role = \'engineer\'', [id]);
    return result.rows[0] || null;
};

const updateEngineer = async (id, updates) => {
    const { name, skills, seniority, maxCapacity, department } = updates;
    const result = await pool.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             skills = COALESCE($2, skills),
             seniority = COALESCE($3, seniority),
             max_capacity = COALESCE($4, max_capacity),
             department = COALESCE($5, department)
         WHERE id = $6 AND role = 'engineer'
         RETURNING id, name, email, skills, seniority, max_capacity, department`,
        [name, skills, seniority, maxCapacity, department, id]
    );
    return result.rows[0] || null;
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    getAllEngineers,
    getEngineerById,
    updateEngineer
};