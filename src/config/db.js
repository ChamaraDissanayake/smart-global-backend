const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(512) NOT NULL,
        content_hash VARCHAR(64) UNIQUE,
        size BIGINT
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS whitelist_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS insights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        video_title VARCHAR(255),
        video_thumbnail_url VARCHAR(255),
        video_url VARCHAR(255),
        video_is_external BOOLEAN DEFAULT FALSE,
        article_title VARCHAR(255),
        article_description TEXT,
        article_thumbnail_url VARCHAR(255),
        article_reading_time TINYINT UNSIGNED,
        article_content TEXT
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        image_path VARCHAR(512),
        bio TEXT
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS chat_threads (
        id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        thread_id VARCHAR(255) NOT NULL,
        role ENUM('user','assistant') NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
      );
    `);

  } finally {
    conn.release();
  }
}

module.exports = {
  initDB,
  pool
};