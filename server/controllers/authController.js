const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findUserByEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
        console.error('Error in loginUser:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error in getProfile:', error.message);
        res.status(500).json({ message: 'Server error',error });
    }
};

const registerUser = async (req, res) => {
    const { email, password, name, role, skills, seniority, maxCapacity, department } = req.body;

    try {
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await User.createUser({
            email, password_hash, name, role, skills, seniority, maxCapacity, department
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error in registerUser:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    loginUser,
    getProfile,
    registerUser
};