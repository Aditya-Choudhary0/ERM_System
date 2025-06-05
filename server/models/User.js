const pool = require('../config/db');

/**
 * @function findUserByEmail
 * @description Finds a user by their email address.
 * @param {string} email - The user's email.
 * @returns {Promise<Object|null>} - User object or null if not found.
 */
const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};

/**
 * @function findUserById
 * @description Finds a user by their ID.
 * @param {string} id - The user's UUID.
 * @returns {Promise<Object|null>} - User object or null if not found.
 */
const findUserById = async (id) => {
    const result = await pool.query('SELECT id, email, name, role, skills, seniority, max_capacity, department FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};

/**
 * @function createUser
 * @description Creates a new user in the database.
 * @param {Object} userData - User data (email, password_hash, name, role, etc.).
 * @returns {Promise<Object>} - The newly created user object.
 */
const createUser = async (userData) => {
    const { email, password_hash, name, role, skills, seniority, maxCapacity, department } = userData;
    const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, skills, seniority, max_capacity, department)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name, role`,
        [email, password_hash, name, role, skills || null, seniority || null, maxCapacity || null, department || null]
    );
    return result.rows[0];
};

/**
 * @function getAllEngineers
 * @description Retrieves all users with the 'engineer' role.
 * @returns {Promise<Array<Object>>} - An array of engineer objects.
 */
const getAllEngineers = async () => {
    const result = await pool.query('SELECT id, name, email, skills, seniority, max_capacity, department FROM users WHERE role = \'engineer\'');
    return result.rows;
};

/**
 * @function getEngineerById
 * @description Retrieves a single engineer by their ID.
 * @param {string} id - The engineer's UUID.
 * @returns {Promise<Object|null>} - Engineer object or null.
 */
const getEngineerById = async (id) => {
    const result = await pool.query('SELECT id, name, email, skills, seniority, max_capacity, department FROM users WHERE id = $1 AND role = \'engineer\'', [id]);
    return result.rows[0] || null;
};

/**
 * @function updateEngineer
 * @description Updates an engineer's profile.
 * @param {string} id - Engineer's UUID.
 * @param {Object} updates - Fields to update.
 * @returns {Promise<Object|null>} - Updated engineer object or null if not found.
 */
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