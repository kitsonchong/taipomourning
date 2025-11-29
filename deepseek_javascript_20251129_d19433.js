const { createPool } = require('@vercel/postgres');

// 创建数据库连接池
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// 初始化数据库表
async function initDatabase() {
  try {
    // 创建留言表
    await pool.sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status INTEGER DEFAULT 1,
        ip_address INET,
        user_agent TEXT
      )
    `;

    // 创建计数器表
    await pool.sql`
      CREATE TABLE IF NOT EXISTS counters (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) UNIQUE NOT NULL,
        count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建管理员表
    await pool.sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建访问统计表
    await pool.sql`
      CREATE TABLE IF NOT EXISTS visit_stats (
        id SERIAL PRIMARY KEY,
        date DATE DEFAULT CURRENT_DATE,
        visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0
      )
    `;

    // 初始化计数器
    await pool.sql`
      INSERT INTO counters (type, count) 
      VALUES ('flower', 0), ('candle', 0), ('incense', 0)
      ON CONFLICT (type) DO NOTHING
    `;

    // 创建默认管理员（密码：admin123）
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync('admin123', 12);
    
    await pool.sql`
      INSERT INTO admin_users (username, password_hash) 
      VALUES ('admin', ${passwordHash})
      ON CONFLICT (username) DO NOTHING
    `;

    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

module.exports = { pool, initDatabase };