// const { Pool } = require("pg");
// require('dotenv').config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// pool
//   .connect()
//   .then(() => console.log("Connected to database using pool"))
//   .catch((err) => console.error("Connection error", err.stack));

// module.exports = pool;

const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  }
});

pool
  .connect()
  .then(() => console.log("✅ Connected to Render PostgreSQL"))
  .catch((err) => console.error("❌ Connection error", err.stack));

module.exports = pool;