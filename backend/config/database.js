import pkg from 'pg';
const { Pool } = pkg;

// Important: PostgreSQL configuration for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;