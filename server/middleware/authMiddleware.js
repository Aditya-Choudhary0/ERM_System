// const jwt = require('jsonwebtoken');
// const pool = require('../config/db');

// const protect = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
    
//     if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
//     const user = result.rows[0];
    
//     if (!user) throw new Error('User not found');
    
//     req.user = user;
    
//     next();
    
//   } catch (err) {
//     res.status(401).json({ message: 'Token invalid' });
//   }
// };

// module.exports = { protect };


const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const authorizeManager = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Manager role required.' });
    }
};

module.exports = {
    authenticateToken,
    authorizeManager
};